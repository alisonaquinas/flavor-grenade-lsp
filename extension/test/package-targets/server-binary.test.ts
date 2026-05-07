import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  expectedServerBinaryForTarget,
  validateServerBinaryEntries,
} from './server-binary.ts';

const testDir = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(testDir, '..', '..');
const packageJson = JSON.parse(readFileSync(join(extensionRoot, 'package.json'), 'utf8')) as {
  scripts?: Record<string, string>;
};

describe('package target server binary validation', () => {
  it('exposes a repeatable package target verification script', () => {
    assert.equal(
      packageJson.scripts?.['verify:package-targets'],
      'node --import tsx --test "test/package-targets/server-binary.test.ts"',
    );
  });

  it('maps VSIX targets to the expected bundled server binary', () => {
    assert.equal(expectedServerBinaryForTarget('win32-x64'), 'extension/server/flavor-grenade-lsp.exe');
    assert.equal(expectedServerBinaryForTarget('linux-x64'), 'extension/server/flavor-grenade-lsp');
    assert.equal(expectedServerBinaryForTarget('darwin-arm64'), 'extension/server/flavor-grenade-lsp');
  });

  it('accepts exactly one matching server binary', () => {
    assert.deepEqual(
      validateServerBinaryEntries({
        entries: ['extension/server/flavor-grenade-lsp.exe'],
        target: 'win32-x64',
      }),
      [],
    );
  });

  it('rejects missing, duplicate, and wrong-target server binaries', () => {
    assert.match(
      validateServerBinaryEntries({ entries: [], target: 'linux-x64' }).join('\n'),
      /missing server binary/i,
    );
    assert.match(
      validateServerBinaryEntries({
        entries: [
          'extension/server/flavor-grenade-lsp',
          'extension/server/flavor-grenade-lsp.exe',
        ],
        target: 'linux-x64',
      }).join('\n'),
      /exactly one server binary/i,
    );
    assert.match(
      validateServerBinaryEntries({
        entries: ['extension/server/flavor-grenade-lsp.exe'],
        target: 'linux-x64',
      }).join('\n'),
      /wrong target/i,
    );
  });
});

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  hasNativeServerEntry,
  validateServerPayloadEntries,
  validateServerPayloadVsix,
} from './server-binary.ts';

const testDir = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(testDir, '..', '..');
const packageJson = JSON.parse(readFileSync(join(extensionRoot, 'package.json'), 'utf8')) as {
  scripts?: Record<string, string>;
};

describe('Marketplace server payload validation', () => {
  it('exposes a repeatable package target verification script', () => {
    assert.equal(
      packageJson.scripts?.['verify:package-targets'],
      'node --import tsx --test "test/package-targets/server-binary.test.ts"',
    );
  });

  it('accepts exactly one bundled JS server module', () => {
    assert.deepEqual(
      validateServerPayloadEntries({
        entries: ['extension/server/main.js'],
      }),
      [],
    );
  });

  it('rejects missing, duplicate, and native executable server payloads', () => {
    assert.match(
      validateServerPayloadEntries({ entries: [] }).join('\n'),
      /missing bundled server module/i,
    );
    assert.match(
      validateServerPayloadEntries({
        entries: ['extension/server/main.js', 'extension/server/main.js'],
      }).join('\n'),
      /exactly one bundled server module/i,
    );
    assert.match(
      validateServerPayloadEntries({
        entries: ['extension/server/main.js', 'extension/server/flavor-grenade-lsp.exe'],
      }).join('\n'),
      /native server executables/i,
    );
    assert.equal(hasNativeServerEntry(['extension/server/flavor-grenade-lsp']), true);
  });

  it('inspects a packaged VSIX archive for the bundled JS server module', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'fg-package-targets-'));

    try {
      const vsixPath = join(tempDir, 'flavor-grenade.vsix');
      const result = spawnSync(vscePackageCommand(), vscePackageArgs(vsixPath), {
        cwd: extensionRoot,
        encoding: 'utf8',
      });

      assert.equal(result.status, 0, result.stderr || String(result.error));
      assert.deepEqual(validateServerPayloadVsix({ vsixPath }), []);
    } finally {
      rmSync(tempDir, { force: true, recursive: true });
    }
  });
});

function vscePackageCommand(): string {
  return process.platform === 'win32' ? 'cmd.exe' : 'npx';
}

function vscePackageArgs(vsixPath: string): string[] {
  if (process.platform === 'win32') {
    return ['/d', '/s', '/c', `npx vsce package --no-dependencies --out ${vsixPath}`];
  }

  return ['vsce', 'package', '--no-dependencies', '--out', vsixPath];
}

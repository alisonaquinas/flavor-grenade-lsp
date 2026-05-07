import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  expectedServerBinaryForTarget,
  validateServerBinaryEntries,
  validateServerBinaryVsix,
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
    assert.equal(expectedServerBinaryForTarget('alpine-x64'), 'extension/server/flavor-grenade-lsp');
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

  it('inspects a packaged VSIX archive for the target server binary', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'fg-package-targets-'));

    try {
      const vsixPath = join(tempDir, 'flavor-grenade-win32-x64.vsix');
      const result = spawnSync(vscePackageCommand(), vscePackageArgs(vsixPath), {
        cwd: extensionRoot,
        encoding: 'utf8',
      });

      assert.equal(result.status, 0, result.stderr || String(result.error));
      assert.deepEqual(validateServerBinaryVsix({ target: 'win32-x64', vsixPath }), []);
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
    return ['/d', '/s', '/c', `npx vsce package --target win32-x64 --no-dependencies --out ${vsixPath}`];
  }

  return ['vsce', 'package', '--target', 'win32-x64', '--no-dependencies', '--out', vsixPath];
}

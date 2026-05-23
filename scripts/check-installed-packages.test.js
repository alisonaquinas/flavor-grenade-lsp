import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'bun:test';
import {
  findInstalledPackageMismatches,
  satisfiesManifestSpecifier,
} from './check-installed-packages.mjs';

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeInstalledPackage(packageDir, name, version) {
  const packagePath = join(packageDir, 'node_modules', ...name.split('/'));
  mkdirSync(packagePath, { recursive: true });
  writeJson(join(packagePath, 'package.json'), { name, version });
}

describe('check-installed-packages', () => {
  it('accepts exact, caret, and tilde-compatible installed versions', () => {
    expect(satisfiesManifestSpecifier('1.2.3', '1.2.3')).toBe(true);
    expect(satisfiesManifestSpecifier('1.2.3', '1.2.4')).toBe(false);
    expect(satisfiesManifestSpecifier('^1.2.3', '1.9.0')).toBe(true);
    expect(satisfiesManifestSpecifier('^1.2.3', '2.0.0')).toBe(false);
    expect(satisfiesManifestSpecifier('~1.2.3', '1.2.9')).toBe(true);
    expect(satisfiesManifestSpecifier('~1.2.3', '1.3.0')).toBe(false);
  });

  it('reports missing and mismatched installed direct packages', () => {
    const packageDir = mkdtempSync(join(tmpdir(), 'fg-installed-packages-'));
    try {
      writeJson(join(packageDir, 'package.json'), {
        dependencies: {
          exact: '1.0.0',
          stale: '2.0.0',
          ranged: '^3.0.0',
          missing: '4.0.0',
        },
      });
      writeInstalledPackage(packageDir, 'exact', '1.0.0');
      writeInstalledPackage(packageDir, 'stale', '2.0.1');
      writeInstalledPackage(packageDir, 'ranged', '3.2.0');

      expect(findInstalledPackageMismatches(packageDir)).toEqual([
        {
          section: 'dependencies',
          name: 'stale',
          specifier: '2.0.0',
          installedVersion: '2.0.1',
          reason: 'version-mismatch',
        },
        {
          section: 'dependencies',
          name: 'missing',
          specifier: '4.0.0',
          installedVersion: null,
          reason: 'missing',
        },
      ]);
    } finally {
      rmSync(packageDir, { recursive: true, force: true });
    }
  });
});

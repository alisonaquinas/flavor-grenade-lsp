import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const testDir = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(testDir, '..', '..');
const packageJson = JSON.parse(readFileSync(join(extensionRoot, 'package.json'), 'utf8')) as {
  scripts?: Record<string, string>;
};
const inventory = JSON.parse(
  readFileSync(join(extensionRoot, 'images', 'marketplace', 'inventory.json'), 'utf8'),
) as {
  requiredVisuals: Array<{ id: string; path: string }>;
};

describe('Marketplace VSIX asset packaging', () => {
  it('exposes a repeatable Marketplace asset verification script', () => {
    assert.equal(
      packageJson.scripts?.['verify:marketplace-assets'],
      'node --import tsx --test "test/marketplace/readme-assets.test.ts" "test/marketplace/vsix-assets.test.ts"',
    );
  });

  it('includes every required Marketplace README visual in packaged output', () => {
    const result = spawnSync(vsceListCommand(), vsceListArgs(), {
      cwd: extensionRoot,
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr || String(result.error));

    const packagedFiles = new Set(
      result.stdout
        .split(/\r?\n/)
        .map((line) => line.trim().replaceAll('\\', '/'))
        .filter(Boolean),
    );

    for (const visual of inventory.requiredVisuals) {
      assert.equal(packagedFiles.has(visual.path), true, `${visual.id} must be packaged`);
    }
  });
});

function vsceListCommand(): string {
  return process.platform === 'win32' ? 'cmd.exe' : 'npx';
}

function vsceListArgs(): string[] {
  if (process.platform === 'win32') {
    return ['/d', '/s', '/c', 'npx vsce ls --no-dependencies'];
  }

  return ['vsce', 'ls', '--no-dependencies'];
}

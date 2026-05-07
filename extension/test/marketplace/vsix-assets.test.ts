import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

  it('includes every required Marketplace README visual in the packaged VSIX archive', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'fg-marketplace-assets-'));

    try {
      const vsixPath = join(tempDir, 'flavor-grenade-marketplace-assets.vsix');
      const result = spawnSync(vscePackageCommand(), vscePackageArgs(vsixPath), {
        cwd: extensionRoot,
        encoding: 'utf8',
      });

      assert.equal(result.status, 0, result.stderr || String(result.error));

      const packagedFiles = readZipEntries(vsixPath);

      for (const visual of inventory.requiredVisuals) {
        assert.equal(
          packagedFiles.has(`extension/${visual.path}`),
          true,
          `${visual.id} must be packaged`,
        );
      }
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

function readZipEntries(zipPath: string): Set<string> {
  const archive = readFileSync(zipPath);
  const endOfCentralDirectory = findEndOfCentralDirectory(archive);
  const centralDirectorySize = archive.readUInt32LE(endOfCentralDirectory + 12);
  const centralDirectoryOffset = archive.readUInt32LE(endOfCentralDirectory + 16);
  const endOffset = centralDirectoryOffset + centralDirectorySize;
  const entries = new Set<string>();

  let offset = centralDirectoryOffset;
  while (offset < endOffset) {
    assert.equal(archive.readUInt32LE(offset), 0x02014b50, 'invalid ZIP central directory');

    const fileNameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const fileNameStart = offset + 46;
    const fileNameEnd = fileNameStart + fileNameLength;

    entries.add(archive.toString('utf8', fileNameStart, fileNameEnd).replaceAll('\\', '/'));
    offset = fileNameEnd + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(archive: Buffer): number {
  for (let offset = archive.length - 22; offset >= 0; offset -= 1) {
    if (archive.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error('ZIP end of central directory not found');
}

import { describe, expect, it } from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  confineExistingPathToVaultRoot,
  confinePathToVaultRoot,
  resolveVaultRelativePath,
} from '../vault-path-confinement.js';

describe('vault path confinement', () => {
  it('resolves safe vault-relative paths under the vault root', () => {
    const vaultRoot = path.resolve('/vault');

    expect(resolveVaultRelativePath(vaultRoot, 'notes/alpha.md')).toBe(
      path.normalize(`${vaultRoot}${path.sep}notes${path.sep}alpha.md`),
    );
  });

  it('rejects traversal and absolute vault-relative inputs', () => {
    const vaultRoot = path.resolve('/vault');

    expect(resolveVaultRelativePath(vaultRoot, '../secret.md')).toBeNull();
    expect(resolveVaultRelativePath(vaultRoot, '/secret.md')).toBeNull();
    expect(resolveVaultRelativePath(vaultRoot, 'C:\\secret.md')).toBeNull();
    expect(resolveVaultRelativePath(vaultRoot, 'notes\0secret.md')).toBeNull();
  });

  it('confines non-existing lexical paths to the vault root', () => {
    const vaultRoot = path.resolve('/vault');
    const inside = path.normalize(`${vaultRoot}${path.sep}new.md`);
    const outside = path.resolve('/outside/new.md');

    expect(confinePathToVaultRoot(vaultRoot, inside)).toBe(inside);
    expect(confinePathToVaultRoot(vaultRoot, outside)).toBeNull();
  });

  it('rejects symlinked existing paths whose real target escapes the vault root', () => {
    const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-vault-'));
    const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-outside-'));

    try {
      const outsideFile = path.join(outsideRoot, 'secret.md');
      const linkPath = path.join(vaultRoot, 'linked.md');
      fs.writeFileSync(outsideFile, '# Secret\n');
      try {
        fs.symlinkSync(outsideFile, linkPath, 'file');
      } catch {
        return;
      }

      expect(confineExistingPathToVaultRoot(vaultRoot, linkPath)).toBeNull();
    } finally {
      fs.rmSync(vaultRoot, { recursive: true, force: true });
      fs.rmSync(outsideRoot, { recursive: true, force: true });
    }
  });
});

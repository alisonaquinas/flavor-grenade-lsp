import { describe, expect, it } from '@jest/globals';
import { pathToFileURL } from 'url';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FileOperationPlanner } from '../file-operation-planner.js';
import { VaultIndex } from '../vault-index.js';
import { resolveVaultRelativePath } from '../vault-path-confinement.js';
import type { DocId } from '../doc-id.js';
import type { OFMDoc, OFMIndex } from '../../parser/types.js';

function id(value: string): DocId {
  return value as DocId;
}

function uriFor(vaultRoot: string, relPath: string): string {
  const filePath = resolveVaultRelativePath(vaultRoot, relPath);
  if (filePath === null) {
    throw new Error(`Invalid vault-relative test path: ${relPath}`);
  }
  return pathToFileURL(filePath).toString();
}

function makeIndex(): OFMIndex {
  return {
    wikiLinks: [],
    embeds: [],
    blockAnchors: [],
    tags: [],
    callouts: [],
    headings: [],
    markdownLinks: [],
    markdownImages: [],
    linkLabelRefs: [],
    linkLabelDefs: [],
  };
}

function makeDoc(uri: string): OFMDoc {
  return {
    uri,
    version: 0,
    text: '',
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    index: makeIndex(),
  };
}

describe('FileOperationPlanner', () => {
  it('plans vault-confined Markdown note moves as extension-free DocId mappings', () => {
    const vaultRoot = path.resolve('C:/vault');
    const vaultIndex = new VaultIndex();
    vaultIndex.set(id('notes/alpha'), makeDoc(uriFor(vaultRoot, 'notes/alpha.md')));
    const planner = new FileOperationPlanner(vaultIndex);

    const plan = planner.planRenameFiles(vaultRoot, {
      files: [
        {
          oldUri: uriFor(vaultRoot, 'notes/alpha.md'),
          newUri: uriFor(vaultRoot, 'archive/alpha.md'),
        },
      ],
    });

    expect(plan).toEqual({
      status: 'ok',
      moves: [
        {
          kind: 'document',
          oldUri: uriFor(vaultRoot, 'notes/alpha.md'),
          newUri: uriFor(vaultRoot, 'archive/alpha.md'),
          oldPath: 'notes/alpha.md',
          newPath: 'archive/alpha.md',
          oldDocId: 'notes/alpha',
          newDocId: 'archive/alpha',
        },
      ],
    });
  });

  it('plans attachment moves with extension-bearing vault-relative paths', () => {
    const vaultRoot = path.resolve('C:/vault');
    const vaultIndex = new VaultIndex();
    vaultIndex.setAttachment({
      path: 'assets/diagram.png',
      uri: uriFor(vaultRoot, 'assets/diagram.png'),
      extension: 'png',
      kind: 'image',
      sizeBytes: 1,
    });
    const planner = new FileOperationPlanner(vaultIndex);

    const plan = planner.planRenameFiles(vaultRoot, {
      files: [
        {
          oldUri: uriFor(vaultRoot, 'assets/diagram.png'),
          newUri: uriFor(vaultRoot, 'media/diagram.png'),
        },
      ],
    });

    expect(plan).toEqual({
      status: 'ok',
      moves: [
        {
          kind: 'attachment',
          oldUri: uriFor(vaultRoot, 'assets/diagram.png'),
          newUri: uriFor(vaultRoot, 'media/diagram.png'),
          oldPath: 'assets/diagram.png',
          newPath: 'media/diagram.png',
        },
      ],
    });
  });

  it('expands folder moves across known notes and attachments', () => {
    const vaultRoot = path.resolve('C:/vault');
    const vaultIndex = new VaultIndex();
    vaultIndex.set(id('notes/alpha'), makeDoc(uriFor(vaultRoot, 'notes/alpha.md')));
    vaultIndex.set(id('notes/deep/beta'), makeDoc(uriFor(vaultRoot, 'notes/deep/beta.md')));
    vaultIndex.setAttachment({
      path: 'notes/assets/diagram.png',
      uri: uriFor(vaultRoot, 'notes/assets/diagram.png'),
      extension: 'png',
      kind: 'image',
      sizeBytes: 1,
    });
    const planner = new FileOperationPlanner(vaultIndex);

    const plan = planner.planRenameFiles(vaultRoot, {
      files: [{ oldUri: uriFor(vaultRoot, 'notes'), newUri: uriFor(vaultRoot, 'archive') }],
    });

    expect(plan.status).toBe('ok');
    expect(plan.status === 'ok' ? plan.moves : []).toEqual([
      expect.objectContaining({
        kind: 'document',
        oldDocId: 'notes/alpha',
        newDocId: 'archive/alpha',
      }),
      expect.objectContaining({
        kind: 'document',
        oldDocId: 'notes/deep/beta',
        newDocId: 'archive/deep/beta',
      }),
      expect.objectContaining({
        kind: 'attachment',
        oldPath: 'notes/assets/diagram.png',
        newPath: 'archive/assets/diagram.png',
      }),
    ]);
  });

  it('rejects the whole plan when any source or target escapes the vault root', () => {
    const vaultRoot = path.resolve('C:/vault');
    const vaultIndex = new VaultIndex();
    const planner = new FileOperationPlanner(vaultIndex);

    const plan = planner.planRenameFiles(vaultRoot, {
      files: [
        {
          oldUri: uriFor(vaultRoot, 'notes/alpha.md'),
          newUri: pathToFileURL(path.resolve('C:/outside/alpha.md')).toString(),
        },
      ],
    });

    expect(plan).toEqual({
      status: 'rejected',
      reason: 'Path escapes vault root',
    });
  });

  it('rejects symlinked source paths whose real target escapes the vault root', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-symlink-plan-'));
    const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-symlink-outside-'));

    try {
      const outsideFile = path.join(outsideRoot, 'secret.md');
      const linkPath = path.join(tempRoot, 'linked.md');
      fs.writeFileSync(outsideFile, '# Secret\n');
      try {
        fs.symlinkSync(outsideFile, linkPath, 'file');
      } catch {
        return;
      }

      const vaultIndex = new VaultIndex();
      const planner = new FileOperationPlanner(vaultIndex);
      const plan = planner.planRenameFiles(tempRoot, {
        files: [
          {
            oldUri: pathToFileURL(linkPath).toString(),
            newUri: pathToFileURL(path.join(tempRoot, 'renamed.md')).toString(),
          },
        ],
      });

      expect(plan).toEqual({
        status: 'rejected',
        reason: 'Path escapes vault root',
      });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      fs.rmSync(outsideRoot, { recursive: true, force: true });
    }
  });
});

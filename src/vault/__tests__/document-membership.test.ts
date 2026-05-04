import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { pathToFileURL } from 'url';
import type { OFMDoc } from '../../parser/types.js';
import { DocumentMembershipService } from '../document-membership.js';
import { toDocId } from '../doc-id.js';
import { VaultDetector } from '../vault-detector.js';
import { VaultIndex } from '../vault-index.js';

describe('DocumentMembershipService', () => {
  let tmpDir: string;
  let detector: VaultDetector;
  let index: VaultIndex;
  let service: DocumentMembershipService;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-doc-membership-'));
    detector = new VaultDetector();
    index = new VaultIndex();
    service = new DocumentMembershipService(detector, index);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reports Obsidian vault Markdown as OFMarkdown even before indexing', () => {
    fs.mkdirSync(path.join(tmpDir, '.obsidian'));
    const note = path.join(tmpDir, 'note.md');
    fs.writeFileSync(note, '# Note\n');

    const result = service.handle({ uri: pathToFileURL(note).toString() });

    expect(result).toEqual({
      isOfMarkdown: true,
      indexed: false,
      vaultRoot: tmpDir,
      reason: 'obsidian-vault',
    });
  });

  it('reports Flavor Grenade config vault Markdown as OFMarkdown', () => {
    fs.writeFileSync(path.join(tmpDir, '.flavor-grenade.toml'), '');
    const note = path.join(tmpDir, 'note.md');
    fs.writeFileSync(note, '# Note\n');

    const result = service.handle({ uri: pathToFileURL(note).toString() });

    expect(result.isOfMarkdown).toBe(true);
    expect(result.reason).toBe('flavor-config-vault');
  });

  it('marks documents as indexed when their DocId is present', () => {
    fs.mkdirSync(path.join(tmpDir, '.obsidian'));
    const note = path.join(tmpDir, 'note.md');
    const uri = pathToFileURL(note).toString();
    fs.writeFileSync(note, '# Note\n');
    index.set(toDocId(tmpDir, note), { uri } as OFMDoc);

    const result = service.handle({ uri });

    expect(result.indexed).toBe(true);
  });

  it('keeps generic Markdown in single-file mode', () => {
    const note = path.join(tmpDir, 'readme.md');
    fs.writeFileSync(note, '# Readme\n');

    const result = service.handle({ uri: pathToFileURL(note).toString() });

    expect(result).toEqual({
      isOfMarkdown: false,
      indexed: false,
      reason: 'single-file',
    });
  });

  it('rejects unsupported URI schemes', () => {
    const result = service.handle({ uri: 'untitled:Untitled-1' });

    expect(result).toEqual({
      isOfMarkdown: false,
      indexed: false,
      reason: 'not-indexed',
    });
  });
});

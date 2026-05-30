import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { VaultScanner } from '../vault-scanner.js';
import { VaultIndex } from '../vault-index.js';
import { FolderLookup } from '../folder-lookup.js';
import { IgnoreFilter } from '../ignore-filter.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { FlavorGrenadeConfigFiles } from '../../markdown-flavor/fg-config-files.js';
import { MarkdownFlavorState } from '../../markdown-flavor/markdown-flavor-state.js';
import type { VaultDetector } from '../vault-detector.js';
import type { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';
import type { TagRegistry } from '../../tags/tag-registry.js';

function makeTempVault(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'fglsp-attachment-config-'));
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

function toFileUri(absPath: string): string {
  const forward = absPath.split(path.sep).join('/');
  return forward.startsWith('/') ? `file://${forward}` : `file:///${forward}`;
}

function makeVaultDetector(vaultRoot: string): VaultDetector {
  return {
    detect: (_p: string) => ({ mode: 'obsidian', vaultRoot }),
  } as unknown as VaultDetector;
}

function makeScanner(vaultRoot: string): { scanner: VaultScanner; vaultIndex: VaultIndex } {
  const vaultIndex = new VaultIndex();
  const scanner = new VaultScanner(
    makeVaultDetector(vaultRoot),
    vaultIndex,
    new FolderLookup(),
    new IgnoreFilter(),
    new OFMParser(),
    { sendNotification: () => {} } as unknown as JsonRpcDispatcher,
    { rebuild: () => {}, removeDoc: () => {}, addDoc: () => {} } as unknown as TagRegistry,
    new MarkdownFlavorState(),
    new FlavorGrenadeConfigFiles(),
  );

  return { scanner, vaultIndex };
}

describe('attachment configuration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempVault();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  it('reads Obsidian attachment folder hints from .obsidian/app.json', async () => {
    fs.mkdirSync(path.join(tmpDir, '.obsidian'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, '.obsidian', 'app.json'),
      JSON.stringify({ attachmentFolderPath: 'assets' }),
    );
    fs.mkdirSync(path.join(tmpDir, 'assets'));
    fs.writeFileSync(path.join(tmpDir, 'assets', 'diagram.png'), 'PNG');

    const { scanner, vaultIndex } = makeScanner(tmpDir);

    await scanner.scan(toFileUri(tmpDir));

    expect(vaultIndex.getAttachmentFolderHint()).toBe('assets');
    expect(vaultIndex.hasAttachment('assets/diagram.png')).toBe(true);
  });

  it('falls back silently when Obsidian app.json is malformed', async () => {
    fs.mkdirSync(path.join(tmpDir, '.obsidian'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.obsidian', 'app.json'), '{not json');

    const { scanner, vaultIndex } = makeScanner(tmpDir);

    await scanner.scan(toFileUri(tmpDir));

    expect(vaultIndex.getAttachmentFolderHint()).toBeUndefined();
  });
});

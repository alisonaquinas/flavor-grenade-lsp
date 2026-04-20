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
import type { VaultDetector } from '../vault-detector.js';
import type { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';
import type { TagRegistry } from '../../tags/tag-registry.js';
import type { DocId } from '../doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

// ─── Factory helpers ────────────────────────────────────────────────────────

function makeTempVault(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'fglsp-test-'));
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

/** Build a VaultDetector mock that always returns obsidian mode for the given root. */
function makeVaultDetector(vaultRoot: string): VaultDetector {
  return {
    detect: (_p: string) => ({ mode: 'obsidian', vaultRoot }),
  } as unknown as VaultDetector;
}

/** Build a VaultDetector mock that always returns single-file mode. */
function makeSingleFileDetector(): VaultDetector {
  return {
    detect: (_p: string) => ({ mode: 'single-file', vaultRoot: null }),
  } as unknown as VaultDetector;
}

/**
 * Build a JsonRpcDispatcher mock that records all outbound notifications.
 * Returns both the mock and a reference to the collected notification list.
 */
function makeDispatcher(): {
  dispatcher: JsonRpcDispatcher;
  notifications: Array<{ method: string; params: unknown }>;
} {
  const notifications: Array<{ method: string; params: unknown }> = [];
  const dispatcher = {
    sendNotification: (method: string, params: unknown) => {
      notifications.push({ method, params });
    },
  } as unknown as JsonRpcDispatcher;
  return { dispatcher, notifications };
}

/** Build a minimal TagRegistry mock. */
function makeTagRegistry(): TagRegistry {
  return {
    rebuild: () => {},
    removeDoc: () => {},
    addDoc: () => {},
  } as unknown as TagRegistry;
}

/**
 * Assemble a VaultScanner with real VaultIndex, FolderLookup, IgnoreFilter, and
 * OFMParser, together with the provided detector, dispatcher, and tagRegistry mocks.
 */
function makeScanner(opts: {
  vaultDetector: VaultDetector;
  dispatcher: JsonRpcDispatcher;
  tagRegistry?: TagRegistry;
}): {
  scanner: VaultScanner;
  vaultIndex: VaultIndex;
  folderLookup: FolderLookup;
  ignoreFilter: IgnoreFilter;
} {
  const vaultIndex = new VaultIndex();
  const folderLookup = new FolderLookup();
  const ignoreFilter = new IgnoreFilter();
  const ofmParser = new OFMParser();
  const tagRegistry = opts.tagRegistry ?? makeTagRegistry();

  const scanner = new VaultScanner(
    opts.vaultDetector,
    vaultIndex,
    folderLookup,
    ignoreFilter,
    ofmParser,
    opts.dispatcher,
    tagRegistry,
  );

  return { scanner, vaultIndex, folderLookup, ignoreFilter };
}

/**
 * Convert a temp-dir absolute path to the `file://` URI that scan() expects.
 * Uses forward slashes and prefixes with an extra slash on POSIX.
 */
function toFileUri(absPath: string): string {
  const forward = absPath.split(path.sep).join('/');
  // Windows: C:/foo → file:///C:/foo  |  POSIX: /foo → file:///foo
  return forward.startsWith('/') ? `file://${forward}` : `file:///${forward}`;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('VaultScanner', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempVault();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  // ── 1. Single-file mode ──────────────────────────────────────────────────

  it('single-file mode: sends ready immediately and does not walk the filesystem', async () => {
    // Write a file that would be indexed if a walk occurred
    fs.writeFileSync(path.join(tmpDir, 'note.md'), '# Hello');

    const { dispatcher, notifications } = makeDispatcher();
    const { scanner, vaultIndex } = makeScanner({
      vaultDetector: makeSingleFileDetector(),
      dispatcher,
    });

    await scanner.scan(toFileUri(tmpDir));

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toEqual({
      method: 'flavorGrenade/status',
      params: { status: 'ready' },
    });
    // No files should have been indexed
    expect(vaultIndex.size()).toBe(0);
    expect(scanner.getAssetIndex().size).toBe(0);
  });

  // ── 2. Empty vault ───────────────────────────────────────────────────────

  it('scan empty vault: sends ready, vaultIndex is empty, assetIndex is empty', async () => {
    const { dispatcher, notifications } = makeDispatcher();
    const { scanner, vaultIndex } = makeScanner({
      vaultDetector: makeVaultDetector(tmpDir),
      dispatcher,
    });

    await scanner.scan(toFileUri(tmpDir));

    expect(notifications).toHaveLength(1);
    expect(notifications[0].params).toEqual({ status: 'ready' });
    expect(vaultIndex.size()).toBe(0);
    expect(scanner.getAssetIndex().size).toBe(0);
  });

  // ── 3. .md files are indexed into vaultIndex ─────────────────────────────

  it('scan with .md files: both files appear in vaultIndex, assetIndex stays empty', async () => {
    fs.mkdirSync(path.join(tmpDir, 'notes'));
    fs.writeFileSync(path.join(tmpDir, 'notes', 'alpha.md'), '# Alpha');
    fs.writeFileSync(path.join(tmpDir, 'notes', 'beta.md'), '# Beta');

    const { dispatcher } = makeDispatcher();
    const { scanner, vaultIndex } = makeScanner({
      vaultDetector: makeVaultDetector(tmpDir),
      dispatcher,
    });

    await scanner.scan(toFileUri(tmpDir));

    expect(vaultIndex.has(id('notes/alpha'))).toBe(true);
    expect(vaultIndex.has(id('notes/beta'))).toBe(true);
    expect(vaultIndex.size()).toBe(2);
    expect(scanner.getAssetIndex().size).toBe(0);
  });

  // ── 4. Non-markdown files land in assetIndex ─────────────────────────────

  it('scan with non-markdown file: not in vaultIndex, IS in assetIndex', async () => {
    fs.mkdirSync(path.join(tmpDir, 'images'));
    fs.writeFileSync(path.join(tmpDir, 'images', 'photo.png'), 'PNG');

    const { dispatcher } = makeDispatcher();
    const { scanner, vaultIndex } = makeScanner({
      vaultDetector: makeVaultDetector(tmpDir),
      dispatcher,
    });

    await scanner.scan(toFileUri(tmpDir));

    expect(vaultIndex.size()).toBe(0);
    expect(scanner.hasAsset('images/photo.png')).toBe(true);
    expect(scanner.getAssetIndex().size).toBe(1);
  });

  // ── 5. Nested subdirectory: docId path is correct ────────────────────────

  it('scan with deeply nested .md file: indexed with correct docId', async () => {
    fs.mkdirSync(path.join(tmpDir, 'a', 'b'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'a', 'b', 'c.md'), '# C');

    const { dispatcher } = makeDispatcher();
    const { scanner, vaultIndex } = makeScanner({
      vaultDetector: makeVaultDetector(tmpDir),
      dispatcher,
    });

    await scanner.scan(toFileUri(tmpDir));

    expect(vaultIndex.has(id('a/b/c'))).toBe(true);
    expect(vaultIndex.size()).toBe(1);
  });

  // ── 6. Ignored files (.obsidian/) ────────────────────────────────────────

  it('scan with .obsidian/config: file is not indexed and not in assetIndex', async () => {
    fs.mkdirSync(path.join(tmpDir, '.obsidian'));
    fs.writeFileSync(path.join(tmpDir, '.obsidian', 'config'), '{}');
    // Also write a normal file to confirm normal files still work
    fs.writeFileSync(path.join(tmpDir, 'note.md'), '# note');

    const { dispatcher } = makeDispatcher();
    const { scanner, vaultIndex } = makeScanner({
      vaultDetector: makeVaultDetector(tmpDir),
      dispatcher,
    });

    await scanner.scan(toFileUri(tmpDir));

    // .obsidian/config must not appear anywhere
    expect(scanner.hasAsset('.obsidian/config')).toBe(false);
    expect(scanner.getAssetIndex().size).toBe(0);
    // The normal .md file is indexed
    expect(vaultIndex.has(id('note'))).toBe(true);
  });

  // ── 7. Unreadable directory (POSIX only) ─────────────────────────────────

  it('unreadable directory: walk continues without throwing', async () => {
    if (process.platform === 'win32') {
      // chmod 000 is not reliably enforced on Windows — skip
      console.log('Skipping unreadable-dir test on Windows');
      return;
    }

    fs.mkdirSync(path.join(tmpDir, 'locked'));
    fs.writeFileSync(path.join(tmpDir, 'locked', 'secret.md'), '# secret');
    fs.chmodSync(path.join(tmpDir, 'locked'), 0o000);

    // A readable sibling to prove the walk continues
    fs.writeFileSync(path.join(tmpDir, 'visible.md'), '# visible');

    const { dispatcher } = makeDispatcher();
    const { scanner, vaultIndex } = makeScanner({
      vaultDetector: makeVaultDetector(tmpDir),
      dispatcher,
    });

    try {
      await expect(scanner.scan(toFileUri(tmpDir))).resolves.toBeUndefined();
      // The locked dir is silently skipped; the visible sibling is indexed
      expect(vaultIndex.has(id('visible'))).toBe(true);
      // secret.md was inside the locked dir and therefore not indexed
      expect(vaultIndex.has(id('locked/secret'))).toBe(false);
    } finally {
      // Restore permissions so afterEach cleanup can delete the dir
      fs.chmodSync(path.join(tmpDir, 'locked'), 0o755);
    }
  });

  // ── 8. Consecutive scans reset assetIndex ────────────────────────────────

  it('second scan on empty vault clears assetIndex from first scan', async () => {
    // First scan: vault has an asset
    fs.writeFileSync(path.join(tmpDir, 'image.jpg'), 'JPG');

    const { dispatcher } = makeDispatcher();
    const { scanner } = makeScanner({
      vaultDetector: makeVaultDetector(tmpDir),
      dispatcher,
    });

    await scanner.scan(toFileUri(tmpDir));
    expect(scanner.hasAsset('image.jpg')).toBe(true);

    // Remove the asset and scan again
    fs.rmSync(path.join(tmpDir, 'image.jpg'));

    await scanner.scan(toFileUri(tmpDir));
    expect(scanner.hasAsset('image.jpg')).toBe(false);
    expect(scanner.getAssetIndex().size).toBe(0);
  });
});

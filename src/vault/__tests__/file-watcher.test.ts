import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FileWatcher } from '../file-watcher.js';
import { VaultIndex } from '../vault-index.js';
import { FolderLookup } from '../folder-lookup.js';
import { IgnoreFilter } from '../ignore-filter.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import type { TagRegistry } from '../../tags/tag-registry.js';
import type { VaultScanner } from '../vault-scanner.js';
import type { DocId } from '../doc-id.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function id(s: string): DocId {
  return s as DocId;
}

function makeTagRegistry(): TagRegistry {
  return {
    rebuild: () => {},
    removeDoc: (_id: unknown) => {},
    addDoc: (_id: unknown, _doc: unknown) => {},
  } as unknown as TagRegistry;
}

/** Call FileWatcher.handleEvent (private) via bracket notation. */
async function callHandleEvent(
  watcher: FileWatcher,
  eventType: string,
  filename: string | null,
): Promise<void> {
  await (
    watcher as unknown as { handleEvent(e: string, f: string | null): Promise<void> }
  ).handleEvent(eventType, filename);
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('FileWatcher', () => {
  let vaultRoot: string;
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let ignoreFilter: IgnoreFilter;
  let assetIndex: Set<string>;
  let tagRegistry: TagRegistry;
  let watcher: FileWatcher;

  beforeEach(() => {
    vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fglsp-fw-'));
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    ignoreFilter = new IgnoreFilter();
    const ofmParser = new OFMParser();
    assetIndex = new Set<string>();
    const vaultScanner = { getAssetIndex: () => assetIndex } as unknown as VaultScanner;
    tagRegistry = makeTagRegistry();
    watcher = new FileWatcher(
      vaultIndex,
      folderLookup,
      ignoreFilter,
      ofmParser,
      tagRegistry,
      vaultScanner,
    );
    watcher.start(vaultRoot);
  });

  afterEach(() => {
    watcher.stop();
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  });

  // ── 1. start() activates the watcher ────────────────────────────────────

  it('start() sets resolvedRoot and activates the watcher', () => {
    // After start() the internal FSWatcher must be non-null
    expect((watcher as unknown as Record<string, unknown>)['watcher']).not.toBeNull();
  });

  // ── 2. stop() deactivates the watcher ───────────────────────────────────

  it('stop() closes the watcher and nulls the field', () => {
    watcher.stop();
    expect((watcher as unknown as Record<string, unknown>)['watcher']).toBeNull();
  });

  // ── 3. null filename guard ───────────────────────────────────────────────
  //
  // The null check (`if (filename === null) return`) lives at the top of
  // handleEvent.  Calling handleEvent directly with null must not throw and
  // must leave vaultIndex unchanged.

  it('handleEvent silently drops null filename (no throw, vaultIndex unchanged)', async () => {
    await expect(callHandleEvent(watcher, 'change', null)).resolves.toBeUndefined();
    expect(vaultIndex.size()).toBe(0);
  });

  // ── 4. ADR013: path outside vault root is ignored ────────────────────────

  it('handleEvent ignores paths that escape the vault root (ADR013)', async () => {
    // '../outside.md' resolves to the parent of vaultRoot — outside the root
    await callHandleEvent(watcher, 'change', '../outside.md');
    expect(vaultIndex.size()).toBe(0);
  });

  // ── 5. IgnoreFilter blocks .obsidian paths ───────────────────────────────

  it('handleEvent ignores files that the IgnoreFilter blocks', async () => {
    // Create the file so it exists on disk (the filter check happens before any read)
    fs.mkdirSync(path.join(vaultRoot, '.obsidian'), { recursive: true });
    fs.writeFileSync(path.join(vaultRoot, '.obsidian', 'config'), '{}');

    await callHandleEvent(watcher, 'change', '.obsidian/config');

    expect(vaultIndex.size()).toBe(0);
    expect(assetIndex.size).toBe(0);
  });

  // ── 6. handleEvent 'change' on .md → upsertFile ──────────────────────────

  it("handleEvent 'change' on existing .md file indexes the document", async () => {
    fs.writeFileSync(path.join(vaultRoot, 'note.md'), '# Hello');

    await callHandleEvent(watcher, 'change', 'note.md');

    expect(vaultIndex.has(id('note'))).toBe(true);
  });

  // ── 7. handleEvent 'rename' on existing .md → upsertFile ─────────────────

  it("handleEvent 'rename' on existing .md file indexes the document", async () => {
    fs.writeFileSync(path.join(vaultRoot, 'note.md'), '# Hello');

    await callHandleEvent(watcher, 'rename', 'note.md');

    expect(vaultIndex.has(id('note'))).toBe(true);
  });

  // ── 8. handleEvent 'rename' on deleted .md → deleteFile ──────────────────

  it("handleEvent 'rename' on deleted .md file removes the document from vaultIndex", async () => {
    // Pre-populate the index — simulates a previously seen file
    const ofmParser = new OFMParser();
    const absPath = path.join(vaultRoot, 'note.md');
    const uri = `file://${absPath.split(path.sep).join('/')}`;
    const doc = ofmParser.parse(uri, '# Hello', 0);
    vaultIndex.set(id('note'), doc);

    // Do NOT write the file — it should not exist on disk
    await callHandleEvent(watcher, 'rename', 'note.md');

    expect(vaultIndex.has(id('note'))).toBe(false);
  });

  // ── 9. handleEvent 'rename' for existing non-md → add to assetIndex ──────

  it("handleEvent 'rename' on existing non-md file adds it to assetIndex", async () => {
    fs.writeFileSync(path.join(vaultRoot, 'photo.png'), 'PNG');

    await callHandleEvent(watcher, 'rename', 'photo.png');

    expect(assetIndex.has('photo.png')).toBe(true);
  });

  // ── 10. handleEvent 'rename' for deleted non-md → remove from assetIndex ──

  it("handleEvent 'rename' on deleted non-md file removes it from assetIndex", async () => {
    // Pre-populate assetIndex
    assetIndex.add('photo.png');

    // Do NOT write the file — it should not exist on disk
    await callHandleEvent(watcher, 'rename', 'photo.png');

    expect(assetIndex.has('photo.png')).toBe(false);
  });

  // ── 11. handleEvent 'change' on non-md → no-op ───────────────────────────

  it("handleEvent 'change' on non-md file is a no-op (assetIndex unchanged)", async () => {
    fs.writeFileSync(path.join(vaultRoot, 'photo.png'), 'PNG');

    await callHandleEvent(watcher, 'change', 'photo.png');

    expect(assetIndex.size).toBe(0);
  });
});

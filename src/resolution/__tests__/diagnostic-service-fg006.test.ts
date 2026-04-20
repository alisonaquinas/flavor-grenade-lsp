import { describe, it, expect, beforeEach } from '@jest/globals';
import { DiagnosticService } from '../diagnostic-service.js';
import { Oracle } from '../oracle.js';
import { EmbedResolver } from '../embed-resolver.js';
import { VaultScanner } from '../../vault/vault-scanner.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { VaultDetector } from '../../vault/vault-detector.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';
import type { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeDoc(uri: string, text: string, frontmatterEndOffset = 0): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset,
    opaqueRegions: [],
    text,
    index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
  };
}

function makeVaultDetector(): VaultDetector {
  return {
    detect: (_path: string) => ({ mode: 'obsidian', vaultRoot: '/vault' }),
  } as unknown as VaultDetector;
}

describe('DiagnosticService — FG006 (NBSP detection)', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let embedResolver: EmbedResolver;
  let parseCache: ParseCache;
  let sentNotifications: Array<{ method: string; params: unknown }>;

  function makeDispatcher(): JsonRpcDispatcher {
    return {
      sendNotification(method: string, params: unknown) {
        sentNotifications.push({ method, params });
      },
    } as unknown as JsonRpcDispatcher;
  }

  beforeEach(() => {
    sentNotifications = [];
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    parseCache = new ParseCache();
    const vaultScanner = {
      hasAsset: () => false,
      getAssetIndex: () => new Set<string>(),
    } as unknown as VaultScanner;
    embedResolver = new EmbedResolver(oracle, vaultScanner);
  });

  it('emits FG006 for U+00A0 (NBSP) in document body', () => {
    folderLookup.rebuild(vaultIndex);
    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
    );

    // Document body has a non-breaking space at position 5
    const text = 'Hello\u00A0world';
    const doc = makeDoc('file:///vault/alpha.md', text, 0);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    const fg006Diags = (params.diagnostics as Array<Record<string, unknown>>).filter(
      (d) => d['code'] === 'FG006',
    );
    expect(fg006Diags).toHaveLength(1);
    expect(fg006Diags[0]['severity']).toBe(2); // Warning
    expect(fg006Diags[0]['source']).toBe('flavor-grenade');
    expect(fg006Diags[0]['message']).toContain('non-breaking');
  });

  it('does NOT emit FG006 for NBSP inside frontmatter', () => {
    folderLookup.rebuild(vaultIndex);
    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
    );

    // NBSP is in frontmatter (before offset 20), body is clean
    const text = '---\ntitle: Hello\u00A0World\n---\nclean body text';
    // frontmatter occupies lines 0-2, offset of '---\n' end is after 'Hello\u00A0World\n---\n'
    // frontmatterEndOffset = position after closing ---
    const fmEnd = text.indexOf('---\n', 4) + 4; // position after closing ---\n
    const doc = makeDoc('file:///vault/alpha.md', text, fmEnd);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    const fg006Diags = (params.diagnostics as Array<Record<string, unknown>>).filter(
      (d) => d['code'] === 'FG006',
    );
    expect(fg006Diags).toHaveLength(0);
  });

  it('emits FG006 with severity 2 (Warning)', () => {
    folderLookup.rebuild(vaultIndex);
    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
    );

    const text = 'Some\u00A0text here';
    const doc = makeDoc('file:///vault/alpha.md', text, 0);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    const fg006Diags = (params.diagnostics as Array<Record<string, unknown>>).filter(
      (d) => d['code'] === 'FG006',
    );
    expect(fg006Diags).toHaveLength(1);
    expect(fg006Diags[0]['severity']).toBe(2);
  });

  it('emits correct range for NBSP character', () => {
    folderLookup.rebuild(vaultIndex);
    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
    );

    // NBSP at char 5 on line 0
    const text = 'Hello\u00A0world';
    const doc = makeDoc('file:///vault/alpha.md', text, 0);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    const fg006Diags = (params.diagnostics as Array<Record<string, unknown>>).filter(
      (d) => d['code'] === 'FG006',
    );
    const diag = fg006Diags[0];
    const range = diag['range'] as {
      start: { line: number; character: number };
      end: { line: number; character: number };
    };
    expect(range.start.line).toBe(0);
    expect(range.start.character).toBe(5);
    expect(range.end.character).toBe(6);
  });

  it('emits multiple FG006 for multiple NBSPs in body', () => {
    folderLookup.rebuild(vaultIndex);
    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
    );

    const text = 'A\u00A0B\u00A0C';
    const doc = makeDoc('file:///vault/alpha.md', text, 0);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    const fg006Diags = (params.diagnostics as Array<Record<string, unknown>>).filter(
      (d) => d['code'] === 'FG006',
    );
    expect(fg006Diags).toHaveLength(2);
  });
});

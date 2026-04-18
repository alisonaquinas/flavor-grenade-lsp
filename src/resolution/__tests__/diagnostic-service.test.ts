import { describe, it, expect, beforeEach } from '@jest/globals';
import { DiagnosticService } from '../diagnostic-service.js';
import { Oracle } from '../oracle.js';
import { EmbedResolver } from '../embed-resolver.js';
import { VaultScanner } from '../../vault/vault-scanner.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { VaultDetector } from '../../vault/vault-detector.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, WikiLinkEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';
import type { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';

function id(s: string): DocId {
  return s as DocId;
}

const RANGE = {
  start: { line: 0, character: 0 },
  end: { line: 0, character: 15 },
};

function makeWikiLink(target: string, range = RANGE): WikiLinkEntry {
  return { raw: `[[${target}]]`, target, range };
}

function makeDoc(uri: string, wikiLinks: WikiLinkEntry[] = []): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: { wikiLinks, embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
  };
}

/** A mock VaultDetector that always returns obsidian vault mode. */
function makeVaultDetector(): VaultDetector {
  return {
    detect: (_path: string) => ({ mode: 'obsidian', vaultRoot: '/vault' }),
  } as unknown as VaultDetector;
}

/** A mock VaultDetector that always returns single-file mode. */
function makeSingleFileDetector(): VaultDetector {
  return {
    detect: (_path: string) => ({ mode: 'single-file', vaultRoot: null }),
  } as unknown as VaultDetector;
}

describe('DiagnosticService', () => {
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

  it('publishes FG001 for a broken wiki-link', () => {
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
    );
    const doc = makeDoc('file:///vault/alpha.md', [makeWikiLink('nonexistent')]);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    expect(sentNotifications).toHaveLength(1);
    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(1);
    const diag = params.diagnostics[0] as Record<string, unknown>;
    expect(diag['code']).toBe('FG001');
    expect(diag['severity']).toBe(1);
    expect(diag['source']).toBe('flavor-grenade');
  });

  it('publishes FG002 for an ambiguous wiki-link with relatedInformation', () => {
    vaultIndex.set(id('notes/gamma'), makeDoc('file:///vault/notes/gamma.md'));
    vaultIndex.set(id('other/gamma'), makeDoc('file:///vault/other/gamma.md'));
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
    );
    const doc = makeDoc('file:///vault/alpha.md', [makeWikiLink('gamma')]);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(1);
    const diag = params.diagnostics[0] as Record<string, unknown>;
    expect(diag['code']).toBe('FG002');
    const related = diag['relatedInformation'] as unknown[];
    expect(related).toHaveLength(2);
  });

  it('publishes FG003 for a malformed wiki-link', () => {
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
    );
    const doc = makeDoc('file:///vault/alpha.md', [makeWikiLink('   ')]);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    const diag = params.diagnostics[0] as Record<string, unknown>;
    expect(diag['code']).toBe('FG003');
  });

  it('publishes empty diagnostics in single-file mode', () => {
    folderLookup.rebuild(vaultIndex);
    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeSingleFileDetector(),
    );
    const doc = makeDoc('file:///vault/alpha.md', [makeWikiLink('nonexistent')]);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(0);
  });

  it('publishes empty diagnostics when no wiki-links', () => {
    folderLookup.rebuild(vaultIndex);
    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
    );
    const doc = makeDoc('file:///vault/alpha.md', []);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(0);
  });
});

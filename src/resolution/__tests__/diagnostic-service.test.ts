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

function makeBlockRefLink(blockRef: string, target = ''): WikiLinkEntry {
  return { raw: `[[${target}#^${blockRef}]]`, target, blockRef, range: RANGE };
}

function makeDocWithAnchors(
  uri: string,
  wikiLinks: WikiLinkEntry[],
  anchors: string[],
  embeds: OFMDoc['index']['embeds'] = [],
): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: {
      wikiLinks,
      embeds,
      tags: [],
      callouts: [],
      headings: [],
      blockAnchors: anchors.map((anchorId) => ({ id: anchorId, range: RANGE })),
    },
  };
}

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

describe('block reference diagnostics', () => {
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

  it('FG005 — intra-doc, anchor missing', () => {
    // Doc with [[#^ghost]] but no blockAnchors
    const docUri = 'file:///vault/alpha.md';
    const doc = makeDocWithAnchors(docUri, [makeBlockRefLink('ghost')], []);
    vaultIndex.set(id('alpha'), doc);
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(1);
    const diag = params.diagnostics[0] as Record<string, unknown>;
    expect(diag['code']).toBe('FG005');
    expect(diag['severity']).toBe(1);
    expect(diag['source']).toBe('flavor-grenade');
  });

  it('no diagnostic — intra-doc, anchor found', () => {
    // Doc with [[#^abc]] and blockAnchors: ['abc']
    const docUri = 'file:///vault/alpha.md';
    const doc = makeDocWithAnchors(docUri, [makeBlockRefLink('abc')], ['abc']);
    vaultIndex.set(id('alpha'), doc);
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(0);
  });

  it('FG001 — cross-doc block ref, target broken', () => {
    // [[missing#^id]] — 'missing' not in vaultIndex
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );
    const doc = makeDocWithAnchors(
      'file:///vault/alpha.md',
      [makeBlockRefLink('id', 'missing')],
      [],
    );

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(1);
    const diag = params.diagnostics[0] as Record<string, unknown>;
    expect(diag['code']).toBe('FG001');
    expect(diag['severity']).toBe(1);
  });

  it('FG002 — cross-doc block ref, target ambiguous', () => {
    // [[gamma#^id]] — two 'gamma' docs in vault
    vaultIndex.set(id('notes/gamma'), makeDocWithAnchors('file:///vault/notes/gamma.md', [], []));
    vaultIndex.set(id('other/gamma'), makeDocWithAnchors('file:///vault/other/gamma.md', [], []));
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );
    const doc = makeDocWithAnchors('file:///vault/alpha.md', [makeBlockRefLink('id', 'gamma')], []);

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

  it('FG003 — cross-doc block ref, malformed target', () => {
    // [[   #^id]] — whitespace-only target → malformed
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );
    const doc = makeDocWithAnchors('file:///vault/alpha.md', [makeBlockRefLink('id', '   ')], []);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(1);
    const diag = params.diagnostics[0] as Record<string, unknown>;
    expect(diag['code']).toBe('FG003');
  });

  it('FG005 — cross-doc block ref, target resolves, anchor missing', () => {
    // [[beta#^ghost]] — 'beta' in vault but no anchors
    const betaDoc = makeDocWithAnchors('file:///vault/beta.md', [], []);
    vaultIndex.set(id('beta'), betaDoc);
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );
    const doc = makeDocWithAnchors(
      'file:///vault/alpha.md',
      [makeBlockRefLink('ghost', 'beta')],
      [],
    );

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(1);
    const diag = params.diagnostics[0] as Record<string, unknown>;
    expect(diag['code']).toBe('FG005');
    expect(diag['severity']).toBe(1);
  });

  it('no diagnostic — cross-doc block ref, target resolves, anchor found', () => {
    // [[beta#^abc]] — 'beta' in vault with blockAnchors: ['abc']
    const betaDoc = makeDocWithAnchors('file:///vault/beta.md', [], ['abc']);
    vaultIndex.set(id('beta'), betaDoc);
    folderLookup.rebuild(vaultIndex);

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );
    const doc = makeDocWithAnchors('file:///vault/alpha.md', [makeBlockRefLink('abc', 'beta')], []);

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(0);
  });
});

describe('embed diagnostics', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
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
    folderLookup.rebuild(vaultIndex);
  });

  it('FG004 — broken embed', () => {
    const brokenEmbedResolver = {
      resolve: () => ({ kind: 'broken' }),
    } as unknown as EmbedResolver;

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      brokenEmbedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );

    const doc = makeDocWithAnchors(
      'file:///vault/alpha.md',
      [],
      [],
      [{ raw: '![[photo.png]]', target: 'photo.png', range: RANGE }],
    );

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(1);
    const diag = params.diagnostics[0] as Record<string, unknown>;
    expect(diag['code']).toBe('FG004');
    expect(diag['severity']).toBe(2);
    expect(diag['source']).toBe('flavor-grenade');
  });

  it('no diagnostic — resolved embed', () => {
    const resolvedEmbedResolver = {
      resolve: () => ({ kind: 'markdown', targetDocId: id('beta') }),
    } as unknown as EmbedResolver;

    const service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      resolvedEmbedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );

    const doc = makeDocWithAnchors(
      'file:///vault/alpha.md',
      [],
      [],
      [{ raw: '![[beta.md]]', target: 'beta.md', range: RANGE }],
    );

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    const { params } = sentNotifications[0] as {
      params: { uri: string; diagnostics: unknown[] };
    };
    expect(params.diagnostics).toHaveLength(0);
  });
});

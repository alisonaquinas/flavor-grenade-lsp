import { describe, it, expect, beforeEach } from '@jest/globals';
import { DiagnosticService } from '../diagnostic-service.js';
import { EmbedResolver } from '../embed-resolver.js';
import { Oracle } from '../oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';
import type { OFMDoc, MarkdownImageRef, EmbedEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';
import type { VaultDetector } from '../../vault/vault-detector.js';
import type { VaultScanner } from '../../vault/vault-scanner.js';

const RANGE = {
  start: { line: 0, character: 0 },
  end: { line: 0, character: 24 },
};

function id(value: string): DocId {
  return value as DocId;
}

function makeVaultDetector(): VaultDetector {
  return {
    detect: (_path: string) => ({ mode: 'obsidian', vaultRoot: '/vault' }),
  } as unknown as VaultDetector;
}

function makeMarkdownImage(target: string): MarkdownImageRef {
  return {
    raw: `![Diagram](${target})`,
    alt: 'Diagram',
    target,
    range: RANGE,
    altRange: RANGE,
    targetRange: RANGE,
  };
}

function makeEmbed(target: string): EmbedEntry {
  return {
    raw: `![[${target}]]`,
    target,
    range: RANGE,
  };
}

function makeDoc({
  markdownImages = [],
  embeds = [],
}: {
  markdownImages?: MarkdownImageRef[];
  embeds?: EmbedEntry[];
} = {}): OFMDoc {
  return {
    uri: 'file:///vault/alpha.md',
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: {
      wikiLinks: [],
      embeds,
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [],
      markdownLinks: [],
      markdownImages,
      linkLabelRefs: [],
      linkLabelDefs: [],
    },
  };
}

describe('attachment diagnostics', () => {
  let vaultIndex: VaultIndex;
  let service: DiagnosticService;
  let sentNotifications: Array<{ method: string; params: unknown }>;

  function makeDispatcher(): JsonRpcDispatcher {
    return {
      sendNotification(method: string, params: unknown) {
        sentNotifications.push({ method, params });
      },
    } as unknown as JsonRpcDispatcher;
  }

  function diagnostics(): Array<Record<string, unknown>> {
    const { params } = sentNotifications[0] as {
      params: { diagnostics: Array<Record<string, unknown>> };
    };
    return params.diagnostics;
  }

  beforeEach(() => {
    sentNotifications = [];
    vaultIndex = new VaultIndex();
    const folderLookup = new FolderLookup();
    const oracle = new Oracle(folderLookup, vaultIndex);
    const vaultScanner = {
      hasAsset: (target: string) => vaultIndex.hasAttachment(target),
      getAssetIndex: () =>
        new Set(Array.from(vaultIndex.attachments(), (attachment) => attachment.path)),
    } as unknown as VaultScanner;
    const embedResolver = new EmbedResolver(oracle, vaultScanner);
    folderLookup.rebuild(vaultIndex);

    service = new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      new ParseCache(),
      makeVaultDetector(),
      vaultIndex,
    );
  });

  it('publishes FG004 warning for a missing Markdown image attachment', () => {
    const doc = makeDoc({ markdownImages: [makeMarkdownImage('assets/missing.png')] });

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    expect(diagnostics()).toHaveLength(1);
    expect(diagnostics()[0]).toMatchObject({
      code: 'FG004',
      severity: 2,
      source: 'flavor-grenade',
    });
  });

  it('publishes no diagnostic for an indexed Markdown image attachment', () => {
    vaultIndex.setAttachment({
      path: 'assets/diagram.png',
      uri: 'file:///vault/assets/diagram.png',
      extension: 'png',
      kind: 'image',
      sizeBytes: 42,
    });
    const doc = makeDoc({ markdownImages: [makeMarkdownImage('assets/diagram.png')] });

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    expect(diagnostics()).toHaveLength(0);
  });

  it('publishes no diagnostic for external Markdown image URLs', () => {
    const doc = makeDoc({ markdownImages: [makeMarkdownImage('https://example.test/image.png')] });

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    expect(diagnostics()).toHaveLength(0);
  });

  it('publishes no diagnostic for an indexed non-image attachment embed', () => {
    vaultIndex.setAttachment({
      path: 'files/manual.pdf',
      uri: 'file:///vault/files/manual.pdf',
      extension: 'pdf',
      kind: 'pdf',
      sizeBytes: 1024,
    });
    const doc = makeDoc({ embeds: [makeEmbed('files/manual.pdf')] });

    service.publishDiagnostics(id('alpha'), doc, '/vault');

    expect(diagnostics()).toHaveLength(0);
  });
});

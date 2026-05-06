import { describe, it, expect, beforeEach } from '@jest/globals';
import type { Diagnostic } from 'vscode-languageserver-types';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';
import type { VaultDetector } from '../../vault/vault-detector.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import type { DocId } from '../../vault/doc-id.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { VaultScanner } from '../../vault/vault-scanner.js';
import { EmbedResolver } from '../embed-resolver.js';
import { Oracle } from '../oracle.js';
import { DiagnosticService } from '../diagnostic-service.js';

function id(value: string): DocId {
  return value as DocId;
}

function makeVaultDetector(): VaultDetector {
  return {
    detect: (_path: string) => ({ mode: 'obsidian', vaultRoot: '/vault' }),
  } as unknown as VaultDetector;
}

describe('DiagnosticService Markdown links', () => {
  let parser: OFMParser;
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let embedResolver: EmbedResolver;
  let parseCache: ParseCache;
  let sentNotifications: Array<{
    method: string;
    params: { uri: string; diagnostics: Diagnostic[] };
  }>;

  function makeDispatcher(): JsonRpcDispatcher {
    return {
      sendNotification(method: string, params: { uri: string; diagnostics: Diagnostic[] }) {
        sentNotifications.push({ method, params });
      },
    } as unknown as JsonRpcDispatcher;
  }

  function makeService(): DiagnosticService {
    return new DiagnosticService(
      makeDispatcher(),
      oracle,
      embedResolver,
      parseCache,
      makeVaultDetector(),
      vaultIndex,
    );
  }

  beforeEach(() => {
    parser = new OFMParser();
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    parseCache = new ParseCache();
    sentNotifications = [];
    const vaultScanner = {
      hasAsset: () => false,
      getAssetIndex: () => new Set<string>(),
    } as unknown as VaultScanner;
    embedResolver = new EmbedResolver(oracle, vaultScanner);
  });

  it('suppresses diagnostics for external Markdown URLs', () => {
    const doc = parser.parse(
      'file:///vault/notes/source.md',
      '[External](https://example.com/page)',
      1,
    );
    vaultIndex.set(id('notes/source'), doc);
    folderLookup.rebuild(vaultIndex);

    makeService().publishDiagnostics(id('notes/source'), doc, '/vault');

    expect(sentNotifications[0].params.diagnostics).toHaveLength(0);
  });

  it('diagnoses missing same-document heading anchors on the target range', () => {
    const doc = parser.parse(
      'file:///vault/notes/source.md',
      '# Existing\n\n[Missing](#Missing)',
      1,
    );
    vaultIndex.set(id('notes/source'), doc);
    folderLookup.rebuild(vaultIndex);

    makeService().publishDiagnostics(id('notes/source'), doc, '/vault');

    const diag = sentNotifications[0].params.diagnostics[0];
    expect(diag.code).toBe('FG001');
    expect(diag.message).toContain("heading 'Missing' not found");
    expect(diag.range).toEqual(doc.index.markdownLinks[0].targetRange);
  });

  it('diagnoses ambiguous same-document heading anchors with related heading ranges', () => {
    const doc = parser.parse(
      'file:///vault/notes/source.md',
      '# Overview\n## Overview\n\n[Overview](#overview)',
      1,
    );
    vaultIndex.set(id('notes/source'), doc);
    folderLookup.rebuild(vaultIndex);

    makeService().publishDiagnostics(id('notes/source'), doc, '/vault');

    const diag = sentNotifications[0].params.diagnostics[0];
    expect(diag.code).toBe('FG002');
    expect(diag.relatedInformation).toHaveLength(2);
    expect(diag.relatedInformation[0].location.range).toEqual(doc.index.headings[0].range);
    expect(diag.relatedInformation[1].location.range).toEqual(doc.index.headings[1].range);
  });
});

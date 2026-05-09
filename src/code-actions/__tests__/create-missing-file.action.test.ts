import { describe, it, expect, beforeEach } from '@jest/globals';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CreateMissingFileAction } from '../create-missing-file.action.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, WikiLinkEntry } from '../../parser/types.js';
import type { Diagnostic } from 'vscode-languageserver-types';

function makeVaultDetector(vaultRoot: string): VaultDetector {
  return {
    detectFresh: (_path: string) => ({ mode: 'obsidian', vaultRoot }),
  } as unknown as VaultDetector;
}

const VAULT_ROOT = path.resolve('/vault');
const DOC_URI = pathToFileURL(path.join(VAULT_ROOT, 'test.md')).toString();

describe('CreateMissingFileAction', () => {
  let vaultDetector: VaultDetector;
  let parseCache: ParseCache;
  let action: CreateMissingFileAction;

  beforeEach(() => {
    vaultDetector = makeVaultDetector(VAULT_ROOT);
    parseCache = new ParseCache();
    action = new CreateMissingFileAction(vaultDetector, parseCache);
  });

  function cacheDocWithLink(entry: WikiLinkEntry): void {
    const doc: OFMDoc = {
      uri: DOC_URI,
      version: 0,
      text: entry.raw,
      frontmatter: null,
      frontmatterEndOffset: 0,
      opaqueRegions: [],
      index: {
        wikiLinks: [entry],
        embeds: [],
        blockAnchors: [],
        tags: [],
        callouts: [],
        headings: [],
        markdownLinks: [],
        markdownImages: [],
        linkLabelRefs: [],
        linkLabelDefs: [],
      },
    };
    parseCache.set(DOC_URI, doc);
  }

  it('creates a CodeAction with CreateFile documentChange', () => {
    const diag: Diagnostic = {
      range: { start: { line: 1, character: 0 }, end: { line: 1, character: 15 } },
      severity: 1,
      code: 'FG001',
      source: 'flavor-grenade',
      message: "Cannot resolve wiki-link: 'missing-file' not found in vault",
    };
    cacheDocWithLink({ raw: '[[missing-file]]', target: 'missing-file', range: diag.range });

    const params = {
      textDocument: { uri: DOC_URI },
      range: diag.range,
      context: { diagnostics: [diag] },
    };

    const result = action.handle(params, [diag]);

    expect(result).toHaveLength(1);
    const ca = result[0];
    expect(ca.edit?.documentChanges).toBeDefined();
    const changes = ca.edit!.documentChanges!;
    expect(changes).toHaveLength(1);
    const createFile = changes[0] as {
      kind: string;
      uri: string;
      options?: { ignoreIfExists?: boolean };
    };
    expect(createFile.kind).toBe('create');
    expect(createFile.options?.ignoreIfExists).toBe(true);
  });

  it('formats title as "Create missing file"', () => {
    const diag: Diagnostic = {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      severity: 1,
      code: 'FG001',
      source: 'flavor-grenade',
      message: "Cannot resolve wiki-link: 'my-note' not found in vault",
    };
    cacheDocWithLink({ raw: '[[my-note]]', target: 'my-note', range: diag.range });

    const params = {
      textDocument: { uri: DOC_URI },
      range: diag.range,
      context: { diagnostics: [diag] },
    };

    const result = action.handle(params, [diag]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Create missing file');
  });

  it('creates URI within vault root', () => {
    const diag: Diagnostic = {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      severity: 1,
      code: 'FG001',
      source: 'flavor-grenade',
      message: "Cannot resolve wiki-link: 'new-doc' not found in vault",
    };
    cacheDocWithLink({ raw: '[[new-doc]]', target: 'new-doc', range: diag.range });

    const params = {
      textDocument: { uri: DOC_URI },
      range: diag.range,
      context: { diagnostics: [diag] },
    };

    const result = action.handle(params, [diag]);
    expect(result).toHaveLength(1);
    const createFile = result[0].edit!.documentChanges![0] as { kind: string; uri: string };
    expect(createFile.uri).toContain('new-doc.md');
    // URI must reference vault root
    expect(createFile.uri).toContain('vault');
  });

  it('returns empty array for empty diagnostics', () => {
    const params = {
      textDocument: { uri: DOC_URI },
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      context: { diagnostics: [] },
    };

    const result = action.handle(params, []);
    expect(result).toHaveLength(0);
  });

  it('rejects forged diagnostics that do not match a parsed wiki-link', () => {
    const diag: Diagnostic = {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 13 } },
      severity: 1,
      code: 'FG001',
      source: 'flavor-grenade',
      message: "Cannot resolve wiki-link: '../outside' not found in vault",
    };
    cacheDocWithLink({ raw: '[[safe-note]]', target: 'safe-note', range: diag.range });

    const params = {
      textDocument: { uri: DOC_URI },
      range: diag.range,
      context: { diagnostics: [diag] },
    };

    const result = action.handle(params, [diag]);
    expect(result).toHaveLength(0);
  });

  it('rejects parsed traversal targets outside the vault', () => {
    const diag: Diagnostic = {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 13 } },
      severity: 1,
      code: 'FG001',
      source: 'flavor-grenade',
      message: "Cannot resolve wiki-link: '../outside' not found in vault",
    };
    cacheDocWithLink({ raw: '[[../outside]]', target: '../outside', range: diag.range });

    const params = {
      textDocument: { uri: DOC_URI },
      range: diag.range,
      context: { diagnostics: [diag] },
    };

    const result = action.handle(params, [diag]);
    expect(result).toHaveLength(0);
  });
});

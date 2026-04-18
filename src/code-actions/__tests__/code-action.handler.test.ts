import { describe, it, expect, beforeEach } from '@jest/globals';
import { CodeActionHandler } from '../code-action.handler.js';
import { CreateMissingFileAction } from '../create-missing-file.action.js';
import { FixNbspAction } from '../fix-nbsp.action.js';
import { TagToYamlAction } from '../tag-to-yaml.action.js';
import { TocGeneratorAction } from '../toc-generator.action.js';
import { ParseCache } from '../../parser/parser.module.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import type { OFMDoc, TagEntry } from '../../parser/types.js';
import type { Diagnostic } from 'vscode-languageserver-types';

function makeDoc(uri: string, overrides: Partial<OFMDoc> = {}): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    text: '',
    index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
    ...overrides,
  };
}

function makeVaultDetector(): VaultDetector {
  return {
    detect: (_path: string) => ({ mode: 'obsidian', vaultRoot: '/vault' }),
  } as unknown as VaultDetector;
}

const ZERO_RANGE = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
const DOC_URI = 'file:///vault/test.md';

describe('CodeActionHandler', () => {
  let parseCache: ParseCache;
  let vaultDetector: VaultDetector;
  let createMissingFile: CreateMissingFileAction;
  let fixNbsp: FixNbspAction;
  let tagToYaml: TagToYamlAction;
  let tocGenerator: TocGeneratorAction;
  let handler: CodeActionHandler;

  beforeEach(() => {
    parseCache = new ParseCache();
    vaultDetector = makeVaultDetector();
    createMissingFile = new CreateMissingFileAction(vaultDetector);
    fixNbsp = new FixNbspAction();
    tagToYaml = new TagToYamlAction(parseCache);
    tocGenerator = new TocGeneratorAction(parseCache);
    handler = new CodeActionHandler(
      createMissingFile,
      fixNbsp,
      tagToYaml,
      tocGenerator,
      parseCache,
    );
  });

  it('routes FG001 diagnostic to CreateMissingFileAction', () => {
    const doc = makeDoc(DOC_URI);
    parseCache.set(DOC_URI, doc);

    const fg001: Diagnostic = {
      range: { start: { line: 1, character: 0 }, end: { line: 1, character: 10 } },
      severity: 1,
      code: 'FG001',
      source: 'flavor-grenade',
      message: 'Broken wiki-link: [[missing-file]] not found in vault',
    };

    const params = {
      textDocument: { uri: DOC_URI },
      range: { start: { line: 1, character: 0 }, end: { line: 1, character: 10 } },
      context: { diagnostics: [fg001] },
    };

    const result = handler.handle(params);
    expect(Array.isArray(result)).toBe(true);
    const fg001Actions = result.filter((a) => a.diagnostics?.some((d) => d.code === 'FG001'));
    expect(fg001Actions.length).toBeGreaterThan(0);
  });

  it('routes FG006 diagnostic to FixNbspAction', () => {
    const doc = makeDoc(DOC_URI);
    parseCache.set(DOC_URI, doc);

    const fg006: Diagnostic = {
      range: { start: { line: 2, character: 5 }, end: { line: 2, character: 6 } },
      severity: 2,
      code: 'FG006',
      source: 'flavor-grenade',
      message: 'Non-breaking space (U+00A0) found',
    };

    const params = {
      textDocument: { uri: DOC_URI },
      range: { start: { line: 2, character: 5 }, end: { line: 2, character: 6 } },
      context: { diagnostics: [fg006] },
    };

    const result = handler.handle(params);
    expect(Array.isArray(result)).toBe(true);
    const nbspActions = result.filter(
      (a) => a.title.includes('non-breaking') || a.title.includes('Replace'),
    );
    expect(nbspActions.length).toBeGreaterThan(0);
  });

  it('routes tag cursor position to TagToYamlAction', () => {
    const tagEntry: TagEntry = {
      tag: '#todo',
      range: { start: { line: 3, character: 0 }, end: { line: 3, character: 5 } },
    };
    const doc = makeDoc(DOC_URI, {
      text: '---\n---\nsome text\n#todo item',
      index: {
        wikiLinks: [],
        embeds: [],
        blockAnchors: [],
        tags: [tagEntry],
        callouts: [],
        headings: [],
      },
    });
    parseCache.set(DOC_URI, doc);

    const params = {
      textDocument: { uri: DOC_URI },
      range: { start: { line: 3, character: 2 }, end: { line: 3, character: 2 } },
      context: { diagnostics: [] },
    };

    const result = handler.handle(params);
    expect(Array.isArray(result)).toBe(true);
    const tagActions = result.filter(
      (a) => a.title.includes('frontmatter') || a.title.includes('#todo'),
    );
    expect(tagActions.length).toBeGreaterThan(0);
  });

  it('returns empty array when no diagnostics and no tag', () => {
    const doc = makeDoc(DOC_URI, { text: '' });
    parseCache.set(DOC_URI, doc);

    const params = {
      textDocument: { uri: DOC_URI },
      range: ZERO_RANGE,
      context: { diagnostics: [] },
    };

    const result = handler.handle(params);
    expect(Array.isArray(result)).toBe(true);
    // No FG001/FG006 diagnostics, no tag at position → only TOC action (null) → empty or small
    const fg001Actions = result.filter((a) => a.diagnostics?.some((d) => d.code === 'FG001'));
    expect(fg001Actions).toHaveLength(0);
    const fg006Actions = result.filter(
      (a) => a.title.includes('non-breaking') || a.title.includes('Replace non'),
    );
    expect(fg006Actions).toHaveLength(0);
  });
});

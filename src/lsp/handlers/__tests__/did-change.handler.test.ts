import { describe, it, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { DidChangeHandler } from '../did-change.handler.js';
import { DocumentStore } from '../../services/document-store.js';
import { OFMParser } from '../../../parser/ofm-parser.js';
import { ParseCache } from '../../../parser/parser.module.js';
import { VaultDetector } from '../../../vault/vault-detector.js';
import { DiagnosticService } from '../../../resolution/diagnostic-service.js';
import { MarkdownFlavorState } from '../../../markdown-flavor/markdown-flavor-state.js';
import { MarkdownFlavorConfigFiles } from '../../../markdown-flavor/mdf-config-files.js';

const TEST_URI = 'file:///vault/test.md';
const TEST_VERSION = 2;
const UPDATED_TEXT = 'updated text';

const mockDoc = {
  uri: TEST_URI,
  version: TEST_VERSION,
  frontmatter: null,
  frontmatterEndOffset: 0,
  opaqueRegions: [],
  text: UPDATED_TEXT,
  index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
};

function makeParams(contentChanges: unknown[] = [{ text: UPDATED_TEXT }]): {
  textDocument: { uri: string; version: number };
  contentChanges: unknown[];
} {
  return {
    textDocument: { uri: TEST_URI, version: TEST_VERSION },
    contentChanges,
  };
}

describe('DidChangeHandler', () => {
  let store: DocumentStore;
  let ofmParser: OFMParser;
  let parseCache: ParseCache;
  let vaultDetector: VaultDetector;
  let diagnosticService: DiagnosticService;
  let mockTextDoc: {
    uri: string;
    languageId: string;
    version: number;
    getText: ReturnType<typeof jest.fn>;
  };

  beforeEach(() => {
    mockTextDoc = {
      uri: TEST_URI,
      languageId: 'markdown',
      version: TEST_VERSION,
      getText: jest.fn().mockReturnValue(UPDATED_TEXT),
    };
    store = {
      open: jest.fn(),
      get: jest.fn().mockReturnValue(mockTextDoc),
      update: jest.fn(),
      close: jest.fn(),
    } as unknown as DocumentStore;
    ofmParser = { parse: jest.fn().mockReturnValue(mockDoc) } as unknown as OFMParser;
    parseCache = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    } as unknown as ParseCache;
    vaultDetector = {
      detectFresh: jest.fn().mockReturnValue({ mode: 'obsidian', vaultRoot: '/vault' }),
    } as unknown as VaultDetector;
    diagnosticService = {
      publishDiagnostics: jest.fn(),
      clearDiagnostics: jest.fn(),
    } as unknown as DiagnosticService;
  });

  it('calls store.update(uri, contentChanges, version)', async () => {
    const handler = new DidChangeHandler(store, ofmParser, parseCache, vaultDetector, null);
    const changes = [{ text: UPDATED_TEXT }];
    await handler.handle(makeParams(changes));
    expect(store.update).toHaveBeenCalledWith(TEST_URI, changes, TEST_VERSION);
  });

  it('calls store.get(uri) after update', async () => {
    const handler = new DidChangeHandler(store, ofmParser, parseCache, vaultDetector, null);
    await handler.handle(makeParams());
    expect(store.get).toHaveBeenCalledWith(TEST_URI);
  });

  it('calls ofmParser.parse with updated text (from store.get().getText())', async () => {
    const handler = new DidChangeHandler(store, ofmParser, parseCache, vaultDetector, null);
    await handler.handle(makeParams());
    expect(ofmParser.parse).toHaveBeenCalledWith(
      TEST_URI,
      UPDATED_TEXT,
      TEST_VERSION,
      expect.objectContaining({ effectiveFlavor: 'obsidian' }),
    );
  });

  it('calls parseCache.set with re-parsed doc', async () => {
    const handler = new DidChangeHandler(store, ofmParser, parseCache, vaultDetector, null);
    await handler.handle(makeParams());
    expect(parseCache.set).toHaveBeenCalledWith(TEST_URI, mockDoc);
  });

  it('calls diagnosticService.publishDiagnostics() when present', async () => {
    const handler = new DidChangeHandler(
      store,
      ofmParser,
      parseCache,
      vaultDetector,
      diagnosticService,
    );
    await handler.handle(makeParams());
    expect(diagnosticService.publishDiagnostics).toHaveBeenCalled();
  });

  it('skips publishDiagnostics when service is null', async () => {
    const handler = new DidChangeHandler(store, ofmParser, parseCache, vaultDetector, null);
    await handler.handle(makeParams());
    expect(diagnosticService.publishDiagnostics).not.toHaveBeenCalled();
  });

  it('no-op on diagnostics when store.get() returns undefined', async () => {
    store.get = jest.fn().mockReturnValue(undefined);
    const handler = new DidChangeHandler(
      store,
      ofmParser,
      parseCache,
      vaultDetector,
      diagnosticService,
    );
    await handler.handle(makeParams());
    expect(ofmParser.parse).not.toHaveBeenCalled();
    expect(parseCache.set).not.toHaveBeenCalled();
    expect(diagnosticService.publishDiagnostics).not.toHaveBeenCalled();
  });

  it('uses .mdfattributes flavor when parsing a changed document', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-did-change-'));
    try {
      fs.writeFileSync(path.join(root, '.mdfattributes'), 'docs/**/*.md flavor=pandoc\n');
      fs.mkdirSync(path.join(root, 'docs'));
      const note = path.join(root, 'docs', 'guide.md');
      const uri = pathToFileURL(note).toString();
      mockTextDoc.uri = uri;
      store.get = jest.fn().mockReturnValue(mockTextDoc);
      vaultDetector = {
        detectFresh: jest.fn().mockReturnValue({ mode: 'flavor-grenade', vaultRoot: root }),
      } as unknown as VaultDetector;
      const handler = new DidChangeHandler(
        store,
        ofmParser,
        parseCache,
        vaultDetector,
        null,
        new MarkdownFlavorState(),
        new MarkdownFlavorConfigFiles(),
      );

      await handler.handle({ textDocument: { uri, version: TEST_VERSION }, contentChanges: [] });

      expect(ofmParser.parse).toHaveBeenCalledWith(
        uri,
        UPDATED_TEXT,
        TEST_VERSION,
        expect.objectContaining({ effectiveFlavor: 'pandoc' }),
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('keeps a .mdfignore ignored changed document inactive', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-did-change-ignore-'));
    try {
      fs.writeFileSync(path.join(root, '.mdfignore'), 'docs/**/*.md\n');
      fs.mkdirSync(path.join(root, 'docs'));
      const note = path.join(root, 'docs', 'ignored.md');
      const uri = pathToFileURL(note).toString();
      mockTextDoc.uri = uri;
      store.get = jest.fn().mockReturnValue(mockTextDoc);
      vaultDetector = {
        detectFresh: jest.fn().mockReturnValue({ mode: 'flavor-grenade', vaultRoot: root }),
      } as unknown as VaultDetector;
      const handler = new DidChangeHandler(
        store,
        ofmParser,
        parseCache,
        vaultDetector,
        diagnosticService,
        new MarkdownFlavorState(),
        new MarkdownFlavorConfigFiles(),
      );

      await handler.handle({ textDocument: { uri, version: TEST_VERSION }, contentChanges: [] });

      expect(store.update).toHaveBeenCalledWith(uri, [], TEST_VERSION);
      expect(ofmParser.parse).not.toHaveBeenCalled();
      expect(parseCache.delete).toHaveBeenCalledWith(uri);
      expect(diagnosticService.clearDiagnostics).toHaveBeenCalledWith(uri);
      expect(diagnosticService.publishDiagnostics).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

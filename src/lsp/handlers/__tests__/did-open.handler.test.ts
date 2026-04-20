import { describe, it, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { DidOpenHandler } from '../did-open.handler.js';
import { DocumentStore } from '../../services/document-store.js';
import { OFMParser } from '../../../parser/ofm-parser.js';
import { ParseCache } from '../../../parser/parser.module.js';
import { VaultDetector } from '../../../vault/vault-detector.js';
import { DiagnosticService } from '../../../resolution/diagnostic-service.js';

const TEST_URI = 'file:///vault/test.md';
const TEST_TEXT = '# Hello\n\nSome content.';
const TEST_VERSION = 1;
const TEST_LANG = 'markdown';

const mockDoc = {
  uri: TEST_URI,
  version: TEST_VERSION,
  frontmatter: null,
  frontmatterEndOffset: 0,
  opaqueRegions: [],
  text: TEST_TEXT,
  index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
};

function makeParams(): {
  textDocument: { uri: string; languageId: string; version: number; text: string };
} {
  return {
    textDocument: {
      uri: TEST_URI,
      languageId: TEST_LANG,
      version: TEST_VERSION,
      text: TEST_TEXT,
    },
  };
}

describe('DidOpenHandler', () => {
  let store: DocumentStore;
  let ofmParser: OFMParser;
  let parseCache: ParseCache;
  let vaultDetector: VaultDetector;
  let diagnosticService: DiagnosticService;

  beforeEach(() => {
    store = {
      open: jest.fn(),
      get: jest.fn(),
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
      detect: jest.fn().mockReturnValue({ mode: 'obsidian', vaultRoot: '/vault' }),
    } as unknown as VaultDetector;
    diagnosticService = {
      publishDiagnostics: jest.fn(),
    } as unknown as DiagnosticService;
  });

  it('calls store.open(uri, languageId, version, text)', async () => {
    const handler = new DidOpenHandler(store, ofmParser, parseCache, vaultDetector, null);
    await handler.handle(makeParams());
    expect(store.open).toHaveBeenCalledWith(TEST_URI, TEST_LANG, TEST_VERSION, TEST_TEXT);
  });

  it('calls ofmParser.parse(uri, text, version)', async () => {
    const handler = new DidOpenHandler(store, ofmParser, parseCache, vaultDetector, null);
    await handler.handle(makeParams());
    expect(ofmParser.parse).toHaveBeenCalledWith(TEST_URI, TEST_TEXT, TEST_VERSION);
  });

  it('calls parseCache.set(uri, parsedDoc)', async () => {
    const handler = new DidOpenHandler(store, ofmParser, parseCache, vaultDetector, null);
    await handler.handle(makeParams());
    expect(parseCache.set).toHaveBeenCalledWith(TEST_URI, mockDoc);
  });

  it('calls diagnosticService.publishDiagnostics() when present', async () => {
    const handler = new DidOpenHandler(
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
    const handler = new DidOpenHandler(store, ofmParser, parseCache, vaultDetector, null);
    await handler.handle(makeParams());
    expect(diagnosticService.publishDiagnostics).not.toHaveBeenCalled();
  });

  it('passes empty docId when vaultRoot is null (single-file mode)', async () => {
    vaultDetector = {
      detect: jest.fn().mockReturnValue({ mode: 'single-file', vaultRoot: null }),
    } as unknown as VaultDetector;
    const handler = new DidOpenHandler(
      store,
      ofmParser,
      parseCache,
      vaultDetector,
      diagnosticService,
    );
    await handler.handle(makeParams());
    expect(diagnosticService.publishDiagnostics).toHaveBeenCalledWith(
      '',
      mockDoc,
      expect.any(String),
    );
    const fsPathArg = (diagnosticService.publishDiagnostics as ReturnType<typeof jest.fn>).mock
      .calls[0][2] as string;
    expect(fsPathArg).not.toContain('file://');
  });

  it('passes real docId when vaultRoot is non-null', async () => {
    const handler = new DidOpenHandler(
      store,
      ofmParser,
      parseCache,
      vaultDetector,
      diagnosticService,
    );
    await handler.handle(makeParams());
    const [docId, , vaultRoot] = (
      diagnosticService.publishDiagnostics as ReturnType<typeof jest.fn>
    ).mock.calls[0] as [string, unknown, string];
    expect(vaultRoot).toBe('/vault');
    expect(docId).toBeTruthy();
    expect(docId).not.toBe('');
  });
});

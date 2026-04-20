import { describe, it, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { DidCloseHandler } from '../did-close.handler.js';
import { DocumentStore } from '../../services/document-store.js';
import { ParseCache } from '../../../parser/parser.module.js';

describe('DidCloseHandler', () => {
  let store: DocumentStore;
  let parseCache: ParseCache;
  let handler: DidCloseHandler;

  beforeEach(() => {
    store = { close: jest.fn() } as unknown as DocumentStore;
    parseCache = { delete: jest.fn(), set: jest.fn(), get: jest.fn() } as unknown as ParseCache;
    handler = new DidCloseHandler(store, parseCache);
  });

  it('calls store.close(uri)', async () => {
    await handler.handle({ textDocument: { uri: 'file:///vault/note.md' } });
    expect(store.close).toHaveBeenCalledWith('file:///vault/note.md');
  });

  it('calls parseCache.delete(uri)', async () => {
    await handler.handle({ textDocument: { uri: 'file:///vault/note.md' } });
    expect(parseCache.delete).toHaveBeenCalledWith('file:///vault/note.md');
  });

  it('calls both with the same uri', async () => {
    const uri = 'file:///vault/shared-uri.md';
    await handler.handle({ textDocument: { uri } });
    expect(store.close).toHaveBeenCalledWith(uri);
    expect(parseCache.delete).toHaveBeenCalledWith(uri);
    expect((store.close as ReturnType<typeof jest.fn>).mock.calls[0][0]).toBe(
      (parseCache.delete as ReturnType<typeof jest.fn>).mock.calls[0][0],
    );
  });
});

import { describe, it, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { VaultModule } from '../vault.module.js';
import { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';
import { AwaitIndexReadyHandler } from '../handlers/await-index-ready.handler.js';
import { VaultIndex } from '../vault-index.js';
import { VaultDetector } from '../vault-detector.js';
import { DocumentMembershipService } from '../document-membership.js';

describe('VaultModule', () => {
  let mockDispatcher: JsonRpcDispatcher;
  let mockHandler: AwaitIndexReadyHandler;
  let mockIndex: VaultIndex;
  let mockDetector: VaultDetector;
  let mockMembership: DocumentMembershipService;
  let module: VaultModule;

  beforeEach(() => {
    mockDispatcher = {
      onRequest: jest.fn(),
    } as unknown as JsonRpcDispatcher;

    mockHandler = {
      markReady: jest.fn(),
      handle: jest.fn().mockResolvedValue(null),
    } as unknown as AwaitIndexReadyHandler;

    mockIndex = {
      entries: jest.fn().mockReturnValue([]),
    } as unknown as VaultIndex;

    mockDetector = {
      detect: jest.fn().mockReturnValue({ mode: 'single-file', vaultRoot: null }),
    } as unknown as VaultDetector;

    mockMembership = {
      handle: jest.fn().mockReturnValue({
        isOfMarkdown: false,
        indexed: false,
        reason: 'not-indexed',
      }),
    } as unknown as DocumentMembershipService;

    module = new VaultModule(mockDispatcher, mockHandler, mockIndex, mockDetector, mockMembership);
  });

  it('onModuleInit registers "flavorGrenade/awaitIndexReady" with dispatcher', () => {
    module.onModuleInit();

    expect(mockDispatcher.onRequest).toHaveBeenCalledWith(
      'flavorGrenade/awaitIndexReady',
      expect.any(Function),
    );
  });

  it('onModuleInit registers "flavorGrenade/documentMembership" with dispatcher', () => {
    module.onModuleInit();

    expect(mockDispatcher.onRequest).toHaveBeenCalledWith(
      'flavorGrenade/documentMembership',
      expect.any(Function),
    );
  });

  it('the registered callback calls awaitIndexReadyHandler.handle()', () => {
    module.onModuleInit();

    // Capture the callback that was registered
    const registeredCallback = (mockDispatcher.onRequest as ReturnType<typeof jest.fn>).mock
      .calls[0][1] as () => unknown;

    registeredCallback();

    expect(mockHandler.handle).toHaveBeenCalledTimes(1);
  });

  it('the registered callback returns the result of awaitIndexReadyHandler.handle()', async () => {
    const expected = Promise.resolve(null);
    (mockHandler.handle as ReturnType<typeof jest.fn>).mockReturnValue(expected);

    module.onModuleInit();

    const registeredCallback = (mockDispatcher.onRequest as ReturnType<typeof jest.fn>).mock
      .calls[0][1] as () => unknown;

    const result = registeredCallback();

    expect(result).toBe(expected);
  });

  it('the document membership callback calls DocumentMembershipService.handle()', async () => {
    module.onModuleInit();

    const registeredCallback = (
      mockDispatcher.onRequest as ReturnType<typeof jest.fn>
    ).mock.calls.find(([method]) => method === 'flavorGrenade/documentMembership')![1] as (
      params: unknown,
    ) => Promise<unknown>;

    await registeredCallback({ uri: 'file:///vault/note.md' });

    expect(mockMembership.handle).toHaveBeenCalledWith({ uri: 'file:///vault/note.md' });
  });
});

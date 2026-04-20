import { describe, it, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { VaultModule } from '../vault.module.js';
import { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';
import { AwaitIndexReadyHandler } from '../handlers/await-index-ready.handler.js';

describe('VaultModule', () => {
  let mockDispatcher: JsonRpcDispatcher;
  let mockHandler: AwaitIndexReadyHandler;
  let module: VaultModule;

  beforeEach(() => {
    mockDispatcher = {
      onRequest: jest.fn(),
    } as unknown as JsonRpcDispatcher;

    mockHandler = {
      markReady: jest.fn(),
      handle: jest.fn().mockResolvedValue(null),
    } as unknown as AwaitIndexReadyHandler;

    module = new VaultModule(mockDispatcher, mockHandler);
  });

  it('onModuleInit registers "flavorGrenade/awaitIndexReady" with dispatcher', () => {
    module.onModuleInit();

    expect(mockDispatcher.onRequest).toHaveBeenCalledWith(
      'flavorGrenade/awaitIndexReady',
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
});

import { describe, it, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { InitializeHandler } from '../initialize.handler.js';
import { CapabilityRegistry } from '../../services/capability-registry.js';
import { StatusNotifier } from '../../services/status-notifier.js';

describe('InitializeHandler', () => {
  let mockCapabilities: CapabilityRegistry;
  let mockNotifier: StatusNotifier;
  let handler: InitializeHandler;
  const fakeCapabilities = { textDocumentSync: 1, someFeature: true };

  beforeEach(() => {
    mockCapabilities = {
      getCapabilities: jest.fn().mockReturnValue(fakeCapabilities),
    } as unknown as CapabilityRegistry;
    mockNotifier = { send: jest.fn() } as unknown as StatusNotifier;
    handler = new InitializeHandler(mockCapabilities, mockNotifier);
  });

  it('result.capabilities === CapabilityRegistry.getCapabilities() return value', async () => {
    const result = await handler.handle({});
    expect(result.capabilities).toBe(fakeCapabilities);
  });

  it('result.serverInfo.name === "flavor-grenade-lsp"', async () => {
    const result = await handler.handle({});
    expect(result.serverInfo.name).toBe('flavor-grenade-lsp');
  });

  it('result.serverInfo.version === "0.1.0"', async () => {
    const result = await handler.handle({});
    expect(result.serverInfo.version).toBe('0.1.0');
  });

  it('notifier.send is NOT called synchronously', async () => {
    await handler.handle({});
    // setImmediate has not fired yet at this point
    expect(mockNotifier.send).not.toHaveBeenCalled();
  });

  it('notifier.send("initializing") IS called after setImmediate flushes', async () => {
    const notifier = { send: jest.fn() } as unknown as StatusNotifier;
    const h = new InitializeHandler(mockCapabilities, notifier);
    await h.handle({});
    // Not yet called synchronously
    expect(notifier.send).not.toHaveBeenCalled();
    // Flush setImmediate
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(notifier.send).toHaveBeenCalledWith('initializing');
  });
});

import { describe, expect, it, jest } from '@jest/globals';
import { InitializeHandler } from '../initialize.handler.js';
import { ErrorCodes } from '../../../transport/json-rpc-dispatcher.js';
import { CapabilityRegistry } from '../../services/capability-registry.js';
import { LifecycleState } from '../../services/lifecycle-state.js';
import { ServerSettings } from '../../services/server-settings.js';
import { StatusNotifier } from '../../services/status-notifier.js';

describe('InitializeHandler', () => {
  it('rejects non-file rootUri before lifecycle state is updated', async () => {
    const lifecycle = new LifecycleState();
    const notifier = { send: jest.fn() } as unknown as StatusNotifier;
    const handler = new InitializeHandler(
      new CapabilityRegistry(),
      notifier,
      lifecycle,
      new ServerSettings(),
    );

    await expect(
      handler.handle({
        rootUri: 'https://example.invalid/vault',
        capabilities: {},
      }),
    ).rejects.toMatchObject({
      code: ErrorCodes.InvalidParams,
      message: expect.stringContaining('file'),
    });
    expect(lifecycle.rootUri).toBeNull();
  });
});

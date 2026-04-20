import { describe, it, expect, beforeEach } from '@jest/globals';
import { ShutdownHandler } from '../shutdown.handler.js';
import { LifecycleState } from '../../services/lifecycle-state.js';

describe('ShutdownHandler', () => {
  let lifecycle: LifecycleState;
  let handler: ShutdownHandler;

  beforeEach(() => {
    lifecycle = new LifecycleState();
    handler = new ShutdownHandler(lifecycle);
  });

  it('sets lifecycle.shutdownRequested = true', async () => {
    expect(lifecycle.shutdownRequested).toBe(false);
    await handler.handle({});
    expect(lifecycle.shutdownRequested).toBe(true);
  });

  it('returns null', async () => {
    const result = await handler.handle({});
    expect(result).toBeNull();
  });

  it('returns null (not undefined)', async () => {
    const result = await handler.handle({});
    // Strict null check: must be null, not undefined
    expect(result === null).toBe(true);
    expect(result).not.toBeUndefined();
  });
});

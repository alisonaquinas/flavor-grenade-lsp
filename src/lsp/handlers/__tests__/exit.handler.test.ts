import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { ExitHandler } from '../exit.handler.js';
import { LifecycleState } from '../../services/lifecycle-state.js';

describe('ExitHandler', () => {
  let exitSpy: jest.SpiedFunction<typeof process.exit>;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as never);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('calls process.exit(0) when shutdownRequested is true', async () => {
    const lifecycle = new LifecycleState();
    lifecycle.shutdownRequested = true;
    const handler = new ExitHandler(lifecycle);

    await handler.handle({});

    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('calls process.exit(1) when shutdownRequested is false', async () => {
    const lifecycle = new LifecycleState();
    lifecycle.shutdownRequested = false;
    const handler = new ExitHandler(lifecycle);

    await handler.handle({});

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

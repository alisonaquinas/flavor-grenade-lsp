import { Injectable } from '@nestjs/common';
import { LifecycleState } from '../services/lifecycle-state.js';

/**
 * Handles the `shutdown` LSP request.
 *
 * Sets {@link LifecycleState.shutdownRequested} so the subsequent `exit`
 * notification knows to exit cleanly with code 0. Returns `null` per the
 * LSP specification (the result MUST be `null`, not `undefined`).
 */
@Injectable()
export class ShutdownHandler {
  constructor(private readonly lifecycle: LifecycleState) {}

  /**
   * Handle a `shutdown` request.
   *
   * @returns `null` — as required by the LSP spec.
   */
  async handle(_params: unknown): Promise<null> {
    this.lifecycle.shutdownRequested = true;
    return null;
  }
}

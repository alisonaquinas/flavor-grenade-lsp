import { Injectable } from '@nestjs/common';
import { LifecycleState } from '../services/lifecycle-state.js';

/**
 * Handles the `exit` LSP notification.
 *
 * Exits the process with code 0 if {@link LifecycleState.shutdownRequested}
 * is `true` (clean shutdown sequence was followed), otherwise exits with
 * code 1 (abnormal termination as specified by LSP 3.17).
 */
@Injectable()
export class ExitHandler {
  constructor(private readonly lifecycle: LifecycleState) {}

  /**
   * Handle an `exit` notification.
   */
  async handle(_params: unknown): Promise<void> {
    process.exit(this.lifecycle.shutdownRequested ? 0 : 1);
  }
}

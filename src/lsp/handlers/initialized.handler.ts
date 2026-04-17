import { Injectable } from '@nestjs/common';

/**
 * Handles the `initialized` LSP notification.
 *
 * The `initialized` notification is sent by the client to confirm that it
 * has processed the `initialize` response. This handler logs receipt to
 * stderr for diagnostics and takes no further action.
 *
 * // Phase 4: trigger vault detection
 */
@Injectable()
export class InitializedHandler {
  /**
   * Handle an `initialized` notification.
   *
   * @param _params - Notification parameters (unused in Phase 2).
   */
  async handle(_params: unknown): Promise<void> {
    process.stderr.write('[flavor-grenade-lsp] initialized notification received\n');
  }
}

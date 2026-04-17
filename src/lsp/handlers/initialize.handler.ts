import { Injectable } from '@nestjs/common';
import { CapabilityRegistry } from '../services/capability-registry.js';
import { StatusNotifier } from '../services/status-notifier.js';

/** Result shape returned to the LSP client for `initialize`. */
interface InitializeResult {
  capabilities: Record<string, unknown>;
  serverInfo: { name: string; version: string };
}

/**
 * Handles the `initialize` LSP request.
 *
 * Returns the server capabilities and identity so the client can confirm
 * the handshake. After responding, notifies the client that the server is
 * ready via a `flavorGrenade/status` notification.
 */
@Injectable()
export class InitializeHandler {
  constructor(
    private readonly capabilities: CapabilityRegistry,
    private readonly notifier: StatusNotifier,
  ) {}

  /**
   * Handle an `initialize` request.
   *
   * @returns The `InitializeResult` containing capabilities and server info.
   */
  async handle(_params: unknown): Promise<InitializeResult> {
    const result: InitializeResult = {
      capabilities: this.capabilities.getCapabilities(),
      serverInfo: { name: 'flavor-grenade-lsp', version: '0.1.0' },
    };

    // Defer status notification until after the initialize response is written,
    // so the client always receives the response before the notification.
    setImmediate(() => this.notifier.send('initializing'));

    return result;
  }
}

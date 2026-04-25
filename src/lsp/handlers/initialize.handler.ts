import { Injectable } from '@nestjs/common';
import { CapabilityRegistry } from '../services/capability-registry.js';
import { StatusNotifier } from '../services/status-notifier.js';
import { LifecycleState } from '../services/lifecycle-state.js';

/** Result shape returned to the LSP client for `initialize`. */
interface InitializeResult {
  capabilities: Record<string, unknown>;
  serverInfo: { name: string; version: string };
}

/** Subset of LSP InitializeParams we care about. */
interface InitializeParams {
  rootUri?: string | null;
  workspaceFolders?: Array<{ uri: string }> | null;
}

/**
 * Handles the `initialize` LSP request.
 *
 * Returns the server capabilities and identity so the client can confirm
 * the handshake. Captures `rootUri` from the client params into
 * {@link LifecycleState} so that the subsequent `initialized` handler can
 * trigger the vault scan.
 *
 * After responding, sends a `flavorGrenade/status` notification
 * with value `'initializing'` (not `'ready'` — the server reaches `'ready'`
 * only after the vault scan completes in {@link InitializedHandler}).
 */
@Injectable()
export class InitializeHandler {
  constructor(
    private readonly capabilities: CapabilityRegistry,
    private readonly notifier: StatusNotifier,
    private readonly lifecycle: LifecycleState,
  ) {}

  /**
   * Handle an `initialize` request.
   *
   * @returns The `InitializeResult` containing capabilities and server info.
   */
  async handle(params: unknown): Promise<InitializeResult> {
    const p = params as InitializeParams | null | undefined;

    // Capture rootUri: prefer rootUri, fall back to first workspaceFolder.
    this.lifecycle.rootUri = p?.rootUri ?? p?.workspaceFolders?.[0]?.uri ?? null;

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

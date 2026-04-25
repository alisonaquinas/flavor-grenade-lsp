import { Injectable, Optional } from '@nestjs/common';
import { VaultScanner } from '../../vault/vault-scanner.js';
import { FileWatcher } from '../../vault/file-watcher.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { SingleFileModeGuard } from '../../vault/single-file-mode.js';
import { AwaitIndexReadyHandler } from '../../vault/handlers/await-index-ready.handler.js';
import { RefGraph } from '../../resolution/ref-graph.js';
import { Oracle } from '../../resolution/oracle.js';
import { EmbedResolver } from '../../resolution/embed-resolver.js';
import { LifecycleState } from '../services/lifecycle-state.js';

/**
 * Handles the `initialized` LSP notification.
 *
 * Reads `rootUri` from {@link LifecycleState} (captured during `initialize`)
 * and, when vault services are available:
 * 1. Runs the vault scanner to populate `VaultIndex` from disk.
 * 2. Rebuilds the `RefGraph` and invalidates the `Oracle` alias cache.
 * 3. Calls `AwaitIndexReadyHandler.markReady()` to unblock any waiting requests.
 * 4. Starts the `FileWatcher` (skipped in single-file mode).
 *
 * When `rootUri` is absent or vault services are not injected, the handler
 * returns immediately (single-file mode).
 */
@Injectable()
export class InitializedHandler {
  constructor(
    private readonly lifecycle: LifecycleState,
    @Optional() private readonly vaultScanner: VaultScanner | null = null,
    @Optional() private readonly fileWatcher: FileWatcher | null = null,
    @Optional() private readonly vaultDetector: VaultDetector | null = null,
    @Optional() private readonly awaitIndexReady: AwaitIndexReadyHandler | null = null,
    @Optional() private readonly refGraph: RefGraph | null = null,
    @Optional() private readonly oracle: Oracle | null = null,
    @Optional() private readonly embedResolver: EmbedResolver | null = null,
    @Optional() private readonly vaultIndex: VaultIndex | null = null,
  ) {}

  /**
   * Handle an `initialized` notification, optionally triggering vault scan.
   *
   * @param _params - Notification parameters (unused — rootUri comes from LifecycleState).
   */
  async handle(_params: unknown): Promise<void> {
    process.stderr.write('[flavor-grenade-lsp] initialized notification received\n');

    const rootUri = this.lifecycle.rootUri;
    process.stderr.write(`[flavor-grenade-lsp] rootUri=${rootUri ?? '(null)'}\n`);
    process.stderr.write(
      `[flavor-grenade-lsp] vaultScanner=${!!this.vaultScanner} vaultDetector=${!!this.vaultDetector}\n`,
    );
    if (!rootUri || !this.vaultScanner || !this.vaultDetector) {
      process.stderr.write(
        `[flavor-grenade-lsp] no rootUri or vault services — single-file mode\n`,
      );
      return;
    }

    process.stderr.write(`[flavor-grenade-lsp] checking single-file mode...\n`);
    const isSingleFile = SingleFileModeGuard.isActive(this.vaultDetector, rootUri);
    process.stderr.write(`[flavor-grenade-lsp] isSingleFile=${isSingleFile}, starting scan...\n`);
    await this.vaultScanner.scan(rootUri);
    process.stderr.write(`[flavor-grenade-lsp] scan complete\n`);

    // Rebuild the reference graph now that the vault index is fully populated.
    // This enables find-references, code lens, and rename to work across the vault.
    if (this.refGraph !== null && this.oracle !== null && this.vaultIndex !== null) {
      this.refGraph.rebuild(this.vaultIndex, this.oracle, this.embedResolver ?? undefined);
    }
    process.stderr.write(`[flavor-grenade-lsp] refGraph rebuilt\n`);

    if (this.awaitIndexReady !== null) {
      this.awaitIndexReady.markReady();
    }

    if (!isSingleFile && this.fileWatcher !== null) {
      const detection = this.vaultDetector.detect(SingleFileModeGuard.uriToPath(rootUri));
      if (detection.vaultRoot !== null) {
        this.fileWatcher.start(detection.vaultRoot);
      }
    }
    process.stderr.write(`[flavor-grenade-lsp] initialized handler complete\n`);
  }
}

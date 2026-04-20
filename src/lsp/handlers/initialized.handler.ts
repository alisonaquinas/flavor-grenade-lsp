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

/**
 * Parameters for the `initialized` notification.
 *
 * The LSP spec defines `initialized` as taking an empty `{}` params object.
 * This server extends it with an optional `rootUri` field that the client
 * (or test harness) may supply to indicate the vault root — this is a
 * server-specific extension, not part of the LSP standard.
 */
interface InitializedParams {
  rootUri?: string;
}

/**
 * Handles the `initialized` LSP notification.
 *
 * When `rootUri` is provided and vault services are available, this handler:
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
   * @param params - Notification parameters, may include `rootUri`.
   */
  async handle(params: unknown): Promise<void> {
    process.stderr.write('[flavor-grenade-lsp] initialized notification received\n');

    const rootUri = (params as InitializedParams | null)?.rootUri;
    if (!rootUri || !this.vaultScanner || !this.vaultDetector) {
      return;
    }

    const isSingleFile = SingleFileModeGuard.isActive(this.vaultDetector, rootUri);
    await this.vaultScanner.scan(rootUri);

    // Rebuild the reference graph now that the vault index is fully populated.
    // This enables find-references, code lens, and rename to work across the vault.
    if (this.refGraph !== null && this.oracle !== null && this.vaultIndex !== null) {
      this.refGraph.rebuild(this.vaultIndex, this.oracle, this.embedResolver ?? undefined);
    }

    if (this.awaitIndexReady !== null) {
      this.awaitIndexReady.markReady();
    }

    if (!isSingleFile && this.fileWatcher !== null) {
      const detection = this.vaultDetector.detect(SingleFileModeGuard.uriToPath(rootUri));
      if (detection.vaultRoot !== null) {
        this.fileWatcher.start(detection.vaultRoot);
      }
    }
  }
}

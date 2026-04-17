import { Injectable, Optional } from '@nestjs/common';
import type { VaultScanner } from '../../vault/vault-scanner.js';
import type { FileWatcher } from '../../vault/file-watcher.js';
import type { VaultDetector } from '../../vault/vault-detector.js';
import { SingleFileModeGuard } from '../../vault/single-file-mode.js';
import type { AwaitIndexReadyHandler } from '../../vault/handlers/await-index-ready.handler.js';

/** Parameters for the LSP `initialized` notification (typically `{}`). */
interface InitializedParams {
  rootUri?: string;
}

/**
 * Handles the `initialized` LSP notification.
 *
 * After Phase 4 wiring, triggers the vault scan and starts the file watcher
 * when vault services are present. In single-file mode, skips both.
 */
@Injectable()
export class InitializedHandler {
  constructor(
    @Optional() private readonly vaultScanner: VaultScanner | null = null,
    @Optional() private readonly fileWatcher: FileWatcher | null = null,
    @Optional() private readonly vaultDetector: VaultDetector | null = null,
    @Optional() private readonly awaitIndexReady: AwaitIndexReadyHandler | null = null,
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

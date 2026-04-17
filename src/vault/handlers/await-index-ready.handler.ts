import 'reflect-metadata';
import { Injectable } from '@nestjs/common';

/**
 * Handles the `flavorGrenade/awaitIndexReady` custom JSON-RPC request.
 *
 * Callers (typically integration tests) send this request to block until
 * the vault scan has completed. Once {@link markReady} is called, all
 * pending `handle()` promises resolve with `null`.
 */
@Injectable()
export class AwaitIndexReadyHandler {
  private readonly readyResolvers: Array<() => void> = [];
  private isReady = false;

  /**
   * Mark the index as ready and resolve all waiting callers.
   *
   * Called by {@link VaultScanner} after the initial scan completes.
   */
  markReady(): void {
    this.isReady = true;
    for (const resolve of this.readyResolvers) {
      resolve();
    }
    this.readyResolvers.length = 0;
  }

  /**
   * Return a Promise that resolves to `null` once the index is ready.
   *
   * If the index is already ready, resolves immediately.
   *
   * @returns A JSON-RPC result value of `null`.
   */
  handle(): Promise<null> {
    if (this.isReady) {
      return Promise.resolve(null);
    }
    return new Promise<null>((resolve) => {
      this.readyResolvers.push(() => resolve(null));
    });
  }
}

import type { VaultDetector } from './vault-detector.js';

/**
 * Guard utility for single-file mode detection.
 *
 * In single-file mode, {@link VaultScanner} skips the recursive walk and
 * {@link FileWatcher} does not start.
 */
export class SingleFileModeGuard {
  /**
   * Returns `true` when vault detection resolves to `'single-file'` mode for
   * the given URI.
   *
   * @param detector - The {@link VaultDetector} instance.
   * @param rootUri  - The `file://` URI to test detection from.
   */
  static isActive(detector: VaultDetector, rootUri: string): boolean {
    const fsPath = SingleFileModeGuard.uriToPath(rootUri);
    return detector.detect(fsPath).mode === 'single-file';
  }

  /**
   * Convert a `file://` URI to a filesystem path.
   *
   * @param uri - A `file://` URI string.
   */
  static uriToPath(uri: string): string {
    try {
      const pathname = new URL(uri).pathname;
      // On Windows: /C:/path → C:/path
      return decodeURIComponent(pathname.replace(/^\/([A-Za-z]:)/, '$1'));
    } catch {
      return uri;
    }
  }
}

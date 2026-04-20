/**
 * Shared URI normalisation helpers used across LSP request handlers.
 *
 * These utilities consolidate the three previously duplicated URI-comparison
 * implementations in CodeLensHandler, ReferencesHandler, and RenameHandler
 * (issue #10).
 */

/**
 * Normalise a `file://` URI for case-insensitive comparison on Windows.
 *
 * Converts `file:///C:/path` → `file://c:/path`
 * Converts `file://C:/path`  → `file://c:/path`
 * On non-Windows URIs the string is just lowercased.
 *
 * Note: the drive-letter capture group `([A-Za-z]:)` already includes the
 * colon, so no extra `:` is appended in the replacement (issue #1 fix).
 */
export function normaliseFileUri(uri: string): string {
  return uri
    .replace(/^file:\/\/\/([A-Za-z]:)/, (_, d: string) => `file://${d.toLowerCase()}`)
    .replace(/^file:\/\/([A-Za-z]:)/, (_, d: string) => `file://${d.toLowerCase()}`)
    .toLowerCase();
}

/**
 * Strip the Windows leading-slash and normalise separators in a decoded
 * `URL.pathname` value so it can be passed to filesystem APIs.
 *
 * `"/C:/Users/foo"` → `"C:/Users/foo"`
 * `"/home/foo"` → `"/home/foo"` (unchanged on POSIX)
 * Backslashes (may appear on Windows) are converted to forward slashes.
 */
export function pathnameToFsPath(pathname: string): string {
  return pathname
    .replace(/^\/([A-Za-z]:)/, '$1') // strip leading / before Windows drive letter
    .replace(/\\/g, '/'); // normalise backslashes → forward slashes (issue #2 fix)
}

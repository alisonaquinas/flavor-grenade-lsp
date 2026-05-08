import { ErrorCodes, JsonRpcError } from '../transport/json-rpc-dispatcher.js';

/**
 * Assert that a client-provided URI is a file URI before any path handling.
 *
 * @param value - Candidate URI value from LSP params.
 * @param field - Human-readable field name for InvalidParams errors.
 */
export function assertFileUri(value: unknown, field = 'URI'): asserts value is string {
  if (typeof value !== 'string') {
    throw new JsonRpcError(ErrorCodes.InvalidParams, `${field} must be a file URI string`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new JsonRpcError(ErrorCodes.InvalidParams, `${field} must be a valid file URI`);
  }

  if (parsed.protocol !== 'file:') {
    throw new JsonRpcError(ErrorCodes.InvalidParams, `${field} must use the file scheme`);
  }
}

/**
 * Convert a file URI into a filesystem path after enforcing the file scheme.
 *
 * @param uri - Candidate file URI.
 * @param field - Human-readable field name for InvalidParams errors.
 */
export function fileUriToPath(uri: string, field = 'URI'): string {
  assertFileUri(uri, field);
  try {
    // Decode first so percent-encoded colons (%3A) become ':' before the
    // drive-letter regex runs. Without this, '/c%3A/...' bypasses the strip
    // and resolves to an invalid path on Windows.
    const decoded = decodeURIComponent(new URL(uri).pathname);
    return decoded.replace(/^\/([A-Za-z]:)/, '$1');
  } catch {
    throw new JsonRpcError(ErrorCodes.InvalidParams, `${field} must be a valid file URI`);
  }
}

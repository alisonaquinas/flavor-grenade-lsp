import * as path from 'path';
import { resolveVaultRelativePath } from './vault-path-confinement.js';

/**
 * A branded string type representing a vault-relative document identifier.
 *
 * Format: forward-slash-separated relative path from vault root, without
 * file extension (for `.md` files).
 *
 * @example `'notes/MyNote'`, `'daily/2026-04-17'`
 */
export type DocId = string & { readonly __brand: 'DocId' };

/**
 * Compute the {@link DocId} for a document given its absolute path and the
 * vault root.
 *
 * The DocId is the relative path from `vaultRoot` to `absolutePath`, with
 * the `.md` extension stripped and all separators normalized to `/`.
 *
 * @param vaultRoot    - Absolute path to the vault root directory.
 * @param absolutePath - Absolute path to the document file.
 */
export function toDocId(vaultRoot: string, absolutePath: string): DocId {
  const rel = path.relative(vaultRoot, absolutePath);
  const ext = path.extname(rel);
  const withoutExt = ext === '.md' ? rel.slice(0, -ext.length) : rel;
  return withoutExt.split(path.sep).join('/') as DocId;
}

/**
 * Reconstruct the absolute filesystem path from a {@link DocId}.
 *
 * Adds `.md` if the docId has no extension.
 *
 * @param vaultRoot - Absolute path to the vault root directory.
 * @param docId     - The document identifier.
 */
export function fromDocId(vaultRoot: string, docId: DocId): string {
  const withExt = path.extname(docId) === '' ? `${docId}.md` : docId;
  if (vaultRoot.length === 0) {
    if (isUnsafeRelativeDocId(withExt)) {
      throw new Error(`DocId escapes vault root: ${docId}`);
    }
    return withExt.split('/').join(path.sep);
  }

  const resolved = resolveVaultRelativePath(vaultRoot, withExt);
  if (resolved === null) {
    throw new Error(`DocId escapes vault root: ${docId}`);
  }
  return resolved;
}

function isUnsafeRelativeDocId(value: string): boolean {
  return (
    value.length === 0 ||
    value.includes('\0') ||
    path.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    path.posix.isAbsolute(value) ||
    value.split(/[\\/]+/).includes('..')
  );
}

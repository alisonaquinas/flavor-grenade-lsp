import * as path from 'path';

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
  return path.join(vaultRoot, withExt);
}

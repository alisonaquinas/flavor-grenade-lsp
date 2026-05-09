import * as fs from 'fs';
import * as path from 'path';

/**
 * Return true when `candidate` is equal to or nested under `root`.
 *
 * @param root - Absolute root path.
 * @param candidate - Absolute candidate path.
 */
export function isInsideOrEqualPath(root: string, candidate: string): boolean {
  const normalizedRoot = normalizeForCompare(path.resolve(root));
  const normalizedCandidate = normalizeForCompare(path.resolve(candidate));
  if (normalizedCandidate === normalizedRoot) {
    return true;
  }

  const rootWithSep = normalizedRoot.endsWith(path.sep)
    ? normalizedRoot
    : `${normalizedRoot}${path.sep}`;
  return normalizedCandidate.startsWith(rootWithSep);
}

/**
 * Confine an existing filesystem path to a vault root using both lexical and
 * realpath checks.
 *
 * @param vaultRoot - Vault root path.
 * @param candidate - Existing candidate path.
 */
export function confineExistingPathToVaultRoot(
  vaultRoot: string,
  candidate: string,
): string | null {
  const resolvedRoot = path.resolve(vaultRoot);
  const resolvedCandidate = path.resolve(candidate);
  if (!isInsideOrEqualPath(resolvedRoot, resolvedCandidate)) {
    return null;
  }

  let realRoot: string;
  let realCandidate: string;
  try {
    realRoot = fs.realpathSync.native(resolvedRoot);
    realCandidate = fs.realpathSync.native(resolvedCandidate);
  } catch {
    return null;
  }

  return isInsideOrEqualPath(realRoot, realCandidate) ? resolvedCandidate : null;
}

function normalizeForCompare(value: string): string {
  return process.platform === 'win32' ? value.toLowerCase() : value;
}

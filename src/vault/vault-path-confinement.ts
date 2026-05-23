import * as fs from 'fs';
import * as path from 'path';

/**
 * Return true when `candidate` is equal to or nested under `root`.
 *
 * @param root - Absolute root path.
 * @param candidate - Absolute candidate path.
 */
export function isInsideOrEqualPath(root: string, candidate: string): boolean {
  const normalizedRoot = normalizeForCompare(normalizeAbsolutePath(root) ?? '');
  const normalizedCandidate = normalizeForCompare(normalizeAbsolutePath(candidate) ?? '');
  if (normalizedRoot.length === 0 || normalizedCandidate.length === 0) {
    return false;
  }

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
  const resolvedRoot = normalizeAbsolutePath(vaultRoot);
  const resolvedCandidate = normalizeAbsolutePath(candidate);
  if (resolvedRoot === null || resolvedCandidate === null) {
    return null;
  }

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

/**
 * Confine a filesystem path to a vault root using lexical checks only.
 *
 * Use this for paths that may not exist yet, such as file-operation targets.
 * For existing paths, prefer {@link confineExistingPathToVaultRoot} so symlinks
 * are checked with realpath as well.
 */
export function confinePathToVaultRoot(vaultRoot: string, candidate: string): string | null {
  const resolvedRoot = normalizeAbsolutePath(vaultRoot);
  const resolvedCandidate = normalizeAbsolutePath(candidate);
  if (resolvedRoot === null || resolvedCandidate === null) {
    return null;
  }

  return isInsideOrEqualPath(resolvedRoot, resolvedCandidate) ? resolvedCandidate : null;
}

/**
 * Resolve a vault-relative path under an absolute vault root.
 *
 * Rejects absolute paths, null bytes, and `..` traversal that would leave the
 * vault root. The returned path is absolute and lexically confined.
 */
export function resolveVaultRelativePath(
  vaultRoot: string,
  vaultRelativePath: string,
): string | null {
  if (!isSafeRelativePath(vaultRelativePath)) {
    return null;
  }

  const resolvedRoot = normalizeAbsolutePath(vaultRoot);
  if (resolvedRoot === null) {
    return null;
  }

  const normalizedRelative = normalizeSeparators(vaultRelativePath);
  const candidate = path.normalize(`${resolvedRoot}${path.sep}${normalizedRelative}`);
  return confinePathToVaultRoot(resolvedRoot, candidate);
}

export function normalizeAbsolutePath(value: string): string | null {
  if (value.length === 0 || value.includes('\0')) {
    return null;
  }

  const normalized = path.normalize(value);
  return path.isAbsolute(normalized) ? normalized : null;
}

function isSafeRelativePath(value: string): boolean {
  return (
    value.length > 0 &&
    !value.includes('\0') &&
    !path.isAbsolute(value) &&
    !path.win32.isAbsolute(value) &&
    !path.posix.isAbsolute(value)
  );
}

function normalizeSeparators(value: string): string {
  return value.replace(/\\/g, path.sep).replace(/\//g, path.sep);
}

function normalizeForCompare(value: string): string {
  return process.platform === 'win32' ? value.toLowerCase() : value;
}

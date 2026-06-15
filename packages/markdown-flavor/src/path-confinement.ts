export function confinePathToRoot(root: string, candidate: string): string | null {
  const resolvedRoot = normalizeAbsolutePath(root);
  const resolvedCandidate = normalizeAbsolutePath(candidate);
  if (resolvedRoot === null || resolvedCandidate === null) {
    return null;
  }

  return isInsideOrEqualPath(resolvedRoot, resolvedCandidate) ? resolvedCandidate : null;
}

export function resolveRootRelativePath(root: string, relativePath: string): string | null {
  if (!isSafeRelativePath(relativePath)) {
    return null;
  }

  const resolvedRoot = normalizeAbsolutePath(root);
  if (resolvedRoot === null) {
    return null;
  }

  const normalizedRelative = normalizeRelativePath(relativePath);
  if (normalizedRelative === null) {
    return null;
  }
  return confinePathToRoot(resolvedRoot, joinPath(resolvedRoot, normalizedRelative));
}

export function rootRelativePath(root: string, candidate: string): string | null {
  const resolvedRoot = normalizeAbsolutePath(root);
  const confined = confinePathToRoot(root, candidate);
  if (resolvedRoot === null || confined === null) {
    return null;
  }
  if (normalizeForCompare(resolvedRoot) === normalizeForCompare(confined)) {
    return '';
  }
  return confined.slice(resolvedRoot.endsWith('/') ? resolvedRoot.length : resolvedRoot.length + 1);
}

export function normalizeRootPath(value: string): string | null {
  return normalizeAbsolutePath(value);
}

function isInsideOrEqualPath(root: string, candidate: string): boolean {
  const normalizedRoot = normalizeForCompare(root);
  const normalizedCandidate = normalizeForCompare(candidate);

  if (normalizedCandidate === normalizedRoot) {
    return true;
  }

  const rootWithSep = normalizedRoot.endsWith('/') ? normalizedRoot : `${normalizedRoot}/`;
  return normalizedCandidate.startsWith(rootWithSep);
}

function normalizeAbsolutePath(value: string): string | null {
  if (value.length === 0 || value.includes('\0')) {
    return null;
  }

  const normalized = normalizeSeparators(value);
  const prefix = absolutePrefix(normalized);
  if (prefix === null) {
    return null;
  }

  const body = normalized.slice(prefix.length);
  const segments = normalizeSegments(body.split('/'));
  return segments.length === 0
    ? trimRootPrefix(prefix)
    : `${trimRootPrefix(prefix)}/${segments.join('/')}`;
}

function normalizeRelativePath(value: string): string | null {
  const segments = normalizeSegments(normalizeSeparators(value).split('/'));
  return segments.join('/');
}

function normalizeSegments(parts: readonly string[]): string[] {
  const segments: string[] = [];
  for (const part of parts) {
    if (part.length === 0 || part === '.') {
      continue;
    }
    if (part === '..') {
      if (segments.length === 0) {
        return ['..'];
      }
      segments.pop();
      continue;
    }
    segments.push(part);
  }
  return segments;
}

function isSafeRelativePath(value: string): boolean {
  return (
    value.length > 0 && !value.includes('\0') && absolutePrefix(normalizeSeparators(value)) === null
  );
}

function joinPath(root: string, relativePath: string): string {
  return relativePath.length === 0 ? root : `${trimTrailingSlashes(root)}/${relativePath}`;
}

function normalizeSeparators(value: string): string {
  return value.replace(/\\/g, '/');
}

function absolutePrefix(value: string): string | null {
  if (isWindowsDriveAbsolute(value)) {
    return value.slice(0, 3);
  }
  if (value.startsWith('//')) {
    const parts = value.split('/');
    return parts.length >= 4 && parts[2].length > 0 && parts[3].length > 0
      ? `//${parts[2]}/${parts[3]}/`
      : null;
  }
  return value.startsWith('/') ? '/' : null;
}

function trimRootPrefix(prefix: string): string {
  if (prefix === '/') {
    return '/';
  }
  return trimTrailingSlashes(prefix);
}

function normalizeForCompare(value: string): string {
  return isWindowsDriveAbsolute(value) || value.startsWith('//') ? value.toLowerCase() : value;
}

function trimTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') {
    end -= 1;
  }
  return value.slice(0, end);
}

function isWindowsDriveAbsolute(value: string): boolean {
  if (value.length < 3 || value[1] !== ':' || value[2] !== '/') {
    return false;
  }
  const code = value.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

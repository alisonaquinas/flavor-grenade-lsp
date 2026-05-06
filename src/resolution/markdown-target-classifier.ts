import type { DocId } from '../vault/doc-id.js';

/** Known non-vault URL schemes that Markdown links may target. */
const EXTERNAL_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

/** Options that influence Markdown target classification. */
export interface MarkdownTargetClassificationOptions {
  /** DocId of the document containing the Markdown link. */
  sourceDocId?: DocId;
  /** True when the source syntax is a Markdown image link. */
  isImage?: boolean;
}

/** Classification result for a Markdown link target. */
export type MarkdownTargetClassification =
  | {
      kind: 'local-document';
      rawTarget: string;
      path: DocId;
      fragment?: string;
    }
  | {
      kind: 'same-document-fragment';
      rawTarget: string;
      fragment: string;
    }
  | {
      kind: 'local-attachment';
      rawTarget: string;
      path: string;
      fragment?: string;
    }
  | {
      kind: 'external-url';
      rawTarget: string;
      scheme: string;
    }
  | {
      kind: 'unsupported-scheme';
      rawTarget: string;
      scheme: string;
    };

/**
 * Classify a standard Markdown link target before vault resolution.
 *
 * @param target  - Raw Markdown URL/path target, excluding optional title.
 * @param options - Source document and syntax hints.
 */
export function classifyMarkdownTarget(
  target: string,
  options: MarkdownTargetClassificationOptions = {},
): MarkdownTargetClassification {
  const rawTarget = target;
  const scheme = extractScheme(target);
  if (scheme !== null) {
    return EXTERNAL_SCHEMES.has(scheme)
      ? { kind: 'external-url', rawTarget, scheme }
      : { kind: 'unsupported-scheme', rawTarget, scheme };
  }

  const hashIndex = target.indexOf('#');
  const pathPart = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? undefined : target.slice(hashIndex + 1);

  if (pathPart === '') {
    return {
      kind: 'same-document-fragment',
      rawTarget,
      fragment: fragment ?? '',
    };
  }

  const normalizedPath = normalizeVaultRelativePath(pathPart, options.sourceDocId);
  const hasMarkdownExtension = /\.md$/i.test(normalizedPath);

  if (hasMarkdownExtension || (!options.isImage && !hasKnownNonMarkdownExtension(normalizedPath))) {
    const docPath = stripMarkdownExtension(normalizedPath) as DocId;
    return {
      kind: 'local-document',
      rawTarget,
      path: docPath,
      ...(fragment !== undefined && { fragment }),
    };
  }

  return {
    kind: 'local-attachment',
    rawTarget,
    path: normalizedPath,
    ...(fragment !== undefined && { fragment }),
  };
}

function extractScheme(target: string): string | null {
  const match = /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(target);
  if (match === null) return null;
  return match[1].toLowerCase();
}

function normalizeVaultRelativePath(pathPart: string, sourceDocId?: DocId): string {
  const sourceDir = sourceDocId === undefined ? '' : sourceDocId.split('/').slice(0, -1).join('/');
  const joined = pathPart.startsWith('/')
    ? pathPart.slice(1)
    : sourceDir === ''
      ? pathPart
      : `${sourceDir}/${pathPart}`;

  const parts: string[] = [];
  for (const part of joined.replace(/\\/g, '/').split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join('/');
}

function stripMarkdownExtension(path: string): string {
  return path.replace(/\.md$/i, '');
}

function hasKnownNonMarkdownExtension(path: string): boolean {
  const lastSegment = path.split('/').pop() ?? path;
  return /\.[^./]+$/.test(lastSegment) && !/\.md$/i.test(lastSegment);
}

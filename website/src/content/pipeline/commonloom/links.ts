import type { Image, Link, Text } from 'mdast';
import { visit } from 'unist-util-visit';

import type { ParsedMarkdown } from './markdown';
import type {
  CommonloomDiagnostic,
  CommonloomImageReference,
  CommonloomLinkPolicy,
  CommonloomLinkReference,
} from './types';

export interface ExtractMarkdownReferencesResult {
  links: CommonloomLinkReference[];
  images: CommonloomImageReference[];
}

export interface ResolvedLinkReferencesResult {
  links: CommonloomLinkReference[];
  diagnostics: CommonloomDiagnostic[];
}

const externalUrlPattern = /^https?:\/\//i;
const unsupportedSchemePattern = /^[a-z][a-z0-9+.-]*:/i;
const wikiLinkPattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

export function classifyLinkTarget(
  rawTarget: string,
): Pick<CommonloomLinkReference, 'rawTarget' | 'kind' | 'resolvedTarget'> {
  const target = rawTarget.trim();

  if (externalUrlPattern.test(target)) {
    return { rawTarget: target, resolvedTarget: target, kind: 'external' };
  }

  if (target.startsWith('#')) {
    return { rawTarget: target, resolvedTarget: target, kind: 'same-document' };
  }

  const wikiMatch = /^\[\[([^\]|]+)(?:\|[^\]]+)?\]\]$/.exec(target);

  if (wikiMatch?.[1]) {
    return { rawTarget: wikiMatch[1].trim(), kind: 'wiki-link' };
  }

  if (unsupportedSchemePattern.test(target)) {
    return { rawTarget: target, kind: 'unsupported' };
  }

  return { rawTarget: target, resolvedTarget: target, kind: 'internal' };
}

export function extractMarkdownReferences<Frontmatter>(
  parsed: ParsedMarkdown<Frontmatter>,
): ExtractMarkdownReferencesResult {
  const links: CommonloomLinkReference[] = [];
  const images: CommonloomImageReference[] = [];

  visit(parsed.mdast, 'link', (node: Link) => {
    links.push({
      ...classifyLinkTarget(node.url),
      sourcePath: parsed.sourcePath,
      line: node.position?.start.line,
      column: node.position?.start.column,
    });
  });

  visit(parsed.mdast, 'image', (node: Image) => {
    images.push({
      rawTarget: node.url,
      altText: node.alt ?? '',
      sourcePath: parsed.sourcePath,
      line: node.position?.start.line,
      column: node.position?.start.column,
    });
  });

  visit(parsed.mdast, 'text', (node: Text) => {
    for (const match of node.value.matchAll(wikiLinkPattern)) {
      if (!match[1]) {
        continue;
      }

      links.push({
        rawTarget: match[1].trim(),
        kind: 'wiki-link',
        sourcePath: parsed.sourcePath,
        line: node.position?.start.line,
        column: node.position?.start.column
          ? node.position.start.column + (match.index ?? 0)
          : undefined,
      });
    }
  });

  return { links, images };
}

export async function resolveLinkReferences(
  links: CommonloomLinkReference[],
  policy: CommonloomLinkPolicy,
): Promise<ResolvedLinkReferencesResult> {
  const resolvedLinks: CommonloomLinkReference[] = [];
  const diagnostics: CommonloomDiagnostic[] = [];

  for (const link of links) {
    if (link.kind === 'unsupported') {
      diagnostics.push(unresolvedDiagnostic(link, `Unsupported link target: ${link.rawTarget}`));
      resolvedLinks.push(link);
      continue;
    }

    if (link.kind !== 'wiki-link') {
      resolvedLinks.push(link);
      continue;
    }

    const resolution = await policy.resolveLink(link);
    const resolvedLink = {
      ...link,
      kind: resolution.kind,
      resolvedTarget: resolution.resolvedTarget,
    };

    resolvedLinks.push(resolvedLink);

    if (resolution.diagnostic) {
      diagnostics.push(resolution.diagnostic);
    } else if (!resolution.resolvedTarget) {
      diagnostics.push(unresolvedDiagnostic(link, `Unresolved wiki-link: ${link.rawTarget}`));
    }
  }

  return { links: resolvedLinks, diagnostics };
}

function unresolvedDiagnostic(
  link: CommonloomLinkReference,
  message: string,
): CommonloomDiagnostic {
  return {
    code: 'LINK_UNRESOLVED',
    severity: 'error',
    message,
    sourcePath: link.sourcePath,
    line: link.line,
    column: link.column,
  };
}

import { hashContent } from './hash';
import type { ParsedMarkdown } from './markdown';
import type { CommonloomSourceTrace } from './types';

export interface CreateSourceTraceInput<Frontmatter> {
  markdownPath: string;
  manifestPath?: string;
  markdown: string;
  parsed: ParsedMarkdown<Frontmatter>;
}

export function createSourceTrace<Frontmatter>(
  input: CreateSourceTraceInput<Frontmatter>,
): CommonloomSourceTrace {
  return {
    markdownPath: input.markdownPath,
    manifestPath: input.manifestPath,
    contentHash: hashContent(input.markdown),
    headings: input.parsed.headings,
    links: [],
    images: [],
  };
}

import type { Heading, PhrasingContent, Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { z } from 'zod';

import { parseFrontmatter } from './frontmatter';
import type { CommonloomDiagnostic, CommonloomHeading } from './types';

export interface ParseMarkdownInput<Frontmatter> {
  sourcePath: string;
  markdown: string;
  frontmatterSchema: z.ZodType<Frontmatter>;
}

export interface ParsedMarkdown<Frontmatter> {
  sourcePath: string;
  frontmatter: Frontmatter;
  bodyMarkdown: string;
  headings: CommonloomHeading[];
  mdast: Root;
  diagnostics: CommonloomDiagnostic[];
}

const markdownProcessor = unified().use(remarkParse).use(remarkGfm);

export async function parseMarkdown<Frontmatter>(
  input: ParseMarkdownInput<Frontmatter>,
): Promise<ParsedMarkdown<Frontmatter>> {
  const frontmatter = parseFrontmatter(
    input.sourcePath,
    input.markdown,
    input.frontmatterSchema,
  );
  const mdast = markdownProcessor.parse(frontmatter.bodyMarkdown) as Root;

  return {
    sourcePath: input.sourcePath,
    frontmatter: frontmatter.frontmatter,
    bodyMarkdown: frontmatter.bodyMarkdown,
    headings: extractHeadings(mdast, frontmatter.contentStartLine),
    mdast,
    diagnostics: frontmatter.diagnostics,
  };
}

function extractHeadings(tree: Root, contentStartLine: number): CommonloomHeading[] {
  return tree.children
    .filter((node): node is Heading => node.type === 'heading')
    .map((heading) => {
      const label = heading.children.map(textFromPhrasingContent).join('').trim();

      return {
        id: slugifyHeading(label),
        label,
        level: heading.depth,
        line: heading.position?.start.line
          ? heading.position.start.line + contentStartLine - 1
          : undefined,
        column: heading.position?.start.column,
      };
    });
}

function textFromPhrasingContent(node: PhrasingContent): string {
  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }

  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(textFromPhrasingContent).join('');
  }

  return '';
}

function slugifyHeading(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

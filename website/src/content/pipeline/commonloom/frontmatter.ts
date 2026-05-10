import matter from 'gray-matter';
import { z } from 'zod';

import type { CommonloomDiagnostic } from './types';

export interface ParsedFrontmatter<Frontmatter> {
  frontmatter: Frontmatter | undefined;
  bodyMarkdown: string;
  contentStartLine: number;
  diagnostics: CommonloomDiagnostic[];
}

export function parseFrontmatter<Frontmatter>(
  sourcePath: string,
  markdown: string,
  frontmatterSchema: z.ZodType<Frontmatter>,
): ParsedFrontmatter<Frontmatter> {
  let file: matter.GrayMatterFile<string>;

  try {
    file = matter(markdown);
  } catch (error) {
    return {
      frontmatter: undefined,
      bodyMarkdown: markdown,
      contentStartLine: 1,
      diagnostics: [
        {
          code: 'FRONTMATTER_INVALID',
          severity: 'error',
          message: error instanceof Error ? error.message : 'Invalid frontmatter.',
          sourcePath,
        },
      ],
    };
  }

  const validation = frontmatterSchema.safeParse(file.data);
  const contentIndex = markdown.indexOf(file.content);
  const contentStartLine =
    contentIndex > 0 ? markdown.slice(0, contentIndex).split(/\r?\n/).length : 1;

  if (validation.success) {
    return {
      frontmatter: validation.data,
      bodyMarkdown: file.content,
      contentStartLine,
      diagnostics: [],
    };
  }

  return {
    frontmatter: undefined,
    bodyMarkdown: file.content,
    contentStartLine,
    diagnostics: validation.error.issues.map((issue) => ({
      code: 'FRONTMATTER_INVALID',
      severity: 'error',
      message: `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`,
      sourcePath,
    })),
  };
}

import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import type { ParsedMarkdown } from './markdown';
import type { CommonloomDiagnostic } from './types';

export interface RenderMarkdownHtmlInput<Frontmatter> {
  parsed: ParsedMarkdown<Frontmatter>;
  allowHtml: boolean;
}

export interface RenderMarkdownHtmlResult {
  bodyHtml: string;
  diagnostics: CommonloomDiagnostic[];
}

const unsafeHtmlPattern =
  /<\s*(script|iframe|object|embed|style|link|meta|base|form|input|button|textarea|select|option|svg|math)\b/i;

const safeHtmlSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'kbd'],
  attributes: {
    ...defaultSchema.attributes,
    kbd: [],
  },
};

export async function renderMarkdownHtml<Frontmatter>(
  input: RenderMarkdownHtmlInput<Frontmatter>,
): Promise<RenderMarkdownHtmlResult> {
  const diagnostics = [...input.parsed.diagnostics];

  const unsafeHtml = findUnsafeHtml(input.parsed.bodyMarkdown);

  if (input.allowHtml && unsafeHtml) {
    diagnostics.push({
      code: 'HTML_UNSAFE',
      severity: 'error',
      message: `Unsafe inline HTML tag <${unsafeHtml.tagName}> was removed from Markdown output.`,
      sourcePath: input.parsed.sourcePath,
      line: unsafeHtml.line,
      column: unsafeHtml.column,
    });
  }

  let processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: input.allowHtml });

  if (input.allowHtml) {
    processor = processor.use(rehypeRaw);
  }

  const file = await processor
    .use(rehypeSanitize, safeHtmlSchema)
    .use(rehypeStringify)
    .process(input.parsed.bodyMarkdown);

  return {
    bodyHtml: String(file),
    diagnostics,
  };
}

function findUnsafeHtml(markdown: string):
  | { tagName: string; line: number; column: number }
  | undefined {
  const match = unsafeHtmlPattern.exec(markdown);

  if (!match?.index || !match[1]) {
    if (match?.index === 0 && match[1]) {
      return { tagName: match[1], line: 1, column: 1 };
    }

    return undefined;
  }

  const prefix = markdown.slice(0, match.index);
  const lines = prefix.split('\n');

  return {
    tagName: match[1],
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

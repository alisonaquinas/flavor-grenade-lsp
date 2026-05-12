import { z } from 'zod';
import { describe, expect, it } from 'vitest';

import { createSourceTrace, parseMarkdown, renderMarkdownHtml } from 'commonloom';

const frontmatterSchema = z.object({
  title: z.string(),
});

async function parse(markdown: string) {
  return parseMarkdown({
    sourcePath: 'copy/html.md',
    markdown,
    frontmatterSchema,
  });
}

describe('Commonloom HTML rendering and source traces', () => {
  it('allows safe inline HTML in rendered Markdown', async () => {
    const parsed = await parse(['---', 'title: HTML', '---', '# HTML', '', 'Press <kbd>Ctrl</kbd>.'].join('\n'));
    const result = await renderMarkdownHtml({ parsed, allowHtml: true });

    expect(result.bodyHtml).toContain('<kbd>Ctrl</kbd>');
    expect(result.diagnostics).toEqual([]);
  });

  it('diagnoses and removes unsafe inline HTML', async () => {
    const parsed = await parse(
      ['---', 'title: Unsafe', '---', '# Unsafe', '', '<script>alert("x")</script>'].join('\n'),
    );
    const result = await renderMarkdownHtml({ parsed, allowHtml: true });

    expect(result.bodyHtml).not.toContain('<script>');
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'HTML_UNSAFE',
        severity: 'error',
        sourcePath: 'copy/html.md',
      }),
    );
  });

  it('creates source traces with stable content hashes', async () => {
    const markdown = ['---', 'title: Trace', '---', '# Trace', '', '[Quickstart](/quickstart/)'].join('\n');
    const parsed = await parse(markdown);
    const trace = createSourceTrace({
      markdownPath: 'copy/html.md',
      manifestPath: 'docs.manifest.ts',
      markdown,
      parsed,
    });

    expect(trace.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(trace.headings[0]?.id).toBe('trace');
    expect(trace.markdownPath).toBe('copy/html.md');
  });
});

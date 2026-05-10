import { z } from 'zod';
import { describe, expect, it } from 'vitest';

import { parseMarkdown } from '../src/content/pipeline/commonloom/markdown';

const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
});

describe('Commonloom Markdown parser', () => {
  it('parses frontmatter, CommonMark headings, and GFM constructs', async () => {
    const result = await parseMarkdown({
      sourcePath: 'copy/example.md',
      markdown: [
        '---',
        'title: Example',
        'description: A useful page',
        '---',
        '# Main Heading',
        '',
        'A paragraph with **strong** text and [a link](/quickstart/).',
        '',
        '| Key | Value |',
        '| --- | --- |',
        '| one | two |',
        '',
        '- [x] checked task',
      ].join('\n'),
      frontmatterSchema,
    });

    expect(result.frontmatter).toEqual({
      title: 'Example',
      description: 'A useful page',
    });
    expect(result.headings).toEqual([
      {
        id: 'main-heading',
        label: 'Main Heading',
        level: 1,
        line: 5,
        column: 1,
      },
    ]);
    expect(result.diagnostics).toEqual([]);
  });

  it('reports invalid frontmatter as diagnostics', async () => {
    const result = await parseMarkdown({
      sourcePath: 'copy/bad.md',
      markdown: ['---', 'title: 42', '---', '# Bad'].join('\n'),
      frontmatterSchema,
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'FRONTMATTER_INVALID',
        severity: 'error',
        sourcePath: 'copy/bad.md',
      }),
    );
  });
});

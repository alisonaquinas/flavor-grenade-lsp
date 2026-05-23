import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { z } from 'zod';
import { describe, expect, it } from 'vitest';

import { extractMarkdownReferences, parseMarkdown, resolveLinkReferences, validateMediaReference } from 'commonloom';

const frontmatterSchema = z.object({
  title: z.string(),
});

async function parse(body: string) {
  return parseMarkdown({
    sourcePath: 'copy/page.md',
    markdown: ['---', 'title: Links', '---', '# Links', '', body].join('\n'),
    frontmatterSchema,
  });
}

describe('Commonloom link and media validation', () => {
  it('extracts external links, internal links, wiki-links, and image references', async () => {
    const parsed = await parse(
      [
        '[Home](/)',
        '[Unified](https://unifiedjs.com/)',
        '[[Quick Start]]',
        '![Architecture diagram](diagram.png)',
      ].join('\n\n'),
    );
    const references = extractMarkdownReferences(parsed);

    expect(references.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rawTarget: '/', kind: 'internal' }),
        expect.objectContaining({ rawTarget: 'https://unifiedjs.com/', kind: 'external' }),
        expect.objectContaining({ rawTarget: 'Quick Start', kind: 'wiki-link' }),
      ]),
    );
    expect(references.images).toContainEqual(
      expect.objectContaining({
        rawTarget: 'diagram.png',
        altText: 'Architecture diagram',
      }),
    );
  });

  it('resolves wiki-links only through adapter callbacks', async () => {
    const parsed = await parse('[[Quick Start]]\n\n[[Missing Page]]');
    const references = extractMarkdownReferences(parsed);
    const result = await resolveLinkReferences(references.links, {
      resolveLink: ({ rawTarget }) => ({
        kind: 'wiki-link',
        resolvedTarget: rawTarget === 'Quick Start' ? '/quickstart/' : undefined,
      }),
    });

    expect(result.links).toContainEqual(
      expect.objectContaining({
        rawTarget: 'Quick Start',
        resolvedTarget: '/quickstart/',
      }),
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'LINK_UNRESOLVED',
        severity: 'error',
        sourcePath: 'copy/page.md',
      }),
    );
  });

  it('validates local media paths, missing files, traversal, and alt text', async () => {
    const mediaRoot = join(process.cwd(), 'node_modules', '.tmp-commonloom-media');
    await mkdir(mediaRoot, { recursive: true });
    await writeFile(join(mediaRoot, 'diagram.png'), 'fixture');

    await expect(
      validateMediaReference(
        { rawTarget: 'diagram.png', altText: 'Architecture diagram' },
        { mediaRoot, sourcePath: 'copy/page.md' },
      ),
    ).resolves.toEqual({ resolvedPath: join(mediaRoot, 'diagram.png'), diagnostics: [] });

    await expect(
      validateMediaReference(
        { rawTarget: 'missing.png', altText: 'Missing diagram' },
        { mediaRoot, sourcePath: 'copy/page.md' },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        diagnostics: [
          expect.objectContaining({
            code: 'MEDIA_UNRESOLVED',
            severity: 'error',
          }),
        ],
      }),
    );

    await expect(
      validateMediaReference(
        { rawTarget: '../outside.png', altText: 'Outside' },
        { mediaRoot, sourcePath: 'copy/page.md' },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        diagnostics: [
          expect.objectContaining({
            code: 'PATH_OUTSIDE_ROOT',
            severity: 'error',
          }),
        ],
      }),
    );

    await expect(
      validateMediaReference(
        { rawTarget: 'diagram.png', altText: '' },
        { mediaRoot, sourcePath: 'copy/page.md' },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        diagnostics: [
          expect.objectContaining({
            code: 'MEDIA_ALT_MISSING',
            severity: 'error',
          }),
        ],
      }),
    );
  });
});

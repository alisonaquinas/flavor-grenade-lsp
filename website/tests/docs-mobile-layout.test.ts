import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const websiteRoot = fileURLToPath(new URL('..', import.meta.url));

describe('docs mobile layout guards', () => {
  it('keeps docs copy, links, and code blocks inside narrow viewports', async () => {
    const css = await readFile(
      join(websiteRoot, 'src', 'styles', 'global.scss'),
      'utf8',
    );

    expect(css).toContain('max-inline-size: 100%;');
    expect(css).toContain('hyphens: auto;');
    expect(css).toContain('overflow-wrap: anywhere;');
  });
});

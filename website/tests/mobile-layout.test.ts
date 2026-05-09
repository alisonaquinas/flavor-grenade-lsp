import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const websiteRoot = fileURLToPath(new URL('..', import.meta.url));

describe('mobile layout regression guards', () => {
  it('keeps hero and proof content inside narrow viewports', async () => {
    const css = await readFile(
      join(websiteRoot, 'src', 'styles', 'global.scss'),
      'utf8',
    );

    expect(css).toContain('overflow-x: clip;');
    expect(css).toContain('overflow-wrap: anywhere;');
    expect(css).toContain('min-width: 0;');
  });
});

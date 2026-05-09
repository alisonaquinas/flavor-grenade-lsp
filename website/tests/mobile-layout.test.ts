import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const websiteRoot = fileURLToPath(new URL('..', import.meta.url));

describe('mobile layout regression guards', () => {
  it('keeps hero, proof, and footer content inside narrow viewports', async () => {
    const css = await readFile(
      join(websiteRoot, 'src', 'styles', 'global.scss'),
      'utf8',
    );

    expect(css).toContain('overflow-x: clip;');
    expect(css).toContain('overflow-wrap: anywhere;');
    expect(css).toContain('min-width: 0;');
    expect(css).toContain('.hero-actions .button-link');
    expect(css).toContain('inline-size: 100%;');
    expect(css).toContain('.footer-brand-copy');
  });

  it('collapses narrow navigation to an accessible hamburger control', async () => {
    const app = await readFile(join(websiteRoot, 'src', 'App.svelte'), 'utf8');
    const css = await readFile(join(websiteRoot, 'src', 'styles', 'global.scss'), 'utf8');

    expect(app).toContain('class="nav-toggle"');
    expect(app).toContain('aria-expanded={navOpen}');
    expect(app).toContain('class:open={navOpen}');
    expect(css).toContain('.nav-toggle');
    expect(css).toContain('.primary-nav.open');
  });
});

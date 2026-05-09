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
    expect(css).toContain('.hero-copy > .eyebrow');
    expect(css).toContain('display: none;');
  });

  it('collapses narrow navigation to an accessible hamburger control', async () => {
    const app = await readFile(join(websiteRoot, 'src', 'App.svelte'), 'utf8');
    const css = await readFile(join(websiteRoot, 'src', 'styles', 'global.scss'), 'utf8');

    expect(app).toContain('class="nav-toggle"');
    expect(app).toContain('aria-expanded={navOpen}');
    expect(app).toContain('class:open={navOpen}');
    expect(app).toContain('class:mobile-menu-hidden={item.hideInMobileMenu}');
    expect(css).toContain('.nav-toggle');
    expect(css).toContain('.primary-nav.open');
    expect(css).toContain('.primary-nav.open .mobile-menu-hidden');
  });

  it('keeps feature proof cards selectable with consistent default borders', async () => {
    const app = await readFile(join(websiteRoot, 'src', 'App.svelte'), 'utf8');
    const css = await readFile(join(websiteRoot, 'src', 'styles', 'global.scss'), 'utf8');

    expect(app).toContain('aria-pressed={selectedFeatureSignal === feature.signal}');
    expect(app).toContain('aria-expanded={selectedFeatureSignal === feature.signal}');
    expect(app).toContain('id="feature-detail"');
    expect(app).toContain('class="mobile-feature-detail"');
    expect(css).toContain('.feature-item.selected');
    expect(css).toContain('.feature-detail');
    expect(css).toContain('.mobile-feature-detail');
    expect(css).toContain('.feature-card.selected .mobile-feature-detail');
    expect(css).toContain('inline-size: 100%;');
    expect(css).not.toContain('.feature-item.completion');
    expect(css).not.toContain('.feature-item.index');
  });
});

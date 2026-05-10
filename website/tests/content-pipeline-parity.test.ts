import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { getWebsitePageByPath, websitePages } from '../src/content/pages';
import { websiteRoutes } from '../src/content/routes';

describe('Commonloom migration parity', () => {
  it('keeps migrated public routes addressable with metadata and prose', () => {
    for (const pathname of ['/', '/quickstart/', '/faq/', '/concepts/wiki-link-resolution/']) {
      const page = getWebsitePageByPath(pathname, websiteRoutes);
      const route = websiteRoutes.find((candidate) => candidate.path === pathname);

      expect(page?.routeId).toBe(route?.id);
      expect(route?.title).toBeTruthy();
      expect(page?.summary).toBeTruthy();
      expect(page?.sections.length).toBeGreaterThan(0);
    }
  });

  it('keeps article hubs populated after copy migration', () => {
    const howTo = websitePages.find((page) => page.routeId === 'howTo');
    const concepts = websitePages.find((page) => page.routeId === 'concepts');

    expect(howTo?.sections.some((section) => section.articleLinks && section.articleLinks.length > 5)).toBe(true);
    expect(concepts?.sections.some((section) => section.articleLinks && section.articleLinks.length > 5)).toBe(true);
  });

  it('documents the public content authoring workflow', () => {
    const doc = readFileSync(new URL('../docs/authoring/content-pipeline.md', import.meta.url), 'utf8');

    expect(doc).toContain('website/src/content/copy');
    expect(doc).toContain('frontmatter');
    expect(doc).toContain('website/src/content/media');
    expect(doc).toContain('inline HTML');
    expect(doc).toContain('*.manifest.ts');
    expect(doc).toContain('npm run content:generate');
    expect(doc).toContain('npm run content:check');
    expect(doc).toContain('source trace');
  });
});

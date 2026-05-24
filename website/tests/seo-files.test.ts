import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { websitePages } from '../src/content/pages';
import { websiteRoutes } from '../src/content/routes';
import {
  generateJsonLd,
  generateRobotsTxt,
  generateSitemap,
  getHomeMetadata,
} from '../src/seo/seo-files';

const websiteRoot = fileURLToPath(new URL('..', import.meta.url));

describe('website SEO files', () => {
  it('keeps maintained crawl files aligned with typed route metadata', async () => {
    const sitemap = await readFile(join(websiteRoot, 'public', 'sitemap.xml'), 'utf8');
    const robots = await readFile(join(websiteRoot, 'public', 'robots.txt'), 'utf8');

    expect(sitemap).toBe(generateSitemap(websiteRoutes));
    expect(robots).toBe(generateRobotsTxt(`${websiteRoutes[0]?.canonicalUrl}sitemap.xml`));
  });

  it('defines homepage Open Graph and Twitter metadata', () => {
    expect(getHomeMetadata()).toMatchObject({
      'og:type': 'website',
      'og:title': 'Flavor Grenade LSP | Flavor-Aware Markdown Tools',
      'twitter:card': 'summary_large_image',
      'twitter:title': 'Flavor Grenade LSP | Flavor-Aware Markdown Tools',
    });
  });

  it('generates the required JSON-LD schema types', () => {
    const schemaTypes = generateJsonLd(websiteRoutes, websitePages).map((entry) => entry['@type']);

    expect(schemaTypes).toEqual([
      'WebSite',
      'SoftwareApplication',
      'FAQPage',
      'HowTo',
      'BreadcrumbList',
    ]);
  });
});

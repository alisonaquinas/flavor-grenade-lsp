import { describe, expect, it } from 'vitest';

import {
  getRouteById,
  routeIds,
  validateRouteMetadata,
  websiteRoutes,
  type WebsiteRoute,
} from '../src/content/routes';

describe('website route metadata', () => {
  it('defines every required public route with unique SEO basics', () => {
    expect(routeIds).toEqual([
      'home',
      'quickstart',
      'howTo',
      'howToVsCodeExtension',
      'howToVaultConfiguration',
      'howToBrokenLinks',
      'howToSafeRename',
      'advancedUsage',
      'faq',
      'concepts',
      'conceptObsidianFlavoredMarkdown',
      'conceptVaultIndex',
      'conceptWikiLinkResolution',
      'features',
    ]);
    expect(validateRouteMetadata(websiteRoutes)).toEqual([]);
  });

  it('rejects missing metadata and duplicate route paths', () => {
    const invalidRoutes: WebsiteRoute[] = [
      {
        ...getRouteById('home'),
        title: '',
        canonicalUrl: '',
      },
      {
        ...getRouteById('quickstart'),
        path: '/',
      },
    ];

    expect(validateRouteMetadata(invalidRoutes)).toContain(
      'home is missing title.',
    );
    expect(validateRouteMetadata(invalidRoutes)).toContain(
      'home is missing canonicalUrl.',
    );
    expect(validateRouteMetadata(invalidRoutes)).toContain(
      'quickstart duplicates route path /.',
    );
  });
});

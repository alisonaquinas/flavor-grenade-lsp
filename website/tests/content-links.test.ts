import { describe, expect, it } from 'vitest';

import {
  validatePublicLinks,
  type PublicLink,
} from '../src/content/links';
import {
  validateWebsitePages,
  websitePages,
  type WebsitePageContent,
} from '../src/content/pages';
import { guideArticleGroups, websiteRoutes } from '../src/content/routes';

describe('website content and public links', () => {
  it('defines content records for every public route', () => {
    expect(validateWebsitePages(websitePages, websiteRoutes)).toEqual([]);
  });

  it('links each guide hub to every article in its group', () => {
    for (const group of guideArticleGroups) {
      const hubPage = websitePages.find((page) => page.routeId === group.hubRouteId);
      const linkedRouteIds = new Set(
        hubPage?.sections.flatMap((section) => section.articleLinks?.map((link) => link.routeId) ?? []),
      );

      expect([...linkedRouteIds]).toEqual(group.routeIds);
    }
  });

  it('keeps article examples concrete instead of stub-like', () => {
    const articleRouteIds = guideArticleGroups.flatMap((group) => group.routeIds);

    for (const routeId of articleRouteIds) {
      const pageRecord = websitePages.find((page) => page.routeId === routeId);
      const examples = pageRecord?.sections.flatMap((section) => section.code ?? []) ?? [];

      expect(examples.length).toBeGreaterThan(0);
      expect(examples.join('\n')).toMatch(
        /\.obsidian|\.fgignore|\.fgattributes|rootUri|\[\[|#|npm|npx|```|!?\[|flavor=|structured_profiles=/,
      );
    }
  });

  it('rejects broken internal route links and unapproved outbound hosts', () => {
    const invalidLinks: PublicLink[] = [
      { kind: 'route', routeId: 'missing-route', text: 'Missing route' },
      { kind: 'outbound', href: 'https://example.invalid', text: 'Example' },
    ];

    expect(validatePublicLinks(invalidLinks, websiteRoutes)).toEqual([
      'Missing route points to unknown route missing-route.',
      'Example points to unapproved outbound host example.invalid.',
    ]);
  });

  it('rejects content records without sections or links', () => {
    const invalidPages: WebsitePageContent[] = [
      {
        routeId: 'home',
        summary: '',
        sections: [],
        links: [],
      },
    ];

    expect(validateWebsitePages(invalidPages, websiteRoutes)).toEqual(
      expect.arrayContaining([
        'home is missing summary.',
        'home has no content sections.',
        'home has no public links.',
      ]),
    );
  });
});

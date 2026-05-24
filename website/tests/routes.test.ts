import { describe, expect, it } from 'vitest';

import {
  guideArticleGroups,
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
      'howToConfigureObsidianVaults',
      'howToChooseMarkdownFlavor',
      'howToUseStructuredProfiles',
      'howToFixBrokenLinks',
      'howToUseCodeActions',
      'howToRenameNotesSafely',
      'howToCompleteWikiLinksHeadings',
      'howToNavigateVaultTargets',
      'howToFindReferencesHighlights',
      'howToUseTagsCompletion',
      'howToOpaqueRegions',
      'advancedUsage',
      'advancedConfigurationModel',
      'advancedVaultSingleFileMode',
      'advancedIndexingPerformance',
      'advancedUriConfinement',
      'advancedParserBoundaries',
      'advancedDirectLspIntegration',
      'faq',
      'concepts',
      'conceptInspirationPriorArt',
      'conceptObsidianFlavoredMarkdown',
      'conceptMarkdownFlavorModel',
      'conceptStructuredProfiles',
      'conceptVaultIndex',
      'conceptWikiLinkResolution',
      'conceptDocIdVaultRelativePaths',
      'conceptOpaqueRegions',
      'conceptDiagnostics',
      'conceptCompletions',
      'conceptRenameSafety',
      'conceptReferencesNavigationTagsEmbeds',
      'features',
    ]);
    expect(validateRouteMetadata(websiteRoutes)).toEqual([]);
  });

  it('keeps guide article groups aligned with Phase W7 route inventory', () => {
    expect(guideArticleGroups.map((group) => group.label)).toEqual([
      'How-To',
      'Concepts',
      'Advanced Usage',
    ]);
    expect(guideArticleGroups.flatMap((group) => group.routeIds)).toEqual([
      'howToVsCodeExtension',
      'howToConfigureObsidianVaults',
      'howToChooseMarkdownFlavor',
      'howToUseStructuredProfiles',
      'howToFixBrokenLinks',
      'howToUseCodeActions',
      'howToRenameNotesSafely',
      'howToCompleteWikiLinksHeadings',
      'howToNavigateVaultTargets',
      'howToFindReferencesHighlights',
      'howToUseTagsCompletion',
      'howToOpaqueRegions',
      'conceptInspirationPriorArt',
      'conceptObsidianFlavoredMarkdown',
      'conceptMarkdownFlavorModel',
      'conceptStructuredProfiles',
      'conceptVaultIndex',
      'conceptWikiLinkResolution',
      'conceptDocIdVaultRelativePaths',
      'conceptOpaqueRegions',
      'conceptDiagnostics',
      'conceptCompletions',
      'conceptRenameSafety',
      'conceptReferencesNavigationTagsEmbeds',
      'advancedConfigurationModel',
      'advancedVaultSingleFileMode',
      'advancedIndexingPerformance',
      'advancedUriConfinement',
      'advancedParserBoundaries',
      'advancedDirectLspIntegration',
    ]);
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

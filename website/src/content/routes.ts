/**
 * Canonical public route metadata for the static website.
 */
export const siteBaseUrl = 'https://flavor-grenade.dev';

/** Stable identifiers for public website routes. */
export const routeIds = [
  'home',
  'quickstart',
  'howTo',
  'howToVsCodeExtension',
  'howToUseLlmSkill',
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
] as const;

/** Public route identifier. */
export type RouteId = (typeof routeIds)[number];

/** Route intent used for rendering and structured data selection. */
export type PageType = 'home' | 'docs' | 'how-to' | 'concept' | 'faq' | 'features';

/** Public content group used for article lists, breadcrumbs, and dropdowns. */
export type RouteGroup =
  | 'home'
  | 'quickstart'
  | 'how-to'
  | 'advanced-usage'
  | 'faq'
  | 'concepts'
  | 'features';

/** Social metadata attached to each public route. */
export interface RouteSeoMetadata {
  openGraphTitle: string;
  openGraphDescription: string;
  twitterTitle: string;
  twitterDescription: string;
}

/** Complete metadata required to render and validate a public route. */
export interface WebsiteRoute {
  id: RouteId;
  path: `/${string}`;
  title: string;
  description: string;
  h1: string;
  pageType: PageType;
  group: RouteGroup;
  isArticle: boolean;
  canonicalUrl: string;
  related: RouteId[];
  seo: RouteSeoMetadata;
}

export const howToArticleRouteIds = [
  'howToVsCodeExtension',
  'howToUseLlmSkill',
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
] as const satisfies readonly RouteId[];

export const conceptArticleRouteIds = [
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
] as const satisfies readonly RouteId[];

export const advancedArticleRouteIds = [
  'advancedConfigurationModel',
  'advancedVaultSingleFileMode',
  'advancedIndexingPerformance',
  'advancedUriConfinement',
  'advancedParserBoundaries',
  'advancedDirectLspIntegration',
] as const satisfies readonly RouteId[];

export const articleRouteIds = [
  ...howToArticleRouteIds,
  ...conceptArticleRouteIds,
  ...advancedArticleRouteIds,
] as const satisfies readonly RouteId[];

/** Article route group used by hubs, dropdowns, and sitemap coverage tests. */
export interface GuideArticleGroup {
  label: 'How-To' | 'Concepts' | 'Advanced Usage';
  hubRouteId: 'howTo' | 'concepts' | 'advancedUsage';
  routeIds: readonly RouteId[];
}

/** Canonical public guide article route inventory. */
export const guideArticleGroups: readonly GuideArticleGroup[] = [
  {
    label: 'How-To',
    hubRouteId: 'howTo',
    routeIds: howToArticleRouteIds,
  },
  {
    label: 'Concepts',
    hubRouteId: 'concepts',
    routeIds: conceptArticleRouteIds,
  },
  {
    label: 'Advanced Usage',
    hubRouteId: 'advancedUsage',
    routeIds: advancedArticleRouteIds,
  },
];

function canonicalUrl(path: WebsiteRoute['path']): string {
  return `${siteBaseUrl}${path}`;
}

function makeSeo(title: string, description: string): RouteSeoMetadata {
  return {
    openGraphTitle: title,
    openGraphDescription: description,
    twitterTitle: title,
    twitterDescription: description,
  };
}

function route(
  id: RouteId,
  path: WebsiteRoute['path'],
  title: string,
  description: string,
  h1: string,
  pageType: PageType,
  group: RouteGroup,
  related: RouteId[],
  isArticle = false,
): WebsiteRoute {
  return {
    id,
    path,
    title,
    description,
    h1,
    pageType,
    group,
    isArticle,
    canonicalUrl: canonicalUrl(path),
    related,
    seo: makeSeo(title, description),
  };
}

/** Typed registry for every required public website route. */
export const websiteRoutes: readonly WebsiteRoute[] = [
  route(
    'home',
    '/',
    'Flavor Grenade LSP | Flavor-Aware Markdown Tools',
    'Language server and VS Code extension support for Obsidian vaults and flavor-aware Markdown projects.',
    'Flavor Grenade LSP',
    'home',
    'home',
    ['quickstart', 'features', 'howToChooseMarkdownFlavor'],
  ),
  route(
    'quickstart',
    '/quickstart/',
    'Quickstart | Flavor Grenade LSP',
    'Install Flavor Grenade LSP for VS Code, a direct LSP client, or an LLM skill workflow.',
    'Quickstart',
    'docs',
    'quickstart',
    ['howToVsCodeExtension', 'howToUseLlmSkill', 'advancedDirectLspIntegration'],
  ),
  route(
    'howTo',
    '/how-to/',
    'How-to Guides | Flavor Grenade LSP',
    'Task-focused guides for using Flavor Grenade with Markdown workspaces, Obsidian vaults, and VS Code.',
    'How-to Guides',
    'docs',
    'how-to',
    ['howToVsCodeExtension', 'howToChooseMarkdownFlavor', 'howToUseStructuredProfiles'],
  ),
  route(
    'howToVsCodeExtension',
    '/how-to/use-vscode-extension/',
    'Use the VS Code Extension | Flavor Grenade LSP',
    'Install and activate the Flavor Grenade VS Code extension for Markdown workspace workflows.',
    'Use the VS Code Extension',
    'how-to',
    'how-to',
    ['quickstart', 'howToChooseMarkdownFlavor', 'advancedDirectLspIntegration'],
    true,
  ),
  route(
    'howToUseLlmSkill',
    '/how-to/use-llm-skill-plugin/',
    'Use the LLM Skill and Plugin | Flavor Grenade LSP',
    'Install the Flavor Grenade LSP skill/plugin so Claude, Codex, and compatible agents can inspect Markdown flavor evidence.',
    'Use the LLM Skill and Plugin',
    'how-to',
    'how-to',
    ['quickstart', 'advancedDirectLspIntegration', 'conceptMarkdownFlavorModel'],
    true,
  ),
  route(
    'howToConfigureObsidianVaults',
    '/how-to/configure-obsidian-vaults/',
    'Configure Markdown Workspaces | Flavor Grenade LSP',
    'Configure root detection, indexing boundaries, explicit flavor markers, and generated-output behavior.',
    'Configure Markdown Workspaces',
    'how-to',
    'how-to',
    ['howToChooseMarkdownFlavor', 'conceptVaultIndex', 'advancedConfigurationModel'],
    true,
  ),
  route(
    'howToChooseMarkdownFlavor',
    '/how-to/choose-a-markdown-flavor/',
    'Choose a Markdown Flavor | Flavor Grenade LSP',
    'Use Auto Detect, .fgattributes, and the VS Code selector to choose the right base Markdown flavor.',
    'Choose a Markdown Flavor',
    'how-to',
    'how-to',
    ['conceptMarkdownFlavorModel', 'advancedConfigurationModel', 'howToConfigureObsidianVaults'],
    true,
  ),
  route(
    'howToUseStructuredProfiles',
    '/how-to/use-structured-profiles/',
    'Use Structured Profiles | Flavor Grenade LSP',
    'Layer Keep a Changelog, Common Changelog, or MADR structure on top of the selected Markdown flavor.',
    'Use Structured Profiles',
    'how-to',
    'how-to',
    ['conceptStructuredProfiles', 'howToChooseMarkdownFlavor', 'advancedConfigurationModel'],
    true,
  ),
  route(
    'howToFixBrokenLinks',
    '/how-to/fix-broken-links/',
    'Fix Broken Links | Flavor Grenade LSP',
    'Use diagnostics to repair missing notes, headings, embeds, images, and attachments.',
    'Fix Broken Links',
    'how-to',
    'how-to',
    ['conceptDiagnostics', 'conceptWikiLinkResolution', 'howToUseCodeActions'],
    true,
  ),
  route(
    'howToUseCodeActions',
    '/how-to/use-code-actions/',
    'Use Code Actions | Flavor Grenade LSP',
    'Apply Flavor Grenade quick fixes for missing files, table of contents updates, tags, and non-breaking spaces.',
    'Use Code Actions',
    'how-to',
    'how-to',
    ['conceptDiagnostics', 'howToFixBrokenLinks', 'howToUseStructuredProfiles'],
    true,
  ),
  route(
    'howToRenameNotesSafely',
    '/how-to/rename-notes-safely/',
    'Rename Notes Safely | Flavor Grenade LSP',
    'Rename notes and headings while preserving supported local references inside a vault.',
    'Rename Notes Safely',
    'how-to',
    'how-to',
    ['conceptRenameSafety', 'howToFixBrokenLinks', 'advancedUriConfinement'],
    true,
  ),
  route(
    'howToCompleteWikiLinksHeadings',
    '/how-to/complete-wiki-links-and-headings/',
    'Complete Wiki-links and Headings | Flavor Grenade LSP',
    'Use vault-aware completion for notes, headings, tags, embeds, and attachments.',
    'Complete Wiki-links and Headings',
    'how-to',
    'how-to',
    ['conceptCompletions', 'conceptVaultIndex', 'howToUseTagsCompletion'],
    true,
  ),
  route(
    'howToNavigateVaultTargets',
    '/how-to/navigate-notes-headings-blocks-embeds-and-attachments/',
    'Navigate Notes, Headings, Blocks, Embeds, and Attachments | Flavor Grenade LSP',
    'Jump from Obsidian-style references to local notes, anchors, embeds, and attachments.',
    'Navigate Notes, Headings, Blocks, Embeds, and Attachments',
    'how-to',
    'how-to',
    ['conceptReferencesNavigationTagsEmbeds', 'conceptWikiLinkResolution', 'howToFindReferencesHighlights'],
    true,
  ),
  route(
    'howToFindReferencesHighlights',
    '/how-to/find-references-and-highlights/',
    'Find References and Highlights | Flavor Grenade LSP',
    'Find backlinks, outbound references, tag references, and repeated local references.',
    'Find References and Highlights',
    'how-to',
    'how-to',
    ['conceptReferencesNavigationTagsEmbeds', 'howToRenameNotesSafely', 'howToUseTagsCompletion'],
    true,
  ),
  route(
    'howToUseTagsCompletion',
    '/how-to/use-tags-and-tag-completion/',
    'Use Tags and Tag Completion | Flavor Grenade LSP',
    'Complete nested Obsidian tags and find tag references across indexed vault notes.',
    'Use Tags and Tag Completion',
    'how-to',
    'how-to',
    ['conceptReferencesNavigationTagsEmbeds', 'conceptCompletions', 'howToFindReferencesHighlights'],
    true,
  ),
  route(
    'howToOpaqueRegions',
    '/how-to/work-with-ofm-opaque-regions/',
    'Work with OFM Opaque Regions | Flavor Grenade LSP',
    'Understand why code, math, comments, frontmatter, and templates avoid false OFM tokens.',
    'Work with OFM Opaque Regions',
    'how-to',
    'how-to',
    ['conceptOpaqueRegions', 'advancedParserBoundaries', 'howToFixBrokenLinks'],
    true,
  ),
  route(
    'advancedUsage',
    '/advanced-usage/',
    'Advanced Usage | Flavor Grenade LSP',
    'Advanced configuration, indexing, confinement, parser, and direct-LSP integration notes.',
    'Advanced Usage',
    'docs',
    'advanced-usage',
    ['advancedConfigurationModel', 'advancedVaultSingleFileMode', 'advancedDirectLspIntegration'],
  ),
  route(
    'advancedConfigurationModel',
    '/advanced-usage/configuration-model/',
    'Configuration Model | Flavor Grenade LSP',
    'Understand VS Code settings, vault markers, document extensions, and server options.',
    'Configuration Model',
    'docs',
    'advanced-usage',
    ['howToConfigureObsidianVaults', 'advancedVaultSingleFileMode', 'advancedIndexingPerformance'],
    true,
  ),
  route(
    'advancedVaultSingleFileMode',
    '/advanced-usage/vault-mode-and-single-file-mode/',
    'Vault Mode and Single-file Mode | Flavor Grenade LSP',
    'Compare vault-wide behavior with the conservative single-file fallback mode.',
    'Vault Mode and Single-file Mode',
    'docs',
    'advanced-usage',
    ['advancedConfigurationModel', 'conceptVaultIndex', 'advancedDirectLspIntegration'],
    true,
  ),
  route(
    'advancedIndexingPerformance',
    '/advanced-usage/indexing-and-performance/',
    'Indexing and Performance | Flavor Grenade LSP',
    'Learn how scanning, parsing, ignore rules, watchers, and rebuilds affect vault features.',
    'Indexing and Performance',
    'docs',
    'advanced-usage',
    ['conceptVaultIndex', 'advancedConfigurationModel', 'howToConfigureObsidianVaults'],
    true,
  ),
  route(
    'advancedUriConfinement',
    '/advanced-usage/unsupported-uri-schemes-and-confinement/',
    'Unsupported URI Schemes and Confinement | Flavor Grenade LSP',
    'See how local vault targets are separated from external URLs, schemes, and outside paths.',
    'Unsupported URI Schemes and Confinement',
    'docs',
    'advanced-usage',
    ['conceptWikiLinkResolution', 'conceptRenameSafety', 'howToFixBrokenLinks'],
    true,
  ),
  route(
    'advancedParserBoundaries',
    '/advanced-usage/parser-boundaries-and-opaque-regions/',
    'Parser Boundaries and Opaque Regions | Flavor Grenade LSP',
    'Review parser ordering, opaque-region marking, token parsing, and conservative edge cases.',
    'Parser Boundaries and Opaque Regions',
    'docs',
    'advanced-usage',
    ['conceptOpaqueRegions', 'howToOpaqueRegions', 'conceptDiagnostics'],
    true,
  ),
  route(
    'advancedDirectLspIntegration',
    '/advanced-usage/compatibility-and-direct-lsp-integration/',
    'Compatibility and Direct LSP Integration | Flavor Grenade LSP',
    'Use the supported VS Code extension path first; direct LSP clients own advanced setup.',
    'Compatibility and Direct LSP Integration',
    'docs',
    'advanced-usage',
    ['howToVsCodeExtension', 'advancedConfigurationModel', 'advancedVaultSingleFileMode'],
    true,
  ),
  route(
    'faq',
    '/faq/',
    'FAQ | Flavor Grenade LSP',
    'Answers about Obsidian compatibility, VS Code setup, rename safety, and LSP behavior.',
    'Frequently Asked Questions',
    'faq',
    'faq',
    ['quickstart', 'advancedUsage', 'howToVsCodeExtension'],
  ),
  route(
    'concepts',
    '/concepts/',
    'Concepts | Flavor Grenade LSP',
    'Short wiki-style explanations for flavor-aware Markdown language-server concepts.',
    'Concepts',
    'docs',
    'concepts',
    ['conceptMarkdownFlavorModel', 'conceptStructuredProfiles', 'conceptVaultIndex'],
  ),
  route(
    'conceptInspirationPriorArt',
    '/concepts/inspiration-and-prior-art/',
    'Inspiration and Prior Art | Flavor Grenade LSP',
    'Credit the LLM wiki pattern, Obsidian vault workflows, and Markdown LSP prior art.',
    'Inspiration and Prior Art',
    'concept',
    'concepts',
    ['conceptObsidianFlavoredMarkdown', 'conceptVaultIndex', 'faq'],
    true,
  ),
  route(
    'conceptObsidianFlavoredMarkdown',
    '/concepts/obsidian-flavored-markdown/',
    'Obsidian Flavored Markdown and Markdown Flavors | Flavor Grenade LSP',
    'Learn how Obsidian Flavored Markdown fits into Flavor Grenade base-flavor detection.',
    'Obsidian Flavored Markdown and Markdown Flavors',
    'concept',
    'concepts',
    ['conceptMarkdownFlavorModel', 'conceptWikiLinkResolution', 'quickstart'],
    true,
  ),
  route(
    'conceptMarkdownFlavorModel',
    '/concepts/markdown-flavor-model/',
    'Markdown Flavor Model | Flavor Grenade LSP',
    'Understand base Markdown flavors, explicit configuration, inference, and CommonMark fallback.',
    'Markdown Flavor Model',
    'concept',
    'concepts',
    ['conceptObsidianFlavoredMarkdown', 'conceptStructuredProfiles', 'advancedConfigurationModel'],
    true,
  ),
  route(
    'conceptStructuredProfiles',
    '/concepts/structured-profiles/',
    'Structured Profiles | Flavor Grenade LSP',
    'Understand changelog and MADR profiles as optional structure layered over a base Markdown flavor.',
    'Structured Profiles',
    'concept',
    'concepts',
    ['conceptMarkdownFlavorModel', 'conceptDiagnostics', 'howToUseStructuredProfiles'],
    true,
  ),
  route(
    'conceptVaultIndex',
    '/concepts/vault-index/',
    'Vault Index | Flavor Grenade LSP',
    'Understand how Flavor Grenade indexes vault documents, attachments, tags, and links.',
    'Vault Index',
    'concept',
    'concepts',
    ['conceptDocIdVaultRelativePaths', 'conceptCompletions', 'howToConfigureObsidianVaults'],
    true,
  ),
  route(
    'conceptWikiLinkResolution',
    '/concepts/wiki-link-resolution/',
    'Wiki-link Resolution | Flavor Grenade LSP',
    'Understand how Flavor Grenade resolves wiki links, aliases, headings, and attachments.',
    'Wiki-link Resolution',
    'concept',
    'concepts',
    ['conceptVaultIndex', 'conceptDiagnostics', 'howToFixBrokenLinks'],
    true,
  ),
  route(
    'conceptDocIdVaultRelativePaths',
    '/concepts/docid-and-vault-relative-paths/',
    'DocId and Vault-Relative Paths | Flavor Grenade LSP',
    'See why document identity is vault-relative, extension-free, and portable.',
    'DocId and Vault-Relative Paths',
    'concept',
    'concepts',
    ['conceptVaultIndex', 'conceptWikiLinkResolution', 'conceptRenameSafety'],
    true,
  ),
  route(
    'conceptOpaqueRegions',
    '/concepts/opaque-regions/',
    'Opaque Regions | Flavor Grenade LSP',
    'Learn why the parser skips OFM-looking text inside code, math, comments, and templates.',
    'Opaque Regions',
    'concept',
    'concepts',
    ['conceptObsidianFlavoredMarkdown', 'conceptDiagnostics', 'advancedParserBoundaries'],
    true,
  ),
  route(
    'conceptDiagnostics',
    '/concepts/diagnostics/',
    'Diagnostics | Flavor Grenade LSP',
    'Understand vault-aware diagnostics for broken, ambiguous, malformed, and unsafe targets.',
    'Diagnostics',
    'concept',
    'concepts',
    ['conceptWikiLinkResolution', 'conceptOpaqueRegions', 'howToFixBrokenLinks'],
    true,
  ),
  route(
    'conceptCompletions',
    '/concepts/completions/',
    'Completions | Flavor Grenade LSP',
    'Understand context-routed completions from the vault index, tag registry, and attachments.',
    'Completions',
    'concept',
    'concepts',
    ['conceptVaultIndex', 'conceptWikiLinkResolution', 'howToCompleteWikiLinksHeadings'],
    true,
  ),
  route(
    'conceptRenameSafety',
    '/concepts/rename-safety/',
    'Rename Safety | Flavor Grenade LSP',
    'Learn how rename uses resolved local references instead of blind text replacement.',
    'Rename Safety',
    'concept',
    'concepts',
    ['conceptDocIdVaultRelativePaths', 'conceptWikiLinkResolution', 'howToRenameNotesSafely'],
    true,
  ),
  route(
    'conceptReferencesNavigationTagsEmbeds',
    '/concepts/references-navigation-tags-and-embeds/',
    'References, Navigation, Tags, and Embeds | Flavor Grenade LSP',
    'See how references, navigation, tags, highlights, and embeds share one vault graph.',
    'References, Navigation, Tags, and Embeds',
    'concept',
    'concepts',
    ['conceptVaultIndex', 'conceptCompletions', 'features'],
    true,
  ),
  route(
    'features',
    '/features/',
    'Features | Flavor Grenade LSP',
    'Explore diagnostics, completions, references, rename, tags, embeds, and structural navigation.',
    'Features',
    'features',
    'features',
    ['quickstart', 'howTo', 'concepts'],
  ),
];

/** Returns the route metadata for a public route ID. */
export function getRouteById(id: RouteId): WebsiteRoute {
  const routeMatch = websiteRoutes.find((candidate) => candidate.id === id);

  if (!routeMatch) {
    throw new Error(`Unknown website route: ${id}`);
  }

  return routeMatch;
}

/** Returns validation messages for route metadata invariants. */
export function validateRouteMetadata(routes: readonly WebsiteRoute[]): string[] {
  const messages: string[] = [];
  const seenPaths = new Set<string>();
  const seenTitles = new Set<string>();
  const seenDescriptions = new Set<string>();
  const ids = new Set<RouteId>(routeIds);
  const articleIds = new Set<RouteId>(articleRouteIds);

  for (const routeRecord of routes) {
    const requiredFields = [
      'title',
      'description',
      'h1',
      'canonicalUrl',
      'pageType',
      'group',
    ] as const;

    for (const field of requiredFields) {
      if (!routeRecord[field]) {
        messages.push(`${routeRecord.id} is missing ${field}.`);
      }
    }

    if (seenPaths.has(routeRecord.path)) {
      messages.push(`${routeRecord.id} duplicates route path ${routeRecord.path}.`);
    }
    seenPaths.add(routeRecord.path);

    if (seenTitles.has(routeRecord.title)) {
      messages.push(`${routeRecord.id} duplicates title ${routeRecord.title}.`);
    }
    seenTitles.add(routeRecord.title);

    if (seenDescriptions.has(routeRecord.description)) {
      messages.push(`${routeRecord.id} duplicates description ${routeRecord.description}.`);
    }
    seenDescriptions.add(routeRecord.description);

    if (routeRecord.canonicalUrl && routeRecord.canonicalUrl !== canonicalUrl(routeRecord.path)) {
      messages.push(`${routeRecord.id} has non-canonical URL ${routeRecord.canonicalUrl}.`);
    }

    if (articleIds.has(routeRecord.id) && !routeRecord.isArticle) {
      messages.push(`${routeRecord.id} is missing article metadata.`);
    }

    for (const relatedId of routeRecord.related) {
      if (!ids.has(relatedId)) {
        messages.push(`${routeRecord.id} links to unknown related route ${relatedId}.`);
      }
    }
  }

  for (const requiredId of routeIds) {
    if (!routes.some((routeRecord) => routeRecord.id === requiredId)) {
      messages.push(`${requiredId} route is missing.`);
    }
  }

  return messages;
}

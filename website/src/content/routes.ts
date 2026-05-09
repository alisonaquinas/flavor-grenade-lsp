/**
 * Canonical public route metadata for the static website.
 */
export const siteBaseUrl = 'https://alisonaquinas.github.io/flavor-grenade-lsp';

/** Stable identifiers for public website routes. */
export const routeIds = [
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
] as const;

/** Public route identifier. */
export type RouteId = (typeof routeIds)[number];

/** Route intent used for rendering and structured data selection. */
export type PageType = 'home' | 'docs' | 'how-to' | 'concept' | 'faq' | 'features';

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
  canonicalUrl: string;
  related: RouteId[];
  seo: RouteSeoMetadata;
}

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
  related: RouteId[],
): WebsiteRoute {
  return {
    id,
    path,
    title,
    description,
    h1,
    pageType,
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
    'Flavor Grenade LSP | Obsidian Flavored Markdown Tools',
    'Language server and VS Code extension support for Obsidian-style Markdown vaults.',
    'Flavor Grenade LSP',
    'home',
    ['quickstart', 'features', 'howToVsCodeExtension'],
  ),
  route(
    'quickstart',
    '/quickstart/',
    'Quickstart | Flavor Grenade LSP',
    'Install Flavor Grenade LSP and verify Obsidian Flavored Markdown features in VS Code.',
    'Quickstart',
    'docs',
    ['howToVsCodeExtension', 'concepts', 'faq'],
  ),
  route(
    'howTo',
    '/how-to/',
    'How-to Guides | Flavor Grenade LSP',
    'Task-focused guides for using Flavor Grenade with Obsidian Vaults and VS Code.',
    'How-to Guides',
    'docs',
    ['howToVsCodeExtension', 'howToVaultConfiguration', 'howToSafeRename'],
  ),
  route(
    'howToVsCodeExtension',
    '/how-to/use-vscode-extension/',
    'Use the VS Code Extension | Flavor Grenade LSP',
    'Install and activate the Flavor Grenade VS Code extension for Obsidian Vault workflows.',
    'Use the VS Code Extension',
    'how-to',
    ['quickstart', 'advancedUsage', 'faq'],
  ),
  route(
    'howToVaultConfiguration',
    '/how-to/configure-vaults/',
    'Configure Obsidian Vaults | Flavor Grenade LSP',
    'Configure vault detection and indexing for Obsidian Flavored Markdown projects.',
    'Configure Obsidian Vaults',
    'how-to',
    ['conceptVaultIndex', 'advancedUsage', 'howToBrokenLinks'],
  ),
  route(
    'howToBrokenLinks',
    '/how-to/fix-broken-links/',
    'Fix Broken Obsidian Links | Flavor Grenade LSP',
    'Use diagnostics and navigation to find and fix broken wiki links and Markdown links.',
    'Fix Broken Links',
    'how-to',
    ['conceptWikiLinkResolution', 'howToSafeRename', 'features'],
  ),
  route(
    'howToSafeRename',
    '/how-to/rename-notes-safely/',
    'Rename Obsidian Notes Safely | Flavor Grenade LSP',
    'Rename notes and headings while preserving local references inside an Obsidian Vault.',
    'Rename Notes Safely',
    'how-to',
    ['howToBrokenLinks', 'conceptWikiLinkResolution', 'advancedUsage'],
  ),
  route(
    'advancedUsage',
    '/advanced-usage/',
    'Advanced Usage | Flavor Grenade LSP',
    'Advanced configuration, editor integration, and compatibility notes for Flavor Grenade LSP.',
    'Advanced Usage',
    'docs',
    ['quickstart', 'howToVaultConfiguration', 'faq'],
  ),
  route(
    'faq',
    '/faq/',
    'FAQ | Flavor Grenade LSP',
    'Answers about Obsidian compatibility, VS Code setup, rename safety, and LSP behavior.',
    'Frequently Asked Questions',
    'faq',
    ['quickstart', 'advancedUsage', 'howToVsCodeExtension'],
  ),
  route(
    'concepts',
    '/concepts/',
    'Concepts | Flavor Grenade LSP',
    'Short wiki-style explanations for Obsidian Flavored Markdown language-server concepts.',
    'Concepts',
    'docs',
    ['conceptObsidianFlavoredMarkdown', 'conceptVaultIndex', 'conceptWikiLinkResolution'],
  ),
  route(
    'conceptObsidianFlavoredMarkdown',
    '/concepts/obsidian-flavored-markdown/',
    'Obsidian Flavored Markdown | Flavor Grenade LSP',
    'Learn how Obsidian Flavored Markdown differs from plain Markdown in vault workflows.',
    'Obsidian Flavored Markdown',
    'concept',
    ['conceptVaultIndex', 'conceptWikiLinkResolution', 'quickstart'],
  ),
  route(
    'conceptVaultIndex',
    '/concepts/vault-index/',
    'Vault Index | Flavor Grenade LSP',
    'Understand how Flavor Grenade indexes Obsidian Vaults for completions and navigation.',
    'Vault Index',
    'concept',
    ['conceptObsidianFlavoredMarkdown', 'conceptWikiLinkResolution', 'howToVaultConfiguration'],
  ),
  route(
    'conceptWikiLinkResolution',
    '/concepts/wiki-link-resolution/',
    'Wiki-link Resolution | Flavor Grenade LSP',
    'Understand how Flavor Grenade resolves wiki links, Markdown links, aliases, and headings.',
    'Wiki-link Resolution',
    'concept',
    ['conceptVaultIndex', 'howToBrokenLinks', 'howToSafeRename'],
  ),
  route(
    'features',
    '/features/',
    'Features | Flavor Grenade LSP',
    'Explore diagnostics, completions, references, rename, tags, embeds, and structural navigation.',
    'Features',
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

  for (const routeRecord of routes) {
    const requiredFields = [
      'title',
      'description',
      'h1',
      'canonicalUrl',
      'pageType',
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

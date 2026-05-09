import {
  outboundLink,
  routeLink,
  validatePublicLinks,
  type PublicLink,
} from './links';
import type { RouteId, WebsiteRoute } from './routes';

/** A short section of public page content. */
export interface WebsitePageSection {
  heading: string;
  body: string;
}

/** Typed content record used by the static website route renderer. */
export interface WebsitePageContent {
  routeId: RouteId;
  summary: string;
  sections: WebsitePageSection[];
  links: PublicLink[];
}

function page(
  routeId: RouteId,
  summary: string,
  sections: WebsitePageSection[],
  links: PublicLink[],
): WebsitePageContent {
  return { routeId, summary, sections, links };
}

const repositoryLink = outboundLink(
  'https://github.com/alisonaquinas/flavor-grenade-lsp',
  'Flavor Grenade LSP GitHub repository',
);
const marketplaceLink = outboundLink(
  'https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp',
  'Flavor Grenade LSP on the Visual Studio Marketplace',
);
const obsidianLink = outboundLink('https://obsidian.md', 'Obsidian');
const marksmanLink = outboundLink('https://github.com/artempyanykh/marksman', 'Marksman LSP');
const karpathyLink = outboundLink('https://karpathy.ai', 'Andrej Karpathy');

/** Starter public content records for every required Phase W2 route. */
export const websitePages: readonly WebsitePageContent[] = [
  page(
    'home',
    'Flavor Grenade LSP brings Obsidian-aware language tooling to Markdown vaults.',
    [
      {
        heading: 'Obsidian-aware language tooling',
        body: 'The site introduces diagnostics, completions, rename, references, and navigation for Obsidian Flavored Markdown.',
      },
    ],
    [routeLink('quickstart', 'Start with the quickstart'), marketplaceLink, repositoryLink],
  ),
  page(
    'quickstart',
    'Install the extension, open an Obsidian Vault, and verify language features.',
    [
      {
        heading: 'Install and verify',
        body: 'Quickstart content covers prerequisites, extension installation, and the first successful vault workflow.',
      },
    ],
    [routeLink('howToVsCodeExtension', 'Use the VS Code extension'), marketplaceLink],
  ),
  page(
    'howTo',
    'Task-focused guides collect install, configuration, diagnostics, and rename workflows.',
    [
      {
        heading: 'Choose a task',
        body: 'The how-to index routes users to concrete vault operations rather than internal planning docs.',
      },
    ],
    [
      routeLink('howToVsCodeExtension', 'Install the VS Code extension'),
      routeLink('howToVaultConfiguration', 'Configure vault detection'),
      routeLink('howToSafeRename', 'Rename notes safely'),
    ],
  ),
  page(
    'howToVsCodeExtension',
    'Set up Flavor Grenade from the Visual Studio Marketplace and confirm activation.',
    [
      {
        heading: 'Use the extension path',
        body: 'The extension guide explains installation, activation, and the relationship between the client and the bundled server.',
      },
    ],
    [marketplaceLink, routeLink('quickstart', 'Return to quickstart')],
  ),
  page(
    'howToVaultConfiguration',
    'Configure vault detection and index behavior for Obsidian Vaults.',
    [
      {
        heading: 'Keep vault boundaries explicit',
        body: 'Configuration guidance explains vault markers, supported files, and safe indexing boundaries.',
      },
    ],
    [routeLink('conceptVaultIndex', 'Understand the vault index'), obsidianLink],
  ),
  page(
    'howToBrokenLinks',
    'Use diagnostics and navigation to fix broken local references.',
    [
      {
        heading: 'Repair local links',
        body: 'Broken-link guidance explains how diagnostics point to missing docs, headings, and attachment targets.',
      },
    ],
    [routeLink('conceptWikiLinkResolution', 'Understand wiki-link resolution')],
  ),
  page(
    'howToSafeRename',
    'Rename notes and headings while preserving local references.',
    [
      {
        heading: 'Preserve references',
        body: 'Rename guidance focuses on vault-confined edits and avoiding unsafe external file changes.',
      },
    ],
    [routeLink('howToBrokenLinks', 'Fix broken links'), routeLink('advancedUsage', 'Review advanced usage')],
  ),
  page(
    'advancedUsage',
    'Advanced usage covers direct LSP behavior, compatibility, and configuration details.',
    [
      {
        heading: 'Go deeper',
        body: 'Advanced docs separate direct server use from VS Code extension behavior and future deployment notes.',
      },
    ],
    [routeLink('faq', 'Read the FAQ'), routeLink('howToVaultConfiguration', 'Configure vaults')],
  ),
  page(
    'faq',
    'Answers to common questions about compatibility, activation, indexing, and rename safety.',
    [
      {
        heading: 'Common questions',
        body: 'FAQ content addresses practical objections before users need to inspect repository internals.',
      },
    ],
    [routeLink('quickstart', 'Start setup'), routeLink('advancedUsage', 'Read advanced usage')],
  ),
  page(
    'concepts',
    'Short concept pages explain the LLM wiki ideas behind the public docs.',
    [
      {
        heading: 'Short linked concepts',
        body: 'Concept pages follow a Karpathy-inspired wiki style while crediting Obsidian and Marksman inspiration.',
      },
    ],
    [karpathyLink, obsidianLink, marksmanLink],
  ),
  page(
    'conceptObsidianFlavoredMarkdown',
    'Obsidian Flavored Markdown extends Markdown with vault links, embeds, tags, and local conventions.',
    [
      {
        heading: 'Markdown with vault semantics',
        body: 'This concept distinguishes OFM from generic Markdown so users understand why vault-aware tooling matters.',
      },
    ],
    [obsidianLink, routeLink('conceptWikiLinkResolution', 'Understand wiki-link resolution')],
  ),
  page(
    'conceptVaultIndex',
    'The vault index is the source of truth for documents, attachments, links, and tags.',
    [
      {
        heading: 'One indexed graph',
        body: 'The concept explains how indexed vault data supports completions, diagnostics, navigation, and rename.',
      },
    ],
    [routeLink('conceptWikiLinkResolution', 'Understand link resolution')],
  ),
  page(
    'conceptWikiLinkResolution',
    'Wiki-link resolution connects Obsidian-style links, Markdown links, aliases, headings, and attachments.',
    [
      {
        heading: 'Resolve local references',
        body: 'The concept describes how Flavor Grenade reasons about local links while ignoring unsupported external targets.',
      },
    ],
    [routeLink('howToBrokenLinks', 'Fix broken links'), routeLink('howToSafeRename', 'Rename safely')],
  ),
  page(
    'features',
    'Feature pages summarize diagnostics, completions, references, rename, tags, embeds, and navigation.',
    [
      {
        heading: 'Language-server features',
        body: 'The feature overview gives users a scannable map of the tool before they read task docs.',
      },
    ],
    [routeLink('quickstart', 'Try the quickstart'), routeLink('concepts', 'Read concepts')],
  ),
];

/** Returns validation messages for content records and their public links. */
export function validateWebsitePages(
  pages: readonly WebsitePageContent[],
  routes: readonly WebsiteRoute[],
): string[] {
  const messages: string[] = [];
  const routeIds = new Set(routes.map((route) => route.id));
  const pageIds = new Set<RouteId>();

  for (const pageRecord of pages) {
    if (pageIds.has(pageRecord.routeId)) {
      messages.push(`${pageRecord.routeId} has duplicate content records.`);
    }
    pageIds.add(pageRecord.routeId);

    if (!routeIds.has(pageRecord.routeId)) {
      messages.push(`${pageRecord.routeId} content has no matching route.`);
    }

    if (!pageRecord.summary.trim()) {
      messages.push(`${pageRecord.routeId} is missing summary.`);
    }

    if (pageRecord.sections.length === 0) {
      messages.push(`${pageRecord.routeId} has no content sections.`);
    }

    for (const section of pageRecord.sections) {
      if (!section.heading.trim() || !section.body.trim()) {
        messages.push(`${pageRecord.routeId} has an incomplete content section.`);
      }
    }

    if (pageRecord.links.length === 0) {
      messages.push(`${pageRecord.routeId} has no public links.`);
    }

    messages.push(...validatePublicLinks(pageRecord.links, routes));
  }

  for (const routeRecord of routes) {
    if (!pageIds.has(routeRecord.id)) {
      messages.push(`${routeRecord.id} is missing content.`);
    }
  }

  return messages;
}

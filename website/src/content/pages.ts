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
  items?: string[];
  steps?: Array<{
    title: string;
    body: string;
  }>;
  code?: string;
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
    'Install the VS Code extension, open an Obsidian Vault folder, and verify that Flavor Grenade LSP is serving OFMarkdown features.',
    [
      {
        heading: 'Prerequisites',
        body: 'Use the recommended VS Code extension path when you want the fastest setup. Direct LSP server use is for advanced editor integrations.',
        items: [
          'VS Code installed on Windows, macOS, Linux, WSL, SSH, or Dev Container.',
          'An Obsidian Vault folder or Markdown workspace that uses Obsidian-style links.',
          'A note you can edit, such as notes/Daily Note.md.',
        ],
      },
      {
        heading: 'Install from the Visual Studio Marketplace',
        body: 'Install Flavor Grenade LSP from the Visual Studio Marketplace, then reload VS Code if prompted.',
        steps: [
          {
            title: 'Open an Obsidian Vault folder',
            body: 'Use File > Open Folder and choose the folder that contains `.obsidian/` or `.flavor-grenade.toml`.',
          },
          {
            title: 'Confirm OFMarkdown activation',
            body: 'Open a Markdown note in the vault and confirm the language mode becomes OFMarkdown while the server status is ready.',
          },
        ],
      },
      {
        heading: 'Verify the first vault workflow',
        body: 'Create a note with a real local reference, then use completion, navigation, references, rename, and diagnostics in one pass.',
        code: '[[Daily Note]] links to [[People/Ada Lovelace]] and [[Missing Target]].',
        items: [
          'Type `[[` and choose a completion from the indexed Obsidian Vault.',
          'Navigate to `[[Daily Note]]`, find references, then rename a heading or note.',
          'Leave `[[Missing Target]]` unresolved and confirm a broken-link diagnostic appears.',
        ],
      },
      {
        heading: 'Troubleshooting',
        body: 'If activation does not happen, check workspace trust, the selected language mode, the extension status, and whether the opened folder is the vault root.',
      },
    ],
    [routeLink('howToVsCodeExtension', 'Use the VS Code extension'), marketplaceLink],
  ),
  page(
    'howTo',
    'Task-focused guides collect install, configuration, diagnostics, and rename workflows.',
    [
      {
        heading: 'Choose a workflow',
        body: 'Use these pages when you want a concrete result in an Obsidian Vault before reading the concept wiki.',
        items: [
          'Install and activate the VS Code extension from the Visual Studio Marketplace.',
          'Complete wiki-links and headings from indexed vault notes.',
          'Navigate notes, headings, blocks, embeds, and attachments.',
          'Rename notes and headings safely inside the vault boundary.',
          'Fix broken links with diagnostics and code actions.',
        ],
      },
      {
        heading: 'Workflow groups',
        body: 'Start with setup, then use task pages for links, navigation, rename, diagnostics, tags, callouts, math, comments, frontmatter, and Templater-aware parsing.',
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
        heading: 'Install from the Visual Studio Marketplace',
        body: 'The VS Code extension is the recommended install path because the extension packages the language server and starts it for supported vault workspaces.',
        steps: [
          {
            title: 'Install',
            body: 'Install Flavor Grenade LSP from the Visual Studio Marketplace and let VS Code reload the extension host.',
          },
          {
            title: 'Activation',
            body: 'Open an Obsidian Vault folder. The extension starts for vault markers and OFMarkdown files instead of forcing every Markdown file into the tool.',
          },
          {
            title: 'Verify server status',
            body: 'Open a vault note, check that OFMarkdown is active, and use wiki-link completion to confirm the server status is ready.',
          },
        ],
      },
      {
        heading: 'When to use it',
        body: 'Use this page when you want VS Code to manage activation, commands, and the bundled server instead of configuring an LSP client yourself.',
      },
      {
        heading: 'Steps',
        body: 'Install from the Marketplace, open an Obsidian Vault folder, check OFMarkdown mode, then verify completion or diagnostics in a note.',
      },
      {
        heading: 'Expected result',
        body: 'The extension activates for the vault open event, the server status is ready, and vault-local language features appear in Markdown notes.',
      },
      {
        heading: 'Common failure mode',
        body: 'If activation does not happen, the folder may not be the vault root, workspace trust may be restricted, or the file may still be plain Markdown.',
      },
      {
        heading: 'Vault open and first checks',
        body: 'A good vault open test is a note that references `[[Daily Note]]`, an attachment, and one intentionally missing target so completion and diagnostics are both visible.',
      },
      {
        heading: 'Extension and server boundary',
        body: 'The extension packages the language server, owns VS Code activation and commands, and delegates OFMarkdown intelligence to the server process.',
      },
    ],
    [marketplaceLink, routeLink('quickstart', 'Return to quickstart')],
  ),
  page(
    'howToVaultConfiguration',
    'Configure vault detection and index behavior for Obsidian Vaults.',
    [
      {
        heading: 'When to use it',
        body: 'Use this page when completions or diagnostics look incomplete because VS Code opened the wrong folder or the vault markers are unclear.',
      },
      {
        heading: 'Steps',
        body: 'Open the Obsidian Vault root, keep `.obsidian/` or `.flavor-grenade.toml` at that root, then let the server index Markdown files and attachments.',
        items: [
          'Prefer opening the vault folder instead of a parent workspace.',
          'Keep local references inside the vault boundary.',
          'Use configured file-extension and ignore rules when the vault contains generated docs.',
        ],
      },
      {
        heading: 'Expected result',
        body: 'The vault index can see notes, headings, tags, embeds, and attachments that belong to the current Obsidian Vault.',
      },
      {
        heading: 'Common failure mode',
        body: 'Opening a parent folder can make vault-relative paths ambiguous; opening only one loose file can fall back to single-file behavior.',
      },
    ],
    [routeLink('conceptVaultIndex', 'Understand the vault index'), obsidianLink],
  ),
  page(
    'howToBrokenLinks',
    'Use diagnostics and navigation to fix broken local references.',
    [
      {
        heading: 'When to use it',
        body: 'Use this page when `[[Missing Note]]`, `[text](missing.md)`, a heading anchor, or an attachment reference does not resolve.',
      },
      {
        heading: 'Steps',
        body: 'Open the diagnostic, inspect whether the target is a note, heading, block, or attachment, then create the target or update the link.',
        items: [
          'Use definition/navigation when the target exists but is hard to find.',
          'Use code actions for missing-note creation when available.',
          'Ignore external HTTPS links unless they are intentionally local vault references.',
        ],
      },
      {
        heading: 'Expected result',
        body: 'The broken-link diagnostic clears after the local target resolves inside the Obsidian Vault.',
      },
      {
        heading: 'Common failure mode',
        body: 'A heading may be ambiguous or misspelled, while an attachment may live outside the configured vault attachment folder.',
      },
    ],
    [routeLink('conceptWikiLinkResolution', 'Understand wiki-link resolution')],
  ),
  page(
    'howToSafeRename',
    'Rename notes and headings while preserving local references.',
    [
      {
        heading: 'When to use it',
        body: 'Use this page when you want to rename a note or heading and keep wiki links, Markdown links, and same-document anchors aligned.',
      },
      {
        heading: 'Steps',
        body: 'Use VS Code rename on a supported note or heading, review the WorkspaceEdit, and apply only vault-confined edits.',
        items: [
          'Rename notes from references the server can resolve.',
          'Rename headings when same-document and file-plus-heading anchors should update.',
          'Re-run references after rename to confirm inbound links still point to the target.',
        ],
      },
      {
        heading: 'Expected result',
        body: 'The rename updates supported local references without changing external URLs or files outside the vault.',
      },
      {
        heading: 'Common failure mode',
        body: 'Ambiguous links may be skipped so the server does not guess and damage unrelated references.',
      },
    ],
    [routeLink('howToBrokenLinks', 'Fix broken links'), routeLink('advancedUsage', 'Review advanced usage')],
  ),
  page(
    'advancedUsage',
    'Advanced usage covers direct LSP behavior, compatibility, and configuration details.',
    [
      {
        heading: 'Configuration model',
        body: 'Flavor Grenade uses explicit configuration for vault behavior, completion style, supported document extensions, and indexing boundaries.',
      },
      {
        heading: 'Vault mode and single-file mode',
        body: 'Vault mode indexes an Obsidian Vault graph. Single-file mode keeps behavior narrow when no vault root is available.',
      },
      {
        heading: 'Indexing and performance',
        body: 'The vault index is the source of truth for parsed documents, headings, tags, links, and attachments; large vaults should use ignore rules for generated output.',
      },
      {
        heading: 'Unsupported URI schemes and confinement',
        body: 'Unsupported URI schemes, external URLs, and paths outside the vault are not treated as editable vault targets.',
      },
      {
        heading: 'Opaque regions',
        body: 'Code fences, math, comments, and Templater regions are parsed as opaque regions before link/token parsing so examples and generated content do not create false diagnostics.',
      },
      {
        heading: 'Current behavior and planned behavior',
        body: 'Current behavior is strongest in the VS Code extension and local LSP server. Planned behavior includes richer static website delivery and broader public docs, not unsupported editor claims.',
        items: ['Current behavior: VS Code extension, direct server, vault-aware OFM features.', 'Planned behavior: deeper public docs and deployment automation.'],
      },
    ],
    [routeLink('faq', 'Read the FAQ'), routeLink('howToVaultConfiguration', 'Configure vaults')],
  ),
  page(
    'faq',
    'Answers to common questions about compatibility, activation, indexing, and rename safety.',
    [
      {
        heading: 'What is Flavor Grenade LSP?',
        body: 'It is a language server and VS Code extension for Obsidian Flavored Markdown workflows: links, headings, tags, embeds, diagnostics, navigation, references, and rename.',
      },
      {
        heading: 'Is Flavor Grenade LSP an Obsidian plugin?',
        body: 'No. It is editor tooling for VS Code and LSP clients. Obsidian does not need to run for the server to understand an Obsidian Vault folder.',
      },
      {
        heading: 'How is it different from Marksman?',
        body: 'Marksman inspired the project and is excellent Markdown LSP prior art. Flavor Grenade focuses specifically on Obsidian Flavored Markdown conventions and vault-aware behavior.',
      },
      {
        heading: 'Does Obsidian have to be installed?',
        body: 'No. The important input is the Obsidian Vault folder structure and Markdown content.',
      },
      {
        heading: 'Does it edit my vault automatically?',
        body: 'No. Diagnostics and completions are suggestions. Rename and code actions produce explicit editor edits that stay vault-confined.',
      },
      {
        heading: 'Which Markdown and OFM features are understood?',
        body: 'The parser understands wiki links, Markdown links, embeds, block references, tags, callouts, math, comments, frontmatter, and Templater-style opaque regions.',
      },
      {
        heading: 'Can Neovim or another LSP client use it?',
        body: 'The server is an LSP server, but the VS Code extension is the supported packaged path. Other clients may require manual transport and configuration.',
      },
      {
        heading: 'Why are some links not resolved?',
        body: 'External URLs, unsupported URI schemes, paths outside the vault, ambiguous headings, and intentionally ignored files are not resolved as editable local targets.',
      },
      {
        heading: 'How do I report a bug?',
        body: 'Create a minimal vault that reproduces the issue, include the link text and expected target, and note whether the problem appears in diagnostics, completion, navigation, references, or rename.',
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

/** Finds the public content record for a route ID. */
export function getWebsitePage(routeId: RouteId): WebsitePageContent {
  const pageRecord = websitePages.find((candidate) => candidate.routeId === routeId);

  if (!pageRecord) {
    throw new Error(`Unknown website page: ${routeId}`);
  }

  return pageRecord;
}

/** Finds the public content record for a browser path, falling back to home. */
export function getWebsitePageByPath(pathname: string, routes: readonly WebsiteRoute[]): WebsitePageContent {
  const routeRecord = routes.find((route) => route.path === pathname);

  return getWebsitePage(routeRecord?.id ?? 'home');
}

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

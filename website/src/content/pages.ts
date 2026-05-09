import {
  outboundLink,
  routeLink,
  validatePublicLinks,
  type PublicLink,
} from './links';
import {
  getRouteById,
  guideArticleGroups,
  type RouteId,
  type WebsiteRoute,
} from './routes';
import { conceptWikiPages } from './wiki';

/** Link from a hub section to a public guide article. */
export interface WebsiteArticleLink {
  routeId: RouteId;
  title: string;
  description: string;
}

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
  articleLinks?: WebsiteArticleLink[];
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

function articleLink(routeId: RouteId): WebsiteArticleLink {
  const routeRecord = getRouteById(routeId);

  return {
    routeId,
    title: routeRecord.h1,
    description: routeRecord.description,
  };
}

function articleLinksFor(hubRouteId: 'howTo' | 'concepts' | 'advancedUsage'): WebsiteArticleLink[] {
  const group = guideArticleGroups.find((candidate) => candidate.hubRouteId === hubRouteId);

  return group?.routeIds.map(articleLink) ?? [];
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
const karpathyLink = outboundLink(
  'https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f',
  "Karpathy's LLM Wiki concept",
);

const taskShapeSections = {
  when: 'When to use it',
  steps: 'Steps',
  expected: 'Expected result',
  failure: 'Common failure mode',
} as const;

function taskArticle(
  routeId: RouteId,
  summary: string,
  useCase: string,
  steps: WebsitePageSection['steps'],
  expected: string,
  failure: string,
  code: string,
  links: PublicLink[],
): WebsitePageContent {
  return page(
    routeId,
    summary,
    [
      { heading: taskShapeSections.when, body: useCase },
      {
        heading: taskShapeSections.steps,
        body: 'Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.',
        steps,
        code,
      },
      { heading: taskShapeSections.expected, body: expected },
      { heading: taskShapeSections.failure, body: failure },
    ],
    links,
  );
}

function conceptArticle(
  routeId: RouteId,
  summary: string,
  definition: string,
  example: string,
  maintainerNote: string,
  links: PublicLink[],
): WebsitePageContent {
  return page(
    routeId,
    summary,
    [
      {
        heading: 'Compact definition',
        body: definition,
      },
      {
        heading: 'Vault example',
        body: 'Use this example as the public vocabulary for humans and LLM maintainers.',
        code: example,
      },
      {
        heading: 'For LLM maintainers',
        body: maintainerNote,
      },
    ],
    links,
  );
}

function advancedArticle(
  routeId: RouteId,
  summary: string,
  sections: WebsitePageSection[],
  links: PublicLink[],
): WebsitePageContent {
  return page(routeId, summary, sections, links);
}

/** Public content records for every website route. */
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
    'Task-focused guides collect install, configuration, diagnostics, navigation, completion, references, tags, rename, and opaque-region workflows.',
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
        articleLinks: articleLinksFor('howTo'),
      },
      {
        heading: 'Workflow groups',
        body: 'Start with setup, then use task pages for links, navigation, rename, diagnostics, tags, callouts, math, comments, frontmatter, and Templater-aware parsing.',
      },
    ],
    [
      routeLink('howToVsCodeExtension', 'Install the VS Code extension'),
      routeLink('howToConfigureObsidianVaults', 'Configure vault detection'),
      routeLink('howToRenameNotesSafely', 'Rename notes safely'),
    ],
  ),
  taskArticle(
    'howToVsCodeExtension',
    'Set up Flavor Grenade from the Visual Studio Marketplace and confirm activation.',
    'Install from the Visual Studio Marketplace when you want VS Code activation, commands, and status UI. The extension packages the language server so the normal vault open path does not require configuring an LSP client yourself.',
    [
      {
        title: 'Install',
        body: 'Install Flavor Grenade LSP from the Visual Studio Marketplace and let VS Code reload the extension host.',
      },
      {
        title: 'Confirm vault open activation',
        body: 'Open the folder that contains `.obsidian/` or `.flavor-grenade.toml` so the server can detect the vault boundary.',
      },
      {
        title: 'Verify activation',
        body: 'Open a Markdown note, check OFMarkdown mode, then type `[[` to confirm vault-aware completion is active.',
      },
    ],
    'The extension activates for the vault open event, the server status is ready, and vault-local language features appear in Markdown notes.',
    'If activation does not happen, the folder may not be the vault root, workspace trust may be restricted, or the file may still be plain Markdown.',
    '[[Daily Note]] links to [[People/Ada Lovelace]] and [[Missing Target]].',
    [marketplaceLink, routeLink('quickstart', 'Return to quickstart')],
  ),
  taskArticle(
    'howToConfigureObsidianVaults',
    'Configure vault detection and index behavior for Obsidian Vaults.',
    'Use this page when completions or diagnostics look incomplete because VS Code opened the wrong folder or the vault markers are unclear.',
    [
      {
        title: 'Open the intended root',
        body: 'Prefer opening the folder that owns `.obsidian/` instead of a parent folder containing several unrelated vaults.',
      },
      {
        title: 'Keep markers explicit',
        body: 'Use `.obsidian/` for Obsidian Vaults or `.flavor-grenade.toml` for a configured Flavor Grenade vault.',
      },
      {
        title: 'Confirm indexed files',
        body: 'Keep generated output and external assets outside the indexed boundary when they should not participate in diagnostics.',
      },
    ],
    'The vault index can see notes, headings, tags, embeds, and attachments that belong to the current Obsidian Vault.',
    'Opening a parent folder can make vault-relative paths ambiguous; opening only one loose file can fall back to single-file behavior.',
    'MyVault/\n  .obsidian/\n  Notes/\n    Daily Note.md\n  assets/\n    diagram.png',
    [routeLink('conceptVaultIndex', 'Understand the vault index'), obsidianLink],
  ),
  taskArticle(
    'howToFixBrokenLinks',
    'Use diagnostics and navigation to fix broken local references.',
    'Use this page when `[[Missing Note]]`, `[[Project Plan#Risks]]`, a Markdown image, or an Obsidian embed does not resolve.',
    [
      {
        title: 'Read the diagnostic',
        body: 'Start with the underlined local reference and identify whether the target is a note, heading, block, image, or embed.',
      },
      {
        title: 'Create or correct the target',
        body: 'Create the missing note, fix the heading text, or update the vault-relative attachment path.',
      },
      {
        title: 'Save and re-check',
        body: 'Save the note and wait for the vault index to refresh before assuming the diagnostic is stale.',
      },
    ],
    'The broken-link diagnostic clears after the supported local target resolves inside the Obsidian Vault.',
    'Plain Markdown asset links such as `[diagram](assets/diagram.png)` are not currently missing attachment diagnostics; use Markdown images or Obsidian embeds for attachment validation.',
    '[[Missing Note]]\n[[Project Plan#Risks]]\n![diagram](assets/missing.png)\n![[diagram.png]]',
    [routeLink('conceptDiagnostics', 'Understand diagnostics'), routeLink('conceptWikiLinkResolution', 'Understand wiki-link resolution')],
  ),
  taskArticle(
    'howToRenameNotesSafely',
    'Rename notes and headings while preserving local references.',
    'Use this page when you want to rename a note or heading and keep supported wiki links, Markdown links, and anchors aligned.',
    [
      {
        title: 'Start from a resolved target',
        body: 'Use rename on a note or heading the server can resolve from the current vault index.',
      },
      {
        title: 'Review the workspace edit',
        body: 'Confirm edits stay inside the vault and affect the references you expect.',
      },
      {
        title: 'Check references after rename',
        body: 'Run references or navigation again to confirm inbound links point at the renamed target.',
      },
    ],
    'The rename updates supported local references without changing external URLs or files outside the vault.',
    'Ambiguous links may be skipped so the server does not guess and damage unrelated references.',
    'Before: [[Project Plan#Risks]]\nAfter:  [[Project Plan#Risk Log]]',
    [routeLink('conceptRenameSafety', 'Understand rename safety'), routeLink('howToFixBrokenLinks', 'Fix broken links')],
  ),
  taskArticle(
    'howToCompleteWikiLinksHeadings',
    'Use vault-aware completion for note names, headings, tags, embeds, and attachments.',
    'Use this page when you want to type less and select local vault targets from indexed candidates.',
    [
      {
        title: 'Trigger note completion',
        body: 'Type `[[Pro` in a vault note and choose an indexed note candidate.',
      },
      {
        title: 'Narrow to headings',
        body: 'Type `[[Project Plan#` to request headings from the resolved note.',
      },
      {
        title: 'Keep the selected style',
        body: 'Use the configured link style so completions match your vault conventions.',
      },
    ],
    'Completion inserts the selected vault target with the expected wiki-link or Markdown-link shape.',
    'If the vault is not indexed, note-name completion is limited or unavailable because there is no vault graph to query.',
    'Today connects to [[Project Plan#Open questions]].',
    [routeLink('conceptCompletions', 'Understand completions'), routeLink('conceptVaultIndex', 'Understand the vault index')],
  ),
  taskArticle(
    'howToNavigateVaultTargets',
    'Jump from Obsidian-style references to local notes, headings, blocks, embeds, and attachments.',
    'Use this page when you want definition navigation to move from a reference to the local vault target.',
    [
      {
        title: 'Place the cursor on a local reference',
        body: 'Use a wiki link, heading anchor, block reference, embed, or supported attachment reference.',
      },
      {
        title: 'Run go to definition',
        body: 'Let the server resolve the target through the same vault model used by diagnostics.',
      },
      {
        title: 'Confirm the target',
        body: 'Check that the opened note, heading, block, or attachment is inside the vault boundary.',
      },
    ],
    'Navigation lands on the resolved vault-local target without treating external URLs as editable targets.',
    'Unsupported URI schemes and paths outside the vault are intentionally ignored.',
    '[[People/Ada Lovelace#Notes]]\n![[assets/diagram.png]]',
    [routeLink('conceptReferencesNavigationTagsEmbeds', 'Understand shared editor features'), routeLink('advancedUriConfinement', 'Review URI confinement')],
  ),
  taskArticle(
    'howToFindReferencesHighlights',
    'Find backlinks, outbound references, tag references, and repeated local references.',
    'Use this page when you need to see where a note, heading, tag, or local target is mentioned.',
    [
      {
        title: 'Choose a resolved target',
        body: 'Place the cursor on a wiki link, tag, heading, or local reference.',
      },
      {
        title: 'Run references or highlights',
        body: 'Use VS Code references for cross-file results and document highlights for local repeats.',
      },
      {
        title: 'Review linked context',
        body: 'Use the results list to inspect backlinks before editing or renaming.',
      },
    ],
    'The editor shows references derived from the indexed vault graph and the current parsed document.',
    'References outside the indexed vault or inside opaque regions may not appear.',
    '[[Project Plan]]\n#project/flavor-grenade\n![[diagram.png]]',
    [routeLink('conceptReferencesNavigationTagsEmbeds', 'Understand references and navigation'), routeLink('howToRenameNotesSafely', 'Rename after checking references')],
  ),
  taskArticle(
    'howToUseTagsCompletion',
    'Complete nested Obsidian tags and find tag references across indexed vault notes.',
    'Use this page when your vault uses tags as a lightweight graph alongside wiki links.',
    [
      {
        title: 'Type a tag prefix',
        body: 'Type `#project/` and select a known nested tag from the vault-wide tag registry.',
      },
      {
        title: 'Find tag references',
        body: 'Run references on the tag to inspect notes that share the same project or topic.',
      },
      {
        title: 'Keep tags outside opaque examples',
        body: 'Tags inside code fences and comments are examples, not indexed tag facts.',
      },
    ],
    'The tag candidate or reference result reflects tags parsed from indexed vault notes.',
    'A tag typed before indexing completes may not have vault-wide suggestions yet.',
    '#project/flavor-grenade\n#project/flavor-grenade/docs',
    [routeLink('conceptCompletions', 'Understand completions'), routeLink('conceptReferencesNavigationTagsEmbeds', 'Understand tag references')],
  ),
  taskArticle(
    'howToOpaqueRegions',
    'Understand why code, math, comments, frontmatter, and templates avoid false OFM tokens.',
    'Use this page when examples or generated regions contain link-looking text that should not affect diagnostics.',
    [
      {
        title: 'Identify the region',
        body: 'Look for code fences, inline code, math, comments, frontmatter, or Templater blocks.',
      },
      {
        title: 'Keep examples inside opaque syntax',
        body: 'Put sample links inside a code fence when they are documentation, not vault references.',
      },
      {
        title: 'Move real links outside',
        body: 'If a link should resolve, place it in normal Markdown text.',
      },
    ],
    'False diagnostics stay quiet for link-looking text inside opaque regions, while real prose links still participate in vault features.',
    'If a real link is accidentally placed inside a code fence, the server treats it as example text.',
    '```markdown\n[[Example Link]] stays inert in this code fence.\n```',
    [routeLink('conceptOpaqueRegions', 'Understand opaque regions'), routeLink('advancedParserBoundaries', 'Review parser boundaries')],
  ),
  page(
    'advancedUsage',
    'Advanced usage covers direct LSP behavior, compatibility, and configuration details.',
    [
      {
        heading: 'Advanced topics',
        body: 'Configuration model, Vault mode and single-file mode, Indexing and performance, Unsupported URI schemes, Opaque regions, and direct LSP compatibility each have a focused article.',
        articleLinks: articleLinksFor('advancedUsage'),
      },
      {
        heading: 'Current behavior and planned behavior',
        body: 'Current behavior is strongest in the VS Code extension and local LSP server. Planned behavior includes richer static website delivery and broader public docs, not unsupported editor claims.',
        items: [
          'Current behavior: VS Code extension, direct server, vault-aware OFM features.',
          'Planned behavior: deeper public docs and deployment automation.',
        ],
      },
    ],
    [routeLink('faq', 'Read the FAQ'), routeLink('howToConfigureObsidianVaults', 'Configure vaults')],
  ),
  advancedArticle(
    'advancedConfigurationModel',
    'Understand VS Code settings, vault markers, document extensions, and server options.',
    [
      {
        heading: 'Configuration sources',
        body: 'Flavor Grenade starts from the editor root, then uses `.obsidian/` or `.flavor-grenade.toml` to decide whether a folder is a vault.',
        code: 'DocsProject/\n  .flavor-grenade.toml\n  docs/\n    index.md',
      },
      {
        heading: 'Document boundaries',
        body: 'Supported document extensions and ignore rules should keep generated output from becoming noisy indexed content.',
      },
      {
        heading: 'Operational rule',
        body: 'Prefer explicit vault markers over guessing from any Markdown folder.',
      },
    ],
    [routeLink('howToConfigureObsidianVaults', 'Configure Obsidian Vaults'), routeLink('advancedVaultSingleFileMode', 'Compare operating modes')],
  ),
  advancedArticle(
    'advancedVaultSingleFileMode',
    'Compare vault-wide behavior with the conservative single-file fallback mode.',
    [
      {
        heading: 'Vault mode',
        body: 'Vault mode scans a detected `.obsidian/` or `.flavor-grenade.toml` root and builds the graph used by completions, diagnostics, references, and rename.',
        code: 'MyVault/\n  .obsidian/\n  Notes/\n    Home.md',
      },
      {
        heading: 'Single-file mode',
        body: 'Single-file mode skips recursive scanning when no vault marker is available. Wiki-link note-name completion is unavailable because no vault index graph is built.',
      },
      {
        heading: 'Direct clients',
        body: 'A direct LSP client should send a `rootUri` or workspace folder for the intended vault root.',
        code: '{"rootUri":"file:///Users/alex/MyVault"}',
      },
    ],
    [routeLink('conceptVaultIndex', 'Understand the vault index'), routeLink('advancedDirectLspIntegration', 'Direct LSP integration')],
  ),
  advancedArticle(
    'advancedIndexingPerformance',
    'Learn how scanning, parsing, ignore rules, watchers, and rebuilds affect vault features.',
    [
      {
        heading: 'Index lifecycle',
        body: 'The index begins with a vault scan, stores parsed OFM documents, and refreshes as watched files change.',
        code: '.obsidian/ root -> scan -> parse -> VaultIndex -> diagnostics/completions/references',
      },
      {
        heading: 'Large vaults',
        body: 'Use ignore rules for generated docs, exports, and vendor folders so user-authored notes stay fast and precise.',
      },
      {
        heading: 'Performance boundary',
        body: 'The index is the source of truth; feature-local caches should not create a second document model.',
      },
    ],
    [routeLink('conceptVaultIndex', 'Vault Index'), routeLink('howToConfigureObsidianVaults', 'Configure vaults')],
  ),
  advancedArticle(
    'advancedUriConfinement',
    'See how local vault targets are separated from external URLs, schemes, and outside paths.',
    [
      {
        heading: 'Unsupported URI schemes',
        body: 'External URLs, `mailto:`, custom schemes, and paths outside the vault are not editable vault targets.',
        code: 'https://example.com\nmailto:team@example.com\n../outside-vault.md',
      },
      {
        heading: 'Vault confinement',
        body: 'Rename and code actions should stay inside the detected vault root.',
      },
      {
        heading: 'Diagnostic behavior',
        body: 'Unsupported URI schemes are ignored instead of reported as missing local notes.',
      },
    ],
    [routeLink('conceptWikiLinkResolution', 'Wiki-link Resolution'), routeLink('conceptRenameSafety', 'Rename Safety')],
  ),
  advancedArticle(
    'advancedParserBoundaries',
    'Review parser ordering, opaque-region marking, token parsing, and conservative edge cases.',
    [
      {
        heading: 'Opaque first',
        body: 'The opaque-region pass runs before token parsing so code, math, comments, and templates can be skipped safely.',
        code: '```markdown\n[[Example Link]]\n```',
      },
      {
        heading: 'Token parsing',
        body: 'After opaque regions are marked, wiki links, Markdown links, tags, embeds, headings, and blocks can be parsed as real OFM tokens.',
      },
      {
        heading: 'Conservative edge cases',
        body: 'Ambiguous or unsupported syntax should stay quiet rather than produce false diagnostics.',
      },
    ],
    [routeLink('conceptOpaqueRegions', 'Opaque Regions'), routeLink('howToOpaqueRegions', 'Work with OFM opaque regions')],
  ),
  advancedArticle(
    'advancedDirectLspIntegration',
    'Use the supported VS Code extension path first; direct LSP clients own advanced setup.',
    [
      {
        heading: 'Supported path',
        body: 'The VS Code extension packages the server, handles activation, and is the recommended setup for most users.',
      },
      {
        heading: 'Direct LSP clients',
        body: 'Direct clients must launch the server, provide a usable `rootUri`, and handle file-watching expectations.',
        code: '{"rootUri":"file:///Users/alex/MyVault","workspaceFolders":[{"uri":"file:///Users/alex/MyVault","name":"MyVault"}]}',
      },
      {
        heading: 'Compatibility boundary',
        body: 'The server speaks LSP, but non-VS-Code clients may need custom transport and configuration work.',
      },
    ],
    [routeLink('howToVsCodeExtension', 'Use the VS Code extension'), routeLink('advancedConfigurationModel', 'Configuration Model')],
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
        body: 'Concept pages follow a Karpathy-inspired LLM wiki style while crediting Obsidian and Marksman inspiration.',
        items: conceptWikiPages.map((conceptPage) => `${conceptPage.title}: ${conceptPage.question}`),
        articleLinks: articleLinksFor('concepts'),
      },
      {
        heading: 'For LLM maintainers',
        body: 'Use these public terms when generating or maintaining docs so Obsidian Vault workflows, OFM behavior, and server/extension boundaries stay consistent.',
      },
    ],
    [karpathyLink, obsidianLink, marksmanLink],
  ),
  conceptArticle(
    'conceptInspirationPriorArt',
    'Credit the LLM wiki pattern, Obsidian vault workflows, and Markdown LSP prior art.',
    'Flavor Grenade uses a Karpathy-inspired LLM wiki shape: short, linked concept pages that let humans and LLM maintainers share vocabulary.',
    'Concept pages link to task pages instead of redefining vault index, DocId, and wiki-link resolution in every guide.',
    'Credit Karpathy, Obsidian, and Marksman as inspiration and prior art without implying affiliation or endorsement.',
    [karpathyLink, obsidianLink, marksmanLink],
  ),
  conceptArticle(
    'conceptObsidianFlavoredMarkdown',
    'Obsidian Flavored Markdown extends Markdown with vault links, embeds, tags, and local conventions.',
    'OFM is Markdown plus vault semantics: wiki links, embeds, tags, headings, block references, callouts, frontmatter, and local attachment conventions.',
    '[[People/Ada Lovelace#Notes]] embeds context from ![[images/diagram.png]] and tags #project/flavor-grenade.',
    'Use OFM when prose depends on vault-local relationships that plain Markdown cannot describe by itself.',
    [obsidianLink, routeLink('conceptWikiLinkResolution', 'Understand wiki-link resolution')],
  ),
  conceptArticle(
    'conceptVaultIndex',
    'The vault index is the source of truth for documents, attachments, links, and tags.',
    'The vault index stores parsed OFM documents and attachment metadata so completions, diagnostics, navigation, references, and rename agree.',
    'notes/Daily.md -> DocId notes/Daily -> headings, tags, links, embeds, and attachments.',
    'Do not describe feature-local caches as alternate truth; new features should read from the shared vault model.',
    [routeLink('conceptWikiLinkResolution', 'Understand link resolution'), routeLink('advancedIndexingPerformance', 'Indexing and performance')],
  ),
  conceptArticle(
    'conceptWikiLinkResolution',
    'Wiki-link resolution connects Obsidian-style links, Markdown links, aliases, headings, and attachments.',
    'Resolution classifies the target, checks whether it is local and supported, resolves the vault document or attachment, then narrows to headings or blocks when needed.',
    '[[Project Plan#Risks|risk list]] resolves the note first, then the heading, then the display alias.',
    'Keep external URLs and unsupported schemes separate from editable vault targets.',
    [routeLink('howToFixBrokenLinks', 'Fix broken links'), routeLink('advancedUriConfinement', 'URI confinement')],
  ),
  conceptArticle(
    'conceptDocIdVaultRelativePaths',
    'See why document identity is vault-relative, extension-free, and portable.',
    'A DocId strips the vault root and Markdown extension so references stay portable across machines and never depend on private absolute paths.',
    'C:/vault/notes/Daily.md is stored as notes/Daily, while links render as human-friendly vault paths.',
    'Use DocId language when explaining rename, references, navigation, and index behavior.',
    [routeLink('conceptVaultIndex', 'Vault Index'), routeLink('conceptRenameSafety', 'Rename Safety')],
  ),
  conceptArticle(
    'conceptOpaqueRegions',
    'Learn why the parser skips OFM-looking text inside code, math, comments, and templates.',
    'Opaque regions protect code, math, comments, frontmatter, and Templater blocks from false link and tag parsing.',
    'A code fence containing [[Example Link]] should remain sample text, not a broken vault link.',
    'When documenting examples, use opaque regions so LLM-maintained pages do not create fake diagnostics.',
    [routeLink('howToOpaqueRegions', 'Work with opaque regions'), routeLink('advancedParserBoundaries', 'Parser boundaries')],
  ),
  conceptArticle(
    'conceptDiagnostics',
    'Understand vault-aware diagnostics for broken, ambiguous, malformed, and unsafe targets.',
    'Diagnostics report local reference problems only when the server has enough vault context to avoid guessing.',
    '[[Missing Note]] can report a broken-link diagnostic while https://example.com remains outside local vault checking.',
    'Describe diagnostics as conservative feedback, not as proof that every possible external or future target has been checked.',
    [routeLink('howToFixBrokenLinks', 'Fix broken links'), routeLink('conceptWikiLinkResolution', 'Wiki-link Resolution')],
  ),
  conceptArticle(
    'conceptCompletions',
    'Understand context-routed completions from the vault index, tag registry, and attachments.',
    'Completions are LSP suggestions built from indexed notes, headings, blocks, tags, callouts, and attachments, routed by the current OFM context.',
    'Typing [[Pro can suggest [[Project Plan]] and typing [[Project Plan# can suggest its headings.',
    'Do not claim vault-wide note-name completion in single-file mode because no vault index graph is built there.',
    [routeLink('howToCompleteWikiLinksHeadings', 'Complete wiki-links and headings'), routeLink('conceptVaultIndex', 'Vault Index')],
  ),
  conceptArticle(
    'conceptRenameSafety',
    'Learn how rename uses resolved local references instead of blind text replacement.',
    'Rename plans are vault-confined, syntax-aware, and explicit; ambiguous or unsupported references are skipped instead of rewritten by guesswork.',
    'Renaming #Risks can update [[Project Plan#Risks]] while leaving an unrelated external URL unchanged.',
    'Use safety language when describing rename so LLM-maintained docs avoid promising global text replacement.',
    [routeLink('howToRenameNotesSafely', 'Rename notes safely'), routeLink('advancedUriConfinement', 'URI confinement')],
  ),
  conceptArticle(
    'conceptReferencesNavigationTagsEmbeds',
    'See how references, navigation, tags, highlights, and embeds share one vault graph.',
    'References, definitions, highlights, tags, and embeds read from the same indexed OFM graph so editor actions stay consistent.',
    '#project/flavor-grenade, [[Daily Note]], and ![[diagram.png]] are indexed together for navigation and lookup.',
    'Explain these features as different views over shared vault data, not as unrelated parsers.',
    [routeLink('howToFindReferencesHighlights', 'Find references and highlights'), routeLink('howToUseTagsCompletion', 'Use tags and completion')],
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
export function getWebsitePageByPath(
  pathname: string,
  routes: readonly WebsiteRoute[],
): WebsitePageContent {
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

      for (const article of section.articleLinks ?? []) {
        if (!routeIds.has(article.routeId)) {
          messages.push(`${pageRecord.routeId} links unknown article route ${article.routeId}.`);
        }
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

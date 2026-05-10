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

function paragraphs(first: string, second: string): string {
  return `${first}\n\n${second}`;
}

interface TaskArticleDetail {
  context: string;
  stepsContext: string;
  expectedContext: string;
  failureContext: string;
}

const defaultTaskDetail: TaskArticleDetail = {
  context:
    'Use a small vault note while you try the workflow so the result is easy to inspect. The page should leave you with one concrete editor behavior you can verify before moving to the next guide.',
  stepsContext:
    'Keep the example narrow: one source note, one target note, and one deliberate edge case. That makes it clear whether the server is reading the vault graph or only reacting to text in the current file.',
  expectedContext:
    'When the workflow is healthy, the editor feature and the underlying vault model point to the same target. If two features disagree, treat that as a signal to check root selection, indexing, or link syntax.',
  failureContext:
    'Most failures come from opening the wrong folder, using syntax that is intentionally ignored, or asking the server to resolve a target outside the vault. Check those boundaries before changing project files.',
};

const taskArticleDetails: Partial<Record<RouteId, TaskArticleDetail>> = {
  howToVsCodeExtension: {
    context:
      'This is the path for users who want the extension to handle activation, status, commands, and server startup. It is the best first install because VS Code owns the editor integration while the bundled server focuses on vault intelligence.',
    stepsContext:
      'Start from the Marketplace listing, then open the vault root instead of a parent workspace. Use a note with one valid wiki link and one intentionally missing wiki link so activation, completion, and diagnostics are all visible.',
    expectedContext:
      'A good install feels uneventful: the extension activates on vault open, OFMarkdown mode is available, and the server reaches a ready state without manual command-line work. Completion and diagnostics are the practical proof.',
    failureContext:
      'If nothing activates, verify workspace trust, the selected language mode, and whether the folder contains `.obsidian/` or `.flavor-grenade.toml`. If activation works but vault features are thin, the folder may not be the vault root.',
  },
  howToConfigureObsidianVaults: {
    context:
      'Use this guide when the server appears to be working but the vault graph is incomplete. Configuration starts with choosing the correct root because DocIds, attachments, and local paths are all interpreted relative to that boundary.',
    stepsContext:
      'Check the folder tree before changing settings. A single `.obsidian/` folder or `.flavor-grenade.toml` marker should identify the content you want indexed, while generated output and unrelated repositories should stay outside the active root.',
    expectedContext:
      'After configuration is right, completions should see vault notes, diagnostics should resolve local targets, and references should stay inside the intended workspace. The same note should not resolve differently across features.',
    failureContext:
      'Opening a parent directory is the common trap: the server may see too much or fail to choose the vault you meant. Opening one loose file is the opposite trap because the server may fall back to single-file behavior.',
  },
  howToFixBrokenLinks: {
    context:
      'Broken-link diagnostics are meant to catch local references that look like vault targets but do not resolve. They are most useful during writing, rename cleanup, and LLM-maintained documentation passes where stale links can spread quickly.',
    stepsContext:
      'Classify the target before editing it. A missing note, missing heading, missing Markdown image, and missing Obsidian embed all have different fixes, so read the diagnostic and compare it with the actual vault tree.',
    expectedContext:
      'The diagnostic should clear only after the supported local target exists and the link points to it. That gives you confidence that the repair changed the vault relationship rather than merely hiding the warning text.',
    failureContext:
      'Some links are intentionally outside this check. Plain external URLs, unsupported URI schemes, and ordinary Markdown asset links that are not images should not be treated like missing vault notes.',
  },
  howToRenameNotesSafely: {
    context:
      'Use rename when you want a semantic edit rather than a search-and-replace. The server should update references it can resolve and skip references that would require guessing.',
    stepsContext:
      'Start from a target that navigation can already resolve, then inspect the WorkspaceEdit before applying it. For heading rename, include one inbound `[[Note#Heading]]` link so you can see the reference update.',
    expectedContext:
      'A safe rename updates the target and its supported inbound references while leaving external links, unrelated headings, and outside-vault files untouched. The result should still pass references and diagnostics checks.',
    failureContext:
      'If rename skips a link, it may be ambiguous, unsupported, or outside the vault boundary. Treat skipped edits as protection rather than failure until you confirm the link should have been resolvable.',
  },
  howToCompleteWikiLinksHeadings: {
    context:
      'Completion is the quickest visible proof that the vault index is useful. It turns indexed notes, headings, blocks, tags, callouts, and attachments into suggestions that match the current OFM context.',
    stepsContext:
      'Try note completion first, then heading completion, then attachment or tag completion. This order makes it easier to tell whether the missing candidate is an index problem, a target-resolution problem, or just the wrong trigger context.',
    expectedContext:
      'The inserted text should match the configured link style and point to a target the server can resolve later. Completion should make the next diagnostic or navigation action more accurate, not merely fill in text.',
    failureContext:
      'In single-file mode, vault-wide note-name completion is unavailable because there is no vault graph. If suggestions are missing in vault mode, wait for indexing and confirm the target file is not ignored.',
  },
  howToNavigateVaultTargets: {
    context:
      'Navigation turns the link graph into an editor workflow. Use it when you need to jump from a wiki link, heading anchor, embed, block reference, or attachment reference to the thing it names.',
    stepsContext:
      'Place the cursor on one local reference at a time and use go to definition. Compare the result with the vault tree so you can spot alias mistakes, heading mismatches, and attachments stored outside the expected folder.',
    expectedContext:
      'Successful navigation should land on the note, heading, block, or attachment inside the vault boundary. The same target should also be eligible for references, diagnostics, and rename where those features apply.',
    failureContext:
      'If navigation does nothing, the target may be external, unsupported, ambiguous, or hidden in an opaque region. Check whether diagnostics report the same issue before rewriting the link.',
  },
  howToFindReferencesHighlights: {
    context:
      'References answer the question “what depends on this?” before you edit a note, heading, or tag. Highlights answer the smaller question “where does this repeat in the current document?”',
    stepsContext:
      'Run references on a resolved target, then compare the result list with a search in your vault. The reference graph should surface OFM-aware relationships that plain text search cannot safely distinguish.',
    expectedContext:
      'The reference list should reflect indexed inbound links, tag usages, and local relationships the parser understands. Use the result list before rename or cleanup work so you know the blast radius.',
    failureContext:
      'References can miss content outside the vault, ignored files, and example text inside opaque regions. If a known reference is missing, inspect the syntax and confirm the source document is indexed.',
  },
  howToUseTagsCompletion: {
    context:
      'Tags are a lightweight graph layered over notes and links. Completion helps keep nested tag spelling consistent, while references make it possible to inspect where a tag is actually used. Treat the tag registry as shared vocabulary for project pages, people notes, status notes, and generated wiki maintenance work.',
    stepsContext:
      'Start with a tag prefix that already exists in more than one note, then add a new nested tag. This shows the difference between indexed candidates and new text the server has not seen yet.',
    expectedContext:
      'The tag candidate should preserve the nested path you chose, and references should find the same tag in indexed notes. This helps maintain project taxonomies without relying on memory.',
    failureContext:
      'Tags inside code fences, comments, and templates should not become indexed facts. If a tag is missing from completion, confirm it appears in normal Markdown and that indexing has finished.',
  },
  howToOpaqueRegions: {
    context:
      'Opaque regions protect documentation, generated snippets, math, comments, and template code from being interpreted as real vault content. This is especially important when LLMs maintain pages full of examples.',
    stepsContext:
      'Move one example link into a code fence and leave one real link in prose. Diagnostics and navigation should ignore the example while continuing to process the prose link.',
    expectedContext:
      'The server should stay quiet about OFM-looking text inside opaque regions and remain active for normal Markdown around it. That keeps examples useful without polluting the vault graph.',
    failureContext:
      'If a real link is inside a code fence or template block, the server will treat it as example text. Move it back into ordinary prose when you want it to resolve.',
  },
};

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
  const detail = taskArticleDetails[routeId] ?? defaultTaskDetail;

  return page(
    routeId,
    summary,
    [
      {
        heading: taskShapeSections.when,
        body: paragraphs(useCase, detail.context),
      },
      {
        heading: taskShapeSections.steps,
        body: paragraphs(
          'Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.',
          detail.stepsContext,
        ),
        steps,
        code,
      },
      {
        heading: taskShapeSections.expected,
        body: paragraphs(expected, detail.expectedContext),
      },
      {
        heading: taskShapeSections.failure,
        body: paragraphs(failure, detail.failureContext),
      },
    ],
    links,
  );
}

interface ConceptArticleDetail {
  definitionDetail: string;
  exampleDetail: string;
  maintainerDetail: string;
  practicalCheck: string;
  readerOutcome: string;
}

const defaultConceptDetail: ConceptArticleDetail = {
  definitionDetail:
    'Use the concept as shared vocabulary between the public website, implementation tickets, and generated docs. The point is to make the term stable enough that future changes can link back to one explanation.',
  exampleDetail:
    'The example is deliberately small but complete: it names a note, a local relationship, or a boundary the server can reason about without relying on private machine paths.',
  maintainerDetail:
    'When maintaining prose, describe what the server can verify and what it intentionally leaves alone. That keeps the docs useful to people and less likely to mislead LLM agents.',
  practicalCheck:
    'A useful article should leave the reader with a concrete check they can perform in a small vault. If the concept cannot be verified through a note, link, diagnostic, completion, or editor action, keep the language clearly conceptual.',
  readerOutcome:
    'The reader should leave with a term they can use accurately in a ticket, guide, or code review. The concept does not need to explain every implementation detail, but it should prevent the most common misunderstanding.',
};

const conceptArticleDetails: Partial<Record<RouteId, ConceptArticleDetail>> = {
  conceptInspirationPriorArt: {
    definitionDetail:
      'The public docs borrow the linked-wiki shape because it is easier for readers and LLM agents to reuse one precise concept than to maintain several partial definitions scattered across guides.',
    exampleDetail:
      'A task page can link to a concept when the reader needs background, then return to the workflow without turning every guide into a glossary. That is the tone to preserve: useful, linked, and direct.',
    maintainerDetail:
      'Always credit Karpathy, Obsidian, and Marksman as influences rather than dependencies or endorsements. The site should be clear about lineage while keeping Flavor Grenade behavior distinct.',
    practicalCheck:
      'A practical prior-art check is to read one workflow page and ask whether each borrowed idea is named precisely. Karpathy should be credited for the linked LLM wiki shape, Obsidian for the vault and OFM conventions, and Marksman for Markdown LSP inspiration. None of those credits should imply that the project is affiliated with, endorsed by, or behaviorally identical to the source of inspiration.',
    readerOutcome:
      'The reader should understand that Flavor Grenade is standing in a lineage, not claiming novelty for every part. The project combines those influences into a focused OFM language-server experience for Obsidian Vaults and LLM-maintained wiki docs.',
  },
  conceptObsidianFlavoredMarkdown: {
    definitionDetail:
      'The language server treats OFM as Markdown with vault-local meaning. A wiki link is not just punctuation; it points to a document, heading, block, or alias inside a specific vault boundary.',
    exampleDetail:
      'The example combines a note target, heading target, embed, and tag because real vault notes often use all of them together. That combination is why plain Markdown tooling is not enough.',
    maintainerDetail:
      'When adding docs, distinguish generic Markdown features from Obsidian-specific conventions. Do not imply that every Markdown link is safe to rewrite as a vault reference.',
    practicalCheck:
      'Create one note with `[[Project Plan]]`, `[[Project Plan#Risks]]`, `![[diagram.png]]`, and `#project/flavor-grenade`. Those tokens should be described as OFM because their meaning depends on the vault. A normal paragraph, an external web link, and a fenced code sample should remain ordinary Markdown unless the article is explicitly explaining how the server classifies them.',
    readerOutcome:
      'The reader should be able to explain why OFM needs vault-aware tooling. Markdown syntax alone can show text and links, but OFM adds local graph meaning that powers completion, diagnostics, navigation, references, and rename.',
  },
  conceptVaultIndex: {
    definitionDetail:
      'The index is the shared model behind the user-facing features. If diagnostics, completion, references, and rename do not read the same indexed facts, they can contradict each other.',
    exampleDetail:
      'The example shows a note becoming a DocId plus attached facts. Those facts are what make `[[Project Plan]]`, tags, and embeds available to multiple LSP features.',
    maintainerDetail:
      'Avoid writing docs that invent a second cache or feature-specific graph. If a behavior needs parsed document state, describe it as coming from the vault index or a service derived from it.',
    practicalCheck:
      'A simple index check is to add a note, wait for completion to offer it, then rename or fix a link that targets it. If completion, diagnostics, references, and rename disagree about the same note, the documentation should point maintainers back to the shared index rather than treating the disagreement as four unrelated feature bugs.',
    readerOutcome:
      'The reader should understand the index as the central reliability contract. When the index is correct, features can agree; when it is wrong or incomplete, the right fix usually starts with vault detection, scanning, parsing, or derived registries.',
  },
  conceptWikiLinkResolution: {
    definitionDetail:
      'Resolution starts by classifying the link target before looking it up. That is how the server keeps local notes separate from external URLs and unsupported schemes.',
    exampleDetail:
      'The alias in the example is display text, not the identity of the target. The target still resolves through the note and heading so rename and diagnostics can reason about it.',
    maintainerDetail:
      'Use resolution language whenever docs discuss broken links, navigation, or rename. Those features should sound like different uses of one resolver, not separate guessing systems.',
    practicalCheck:
      'To verify the concept, compare `[[Project Plan|plan]]`, `[[Project Plan#Risks]]`, and `https://example.com`. The first two should resolve through the vault model, while the external URL should stay outside local resolution. That distinction is what lets diagnostics and rename be useful without pretending every Markdown target is a vault object.',
    readerOutcome:
      'The reader should leave knowing that resolution is classification plus lookup. Display aliases, heading anchors, and local paths can participate in vault behavior, while external targets keep their Markdown meaning without becoming editable vault facts.',
  },
  conceptDocIdVaultRelativePaths: {
    definitionDetail:
      'DocIds keep identity portable by removing the vault root and Markdown extension. That lets the same vault work on another machine without rewriting absolute paths.',
    exampleDetail:
      'The example includes a heading link because DocId identity and anchor identity are separate. `notes/Daily` identifies the document, while `Open questions` identifies a location inside it.',
    maintainerDetail:
      'Do not use absolute local paths in public examples unless the article is explaining why they are not stored as identity. Prefer vault-relative examples that users can adapt.',
    practicalCheck:
      'Move a sample vault from one folder to another and keep the same note structure. The DocId for `notes/Daily.md` should still read like `notes/Daily`, not like a machine-specific path. Public docs should follow that pattern so examples remain portable across Windows, macOS, Linux, CI, and LLM-maintained fixtures.',
    readerOutcome:
      'The reader should be able to spot unsafe identity language. If an article starts treating absolute file paths or extension-bearing filenames as the durable note identity, it is drifting away from the vault-relative model and making examples harder to reuse in another workspace.',
  },
  conceptOpaqueRegions: {
    definitionDetail:
      'Opaque regions are parsed before tokens so examples, code, math, comments, and templates do not produce fake vault facts. They protect both diagnostics and the index.',
    exampleDetail:
      'A documentation page can show `[[Example Link]]` inside a code fence without creating a missing-link warning. Moving the same text into normal prose changes its meaning.',
    maintainerDetail:
      'When LLM agents generate examples, keep sample OFM inside fenced code. When the text should be a real vault relationship, keep it outside opaque syntax.',
    practicalCheck:
      'Put `[[Missing Example]]` inside a fenced code block and `[[Missing Real Note]]` in normal prose. The example should stay quiet while the prose link can produce a missing-target diagnostic. That difference is especially important for guide articles because they need to teach syntax without corrupting the vault graph with demonstration links.',
    readerOutcome:
      'The reader should understand that silence inside opaque regions is intentional. The server is protecting examples, generated snippets, comments, math, and templates from becoming false positives in user-facing editor features, especially on pages that teach OFM syntax by showing inert samples.',
  },
  conceptDiagnostics: {
    definitionDetail:
      'A diagnostic should mean the server has enough local context to make a useful claim. It should not complain about external links or targets it cannot safely classify.',
    exampleDetail:
      'The example contrasts a missing vault note with an external URL. One belongs to the local graph; the other is intentionally outside local vault validation.',
    maintainerDetail:
      'Explain diagnostics as conservative editor feedback. Avoid suggesting that the server validates the entire web, every editor convention, or every possible Markdown interpretation.',
    practicalCheck:
      'A good diagnostic example should name the local thing the user can fix. `[[Missing Note]]` can produce an actionable warning because creating or correcting the note resolves it. `mailto:team@example.com` should not produce the same warning because the server cannot repair that target through an Obsidian Vault edit.',
    readerOutcome:
      'The reader should treat diagnostics as scoped claims, not universal validation. A useful warning says what local relationship failed and gives enough context for a user or LLM maintainer to choose the next edit safely without inventing unsupported validation behavior.',
  },
  conceptCompletions: {
    definitionDetail:
      'Completion is context-routed: candidates depend on where the cursor is, the trigger text, and the indexed source of candidates. That keeps suggestions relevant instead of global.',
    exampleDetail:
      'The example starts with a note prefix and then narrows to a heading prefix. That progression mirrors how users build precise OFM references while writing.',
    maintainerDetail:
      'Be explicit that vault-wide note completion depends on vault mode. Single-file mode can parse the open document, but it does not have a vault graph for note-name suggestions.',
    practicalCheck:
      'Type `[[Pro` in a vault with `Project Plan.md`, then type `[[Project Plan#` after the note exists. The first completion proves note candidates came from the index; the second proves heading candidates came from the resolved target. If either candidate is missing, the article should guide users toward root detection, indexing, and trigger context.',
    readerOutcome:
      'The reader should know how to diagnose missing candidates. Ask whether the vault was detected, whether indexing finished, whether the cursor is in an OFM context, and whether the target is hidden by ignore rules or opaque syntax.',
  },
  conceptRenameSafety: {
    definitionDetail:
      'Rename safety comes from resolving targets before editing text. The server should change links that refer to the target and skip cases where identity is uncertain.',
    exampleDetail:
      'The example keeps the edit local to `[[Project Plan#Risks]]`. It should not rewrite unrelated prose, external URLs, or headings that only happen to share the same words.',
    maintainerDetail:
      'Use safety-focused language for rename docs. LLM-generated maintenance instructions should tell agents to inspect edits and respect skipped ambiguous references.',
    practicalCheck:
      'Before a rename article claims broad coverage, test one inbound wiki link, one heading link, one external URL, and one fenced example. The supported inbound references should be candidates for a WorkspaceEdit. The external URL and fenced example should remain untouched because they are not safe vault references to rewrite.',
    readerOutcome:
      'The reader should understand that skipped edits are often a safety feature. Rename should prefer a smaller correct WorkspaceEdit over a broad text replacement that changes examples, external links, or ambiguous matches, then let the user inspect any remaining manual cleanup.',
  },
  conceptReferencesNavigationTagsEmbeds: {
    definitionDetail:
      'These features are different views over the same graph. References ask who points here, navigation asks where this points, tags group notes, and embeds name local attachments or documents.',
    exampleDetail:
      'The example mixes a tag, note link, and embed because real vault workflows do the same. The server should keep those relationships consistent across editor actions.',
    maintainerDetail:
      'When adding feature docs, link back to the shared graph model. Avoid presenting each editor action as if it parses OFM independently.',
    practicalCheck:
      'A combined check is to create a note with one tag, one wiki link, and one embed, then use navigation and references from each token. The results should feel like different views over the same vault facts. When docs describe those workflows, they should preserve that consistency instead of making each feature sound like a separate parser.',
    readerOutcome:
      'The reader should see tags, embeds, references, and navigation as connected editor behaviors. That framing helps both users and LLM agents predict why a fix in the vault model can improve several features at once instead of chasing isolated symptoms in separate pages.',
  },
};

function conceptArticle(
  routeId: RouteId,
  summary: string,
  definition: string,
  example: string,
  maintainerNote: string,
  links: PublicLink[],
): WebsitePageContent {
  const detail = conceptArticleDetails[routeId] ?? defaultConceptDetail;

  return page(
    routeId,
    summary,
    [
      {
        heading: 'Compact definition',
        body: paragraphs(definition, detail.definitionDetail),
      },
      {
        heading: 'Vault example',
        body: paragraphs(
          'Use this example as the public vocabulary for humans and LLM maintainers.',
          detail.exampleDetail,
        ),
        code: example,
      },
      {
        heading: 'For LLM maintainers',
        body: paragraphs(maintainerNote, detail.maintainerDetail),
      },
      {
        heading: 'Practical check',
        body: paragraphs(detail.practicalCheck, detail.readerOutcome),
      },
    ],
    links,
  );
}

const advancedArticleChecks: Partial<Record<RouteId, string>> = {
  advancedConfigurationModel: paragraphs(
    'Check configuration by opening a folder that contains `.obsidian/` or `.flavor-grenade.toml`, then opening a parent folder that contains the same vault as a child. The first case should behave like a vault; the second should force the user or client to be explicit about the intended root. That contrast keeps the article grounded in the actual source of configuration truth.',
    'The public page should also show the server-only and VS Code paths separately. Marketplace installation is the friendly path for most users, while direct configuration belongs to people launching the language server themselves. Mixing those paths makes support harder because the extension and raw server do not own the same setup responsibilities.',
  ),
  advancedVaultSingleFileMode: paragraphs(
    'Verify the mode boundary with the same Markdown file in two contexts: first inside a detected vault, then as a loose file outside any marked root. In the vault, note completion and cross-file references can use indexed files. Outside the vault, the server should stay conservative because there is no safe graph for vault-wide answers.',
    'This distinction matters for documentation tone. Single-file mode is not a broken install by itself; it is the correct fallback when the client has not provided enough workspace context. The article should help users decide whether they need to reopen the vault root, add an explicit marker, or accept narrow behavior for a standalone note.',
  ),
  advancedIndexingPerformance: paragraphs(
    'Use a small synthetic vault to explain lifecycle, then name the knobs that matter in a real vault: ignored folders, generated output, large archives, and file watching. Users do not need implementation internals before they understand that every feature depends on the same parsed document set.',
    'For examples, prefer a before-and-after story: a generated docs folder pollutes completion, then an ignore rule removes it from the active graph. That makes performance guidance practical and reinforces the accuracy benefit of indexing only content that should participate in vault intelligence.',
  ),
  advancedUriConfinement: paragraphs(
    'Test confinement with four links in one note: a wiki link, a local image, an external URL, and a path that escapes the vault. The first two may be vault-local targets; the others should not become rename or code-action edits. The distinction is the article’s core safety promise.',
    'The prose should avoid saying unsupported targets are invalid Markdown. They may be perfectly valid Markdown or application links; they are just outside the set of targets Flavor Grenade can safely resolve and edit. That wording keeps diagnostics honest and prevents users from interpreting silence as a parser failure or a promise to inspect the wider machine.',
  ),
  advancedParserBoundaries: paragraphs(
    'Parser-boundary examples should pair one real token with one lookalike token in code, math, comment, frontmatter, or template text. The real token demonstrates normal OFM behavior; the lookalike demonstrates why opaque marking happens before token parsing.',
    'That pattern is important for LLM-maintained docs because guide pages contain many examples that look like real vault content. The article should make it clear that fenced snippets are teaching material, not indexed relationships, unless the example is intentionally moved into normal prose for verification in a real vault.',
  ),
  advancedDirectLspIntegration: paragraphs(
    'A direct-client example should include both the command that launches the npm-installed server and the initialize data the client sends afterward. Installing the package is only half the work; the client still owns stdio transport, workspace folders, root URI selection, and restart behavior.',
    'The VS Code article should stay linked from here because it is the supported path for most readers. Direct integration is for editor maintainers, advanced users, and test harnesses that already understand LSP wiring. The article should make that boundary explicit instead of implying npm installation alone gives a complete editor experience.',
  ),
};

function advancedArticle(
  routeId: RouteId,
  summary: string,
  sections: WebsitePageSection[],
  links: PublicLink[],
): WebsitePageContent {
  const practicalCheck = advancedArticleChecks[routeId];

  return page(
    routeId,
    summary,
    practicalCheck === undefined
      ? sections
      : [
          ...sections,
          {
            heading: 'Practical check',
            body: practicalCheck,
          },
        ],
    links,
  );
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
        body: paragraphs(
          'Use the recommended VS Code extension path when you want the fastest setup. Direct LSP server use is for advanced editor integrations.',
          'Before installing anything, decide whether you want VS Code to manage the server for you or whether you are wiring the language server into another editor. The VS Code path is friendlier; the npm server path is lower-level and expects you to provide LSP client configuration.',
        ),
        items: [
          'VS Code installed on Windows, macOS, Linux, WSL, SSH, or Dev Container.',
          'An Obsidian Vault folder or Markdown workspace that uses Obsidian-style links.',
          'A note you can edit, such as notes/Daily Note.md.',
        ],
      },
      {
        heading: 'Install from the Visual Studio Marketplace',
        body: paragraphs(
          'Install Flavor Grenade LSP from the Visual Studio Marketplace, then reload VS Code if prompted. The Marketplace link is included in this page so you can use the canonical extension listing instead of searching by hand.',
          'After installation, open the actual Obsidian Vault folder. Opening a parent workspace can make vault-relative paths ambiguous, while opening a single loose file can prevent vault-wide features from turning on.',
        ),
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
        body: paragraphs(
          'Create a note with a real local reference, then use completion, navigation, references, rename, and diagnostics in one pass.',
          'A good first check deliberately mixes one valid target with one missing target. That lets you see both sides of the server: successful vault lookup and conservative diagnostics when a local reference cannot be resolved.',
        ),
        code: '[[Daily Note]] links to [[People/Ada Lovelace]] and [[Missing Target]].',
        items: [
          'Type `[[` and choose a completion from the indexed Obsidian Vault.',
          'Navigate to `[[Daily Note]]`, find references, then rename a heading or note.',
          'Leave `[[Missing Target]]` unresolved and confirm a broken-link diagnostic appears.',
        ],
      },
      {
        heading: 'Troubleshooting',
        body: paragraphs(
          'If activation does not happen, check workspace trust, the selected language mode, the extension status, and whether the opened folder is the vault root.',
          'If completion works but diagnostics do not, give the initial index a moment to finish and verify that the target file is inside the vault. If diagnostics work but rename is skipped, the reference may be ambiguous or outside the supported local target set.',
        ),
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
        body: paragraphs(
          'Configuration model, Vault mode and single-file mode, Indexing and performance, Unsupported URI schemes, Opaque regions, and direct LSP compatibility each have a focused article.',
          'These pages are written for people who are maintaining the tool, integrating the server outside VS Code, or asking an LLM to modify a Karpathy-style LLM wiki without inventing behavior. Each article starts from the actual boundary the server depends on, then shows a small example that can be checked in a vault.',
        ),
        articleLinks: articleLinksFor('advancedUsage'),
      },
      {
        heading: 'Current behavior and planned behavior',
        body: paragraphs(
          'Current behavior is strongest in the VS Code extension and local LSP server. Planned behavior includes richer static website delivery and broader public docs, not unsupported editor claims.',
          'When a page describes direct LSP clients, read it as integration guidance rather than a promise that every editor works out of the box. The server speaks LSP, but non-VS-Code clients still own launch, root selection, transport, and file watching details.',
        ),
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
        body: paragraphs(
          'Flavor Grenade starts from the editor root, then uses `.obsidian/` or `.flavor-grenade.toml` to decide whether a folder is a vault.',
          'That marker-based approach keeps the tool from treating every Markdown folder as an Obsidian Vault. If the marker is missing, the server should stay conservative because it cannot know which files, attachments, and paths belong together.',
        ),
        code: 'DocsProject/\n  .flavor-grenade.toml\n  docs/\n    index.md',
      },
      {
        heading: 'Document boundaries',
        body: paragraphs(
          'Supported document extensions and ignore rules should keep generated output from becoming noisy indexed content.',
          'For example, a repository might contain source docs, generated API pages, and copied vendor Markdown. Only the human-maintained vault content should drive completions, diagnostics, and rename behavior.',
        ),
      },
      {
        heading: 'Operational rule',
        body: paragraphs(
          'Prefer explicit vault markers over guessing from any Markdown folder.',
          'If a user says completion is missing expected notes, the first check is usually folder selection rather than parser behavior: confirm the opened folder is the intended vault root and not a parent workspace.',
        ),
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
        body: paragraphs(
          'Vault mode scans a detected `.obsidian/` or `.flavor-grenade.toml` root and builds the graph used by completions, diagnostics, references, and rename.',
          'Use vault mode for normal Obsidian work. It gives the server enough context to understand document identity, inbound links, attachments, tags, and headings across files instead of treating one note as an island.',
        ),
        code: 'MyVault/\n  .obsidian/\n  Notes/\n    Home.md',
      },
      {
        heading: 'Single-file mode',
        body: paragraphs(
          'Single-file mode skips recursive scanning when no vault marker is available. Wiki-link note-name completion is unavailable because no vault index graph is built.',
          'This fallback is intentionally quiet. A loose Markdown file may use syntax from another editor or belong to a vault that was not opened, so the server should avoid broad diagnostics or cross-file rename edits.',
        ),
      },
      {
        heading: 'Direct clients',
        body: paragraphs(
          'A direct LSP client should send a `rootUri` or workspace folder for the intended vault root.',
          'If the client sends no usable file root, the server cannot discover vault markers. That is the difference between a direct client getting vault-wide behavior and only getting conservative single-file behavior.',
        ),
        code: '{\n  "rootUri": "file:///Users/alex/MyVault"\n}',
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
        body: paragraphs(
          'The index begins with a vault scan, stores parsed OFM documents, and refreshes as watched files change.',
          'A healthy lifecycle is boring: scan the vault, parse documents, store facts, rebuild derived views, and let features read the same state. If a feature needs different data, add it to that path instead of creating a private interpretation.',
        ),
        code: '.obsidian/ root -> scan -> parse -> VaultIndex -> diagnostics/completions/references',
      },
      {
        heading: 'Large vaults',
        body: paragraphs(
          'Use ignore rules for generated docs, exports, and vendor folders so user-authored notes stay fast and precise.',
          'Large vaults often contain copied documentation, build output, and archives that should not drive completions. Keeping those folders out of the active graph improves both performance and trust in diagnostics.',
        ),
      },
      {
        heading: 'Performance boundary',
        body: paragraphs(
          'The index is the source of truth; feature-local caches should not create a second document model.',
          'This matters for maintainers because duplicate caches create subtle drift: completion may see one target while rename sees another. Prefer derived registries that can be rebuilt from the same indexed documents.',
        ),
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
        body: paragraphs(
          'External URLs, `mailto:`, custom schemes, and paths outside the vault are not editable vault targets.',
          'The resolver must classify these before diagnostics or rename planning. A web URL can be valid Markdown, but it is not a missing note and should not become part of a vault-confined edit.',
        ),
        code: '[[Project Plan]]\nhttps://example.com\nmailto:team@example.com\n../outside-vault.md',
      },
      {
        heading: 'Vault confinement',
        body: paragraphs(
          'Rename and code actions should stay inside the detected vault root.',
          'That rule protects adjacent repositories, parent folders, and operating-system paths from accidental edits. If a target would resolve outside the vault, the safer behavior is to leave it alone.',
        ),
      },
      {
        heading: 'Diagnostic behavior',
        body: paragraphs(
          'Unsupported URI schemes are ignored instead of reported as missing local notes.',
          'This keeps diagnostics meaningful. A diagnostic should tell the user to fix a local vault relationship, not complain that an external protocol is not a Markdown file.',
        ),
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
        body: paragraphs(
          'The opaque-region pass runs before token parsing so code, math, comments, and templates can be skipped safely.',
          'Ordering is the key design point. Once a region is marked opaque, later token parsers can ignore its text and avoid turning examples into diagnostics, references, tags, or rename targets.',
        ),
        code: '```markdown\n[[Example Link]]\n```',
      },
      {
        heading: 'Token parsing',
        body: paragraphs(
          'After opaque regions are marked, wiki links, Markdown links, tags, embeds, headings, and blocks can be parsed as real OFM tokens.',
          'That gives the parser a clean split between examples and content. It also makes future parser changes easier to reason about because each token type shares the same skip rules.',
        ),
      },
      {
        heading: 'Conservative edge cases',
        body: paragraphs(
          'Ambiguous or unsupported syntax should stay quiet rather than produce false diagnostics.',
          'Quiet behavior is not a lack of ambition here; it is what keeps users from distrusting the tool. A false positive in generated or example text is more damaging than an omitted warning.',
        ),
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
        body: paragraphs(
          'The VS Code extension packages the server, handles activation, and is the recommended setup for most users. Use the Visual Studio Marketplace listing linked from this page when you want the extension-managed install.',
          'The extension path is intentionally boring: install, open a vault, wait for the server status, and start using completion or diagnostics. Choose the server-only path only when you are integrating a different editor or testing the LSP server directly.',
        ),
      },
      {
        heading: 'Install the server from npm',
        body: paragraphs(
          'For direct LSP use, install the language server package with npm in the environment where your editor client will launch it. This does not install the VS Code extension or configure an editor by itself.',
          'Use a local project install when you want the server pinned with the rest of a workspace, or use `npx` when you are testing the latest published package quickly. Your client still needs to start the command and send a usable `rootUri`.',
        ),
        code: 'npm install --save-dev flavor-grenade-lsp\nnpx flavor-grenade-lsp',
      },
      {
        heading: 'Direct LSP clients',
        body: paragraphs(
          'Direct clients must launch the server, provide a usable `rootUri`, and handle file-watching expectations.',
          'The root URI is not cosmetic. It decides whether the server can find `.obsidian/` or `.flavor-grenade.toml`, build a vault index, and provide vault-wide features such as note completion, references, and rename.',
        ),
        code: '{\n  "rootUri": "file:///Users/alex/MyVault",\n  "workspaceFolders": [\n    { "uri": "file:///Users/alex/MyVault", "name": "MyVault" }\n  ]\n}',
      },
      {
        heading: 'Compatibility boundary',
        body: paragraphs(
          'The server speaks LSP, but non-VS-Code clients may need custom transport and configuration work.',
          'If a direct client can launch a Node-based stdio language server and send normal LSP initialize parameters, it has the right starting point. If it cannot provide a stable file root, expect single-file behavior rather than full vault intelligence.',
        ),
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
    'A guide can say "see [[Vault Index]]" instead of redefining DocId, wiki-link resolution, and rename safety in every task page.',
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
    'notes/Daily.md -> DocId notes/Daily -> [[Project Plan]], #project/flavor-grenade, ![[diagram.png]].',
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
    'C:/vault/notes/Daily.md is stored as notes/Daily, so [[notes/Daily#Open questions]] can stay vault-relative.',
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

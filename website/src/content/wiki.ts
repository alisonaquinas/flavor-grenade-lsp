import type { RouteId } from './routes';

/** Stable concept-page identifiers for the public LLM wiki. */
export type ConceptWikiId =
  | 'inspiration-and-prior-art'
  | 'obsidian-flavored-markdown'
  | 'markdown-flavor-model'
  | 'structured-profiles'
  | 'vault-index'
  | 'wiki-link-resolution'
  | 'docid-vault-relative-paths'
  | 'opaque-regions'
  | 'diagnostics'
  | 'completions'
  | 'rename-safety'
  | 'references-navigation-tags-embeds';

/** Compact public concept page used by humans and LLM maintainers. */
export interface ConceptWikiPage {
  id: ConceptWikiId;
  title: string;
  question: string;
  answer: string;
  example: string;
  relatedConceptIds: ConceptWikiId[];
  relatedRouteIds: RouteId[];
  sourceLinks: string[];
}

function concept(page: ConceptWikiPage): ConceptWikiPage {
  return page;
}

/** Initial Karpathy-style LLM wiki concept pages for Flavor Grenade LSP. */
export const conceptWikiPages: readonly ConceptWikiPage[] = [
  concept({
    id: 'inspiration-and-prior-art',
    title: 'Inspiration and Prior Art',
    question: 'What inspired the public wiki shape?',
    answer:
      'Flavor Grenade LSP uses short, linked concept pages so humans and LLM maintainers share the same public vocabulary while crediting Karpathy, Obsidian, and Marksman as inspiration.',
    example:
      'A concept page explains "vault index" once, then how-to pages link back instead of redefining the term.',
    relatedConceptIds: ['obsidian-flavored-markdown', 'vault-index'],
    relatedRouteIds: ['concepts', 'faq'],
    sourceLinks: [
      'https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f',
      'https://obsidian.md/',
      'https://github.com/artempyanykh/marksman',
    ],
  }),
  concept({
    id: 'obsidian-flavored-markdown',
    title: 'Obsidian Flavored Markdown and Markdown Flavors',
    question: 'What makes Markdown become Obsidian Flavored Markdown?',
    answer:
      'Obsidian Flavored Markdown is one base flavor where Markdown gains vault semantics: wiki links, embeds, tags, headings, block references, callouts, frontmatter, and local attachments.',
    example: '[[People/Ada Lovelace#Notes]] and ![[images/diagram.png]] are vault-local references, not web URLs.',
    relatedConceptIds: ['markdown-flavor-model', 'wiki-link-resolution'],
    relatedRouteIds: ['conceptObsidianFlavoredMarkdown', 'quickstart'],
    sourceLinks: ['https://obsidian.md/'],
  }),
  concept({
    id: 'markdown-flavor-model',
    title: 'Markdown Flavor Model',
    question: 'How does Auto Detect choose a base Markdown flavor?',
    answer:
      'Auto Detect resolves one effective base flavor from vault markers, syntax, path context, or CommonMark fallback when no concrete .fgattributes rule applies.',
    example:
      '.fgattributes can set docs/github/*.md flavor=gfm while a root README without stronger evidence falls back to CommonMark.',
    relatedConceptIds: ['obsidian-flavored-markdown', 'structured-profiles'],
    relatedRouteIds: ['conceptMarkdownFlavorModel', 'howToChooseMarkdownFlavor'],
    sourceLinks: [],
  }),
  concept({
    id: 'structured-profiles',
    title: 'Structured Profiles',
    question: 'How do profiles layer structure onto Markdown?',
    answer:
      'Structured profiles are flags for known document shapes, currently Keep a Changelog, Common Changelog, and MADR; they do not expand the base flavor list.',
    example: 'CHANGELOG.md can be gfm plus keep-a-changelog, while docs/decisions/0001-use-lsp.md can be obsidian plus madr.',
    relatedConceptIds: ['markdown-flavor-model', 'diagnostics'],
    relatedRouteIds: ['conceptStructuredProfiles', 'howToUseStructuredProfiles'],
    sourceLinks: [],
  }),
  concept({
    id: 'vault-index',
    title: 'Vault Index',
    question: 'Why does the server build a vault index?',
    answer:
      'The vault index is the source of truth for parsed documents, headings, links, tags, and attachments so completions, diagnostics, references, and rename use one graph.',
    example: 'notes/daily.md becomes DocId notes/daily, with headings, tags, and outbound references attached to that indexed document.',
    relatedConceptIds: ['docid-vault-relative-paths', 'completions'],
    relatedRouteIds: ['conceptVaultIndex', 'howToConfigureObsidianVaults'],
    sourceLinks: [],
  }),
  concept({
    id: 'wiki-link-resolution',
    title: 'Wiki-link Resolution',
    question: 'How does a wiki link find its target?',
    answer:
      'Resolution classifies the local target, matches a vault-relative document or attachment, and optionally narrows to a heading or block without treating external schemes as vault edits.',
    example: '[[Project Plan#Risks|risk list]] resolves to the Project Plan note, then to the Risks heading.',
    relatedConceptIds: ['vault-index', 'diagnostics'],
    relatedRouteIds: ['conceptWikiLinkResolution', 'howToFixBrokenLinks'],
    sourceLinks: [],
  }),
  concept({
    id: 'docid-vault-relative-paths',
    title: 'DocId and Vault-Relative Paths',
    question: 'Why are document IDs vault-relative?',
    answer:
      'A DocId strips the vault root and Markdown extension so references stay portable across machines and never depend on a private absolute path.',
    example: 'C:/vault/notes/Daily.md is stored as notes/Daily, while links still render as human-friendly vault paths.',
    relatedConceptIds: ['vault-index', 'rename-safety'],
    relatedRouteIds: ['howToConfigureObsidianVaults', 'advancedUsage'],
    sourceLinks: [],
  }),
  concept({
    id: 'opaque-regions',
    title: 'Opaque Regions',
    question: 'Why does the parser skip some Markdown regions?',
    answer:
      'Opaque regions protect code, math, comments, and Templater blocks from false link parsing, so examples and generated snippets do not create diagnostics.',
    example: 'A code fence containing [[Example Link]] should remain sample text, not a broken vault link.',
    relatedConceptIds: ['obsidian-flavored-markdown', 'diagnostics'],
    relatedRouteIds: ['advancedUsage', 'faq'],
    sourceLinks: [],
  }),
  concept({
    id: 'diagnostics',
    title: 'Diagnostics',
    question: 'What should a diagnostic mean in an Obsidian Vault?',
    answer:
      'Diagnostics report local reference problems only when the server has enough vault context to avoid guessing, such as missing notes, headings, attachments, or ambiguous anchors.',
    example: '[[Missing Note]] can report a broken-link diagnostic while https://example.com remains outside local vault checking.',
    relatedConceptIds: ['wiki-link-resolution', 'opaque-regions'],
    relatedRouteIds: ['howToFixBrokenLinks', 'faq'],
    sourceLinks: [],
  }),
  concept({
    id: 'completions',
    title: 'Completions',
    question: 'What makes completion vault-aware?',
    answer:
      'Completion candidates come from indexed notes, headings, blocks, tags, callouts, and attachments, then respect the current trigger and configured link style.',
    example: 'Typing [[Pro can suggest [[Project Plan]] and typing [[Project Plan# can suggest its headings.',
    relatedConceptIds: ['vault-index', 'wiki-link-resolution'],
    relatedRouteIds: ['quickstart', 'features'],
    sourceLinks: [],
  }),
  concept({
    id: 'rename-safety',
    title: 'Rename Safety',
    question: 'How does rename avoid unsafe edits?',
    answer:
      'Rename plans are vault-confined, syntax-aware, and explicit; ambiguous or unsupported references are skipped instead of rewritten by guesswork.',
    example: 'Renaming #Risks can update [[Project Plan#Risks]] while leaving an unrelated external URL unchanged.',
    relatedConceptIds: ['docid-vault-relative-paths', 'wiki-link-resolution'],
    relatedRouteIds: ['howToRenameNotesSafely', 'advancedUsage'],
    sourceLinks: [],
  }),
  concept({
    id: 'references-navigation-tags-embeds',
    title: 'References, Navigation, Tags, and Embeds',
    question: 'How do editor features share the same vault model?',
    answer:
      'References, definitions, highlights, tags, and embeds all read from the same indexed OFM graph, so the editor view stays consistent across related actions.',
    example: '#project/flavor-grenade, [[Daily Note]], and ![[diagram.png]] are indexed together for navigation and lookup.',
    relatedConceptIds: ['vault-index', 'completions'],
    relatedRouteIds: ['features', 'howToFixBrokenLinks'],
    sourceLinks: [],
  }),
];

/** Returns validation messages for public concept wiki quality rules. */
export function validateConceptWiki(pages: readonly ConceptWikiPage[]): string[] {
  const messages: string[] = [];
  const ids = new Set(pages.map((page) => page.id));
  const privateTerms = /\b(TASK|FEAT|CHORE|BUG|phase|execution ledger)\b/i;

  for (const page of pages) {
    if (!page.question.endsWith('?')) {
      messages.push(`${page.id} question must be focused and end with a question mark.`);
    }

    if (!page.answer.trim() || page.answer.length > 320) {
      messages.push(`${page.id} answer must be direct and compact.`);
    }

    if (!page.example.trim()) {
      messages.push(`${page.id} needs a concrete example.`);
    }

    if (page.relatedConceptIds.length < 2 || page.relatedRouteIds.length < 1) {
      messages.push(`${page.id} needs dense concept and task links.`);
    }

    for (const relatedId of page.relatedConceptIds) {
      if (!ids.has(relatedId)) {
        messages.push(`${page.id} links unknown concept ${relatedId}.`);
      }
    }

    const publicText = [page.title, page.question, page.answer, page.example].join(' ');
    if (privateTerms.test(publicText)) {
      messages.push(`${page.id} exposes internal planning language.`);
    }
  }

  return messages;
}

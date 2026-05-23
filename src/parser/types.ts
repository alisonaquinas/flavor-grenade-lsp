import type { Range } from 'vscode-languageserver-types';
import type { MarkdownFlavorId } from '../markdown-flavor/markdown-flavor-contract.js';

/**
 * A region of document text that should be treated as opaque (not parsed for
 * OFM tokens). Covers comments, math blocks, and code spans/blocks.
 */
export interface OpaqueRegion {
  kind: 'comment' | 'math' | 'code' | 'templater' | 'mdx-esm' | 'mdx-jsx' | 'mdx-expression';
  /** Absolute character offset of the opening delimiter (inclusive). */
  start: number;
  /** Absolute character offset of the closing delimiter (exclusive). */
  end: number;
}

/**
 * A parsed `[[wikilink]]` entry, optionally with an alias, heading fragment,
 * or block reference.
 */
export interface WikiLinkEntry {
  /** The full raw token, e.g. `[[target|alias]]`. */
  raw: string;
  /** The link target (file path/name). */
  target: string;
  /** Optional display alias after `|`. */
  alias?: string;
  /** Optional heading fragment after `#`. */
  heading?: string;
  /** Optional block reference ID after `^`. */
  blockRef?: string;
  /** LSP range of the full `[[…]]` token. */
  range: Range;
}

/**
 * A parsed `![[embed]]` entry.  Image embeds may carry a size specifier.
 */
export interface EmbedEntry {
  /** The full raw token, e.g. `![[image.png|200x150]]`. */
  raw: string;
  /** The embed target (file path/name). */
  target: string;
  /** Optional display alias for non-image embeds. */
  alias?: string;
  /** Optional width pixel value from `|<w>` or `|<w>x<h>`. */
  width?: number;
  /** Optional height pixel value from `|<w>x<h>`. */
  height?: number;
  /** LSP range of the full `![[…]]` token. */
  range: Range;
}

/**
 * A block anchor of the form `^identifier` at the end of a line.
 */
export interface BlockAnchorEntry {
  /** The anchor identifier, without the `^` sigil. */
  id: string;
  /** LSP range of the `^identifier` token. */
  range: Range;
}

/**
 * A tag of the form `#tag/subtag`.
 */
export interface TagEntry {
  /** The full tag string, including the `#` sigil. */
  tag: string;
  /** LSP range of the tag token. */
  range: Range;
}

/**
 * A callout block header parsed from a blockquote, e.g. `> [!NOTE]+`.
 */
export interface CalloutEntry {
  /** Callout type keyword (e.g. `NOTE`, `WARNING`). */
  type: string;
  /** Optional fold indicator: `'+'` (expanded) or `'-'` (collapsed). */
  foldable?: '+' | '-';
  /** Optional title text following the `[!TYPE]±` marker. */
  title?: string;
  /** Blockquote nesting depth (number of leading `>` characters). */
  depth: number;
  /** LSP range of the opening callout-header line. */
  range: Range;
}

/**
 * An ATX heading (one to six `#` characters).
 */
export interface HeadingEntry {
  /** Heading level 1–6. */
  level: number;
  /** Plain-text heading content (trimmed). */
  text: string;
  /** LSP range of the full heading line. */
  range: Range;
}

/** A standard Markdown inline link of the form `[text](target "title")`. */
export interface MarkdownLinkRef {
  /** The full raw token, e.g. `[Alpha](notes/alpha.md#Overview)`. */
  raw: string;
  /** Display text inside the opening brackets. */
  text: string;
  /** Target URL/path inside parentheses, excluding optional title. */
  target: string;
  /** Optional title string after the target. */
  title?: string;
  /** LSP range of the full Markdown link token. */
  range: Range;
  /** LSP range of the display text only. */
  textRange: Range;
  /** LSP range of the target only. */
  targetRange: Range;
  /** Optional LSP range of the title contents, excluding quotes. */
  titleRange?: Range;
}

/** A standard Markdown image link of the form `![alt](target "title")`. */
export interface MarkdownImageRef {
  /** The full raw token, e.g. `![Diagram](assets/diagram.png)`. */
  raw: string;
  /** Alt text inside the image brackets. */
  alt: string;
  /** Target URL/path inside parentheses, excluding optional title. */
  target: string;
  /** Optional title string after the target. */
  title?: string;
  /** LSP range of the full Markdown image token. */
  range: Range;
  /** LSP range of the alt text only. */
  altRange: Range;
  /** LSP range of the target only. */
  targetRange: Range;
  /** Optional LSP range of the title contents, excluding quotes. */
  titleRange?: Range;
}

/** A reference-style Markdown label use: `[text][label]`, `[label][]`, or `[label]`. */
export interface LinkLabelRef {
  /** The full raw token. */
  raw: string;
  /** Display text for full/collapsed/shortcut reference forms. */
  text: string;
  /** Case-preserving label used for definition lookup. */
  label: string;
  /** Normalized label key for case-insensitive document-local matching. */
  normalizedLabel: string;
  /** Reference form parsed from the source token. */
  form: 'full' | 'collapsed' | 'shortcut';
  /** LSP range of the full label reference token. */
  range: Range;
  /** LSP range of the display text. */
  textRange: Range;
  /** LSP range of the lookup label. */
  labelRange: Range;
}

/** A Markdown reference definition of the form `[label]: target "title"`. */
export interface LinkLabelDef {
  /** The full raw definition line. */
  raw: string;
  /** Case-preserving definition label. */
  label: string;
  /** Normalized label key for case-insensitive document-local matching. */
  normalizedLabel: string;
  /** Definition target URL/path. */
  target: string;
  /** Optional title string after the target. */
  title?: string;
  /** LSP range of the full definition line. */
  range: Range;
  /** LSP range of the label text only. */
  labelRange: Range;
  /** LSP range of the definition target only. */
  targetRange: Range;
  /** Optional LSP range of the title contents, excluding quotes. */
  titleRange?: Range;
}

/** A GFM pipe table block. */
export interface GfmTableEntry {
  raw: string;
  headerCells: string[];
  rowCount: number;
  range: Range;
}

/** A pipe-table-looking block rejected by GFM table shape rules. */
export interface GfmMalformedTableEntry {
  raw: string;
  headerCells: string[];
  delimiterCells: string[];
  range: Range;
}

/** A GFM task list item marker and text. */
export interface GfmTaskListItemEntry {
  raw: string;
  checked: boolean;
  text: string;
  range: Range;
  markerRange: Range;
}

/** A GFM strikethrough span. */
export interface GfmStrikethroughEntry {
  raw: string;
  text: string;
  range: Range;
  textRange: Range;
}

/** A GFM extended bare autolink. */
export interface GfmAutolinkEntry {
  raw: string;
  target: string;
  range: Range;
  targetRange: Range;
}

/** A GLFM inapplicable task list item marker and text. */
export interface GlfmInapplicableTaskListItemEntry {
  raw: string;
  text: string;
  range: Range;
  markerRange: Range;
}

/** A GLFM description list block. */
export interface GlfmDescriptionListEntry {
  raw: string;
  term: string;
  definitionCount: number;
  range: Range;
}

/** A description-list-looking block rejected by GLFM shape rules. */
export interface GlfmMalformedDescriptionListEntry {
  raw: string;
  term: string;
  range: Range;
}

/** A GLFM footnote definition. */
export interface GlfmFootnoteEntry {
  raw: string;
  label: string;
  range: Range;
  labelRange: Range;
}

/** A GLFM table-of-contents tag. */
export interface GlfmTocTagEntry {
  raw: string;
  range: Range;
}

/** A GLFM host-scoped reference that must not become a local vault target. */
export interface GlfmHostReferenceEntry {
  raw: string;
  kind: 'issue' | 'merge-request' | 'epic' | 'user' | 'cross-project';
  range: Range;
}

/** Parsed Pandoc attribute contents. */
export interface PandocAttributeSet {
  id?: string;
  classes: string[];
  keyValues: Record<string, string>;
}

/** A Pandoc title block made of leading `%` metadata lines. */
export interface PandocTitleBlockEntry {
  raw: string;
  lines: number;
  range: Range;
}

/** A Pandoc citation key occurrence. */
export interface PandocCitationEntry {
  raw: string;
  key: string;
  range: Range;
  keyRange: Range;
}

/** A Pandoc footnote definition. */
export interface PandocFootnoteEntry {
  raw: string;
  label: string;
  range: Range;
  labelRange: Range;
}

/** A Pandoc attribute block attached to source syntax. */
export interface PandocAttributeEntry extends PandocAttributeSet {
  raw: string;
  range: Range;
}

/** A malformed Pandoc attribute block. */
export interface PandocMalformedAttributeEntry {
  raw: string;
  range: Range;
}

/** A Pandoc fenced Div block. */
export interface PandocFencedDivEntry {
  raw: string;
  attributes: PandocAttributeSet;
  range: Range;
  markerRange: Range;
}

/** A Pandoc definition list block. */
export interface PandocDefinitionListEntry {
  raw: string;
  term: string;
  definitionCount: number;
  range: Range;
}

/** A leading MultiMarkdown metadata key/value row. */
export interface MultimarkdownMetadataEntry {
  raw: string;
  key: string;
  value: string;
  range: Range;
  keyRange: Range;
}

/** A malformed leading MultiMarkdown metadata row. */
export interface MultimarkdownMalformedMetadataEntry {
  raw: string;
  range: Range;
}

/** A MultiMarkdown table block with optional caption label. */
export interface MultimarkdownTableEntry {
  raw: string;
  headerCells: string[];
  rowCount: number;
  label?: string;
  range: Range;
  labelRange?: Range;
}

/** A MultiMarkdown footnote definition. */
export interface MultimarkdownFootnoteEntry {
  raw: string;
  label: string;
  range: Range;
  labelRange: Range;
}

/** A MultiMarkdown bibliography entry or citation key definition. */
export interface MultimarkdownCitationEntry {
  raw: string;
  key: string;
  range: Range;
  keyRange: Range;
}

/** A MultiMarkdown cross-reference occurrence. */
export interface MultimarkdownCrossReferenceEntry {
  raw: string;
  target: string;
  range: Range;
  targetRange: Range;
}

/** A MultiMarkdown label attached to a heading, table, figure, or block. */
export interface MultimarkdownLabelEntry {
  raw: string;
  label: string;
  range: Range;
  labelRange: Range;
}

/** A MultiMarkdown abbreviation or glossary-style definition. */
export interface MultimarkdownAbbreviationEntry {
  raw: string;
  label: string;
  value: string;
  range: Range;
  labelRange: Range;
}

/** An MDX ESM import or export declaration. */
export interface MdxEsmDeclarationEntry {
  raw: string;
  kind: 'import' | 'export';
  name: string;
  source?: string;
  range: Range;
  nameRange: Range;
}

/** An MDX JSX element or component reference. */
export interface MdxJsxElementEntry {
  raw: string;
  name: string;
  range: Range;
  nameRange: Range;
}

/** An MDX expression island. */
export interface MdxExpressionEntry {
  raw: string;
  range: Range;
}

/** A malformed MDX boundary that cannot be safely interpreted. */
export interface MdxMalformedBoundaryEntry {
  raw: string;
  reason: string;
  range: Range;
}

/** Parsed kramdown attribute list contents. */
export interface KramdownAttributeEntry {
  raw: string;
  id?: string;
  classes: string[];
  keyValues: Record<string, string>;
  range: Range;
  markerRange: Range;
}

/** A malformed kramdown attribute list. */
export interface KramdownMalformedAttributeEntry {
  raw: string;
  range: Range;
}

/** A kramdown definition list block. */
export interface KramdownDefinitionListEntry {
  raw: string;
  term: string;
  definitionCount: number;
  range: Range;
}

/** A kramdown pipe table block. */
export interface KramdownTableEntry {
  raw: string;
  headerCells: string[];
  rowCount: number;
  range: Range;
}

/** A kramdown footnote definition. */
export interface KramdownFootnoteEntry {
  raw: string;
  label: string;
  range: Range;
  labelRange: Range;
}

/** A kramdown math block delimited by $$ lines. */
export interface KramdownMathBlockEntry {
  raw: string;
  range: Range;
}

export type MarkdownExtraAttributeEntry = KramdownAttributeEntry;
export type MarkdownExtraMalformedAttributeEntry = KramdownMalformedAttributeEntry;
export type MarkdownExtraDefinitionListEntry = KramdownDefinitionListEntry;
export type MarkdownExtraTableEntry = KramdownTableEntry;
export type MarkdownExtraFootnoteEntry = KramdownFootnoteEntry;

/** A Markdown Extra abbreviation definition. */
export interface MarkdownExtraAbbreviationEntry {
  raw: string;
  label: string;
  value: string;
  range: Range;
  labelRange: Range;
}

/** A Markdown Extra fenced code block with optional attribute language. */
export interface MarkdownExtraFencedCodeBlockEntry {
  raw: string;
  language?: string;
  range: Range;
  markerRange: Range;
}

/** A top-level R Markdown YAML metadata key/value row. */
export interface RMarkdownMetadataEntry {
  raw: string;
  key: string;
  value?: string;
  range: Range;
  keyRange: Range;
}

/** A fenced R Markdown executable chunk header and source block. */
export interface RMarkdownChunkEntry {
  raw: string;
  engine: string;
  label?: string;
  options: Record<string, string>;
  range: Range;
  headerRange: Range;
  engineRange: Range;
  labelRange?: Range;
  optionRanges: Range[];
}

/** An inline R Markdown expression marker. */
export interface RMarkdownInlineExpressionEntry {
  raw: string;
  expression: string;
  range: Range;
  expressionRange: Range;
}

/** A malformed R Markdown chunk opening line. */
export interface RMarkdownMalformedChunkEntry {
  raw: string;
  range: Range;
}

/** A Reddit spoiler span delimited by >! and !<. */
export interface RedditSpoilerEntry {
  raw: string;
  text: string;
  range: Range;
  textRange: Range;
}

/** A Reddit superscript span written as ^word or ^(words). */
export interface RedditSuperscriptEntry {
  raw: string;
  text: string;
  range: Range;
  textRange: Range;
}

export type RedditStrikethroughEntry = GfmStrikethroughEntry;
export type RedditTableEntry = GfmTableEntry;

/** A Reddit host reference that must stay non-local. */
export interface RedditHostReferenceEntry {
  raw: string;
  kind: 'subreddit' | 'user';
  target: string;
  range: Range;
  targetRange: Range;
}

/** An ordered-list marker accepted by new Reddit but not old Reddit. */
export interface RedditOldRedditIncompatibleListEntry {
  raw: string;
  range: Range;
}

/** A Reddit Markdown link with a locally unsafe URL scheme. */
export interface RedditUnsafeLinkEntry {
  raw: string;
  target: string;
  range: Range;
  targetRange: Range;
}

/** A Stack Exchange tag or meta-tag reference. */
export interface StackOverflowTagReferenceEntry {
  raw: string;
  kind: 'tag' | 'meta-tag';
  target: string;
  range: Range;
  targetRange: Range;
}

/** A Stack Overflow spoiler blockquote line. */
export interface StackOverflowSpoilerEntry {
  raw: string;
  text: string;
  range: Range;
  textRange: Range;
}

/** A Stack Overflow syntax-highlighting HTML comment directive. */
export interface StackOverflowLanguageDirectiveEntry {
  raw: string;
  scope: 'all' | 'next-block';
  language: string;
  range: Range;
  languageRange: Range;
}

/** A Stack Overflow fenced code opener with a language hint. */
export interface StackOverflowFencedCodeBlockEntry {
  raw: string;
  language: string;
  range: Range;
  languageRange: Range;
}

export type StackOverflowTableEntry = GfmTableEntry;

/** A Stack Overflow language directive with a non-portable language value. */
export interface StackOverflowMalformedLanguageDirectiveEntry {
  raw: string;
  range: Range;
  languageRange: Range;
}

/**
 * The index of OFM-specific tokens extracted from a document.
 */
export interface OFMIndex {
  wikiLinks: WikiLinkEntry[];
  embeds: EmbedEntry[];
  blockAnchors: BlockAnchorEntry[];
  tags: TagEntry[];
  callouts: CalloutEntry[];
  headings: HeadingEntry[];
  markdownLinks: MarkdownLinkRef[];
  markdownImages: MarkdownImageRef[];
  linkLabelRefs: LinkLabelRef[];
  linkLabelDefs: LinkLabelDef[];
  gfmTables?: GfmTableEntry[];
  gfmMalformedTables?: GfmMalformedTableEntry[];
  gfmTaskListItems?: GfmTaskListItemEntry[];
  gfmStrikethroughs?: GfmStrikethroughEntry[];
  gfmAutolinks?: GfmAutolinkEntry[];
  glfmInapplicableTaskListItems?: GlfmInapplicableTaskListItemEntry[];
  glfmDescriptionLists?: GlfmDescriptionListEntry[];
  glfmMalformedDescriptionLists?: GlfmMalformedDescriptionListEntry[];
  glfmFootnotes?: GlfmFootnoteEntry[];
  glfmTocTags?: GlfmTocTagEntry[];
  glfmHostReferences?: GlfmHostReferenceEntry[];
  pandocTitleBlocks?: PandocTitleBlockEntry[];
  pandocCitations?: PandocCitationEntry[];
  pandocFootnotes?: PandocFootnoteEntry[];
  pandocAttributes?: PandocAttributeEntry[];
  pandocMalformedAttributes?: PandocMalformedAttributeEntry[];
  pandocFencedDivs?: PandocFencedDivEntry[];
  pandocDefinitionLists?: PandocDefinitionListEntry[];
  multimarkdownMetadata?: MultimarkdownMetadataEntry[];
  multimarkdownMalformedMetadata?: MultimarkdownMalformedMetadataEntry[];
  multimarkdownTables?: MultimarkdownTableEntry[];
  multimarkdownFootnotes?: MultimarkdownFootnoteEntry[];
  multimarkdownCitations?: MultimarkdownCitationEntry[];
  multimarkdownCrossReferences?: MultimarkdownCrossReferenceEntry[];
  multimarkdownLabels?: MultimarkdownLabelEntry[];
  multimarkdownAbbreviations?: MultimarkdownAbbreviationEntry[];
  mdxEsmDeclarations?: MdxEsmDeclarationEntry[];
  mdxJsxElements?: MdxJsxElementEntry[];
  mdxExpressions?: MdxExpressionEntry[];
  mdxMalformedBoundaries?: MdxMalformedBoundaryEntry[];
  kramdownAttributes?: KramdownAttributeEntry[];
  kramdownMalformedAttributes?: KramdownMalformedAttributeEntry[];
  kramdownDefinitionLists?: KramdownDefinitionListEntry[];
  kramdownTables?: KramdownTableEntry[];
  kramdownFootnotes?: KramdownFootnoteEntry[];
  kramdownMathBlocks?: KramdownMathBlockEntry[];
  markdownExtraAttributes?: MarkdownExtraAttributeEntry[];
  markdownExtraMalformedAttributes?: MarkdownExtraMalformedAttributeEntry[];
  markdownExtraDefinitionLists?: MarkdownExtraDefinitionListEntry[];
  markdownExtraTables?: MarkdownExtraTableEntry[];
  markdownExtraFootnotes?: MarkdownExtraFootnoteEntry[];
  markdownExtraAbbreviations?: MarkdownExtraAbbreviationEntry[];
  markdownExtraFencedCodeBlocks?: MarkdownExtraFencedCodeBlockEntry[];
  rMarkdownMetadata?: RMarkdownMetadataEntry[];
  rMarkdownChunks?: RMarkdownChunkEntry[];
  rMarkdownInlineExpressions?: RMarkdownInlineExpressionEntry[];
  rMarkdownMalformedChunks?: RMarkdownMalformedChunkEntry[];
  redditSpoilers?: RedditSpoilerEntry[];
  redditSuperscripts?: RedditSuperscriptEntry[];
  redditStrikethroughs?: RedditStrikethroughEntry[];
  redditTables?: RedditTableEntry[];
  redditHostReferences?: RedditHostReferenceEntry[];
  redditOldRedditIncompatibleLists?: RedditOldRedditIncompatibleListEntry[];
  redditUnsafeLinks?: RedditUnsafeLinkEntry[];
  stackOverflowTagReferences?: StackOverflowTagReferenceEntry[];
  stackOverflowSpoilers?: StackOverflowSpoilerEntry[];
  stackOverflowLanguageDirectives?: StackOverflowLanguageDirectiveEntry[];
  stackOverflowFencedCodeBlocks?: StackOverflowFencedCodeBlockEntry[];
  stackOverflowTables?: StackOverflowTableEntry[];
  stackOverflowMalformedLanguageDirectives?: StackOverflowMalformedLanguageDirectiveEntry[];
}

/**
 * The fully parsed representation of an Obsidian Flavored Markdown document.
 */
export interface OFMDoc {
  /** Document URI as provided by the LSP client. */
  uri: string;
  /** Incremental version counter from the LSP client. */
  version: number;
  /** The full raw document text. */
  text: string;
  /** Parsed YAML frontmatter, or `null` if absent or invalid. */
  frontmatter: Record<string, unknown> | null;
  /**
   * True when the document had a frontmatter block but the YAML could not be
   * parsed. Triggers a FG007 diagnostic.
   */
  frontmatterParseError?: boolean;
  /**
   * Character offset of the first character of the document body (i.e. the
   * character immediately after the closing `---\n` of the frontmatter, or 0
   * when there is no frontmatter).
   */
  frontmatterEndOffset: number;
  /**
   * Sorted, non-overlapping list of opaque regions (comments, math, code) that
   * token parsers must skip.
   */
  opaqueRegions: OpaqueRegion[];
  /** Token index for this document. */
  index: OFMIndex;
  /** Effective Markdown flavor used for this parse. */
  markdownFlavor: MarkdownFlavorId;
  /** Parse context metadata consumed by flavor-aware analysis. */
  parseContext: ParseContext;
}

export interface ParseContext {
  effectiveFlavor: MarkdownFlavorId;
}

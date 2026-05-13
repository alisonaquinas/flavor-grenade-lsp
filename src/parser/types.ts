import type { Range } from 'vscode-languageserver-types';
import type { MarkdownFlavorId } from '../markdown-flavor/markdown-flavor-contract.js';

/**
 * A region of document text that should be treated as opaque (not parsed for
 * OFM tokens). Covers comments, math blocks, and code spans/blocks.
 */
export interface OpaqueRegion {
  kind: 'comment' | 'math' | 'code' | 'templater';
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

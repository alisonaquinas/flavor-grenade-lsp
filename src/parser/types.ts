import type { Range } from 'vscode-languageserver-types';

/**
 * A region of document text that should be treated as opaque (not parsed for
 * OFM tokens). Covers comments, math blocks, and code spans/blocks.
 */
export interface OpaqueRegion {
  kind: 'comment' | 'math' | 'code';
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
}

/**
 * The fully parsed representation of an Obsidian Flavored Markdown document.
 */
export interface OFMDoc {
  /** Document URI as provided by the LSP client. */
  uri: string;
  /** Incremental version counter from the LSP client. */
  version: number;
  /** Parsed YAML frontmatter, or `null` if absent or invalid. */
  frontmatter: Record<string, unknown> | null;
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
}

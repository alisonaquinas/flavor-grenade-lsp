/** Explicit Markdown flavor ids supported by shared profile data. */
export const MARKDOWN_FLAVOR_IDS = [
  'original',
  'commonmark',
  'obsidian',
  'gfm',
  'glfm',
  'pandoc',
  'multimarkdown',
  'mdx',
  'kramdown',
  'markdown-extra',
  'r-markdown',
  'reddit',
  'stack-overflow',
] as const;

/** A concrete Markdown dialect profile id. `auto` is intentionally excluded. */
export type MarkdownFlavorId = (typeof MARKDOWN_FLAVOR_IDS)[number];

/** Markdown flavor selector values, including auto-detection state. */
export const MARKDOWN_FLAVOR_SELECTIONS = ['auto', ...MARKDOWN_FLAVOR_IDS] as const;

/** User-facing selector state. `auto` resolves to an explicit flavor later. */
export type MarkdownFlavorSelection = (typeof MARKDOWN_FLAVOR_SELECTIONS)[number];

/** ADR020 labels in selector display order. */
export const MARKDOWN_FLAVOR_LABELS: Record<MarkdownFlavorSelection, string> = {
  auto: 'Auto Detect',
  original: 'Original Markdown',
  commonmark: 'CommonMark',
  obsidian: 'Obsidian',
  gfm: 'GitHub Flavored Markdown',
  glfm: 'GitLab Flavored Markdown',
  pandoc: 'Pandoc Markdown',
  multimarkdown: 'MultiMarkdown',
  mdx: 'MDX',
  kramdown: 'kramdown',
  'markdown-extra': 'Markdown Extra',
  'r-markdown': 'R Markdown',
  reddit: 'Reddit Markdown',
  'stack-overflow': 'Stack Overflow Markdown',
};

/** True when a value is a researched explicit flavor id. */
export function isMarkdownFlavorId(value: unknown): value is MarkdownFlavorId {
  return typeof value === 'string' && MARKDOWN_FLAVOR_IDS.includes(value as MarkdownFlavorId);
}

/** True when a value is a supported selector value, including `auto`. */
export function isMarkdownFlavorSelection(value: unknown): value is MarkdownFlavorSelection {
  return (
    typeof value === 'string' && (MARKDOWN_FLAVOR_SELECTIONS as readonly string[]).includes(value)
  );
}

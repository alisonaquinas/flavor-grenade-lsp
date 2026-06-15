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

export const MARKDOWN_FLAVOR_SELECTIONS = ['auto', ...MARKDOWN_FLAVOR_IDS] as const;
export const STRUCTURED_MARKDOWN_PROFILE_IDS = [
  'keep-a-changelog',
  'common-changelog',
  'madr',
] as const;

export type MarkdownFlavorId = (typeof MARKDOWN_FLAVOR_IDS)[number];
export type MarkdownFlavorSelection = (typeof MARKDOWN_FLAVOR_SELECTIONS)[number];
export type StructuredMarkdownProfileId = (typeof STRUCTURED_MARKDOWN_PROFILE_IDS)[number];
export type StructuredProfileSelection =
  | 'auto'
  | 'none'
  | readonly StructuredMarkdownProfileId[];

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

export const MARKDOWN_FLAVOR_SHORT_LABELS: Record<MarkdownFlavorSelection, string> = {
  auto: 'Auto',
  original: 'Original',
  commonmark: 'CommonMark',
  obsidian: 'Obsidian',
  gfm: 'GFM',
  glfm: 'GLFM',
  pandoc: 'Pandoc',
  multimarkdown: 'MultiMarkdown',
  mdx: 'MDX',
  kramdown: 'kramdown',
  'markdown-extra': 'Extra',
  'r-markdown': 'R Markdown',
  reddit: 'Reddit',
  'stack-overflow': 'Stack Overflow',
};

export const MARKDOWN_FLAVOR_COMMAND = 'flavorGrenade.selectMarkdownFlavor';
export const MARKDOWN_FLAVOR_SECTION = 'flavorGrenade';
export const MDF_CONFIG_MAX_BYTES_SETTING_KEY = 'mdfConfig.maxBytes';
export const MARKDOWN_LANGUAGE_ID = 'markdown';
export const MARKDOWN_LANGUAGE_DOCUMENT_SELECTOR = [
  { scheme: 'file', language: MARKDOWN_LANGUAGE_ID },
] as const;

export interface TextDocumentLike {
  languageId: string;
  uri: {
    scheme: string;
    toString(): string;
  };
  getText?: () => string;
}

export type FlavorResolutionSource =
  | 'explicit-selection'
  | 'mdfattributes'
  | 'obsidian-marker'
  | 'syntax-inference'
  | 'commonmark-fallback';

export type StructuredProfileResolutionSource =
  | 'explicit-selection'
  | 'mdfattributes'
  | 'structured-profile-inference'
  | 'none';

export type MarkdownFlavorResolution =
  | {
      kind: 'active';
      selected: MarkdownFlavorSelection;
      effective: MarkdownFlavorId;
      source: FlavorResolutionSource;
      structuredProfiles: readonly StructuredMarkdownProfileId[];
      structuredProfileSource: StructuredProfileResolutionSource;
    }
  | {
      kind: 'inactive';
      reason: 'mdfignore' | 'non-markdown-language' | 'unsupported-scheme';
    };

export interface MarkdownFlavorQuickPickItem {
  id: MarkdownFlavorSelection;
  label: string;
  description?: string;
}

export type MarkdownFlavorScope = 'selected-file' | 'directory';

export interface MarkdownFlavorScopeQuickPickItem {
  id: MarkdownFlavorScope;
  label: string;
  description?: string;
}

export interface MarkdownFlavorStatusPresentation {
  text: string;
  tooltip: string;
}

export interface MarkdownFlavorStateForDocument {
  document: TextDocumentLike;
  resolution: MarkdownFlavorResolution;
}

export interface MarkdownFlavorConfigurationNotification {
  method: 'workspace/didChangeConfiguration';
  params: {
    settings: {
      flavorGrenade: {
        mdfConfigMaxBytes?: unknown;
      };
    };
  };
}

export function isMarkdownFlavorId(value: unknown): value is MarkdownFlavorId {
  return typeof value === 'string' && MARKDOWN_FLAVOR_IDS.includes(value as MarkdownFlavorId);
}

export function isMarkdownFlavorSelection(value: unknown): value is MarkdownFlavorSelection {
  return (
    typeof value === 'string' &&
    MARKDOWN_FLAVOR_SELECTIONS.includes(value as MarkdownFlavorSelection)
  );
}

export function isStructuredMarkdownProfileId(
  value: unknown,
): value is StructuredMarkdownProfileId {
  return (
    typeof value === 'string' &&
    STRUCTURED_MARKDOWN_PROFILE_IDS.includes(value as StructuredMarkdownProfileId)
  );
}

export function isStructuredProfileSelection(value: unknown): value is StructuredProfileSelection {
  return (
    value === 'auto' ||
    value === 'none' ||
    (Array.isArray(value) && isValidStructuredProfileList(value))
  );
}

function isValidStructuredProfileList(
  value: readonly unknown[],
): value is readonly StructuredMarkdownProfileId[] {
  const seen = new Set<StructuredMarkdownProfileId>();
  for (const item of value) {
    if (!isStructuredMarkdownProfileId(item) || seen.has(item)) {
      return false;
    }
    seen.add(item);
  }
  return !(seen.has('keep-a-changelog') && seen.has('common-changelog'));
}

export function createMarkdownFlavorQuickPickItems(): MarkdownFlavorQuickPickItem[] {
  return MARKDOWN_FLAVOR_SELECTIONS.map((id) => ({
    id,
    label: MARKDOWN_FLAVOR_LABELS[id],
  }));
}

export function createMarkdownFlavorScopeQuickPickItems(): MarkdownFlavorScopeQuickPickItem[] {
  return [
    {
      id: 'selected-file',
      label: 'Selected file',
    },
    {
      id: 'directory',
      label: 'All Markdown files in this directory',
      description: 'Writes /*.md in the active file directory',
    },
  ];
}

export function buildMdfAttributesRule(input: {
  fileName: string;
  scope: MarkdownFlavorScope;
  selection: MarkdownFlavorSelection;
}): string {
  const pattern = buildMdfAttributesPattern(input);
  const attribute = input.selection === 'auto' ? '!flavor' : `flavor=${input.selection}`;
  return `${pattern} ${attribute}`;
}

export function upsertMdfAttributesRule(
  content: string,
  input: {
    fileName: string;
    scope: MarkdownFlavorScope;
    selection: MarkdownFlavorSelection;
  },
): string {
  const pattern = buildMdfAttributesPattern(input);
  const rule = buildMdfAttributesRule(input);
  if (content.length === 0) {
    return `${rule}\n`;
  }

  let replaced = false;
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const updated = lines.map((line, index) => {
    if (index === lines.length - 1 && line.length === 0 && content.endsWith('\n')) {
      return line;
    }
    const nextLine = updateMdfAttributesLine(line, pattern, input.selection);
    if (nextLine === undefined) {
      return line;
    }
    replaced = true;
    return nextLine;
  });

  if (!replaced) {
    if (content.endsWith('\n')) {
      updated.splice(updated.length - 1, 0, rule);
    } else {
      updated.push(rule);
    }
  }

  const result = updated.join('\n');
  return result.endsWith('\n') ? result : `${result}\n`;
}

export function formatMarkdownFlavorStatus(
  resolution?: MarkdownFlavorResolution,
): MarkdownFlavorStatusPresentation {
  if (!resolution) {
    return {
      text: '$(symbol-misc) Markdown: No file',
      tooltip:
        'Markdown Flavor: no active file-backed Markdown document\nOpen a file-backed Markdown document to select a Markdown flavor.',
    };
  }

  if (resolution.kind === 'inactive') {
    return {
      text: '$(symbol-misc) Markdown: Inactive',
      tooltip:
        `Markdown Flavor: inactive for this document\nReason: ${inactiveReasonLabel(resolution.reason)}\n` +
        'Open a file-backed Markdown document to select a Markdown flavor.',
    };
  }

  const effectiveLabel = MARKDOWN_FLAVOR_LABELS[resolution.effective];
  const selectorLabel =
    resolution.selected === 'auto'
      ? `Auto Detect (${effectiveLabel})`
      : MARKDOWN_FLAVOR_LABELS[resolution.selected];

  return {
    text: `$(symbol-misc) Markdown: ${MARKDOWN_FLAVOR_SHORT_LABELS[resolution.effective]}`,
    tooltip: [
      `Markdown Flavor: ${selectorLabel}`,
      `Selected: ${MARKDOWN_FLAVOR_LABELS[resolution.selected]}`,
      `Effective: ${effectiveLabel}`,
      `Source: ${sourceLabel(resolution.source)}`,
      'Click to select Markdown flavor.',
    ].join('\n'),
  };
}

export function isFlavorEligibleDocument(document: TextDocumentLike): boolean {
  return document.uri.scheme === 'file' && document.languageId === MARKDOWN_LANGUAGE_ID;
}

export function resolveMarkdownFlavor(input: {
  document: TextDocumentLike;
  hasObsidianMarker?: boolean;
  ignored?: boolean;
  mdfAttributesFlavor?: unknown;
  mdfAttributesStructuredProfiles?: unknown;
  selected: unknown;
  structuredProfileSelection?: unknown;
  syntaxText?: string;
}): MarkdownFlavorResolution {
  const inactive = inactiveDocumentReason(input.document);
  if (inactive) {
    return inactive;
  }
  if (input.ignored === true) {
    return { kind: 'inactive', reason: 'mdfignore' };
  }

  const selected = isMarkdownFlavorSelection(input.selected) ? input.selected : 'auto';
  const structured = resolveStructuredProfiles({
    selection: isStructuredProfileSelection(input.structuredProfileSelection)
      ? input.structuredProfileSelection
      : 'auto',
    mdfAttributesSelection: isStructuredProfileSelection(input.mdfAttributesStructuredProfiles)
      ? input.mdfAttributesStructuredProfiles
      : undefined,
    uri: input.document.uri.toString(),
    syntaxText: input.syntaxText ?? input.document.getText?.(),
  });
  if (isMarkdownFlavorId(selected)) {
    return activeResolution(selected, selected, 'explicit-selection', structured);
  }

  if (isMarkdownFlavorId(input.mdfAttributesFlavor)) {
    return activeResolution('auto', input.mdfAttributesFlavor, 'mdfattributes', structured);
  }

  if (input.hasObsidianMarker === true) {
    return activeResolution('auto', 'obsidian', 'obsidian-marker', structured);
  }

  const inferred = inferMarkdownFlavorFromSyntax(input.syntaxText ?? input.document.getText?.());
  if (inferred) {
    return activeResolution('auto', inferred, 'syntax-inference', structured);
  }

  return activeResolution('auto', 'commonmark', 'commonmark-fallback', structured);
}

export function buildMarkdownFlavorConfigurationNotification(input: {
  mdfConfigMaxBytes?: unknown;
  restricted?: boolean;
  states: readonly MarkdownFlavorStateForDocument[];
}): MarkdownFlavorConfigurationNotification | undefined {
  if (input.restricted) {
    return undefined;
  }

  if (
    input.mdfConfigMaxBytes === undefined &&
    !input.states.some((state) => isRefreshableMarkdownState(state))
  ) {
    return undefined;
  }

  return {
    method: 'workspace/didChangeConfiguration',
    params: {
      settings: {
        flavorGrenade:
          input.mdfConfigMaxBytes === undefined
            ? {}
            : { mdfConfigMaxBytes: input.mdfConfigMaxBytes },
      },
    },
  };
}

function inactiveDocumentReason(document: TextDocumentLike): MarkdownFlavorResolution | undefined {
  if (document.languageId !== MARKDOWN_LANGUAGE_ID) {
    return { kind: 'inactive', reason: 'non-markdown-language' };
  }
  if (document.uri.scheme !== 'file') {
    return { kind: 'inactive', reason: 'unsupported-scheme' };
  }
  return undefined;
}

function activeResolution(
  selected: MarkdownFlavorSelection,
  effective: MarkdownFlavorId,
  source: FlavorResolutionSource,
  structured: {
    structuredProfiles: readonly StructuredMarkdownProfileId[];
    structuredProfileSource: StructuredProfileResolutionSource;
  },
): MarkdownFlavorResolution {
  return {
    kind: 'active',
    selected,
    effective,
    source,
    ...structured,
  };
}

function inactiveReasonLabel(
  reason: Extract<MarkdownFlavorResolution, { kind: 'inactive' }>['reason'],
): string {
  switch (reason) {
    case 'mdfignore':
      return '.mdfignore';
    case 'non-markdown-language':
      return 'non-Markdown language';
    case 'unsupported-scheme':
      return 'unsupported URI scheme';
  }
}

function sourceLabel(source: FlavorResolutionSource): string {
  switch (source) {
    case 'explicit-selection':
      return 'explicit selection';
    case 'mdfattributes':
      return '.mdfattributes';
    case 'obsidian-marker':
      return 'Obsidian vault marker';
    case 'syntax-inference':
      return 'syntax inference';
    case 'commonmark-fallback':
      return 'CommonMark fallback';
  }
}

function inferMarkdownFlavorFromSyntax(text: string | undefined): MarkdownFlavorId | undefined {
  if (!text) {
    return undefined;
  }
  const sample = text.slice(0, 64 * 1024);

  if (hasMdxEvidence(sample)) {
    return 'mdx';
  }
  if (hasRMarkdownEvidence(sample)) {
    return 'r-markdown';
  }
  if (hasStackOverflowEvidence(sample)) {
    return 'stack-overflow';
  }
  if (hasRedditEvidence(sample)) {
    return 'reddit';
  }
  if (hasGlfmEvidence(sample)) {
    return 'glfm';
  }
  if (hasMultiMarkdownEvidence(sample)) {
    return 'multimarkdown';
  }
  if (hasPandocEvidence(sample)) {
    return 'pandoc';
  }
  if (hasKramdownEvidence(sample)) {
    return 'kramdown';
  }
  if (hasMarkdownExtraEvidence(sample)) {
    return 'markdown-extra';
  }

  return undefined;
}

function resolveStructuredProfiles(input: {
  selection: StructuredProfileSelection;
  mdfAttributesSelection?: StructuredProfileSelection;
  uri: string;
  syntaxText?: string;
}): {
  structuredProfiles: readonly StructuredMarkdownProfileId[];
  structuredProfileSource: StructuredProfileResolutionSource;
} {
  if (Array.isArray(input.selection)) {
    return {
      structuredProfiles: input.selection,
      structuredProfileSource: 'explicit-selection',
    };
  }
  if (input.selection === 'none') {
    return { structuredProfiles: [], structuredProfileSource: 'none' };
  }
  if (Array.isArray(input.mdfAttributesSelection)) {
    return {
      structuredProfiles: input.mdfAttributesSelection,
      structuredProfileSource: 'mdfattributes',
    };
  }
  if (input.mdfAttributesSelection === 'none') {
    return { structuredProfiles: [], structuredProfileSource: 'none' };
  }
  return {
    structuredProfiles: inferStructuredProfiles(input.uri, input.syntaxText),
    structuredProfileSource: 'structured-profile-inference',
  };
}

function inferStructuredProfiles(
  uri: string,
  text: string | undefined,
): readonly StructuredMarkdownProfileId[] {
  const sample = (text ?? '').slice(0, 64 * 1024);
  const profiles: StructuredMarkdownProfileId[] = [];
  const changelog = inferChangelogProfile(uri, sample);
  if (changelog) {
    profiles.push(changelog);
  }
  if (hasMadrEvidence(uri, sample)) {
    profiles.push('madr');
  }
  return profiles;
}

function inferChangelogProfile(
  uri: string,
  text: string,
): 'keep-a-changelog' | 'common-changelog' | undefined {
  const first = firstHeading(text);
  if (!/CHANGELOG\.md$/i.test(uri) || first?.level !== 1 || first.text !== 'Changelog') {
    return undefined;
  }

  const categories = headingTexts(text, 3);
  const categorySet = new Set(categories);
  const keepCategories = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'].filter(
    (category) => categorySet.has(category),
  );
  if (
    /^##\s+\[?Unreleased\]?\s*$/im.test(text) &&
    keepCategories.length >= 2
  ) {
    return 'keep-a-changelog';
  }
  if ((categorySet.has('Deprecated') || categorySet.has('Security')) && keepCategories.length >= 2) {
    return 'keep-a-changelog';
  }

  if (hasCommonChangelogReleaseBlock(text)) {
    return 'common-changelog';
  }

  if (
    /^##\s+\[\d+\.\d+\.\d+[^\]\n]*\]\s+-\s+\d{4}-\d{2}-\d{2}\s*$/im.test(text) &&
    keepCategories.length >= 2
  ) {
    return 'keep-a-changelog';
  }
  return undefined;
}

function hasCommonChangelogReleaseBlock(text: string): boolean {
  const commonCategories = ['Changed', 'Added', 'Removed', 'Fixed'];
  return releaseBlocks(text).some(
    (block) =>
      /^\[?\d+\.\d+\.\d+[^\]\n]*\]?\s+-\s+\d{4}-\d{2}-\d{2}\s*$/i.test(block.heading) &&
      sameStringList(headingTexts(block.text, 3), commonCategories) &&
      /-\s+.+\(\[[^\]]+\]\([^)]+\)\)/.test(block.text) &&
      (/\*\*Breaking:\*\*/.test(block.text) || /-\s+[A-Za-z][\w -]+:\s+/.test(block.text)),
  );
}

function releaseBlocks(text: string): Array<{ heading: string; text: string }> {
  const headingMatches = [...text.matchAll(/^##\s+(.+?)\s*$/gim)];
  return headingMatches.map((match, index) => {
    const next = headingMatches[index + 1];
    return {
      heading: match[1].trim(),
      text: text.slice(match.index, next?.index),
    };
  });
}

function sameStringList(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function firstHeading(text: string): { level: number; text: string } | undefined {
  let body = text;
  if (body.startsWith('---')) {
    const closing = body.indexOf('\n---', 3);
    if (closing >= 0) {
      body = body.slice(closing + 4);
    }
  }
  const match = /^(#{1,6})\s+(.+?)\s*$/m.exec(body);
  if (match === null) return undefined;
  return { level: match[1].length, text: match[2].trim() };
}

function hasMadrEvidence(uri: string, text: string): boolean {
  const normalizedUri = uri.replace(/\\/g, '/');
  const hasPath = /(^|\/)(docs\/decisions|decisions)\//i.test(normalizedUri);
  const hasFilename = /\/\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/i.test(normalizedUri);
  if (!hasPath && !hasFilename) {
    return false;
  }
  const headings = new Set(headingTexts(text, 2));
  const madrHeadingCount = [
    'Context and Problem Statement',
    'Considered Options',
    'Decision Outcome',
  ].filter((heading) => headings.has(heading)).length;
  const hasMetadata = /^---[\s\S]*\b(status|date|decision-makers|consulted|informed)\s*:/m.test(
    text,
  );
  const hasOptionEvidence = /\b(Good|Neutral|Bad), because\b/.test(text);
  return madrHeadingCount >= 2 && (hasMetadata || hasOptionEvidence || (hasPath && hasFilename));
}

function headingTexts(text: string, level: number): string[] {
  const result: string[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (match !== null && match[1].length === level) {
      result.push(match[2].trim());
    }
  }
  return result;
}

function hasMdxEvidence(text: string): boolean {
  return (
    /(^|\n)\s*(import|export)\s+[\s\S]*?\n/.test(text) &&
    /<[A-Z][A-Za-z0-9]*(?:\s|>|\/>)/.test(text)
  );
}

function hasRMarkdownEvidence(text: string): boolean {
  return /(^|\n)```\{[a-zA-Z]+(?:\s+[^}]*)?\}/.test(text) || /`r\s+[^`]+`/.test(text);
}

function hasStackOverflowEvidence(text: string): boolean {
  return (
    /\[(?:meta-)?tag:[^\]]+\]/.test(text) ||
    /<!--\s*language(?:-all)?:\s*[^-]+-->/.test(text) ||
    /(^|\n)```\s+lang-[\w-]+/.test(text)
  );
}

function hasRedditEvidence(text: string): boolean {
  return />![\s\S]*?!<|(\s|^)\^\([^)]+\)/.test(text) && /\b[ru]\/[A-Za-z0-9_]+\b/.test(text);
}

function hasGlfmEvidence(text: string): boolean {
  return (
    /\[\[_TOC_\]\]/.test(text) ||
    /(^|\n)\s*[-*]\s+\[~\]\s+/.test(text) ||
    /(^|\s)(?:[#!&]\d+|[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#\d+)(?=\s|[.,;)]|$)/.test(text)
  );
}

function hasPandocEvidence(text: string): boolean {
  return (
    /(^|\n)%\s+\S/.test(text) ||
    /(^|\s)\[@[A-Za-z][\w:-]*(?:[,;\]\s])/.test(text) ||
    /(^|\s)@[A-Za-z][\w:-]*(?=\s|[.,;)\]])/.test(text) ||
    /(^|\n):::\s*\{[^}]+\}/.test(text)
  );
}

function hasMultiMarkdownEvidence(text: string): boolean {
  return (
    /^(Title|Author|Date|Keywords):\s+\S/m.test(text) &&
    (/(^|\n)#[^\n]+\[[A-Za-z][\w:-]+\]/.test(text) ||
      /\[#[-\w:]+\]:/.test(text) ||
      /\[[^\]]+\]\[\]/.test(text))
  );
}

function hasKramdownEvidence(text: string): boolean {
  return /(^|\n)\s*\{:\s*[.#][^}]+\}/.test(text) || /(^|\n)#{1,6}[^\n]+\{#[^}]+\}/.test(text);
}

function hasMarkdownExtraEvidence(text: string): boolean {
  return /^\*\[[^\]]+\]:\s+\S/m.test(text) && /(^|\n)\s*\{#[^}]+\}/.test(text);
}

function isRefreshableMarkdownState(state: MarkdownFlavorStateForDocument): boolean {
  if (state.resolution.kind !== 'active' || !isFlavorEligibleDocument(state.document)) {
    return false;
  }
  const uri = state.document.uri.toString();
  return isSafeResourceUri(uri);
}

function isSafeResourceUri(uri: string): boolean {
  return (
    uri.startsWith('file://') &&
    !uri.includes('__proto__') &&
    !uri.includes('constructor') &&
    !uri.includes('prototype')
  );
}

function buildMdfAttributesPattern(input: {
  fileName: string;
  scope: MarkdownFlavorScope;
}): string {
  return input.scope === 'directory' ? '/*.md' : escapeMdfAttributesPattern(input.fileName);
}

function updateMdfAttributesLine(
  line: string,
  pattern: string,
  selection: MarkdownFlavorSelection,
): string | undefined {
  const tokens = splitMdfAttributesTokens(line.trim());
  if (tokens.length < 1 || unescapeMdfAttributesPattern(tokens[0]) !== unescapeMdfAttributesPattern(pattern)) {
    return undefined;
  }

  const preservedAttributes = tokens.slice(1).filter((token) => !isFlavorAttributeToken(token));
  const flavorAttribute = selection === 'auto' ? '!flavor' : `flavor=${selection}`;
  return [pattern, ...preservedAttributes, flavorAttribute].join(' ');
}

function splitMdfAttributesTokens(line: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let escaped = false;
  for (const char of line) {
    if (escaped) {
      current += /[\s#!]/u.test(char) ? char : `\\${char}`;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (/\s/u.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += char;
  }
  if (escaped) {
    current += '\\';
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

function isFlavorAttributeToken(token: string): boolean {
  return token === '!flavor' || token.startsWith('flavor=');
}

function escapeMdfAttributesPattern(value: string): string {
  let escaped = '';
  for (const char of value) {
    escaped += /[\s#!*?[\]\\]/u.test(char) ? `\\${char}` : char;
  }
  return escaped;
}

function unescapeMdfAttributesPattern(value: string): string {
  return value.replace(/\\([#!\s*?[\]\\])/gu, '$1');
}

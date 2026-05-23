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

export type MarkdownFlavorId = (typeof MARKDOWN_FLAVOR_IDS)[number];
export type MarkdownFlavorSelection = (typeof MARKDOWN_FLAVOR_SELECTIONS)[number];

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
export const MARKDOWN_FLAVOR_SETTING = 'flavorGrenade.markdownFlavor';
export const MARKDOWN_FLAVOR_SECTION = 'flavorGrenade';
export const MARKDOWN_FLAVOR_SETTING_KEY = 'markdownFlavor';
export const MARKDOWN_LANGUAGE_ID = 'markdown';
export const MARKDOWN_LANGUAGE_DOCUMENT_SELECTOR = [
  { scheme: 'file', language: MARKDOWN_LANGUAGE_ID },
] as const;

const MAX_PROPAGATED_RESOURCES = 100;

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
  | 'project-toml'
  | 'obsidian-marker'
  | 'syntax-inference'
  | 'commonmark-fallback';

export type MarkdownFlavorResolution =
  | {
      kind: 'active';
      selected: MarkdownFlavorSelection;
      effective: MarkdownFlavorId;
      source: FlavorResolutionSource;
    }
  | {
      kind: 'inactive';
      reason: 'non-markdown-language' | 'unsupported-scheme';
    };

export interface MarkdownFlavorQuickPickItem {
  id: MarkdownFlavorSelection;
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
        markdownFlavor: MarkdownFlavorSelection;
        markdownFlavorResources: Record<
          string,
          {
            selected: MarkdownFlavorSelection;
            effective: MarkdownFlavorId;
            source: FlavorResolutionSource;
          }
        >;
      };
    };
  };
}

export type MarkdownFlavorUpdateTarget = 'workspace-folder' | 'workspace' | 'global';

export function isMarkdownFlavorId(value: unknown): value is MarkdownFlavorId {
  return typeof value === 'string' && MARKDOWN_FLAVOR_IDS.includes(value as MarkdownFlavorId);
}

export function isMarkdownFlavorSelection(value: unknown): value is MarkdownFlavorSelection {
  return (
    typeof value === 'string' &&
    MARKDOWN_FLAVOR_SELECTIONS.includes(value as MarkdownFlavorSelection)
  );
}

export function createMarkdownFlavorQuickPickItems(): MarkdownFlavorQuickPickItem[] {
  return MARKDOWN_FLAVOR_SELECTIONS.map((id) => ({
    id,
    label: MARKDOWN_FLAVOR_LABELS[id],
  }));
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
  projectFlavor?: unknown;
  selected: unknown;
  syntaxText?: string;
}): MarkdownFlavorResolution {
  const inactive = inactiveDocumentReason(input.document);
  if (inactive) {
    return inactive;
  }

  const selected = isMarkdownFlavorSelection(input.selected) ? input.selected : 'auto';
  if (isMarkdownFlavorId(selected)) {
    return activeResolution(selected, selected, 'explicit-selection');
  }

  if (isMarkdownFlavorId(input.projectFlavor)) {
    return activeResolution('auto', input.projectFlavor, 'project-toml');
  }

  if (input.hasObsidianMarker === true) {
    return activeResolution('auto', 'obsidian', 'obsidian-marker');
  }

  const inferred = inferMarkdownFlavorFromSyntax(input.syntaxText ?? input.document.getText?.());
  if (inferred) {
    return activeResolution('auto', inferred, 'syntax-inference');
  }

  return activeResolution('auto', 'commonmark', 'commonmark-fallback');
}

export function selectionSettingValue(
  selection: MarkdownFlavorSelection,
): MarkdownFlavorId | undefined {
  return selection === 'auto' ? undefined : selection;
}

export function resolveMarkdownFlavorUpdateTarget(input: {
  hasFolderOverride: boolean;
  hasWorkspaceFolder: boolean;
  workspaceFolderCount: number;
}): MarkdownFlavorUpdateTarget {
  if (!input.hasWorkspaceFolder) {
    return 'global';
  }
  if (input.hasFolderOverride || input.workspaceFolderCount > 1) {
    return 'workspace-folder';
  }
  return 'workspace';
}

export function buildMarkdownFlavorConfigurationNotification(input: {
  restricted?: boolean;
  states: readonly MarkdownFlavorStateForDocument[];
}): MarkdownFlavorConfigurationNotification | undefined {
  if (input.restricted) {
    return undefined;
  }

  const payload = collectPropagatedResources(input.states);
  if (!payload || Object.keys(payload.resources).length > MAX_PROPAGATED_RESOURCES) {
    return undefined;
  }

  return {
    method: 'workspace/didChangeConfiguration',
    params: {
      settings: {
        flavorGrenade: {
          markdownFlavor: payload.markdownFlavor,
          markdownFlavorResources: payload.resources,
        },
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
): MarkdownFlavorResolution {
  return {
    kind: 'active',
    selected,
    effective,
    source,
  };
}

function inactiveReasonLabel(
  reason: Extract<MarkdownFlavorResolution, { kind: 'inactive' }>['reason'],
): string {
  switch (reason) {
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
    case 'project-toml':
      return 'project configuration';
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

function collectPropagatedResources(states: readonly MarkdownFlavorStateForDocument[]):
  | {
      markdownFlavor: MarkdownFlavorSelection;
      resources: MarkdownFlavorConfigurationNotification['params']['settings']['flavorGrenade']['markdownFlavorResources'];
    }
  | undefined {
  const resources: MarkdownFlavorConfigurationNotification['params']['settings']['flavorGrenade']['markdownFlavorResources'] =
    {};
  let markdownFlavor: MarkdownFlavorSelection | undefined;

  for (const state of states) {
    const resource = propagatedResourceForState(state);
    if (!resource) {
      continue;
    }
    markdownFlavor ??= resource.selected;
    resources[resource.uri] = resource.value;
  }

  return markdownFlavor && Object.keys(resources).length > 0
    ? { markdownFlavor, resources }
    : undefined;
}

function propagatedResourceForState(state: MarkdownFlavorStateForDocument):
  | {
      selected: MarkdownFlavorSelection;
      uri: string;
      value: {
        selected: MarkdownFlavorSelection;
        effective: MarkdownFlavorId;
        source: FlavorResolutionSource;
      };
    }
  | undefined {
  if (state.resolution.kind !== 'active' || !isFlavorEligibleDocument(state.document)) {
    return undefined;
  }
  const uri = state.document.uri.toString();
  if (!isSafeResourceUri(uri)) {
    return undefined;
  }
  return {
    selected: state.resolution.selected,
    uri,
    value: {
      selected: state.resolution.selected,
      effective: state.resolution.effective,
      source: state.resolution.source,
    },
  };
}

function isSafeResourceUri(uri: string): boolean {
  return (
    uri.startsWith('file://') &&
    !uri.includes('__proto__') &&
    !uri.includes('constructor') &&
    !uri.includes('prototype')
  );
}

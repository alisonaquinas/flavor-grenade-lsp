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
}

export type FlavorResolutionSource =
  | 'explicit-selection'
  | 'project-toml'
  | 'obsidian-marker'
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

export function isFlavorEligibleDocument(document: TextDocumentLike): boolean {
  return document.uri.scheme === 'file' && document.languageId === MARKDOWN_LANGUAGE_ID;
}

export function resolveMarkdownFlavor(input: {
  document: TextDocumentLike;
  hasObsidianMarker?: boolean;
  projectFlavor?: unknown;
  selected: unknown;
}): MarkdownFlavorResolution {
  if (input.document.languageId !== MARKDOWN_LANGUAGE_ID) {
    return { kind: 'inactive', reason: 'non-markdown-language' };
  }
  if (input.document.uri.scheme !== 'file') {
    return { kind: 'inactive', reason: 'unsupported-scheme' };
  }

  const selected = isMarkdownFlavorSelection(input.selected) ? input.selected : 'auto';
  if (isMarkdownFlavorId(selected)) {
    return {
      kind: 'active',
      selected,
      effective: selected,
      source: 'explicit-selection',
    };
  }

  if (isMarkdownFlavorId(input.projectFlavor)) {
    return {
      kind: 'active',
      selected: 'auto',
      effective: input.projectFlavor,
      source: 'project-toml',
    };
  }

  if (input.hasObsidianMarker === true) {
    return {
      kind: 'active',
      selected: 'auto',
      effective: 'obsidian',
      source: 'obsidian-marker',
    };
  }

  return {
    kind: 'active',
    selected: 'auto',
    effective: 'commonmark',
    source: 'commonmark-fallback',
  };
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

  const resources: MarkdownFlavorConfigurationNotification['params']['settings']['flavorGrenade']['markdownFlavorResources'] =
    {};
  let markdownFlavor: MarkdownFlavorSelection | undefined;

  for (const state of input.states) {
    if (state.resolution.kind !== 'active' || !isFlavorEligibleDocument(state.document)) {
      continue;
    }
    const uri = state.document.uri.toString();
    if (!isSafeResourceUri(uri)) {
      continue;
    }
    markdownFlavor ??= state.resolution.selected;
    resources[uri] = {
      selected: state.resolution.selected,
      effective: state.resolution.effective,
      source: state.resolution.source,
    };
  }

  const entries = Object.keys(resources);
  if (!markdownFlavor || entries.length === 0 || entries.length > MAX_PROPAGATED_RESOURCES) {
    return undefined;
  }

  return {
    method: 'workspace/didChangeConfiguration',
    params: {
      settings: {
        flavorGrenade: {
          markdownFlavor,
          markdownFlavorResources: resources,
        },
      },
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

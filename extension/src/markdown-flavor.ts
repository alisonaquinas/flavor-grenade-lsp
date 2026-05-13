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

function collectPropagatedResources(
  states: readonly MarkdownFlavorStateForDocument[],
):
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

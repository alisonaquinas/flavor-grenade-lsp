import { Injectable } from '@nestjs/common';
import {
  MARKDOWN_FLAVOR_SELECTIONS,
  isMarkdownFlavorId,
  type MarkdownFlavorId,
  type MarkdownFlavorSelection,
} from './markdown-flavor-contract.js';
import { inferMarkdownFlavorFromSyntax } from './syntax-inference.js';
import {
  isValidStructuredProfileList,
  isStructuredProfileSelection,
  resolveStructuredProfiles,
  type StructuredMarkdownProfileId,
  type StructuredProfileResolutionSource,
  type StructuredProfileSelection,
} from './structured-profiles.js';

const MAX_RESOURCE_FLAVOR_ENTRIES = 100;

/** Concrete flavor used by parsers and handlers after selector resolution. */
export type EffectiveMarkdownFlavor = MarkdownFlavorId;

/** Evidence source that selected a document's effective Markdown flavor. */
export type FlavorResolutionSource =
  | 'explicit-selection'
  | 'resource-propagation'
  | 'project-config'
  | 'project-toml'
  | 'obsidian-marker'
  | 'syntax-inference'
  | 'commonmark-fallback';

/** Active or inactive flavor resolution result for one document resource. */
export type FlavorResolutionResult =
  | {
      kind: 'active';
      selected: MarkdownFlavorSelection;
      effective: EffectiveMarkdownFlavor;
      source: FlavorResolutionSource;
      structuredProfiles: readonly StructuredMarkdownProfileId[];
      structuredProfileSource: StructuredProfileResolutionSource;
    }
  | {
      kind: 'inactive';
      reason: 'non-markdown-language' | 'unsupported-scheme';
    };

/** Inputs available when resolving a document's Markdown flavor. */
export interface ResolveFlavorInput {
  uri: string;
  languageId: string;
  hasObsidianMarker: boolean;
  projectConfigFlavor?: MarkdownFlavorSelection;
  projectConfigStructuredProfiles?: StructuredProfileSelection;
  projectTomlFlavor?: MarkdownFlavorSelection;
  projectTomlStructuredProfiles?: StructuredProfileSelection;
  structuredProfileSelection?: StructuredProfileSelection;
  syntaxText?: string;
}

/** Resource-specific flavor payload propagated by the VS Code client. */
export interface PropagatedResourceFlavor {
  selected: MarkdownFlavorSelection;
  effective: MarkdownFlavorId;
  source: FlavorResolutionSource | 'workspace-setting' | 'workspace-folder-setting';
  structuredProfiles?: readonly StructuredMarkdownProfileId[];
  structuredProfileSource?: StructuredProfileResolutionSource;
}

/** LSP configuration payload accepted by the server flavor state service. */
export interface MarkdownFlavorConfiguration {
  selection?: MarkdownFlavorSelection;
  resources?: Record<string, PropagatedResourceFlavor>;
  structuredProfileSelection?: StructuredProfileSelection;
}

@Injectable()
/**
 * Maintains Markdown flavor selector state for server-side analysis.
 *
 * The service validates client-propagated resource flavors, resolves `auto`
 * from project and vault evidence, and falls back to CommonMark for ordinary
 * Markdown files.
 */
export class MarkdownFlavorState {
  private selection: MarkdownFlavorSelection = 'auto';
  private structuredProfileSelection: StructuredProfileSelection = 'auto';
  private readonly resourceFlavors = new Map<string, PropagatedResourceFlavor>();

  snapshot(): {
    selection: MarkdownFlavorSelection;
    structuredProfileSelection: StructuredProfileSelection;
    resources: Record<string, PropagatedResourceFlavor>;
  } {
    return {
      selection: this.selection,
      structuredProfileSelection: this.structuredProfileSelection,
      resources: Object.fromEntries(this.resourceFlavors.entries()),
    };
  }

  effectiveFlavorForUri(uri: string): MarkdownFlavorId | undefined {
    return this.resourceFlavors.get(uri)?.effective;
  }

  applyConfiguration(config: MarkdownFlavorConfiguration, openUris: Set<string>): boolean {
    const before = JSON.stringify(this.snapshot());
    if (config.selection !== undefined && isMarkdownFlavorSelection(config.selection)) {
      this.selection = config.selection;
    }
    if (
      config.structuredProfileSelection !== undefined &&
      isStructuredProfileSelection(config.structuredProfileSelection)
    ) {
      this.structuredProfileSelection = config.structuredProfileSelection;
    }
    const resources =
      config.resources === undefined
        ? undefined
        : this.sanitizedResourceEntries(config.resources, openUris);
    if (resources !== undefined) {
      this.resourceFlavors.clear();
      for (const [uri, value] of resources) {
        this.resourceFlavors.set(uri, value);
      }
    }
    return JSON.stringify(this.snapshot()) !== before;
  }

  resolveForDocument(input: ResolveFlavorInput): FlavorResolutionResult {
    if (input.languageId !== 'markdown') {
      return { kind: 'inactive', reason: 'non-markdown-language' };
    }
    if (!input.uri.startsWith('file://')) {
      return { kind: 'inactive', reason: 'unsupported-scheme' };
    }

    const resource = this.resourceFlavors.get(input.uri);
    if (resource) {
      return {
        kind: 'active',
        selected: resource.selected,
        effective: resource.effective,
        source: 'resource-propagation',
        structuredProfiles: resource.structuredProfiles ?? [],
        structuredProfileSource: resource.structuredProfileSource ?? 'structured-profile-inference',
      };
    }

    const explicit = explicitFlavor(this.selection);
    if (explicit) {
      return {
        kind: 'active',
        selected: this.selection,
        effective: explicit,
        source: 'explicit-selection',
        ...this.resolveStructuredProfileState(input),
      };
    }

    const project = explicitFlavor(input.projectConfigFlavor ?? input.projectTomlFlavor);
    if (project) {
      return {
        kind: 'active',
        selected: 'auto',
        effective: project,
        source: 'project-config',
        ...this.resolveStructuredProfileState(input),
      };
    }

    if (input.hasObsidianMarker) {
      return {
        kind: 'active',
        selected: 'auto',
        effective: 'obsidian',
        source: 'obsidian-marker',
        ...this.resolveStructuredProfileState(input),
      };
    }

    const inferred = inferMarkdownFlavorFromSyntax(input.syntaxText);
    if (inferred) {
      return {
        kind: 'active',
        selected: 'auto',
        effective: inferred,
        source: 'syntax-inference',
        ...this.resolveStructuredProfileState(input),
      };
    }

    return {
      kind: 'active',
      selected: 'auto',
      effective: 'commonmark',
      source: 'commonmark-fallback',
      ...this.resolveStructuredProfileState(input),
    };
  }

  private resolveStructuredProfileState(input: ResolveFlavorInput): {
    structuredProfiles: readonly StructuredMarkdownProfileId[];
    structuredProfileSource: StructuredProfileResolutionSource;
  } {
    return resolveStructuredProfiles({
      selection: input.structuredProfileSelection ?? this.structuredProfileSelection,
      projectSelection:
        input.projectConfigStructuredProfiles ?? input.projectTomlStructuredProfiles,
      uri: input.uri,
      syntaxText: input.syntaxText,
    });
  }

  private sanitizedResourceEntries(
    resources: Record<string, PropagatedResourceFlavor> | undefined,
    openUris: Set<string>,
  ): Array<[string, PropagatedResourceFlavor]> | undefined {
    if (resources === undefined) {
      return [];
    }
    const entries = Object.entries(resources);
    if (entries.length > MAX_RESOURCE_FLAVOR_ENTRIES) {
      return undefined;
    }
    const sanitized: Array<[string, PropagatedResourceFlavor]> = [];
    for (const [uri, value] of entries) {
      if (!uri.startsWith('file://') || !openUris.has(uri)) {
        return undefined;
      }
      if (!isRecord(value)) {
        return undefined;
      }
      if (!isMarkdownFlavorSelection(value.selected) || !isMarkdownFlavorId(value.effective)) {
        return undefined;
      }
      if (!isPropagatedFlavorResolutionSource(value.source)) {
        return undefined;
      }
      const structuredProfiles = value.structuredProfiles ?? [];
      if (!Array.isArray(structuredProfiles) || !isValidStructuredProfileList(structuredProfiles)) {
        return undefined;
      }
      const structuredProfileSource =
        value.structuredProfileSource ?? 'structured-profile-inference';
      if (!isStructuredProfileResolutionSource(structuredProfileSource)) {
        return undefined;
      }
      sanitized.push([
        uri,
        {
          selected: value.selected,
          effective: value.effective,
          source: value.source,
          structuredProfiles,
          structuredProfileSource,
        },
      ]);
    }
    return sanitized;
  }
}

/** True when a value is a supported selector value, including `auto`. */
export function isMarkdownFlavorSelection(value: unknown): value is MarkdownFlavorSelection {
  return (
    typeof value === 'string' && (MARKDOWN_FLAVOR_SELECTIONS as readonly string[]).includes(value)
  );
}

function explicitFlavor(value: MarkdownFlavorSelection | undefined): MarkdownFlavorId | undefined {
  return value && value !== 'auto' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStructuredProfileResolutionSource(
  value: unknown,
): value is StructuredProfileResolutionSource {
  return (
    value === 'explicit-selection' ||
    value === 'project-config' ||
    value === 'project-toml' ||
    value === 'structured-profile-inference' ||
    value === 'none'
  );
}

function isPropagatedFlavorResolutionSource(
  value: unknown,
): value is PropagatedResourceFlavor['source'] {
  return (
    value === 'explicit-selection' ||
    value === 'resource-propagation' ||
    value === 'project-config' ||
    value === 'project-toml' ||
    value === 'obsidian-marker' ||
    value === 'syntax-inference' ||
    value === 'commonmark-fallback' ||
    value === 'workspace-setting' ||
    value === 'workspace-folder-setting'
  );
}

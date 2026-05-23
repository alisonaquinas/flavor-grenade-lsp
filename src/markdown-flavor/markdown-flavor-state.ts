import { Injectable } from '@nestjs/common';
import {
  MARKDOWN_FLAVOR_SELECTIONS,
  isMarkdownFlavorId,
  type MarkdownFlavorId,
  type MarkdownFlavorSelection,
} from './markdown-flavor-contract.js';

const MAX_RESOURCE_FLAVOR_ENTRIES = 100;

/** Concrete flavor used by parsers and handlers after selector resolution. */
export type EffectiveMarkdownFlavor = MarkdownFlavorId;

/** Evidence source that selected a document's effective Markdown flavor. */
export type FlavorResolutionSource =
  | 'explicit-selection'
  | 'resource-propagation'
  | 'project-toml'
  | 'obsidian-marker'
  | 'commonmark-fallback';

/** Active or inactive flavor resolution result for one document resource. */
export type FlavorResolutionResult =
  | {
      kind: 'active';
      selected: MarkdownFlavorSelection;
      effective: EffectiveMarkdownFlavor;
      source: FlavorResolutionSource;
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
  projectTomlFlavor?: MarkdownFlavorSelection;
}

/** Resource-specific flavor payload propagated by the VS Code client. */
export interface PropagatedResourceFlavor {
  selected: MarkdownFlavorSelection;
  effective: MarkdownFlavorId;
  source: FlavorResolutionSource | 'workspace-setting' | 'workspace-folder-setting';
}

/** LSP configuration payload accepted by the server flavor state service. */
export interface MarkdownFlavorConfiguration {
  selection?: MarkdownFlavorSelection;
  resources?: Record<string, PropagatedResourceFlavor>;
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
  private readonly resourceFlavors = new Map<string, PropagatedResourceFlavor>();

  snapshot(): {
    selection: MarkdownFlavorSelection;
    resources: Record<string, PropagatedResourceFlavor>;
  } {
    return {
      selection: this.selection,
      resources: Object.fromEntries(this.resourceFlavors.entries()),
    };
  }

  effectiveFlavorForUri(uri: string): MarkdownFlavorId | undefined {
    return this.resourceFlavors.get(uri)?.effective;
  }

  applyConfiguration(config: MarkdownFlavorConfiguration, openUris: Set<string>): boolean {
    if (!this.isValidResourceMap(config.resources, openUris)) {
      return false;
    }
    if (config.selection !== undefined && !isMarkdownFlavorSelection(config.selection)) {
      return false;
    }

    const before = JSON.stringify(this.snapshot());
    if (config.selection !== undefined) {
      this.selection = config.selection;
    }
    if (config.resources !== undefined) {
      this.resourceFlavors.clear();
      for (const [uri, value] of Object.entries(config.resources)) {
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
      };
    }

    const explicit = explicitFlavor(this.selection);
    if (explicit) {
      return {
        kind: 'active',
        selected: this.selection,
        effective: explicit,
        source: 'explicit-selection',
      };
    }

    const project = explicitFlavor(input.projectTomlFlavor);
    if (project) {
      return { kind: 'active', selected: 'auto', effective: project, source: 'project-toml' };
    }

    if (input.hasObsidianMarker) {
      return { kind: 'active', selected: 'auto', effective: 'obsidian', source: 'obsidian-marker' };
    }

    return {
      kind: 'active',
      selected: 'auto',
      effective: 'commonmark',
      source: 'commonmark-fallback',
    };
  }

  private isValidResourceMap(
    resources: Record<string, PropagatedResourceFlavor> | undefined,
    openUris: Set<string>,
  ): boolean {
    if (resources === undefined) {
      return true;
    }
    const entries = Object.entries(resources);
    if (entries.length > MAX_RESOURCE_FLAVOR_ENTRIES) {
      return false;
    }
    for (const [uri, value] of entries) {
      if (!uri.startsWith('file://') || !openUris.has(uri)) {
        return false;
      }
      if (!isMarkdownFlavorSelection(value.selected) || !isMarkdownFlavorId(value.effective)) {
        return false;
      }
    }
    return true;
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

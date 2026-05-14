import { Injectable } from '@nestjs/common';
import {
  MARKDOWN_FLAVOR_SELECTIONS,
  isMarkdownFlavorId,
  type MarkdownFlavorId,
  type MarkdownFlavorSelection,
} from './markdown-flavor-contract.js';

const MAX_RESOURCE_FLAVOR_ENTRIES = 100;

export type EffectiveMarkdownFlavor = MarkdownFlavorId;

export type FlavorResolutionSource =
  | 'explicit-selection'
  | 'resource-propagation'
  | 'project-toml'
  | 'obsidian-marker'
  | 'commonmark-fallback';

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

export interface ResolveFlavorInput {
  uri: string;
  languageId: string;
  hasObsidianMarker: boolean;
  projectTomlFlavor?: MarkdownFlavorSelection;
}

export interface PropagatedResourceFlavor {
  selected: MarkdownFlavorSelection;
  effective: MarkdownFlavorId;
  source: FlavorResolutionSource | 'workspace-setting' | 'workspace-folder-setting';
}

export interface MarkdownFlavorConfiguration {
  selection?: MarkdownFlavorSelection;
  resources?: Record<string, PropagatedResourceFlavor>;
}

@Injectable()
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

export function isMarkdownFlavorSelection(value: unknown): value is MarkdownFlavorSelection {
  return (
    typeof value === 'string' && (MARKDOWN_FLAVOR_SELECTIONS as readonly string[]).includes(value)
  );
}

function explicitFlavor(value: MarkdownFlavorSelection | undefined): MarkdownFlavorId | undefined {
  return value && value !== 'auto' ? value : undefined;
}

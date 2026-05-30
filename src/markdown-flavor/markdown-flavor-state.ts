import { Injectable } from '@nestjs/common';
import {
  MARKDOWN_FLAVOR_SELECTIONS,
  type MarkdownFlavorId,
  type MarkdownFlavorSelection,
} from './markdown-flavor-contract.js';
import { inferMarkdownFlavorFromSyntax } from './syntax-inference.js';
import {
  resolveStructuredProfiles,
  type StructuredMarkdownProfileId,
  type StructuredProfileResolutionSource,
  type StructuredProfileSelection,
} from './structured-profiles.js';

/** Concrete flavor used by parsers and handlers after selector resolution. */
export type EffectiveMarkdownFlavor = MarkdownFlavorId;

/** Evidence source that selected a document's effective Markdown flavor. */
export type FlavorResolutionSource =
  | 'fgattributes'
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
  fgAttributesFlavor?: MarkdownFlavorSelection;
  fgAttributesStructuredProfiles?: StructuredProfileSelection;
  syntaxText?: string;
}

@Injectable()
/**
 * Resolves server-side Markdown flavor context for visible Markdown files.
 *
 * Persistent file and directory configuration comes only from `.fgattributes`;
 * otherwise Auto Detect resolves from vault and syntax evidence.
 */
export class MarkdownFlavorState {
  snapshot(): {
    selection: MarkdownFlavorSelection;
    structuredProfileSelection: StructuredProfileSelection;
  } {
    return {
      selection: 'auto',
      structuredProfileSelection: 'auto',
    };
  }

  effectiveFlavorForUri(uri: string): MarkdownFlavorId | undefined {
    void uri;
    return undefined;
  }

  applyConfiguration(config: unknown, openUris: Set<string>): boolean {
    void config;
    void openUris;
    return false;
  }

  resolveForDocument(input: ResolveFlavorInput): FlavorResolutionResult {
    if (input.languageId !== 'markdown') {
      return { kind: 'inactive', reason: 'non-markdown-language' };
    }
    if (!input.uri.startsWith('file://')) {
      return { kind: 'inactive', reason: 'unsupported-scheme' };
    }

    const fgAttributes = explicitFlavor(input.fgAttributesFlavor);
    if (fgAttributes) {
      return {
        kind: 'active',
        selected: input.fgAttributesFlavor ?? 'auto',
        effective: fgAttributes,
        source: 'fgattributes',
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
      selection: 'auto',
      fgAttributesSelection: input.fgAttributesStructuredProfiles,
      uri: input.uri,
      syntaxText: input.syntaxText,
    });
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

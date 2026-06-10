import { Injectable } from '@nestjs/common';
import { fileURLToPath } from 'node:url';
import { resolveMarkdownFlavor } from 'markdown-flavor-detection';
import {
  isMarkdownFlavorSelection,
  type MarkdownFlavorId,
  type MarkdownFlavorSelection,
} from './markdown-flavor-contract.js';
import {
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
      reason: 'non-markdown-language' | 'unsupported-scheme' | 'fgignore';
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

    const result = resolveMarkdownFlavor({
      path: pathFromFileUri(input.uri),
      languageId: input.languageId,
      hasObsidianMarker: input.hasObsidianMarker,
      fgAttributesFlavor: input.fgAttributesFlavor,
      fgAttributesStructuredProfiles: input.fgAttributesStructuredProfiles,
      syntaxText: input.syntaxText,
    });

    if (result.kind === 'inactive') {
      if (result.reason === 'unsupported-path') {
        return { kind: 'inactive', reason: 'unsupported-scheme' };
      }
      return { kind: 'inactive', reason: result.reason };
    }
    return result;
  }
}

export { isMarkdownFlavorSelection };

function pathFromFileUri(uri: string): string {
  try {
    return fileURLToPath(uri);
  } catch {
    return uri;
  }
}

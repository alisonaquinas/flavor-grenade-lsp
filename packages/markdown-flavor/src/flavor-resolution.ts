import { type MarkdownFlavorId, type MarkdownFlavorSelection } from './flavors.js';
import { type FgAttributes } from './fgattributes.js';
import { inferMarkdownFlavorFromSyntax } from './syntax-inference.js';
import {
  resolveStructuredProfiles,
  type StructuredMarkdownProfileId,
  type StructuredProfileResolutionSource,
  type StructuredProfileSelection,
} from './structured-profiles.js';

export type EffectiveMarkdownFlavor = MarkdownFlavorId;

export type FlavorResolutionSource =
  | 'fgattributes'
  | 'obsidian-marker'
  | 'syntax-inference'
  | 'commonmark-fallback';

export type InactiveFlavorReason = 'non-markdown-language' | 'unsupported-path' | 'fgignore';

export type MarkdownFlavorResolution =
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
      reason: InactiveFlavorReason;
    };

export type FlavorResolutionResult = MarkdownFlavorResolution;

export interface ResolveMarkdownFlavorInput {
  path: string;
  languageId?: string;
  ignored?: boolean;
  hasObsidianMarker?: boolean;
  fgAttributes?: FgAttributes;
  fgAttributesFlavor?: MarkdownFlavorSelection;
  fgAttributesStructuredProfiles?: StructuredProfileSelection;
  flavorSelection?: MarkdownFlavorSelection;
  structuredProfileSelection?: StructuredProfileSelection;
  syntaxText?: string;
}

export function resolveMarkdownFlavor(input: ResolveMarkdownFlavorInput): MarkdownFlavorResolution {
  if (input.languageId !== undefined && input.languageId !== 'markdown') {
    return { kind: 'inactive', reason: 'non-markdown-language' };
  }
  if (input.ignored === true) {
    return { kind: 'inactive', reason: 'fgignore' };
  }

  const fgAttributesFlavor = input.fgAttributesFlavor ?? input.fgAttributes?.flavor;
  const fgAttributesStructuredProfiles =
    input.fgAttributesStructuredProfiles ?? input.fgAttributes?.structuredProfiles;
  const selected = input.flavorSelection ?? fgAttributesFlavor ?? 'auto';
  const explicitSelection = selected !== 'auto' ? selected : undefined;
  const structuredProfileState = resolveStructuredProfiles({
    selection: input.structuredProfileSelection ?? 'auto',
    fgAttributesSelection: fgAttributesStructuredProfiles,
    path: input.path,
    syntaxText: input.syntaxText,
  });

  if (explicitSelection !== undefined) {
    return {
      kind: 'active',
      selected,
      effective: explicitSelection,
      source: 'fgattributes',
      ...structuredProfileState,
    };
  }

  if (input.hasObsidianMarker === true) {
    return {
      kind: 'active',
      selected: 'auto',
      effective: 'obsidian',
      source: 'obsidian-marker',
      ...structuredProfileState,
    };
  }

  const inferred = inferMarkdownFlavorFromSyntax(input.syntaxText);
  if (inferred !== undefined) {
    return {
      kind: 'active',
      selected: 'auto',
      effective: inferred,
      source: 'syntax-inference',
      ...structuredProfileState,
    };
  }

  return {
    kind: 'active',
    selected: 'auto',
    effective: 'commonmark',
    source: 'commonmark-fallback',
    ...structuredProfileState,
  };
}

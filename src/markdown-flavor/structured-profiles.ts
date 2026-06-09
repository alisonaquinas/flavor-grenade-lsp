import {
  inferStructuredProfiles as inferStructuredProfilesForPath,
  resolveStructuredProfiles as resolveStructuredProfilesForPath,
  type StructuredProfileSelection,
} from '@flavor-grenade/markdown-flavor';
import { fileURLToPath } from 'node:url';

export {
  STRUCTURED_MARKDOWN_PROFILE_IDS,
  isStructuredMarkdownProfileId,
  isStructuredProfileSelection,
  isValidStructuredProfileList,
} from '@flavor-grenade/markdown-flavor';
export type {
  StructuredMarkdownProfileId,
  StructuredProfileResolutionSource,
  StructuredProfileSelection,
} from '@flavor-grenade/markdown-flavor';

export interface StructuredProfileInferenceInput {
  uri: string;
  syntaxText?: string;
}

export function resolveStructuredProfiles(input: {
  selection?: StructuredProfileSelection;
  fgAttributesSelection?: StructuredProfileSelection;
  uri: string;
  syntaxText?: string;
}): ReturnType<typeof resolveStructuredProfilesForPath> {
  return resolveStructuredProfilesForPath({
    selection: input.selection,
    fgAttributesSelection: input.fgAttributesSelection,
    path: pathFromFileUri(input.uri),
    syntaxText: input.syntaxText,
  });
}

export function inferStructuredProfiles(
  input: StructuredProfileInferenceInput,
): ReturnType<typeof inferStructuredProfilesForPath> {
  return inferStructuredProfilesForPath({
    path: pathFromFileUri(input.uri),
    syntaxText: input.syntaxText,
  });
}

function pathFromFileUri(uri: string): string {
  try {
    return uri.startsWith('file://') ? fileURLToPath(uri) : uri;
  } catch {
    return uri;
  }
}

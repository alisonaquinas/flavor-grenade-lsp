export const STRUCTURED_MARKDOWN_PROFILE_IDS = [
  'keep-a-changelog',
  'common-changelog',
  'madr',
] as const;

export type StructuredMarkdownProfileId = (typeof STRUCTURED_MARKDOWN_PROFILE_IDS)[number];
export type StructuredProfileSelection = 'auto' | 'none' | readonly StructuredMarkdownProfileId[];

export type StructuredProfileResolutionSource =
  | 'explicit-selection'
  | 'project-toml'
  | 'structured-profile-inference'
  | 'none';

export interface StructuredProfileInferenceInput {
  uri: string;
  syntaxText?: string;
}

export function isStructuredMarkdownProfileId(
  value: unknown,
): value is StructuredMarkdownProfileId {
  return (
    typeof value === 'string' &&
    STRUCTURED_MARKDOWN_PROFILE_IDS.includes(value as StructuredMarkdownProfileId)
  );
}

export function isStructuredProfileSelection(value: unknown): value is StructuredProfileSelection {
  return (
    value === 'auto' ||
    value === 'none' ||
    (Array.isArray(value) && isValidStructuredProfileList(value))
  );
}

export function isValidStructuredProfileList(
  value: readonly unknown[],
): value is readonly StructuredMarkdownProfileId[] {
  const seen = new Set<StructuredMarkdownProfileId>();
  for (const item of value) {
    if (!isStructuredMarkdownProfileId(item) || seen.has(item)) {
      return false;
    }
    seen.add(item);
  }
  return !(seen.has('keep-a-changelog') && seen.has('common-changelog'));
}

export function resolveStructuredProfiles(input: {
  selection?: StructuredProfileSelection;
  projectSelection?: StructuredProfileSelection;
  uri: string;
  syntaxText?: string;
}): {
  structuredProfiles: readonly StructuredMarkdownProfileId[];
  structuredProfileSource: StructuredProfileResolutionSource;
} {
  if (Array.isArray(input.selection)) {
    return {
      structuredProfiles: input.selection,
      structuredProfileSource: 'explicit-selection',
    };
  }
  if (input.selection === 'none') {
    return { structuredProfiles: [], structuredProfileSource: 'none' };
  }

  if (Array.isArray(input.projectSelection)) {
    return {
      structuredProfiles: input.projectSelection,
      structuredProfileSource: 'project-toml',
    };
  }
  if (input.projectSelection === 'none') {
    return { structuredProfiles: [], structuredProfileSource: 'none' };
  }

  return {
    structuredProfiles: inferStructuredProfiles(input),
    structuredProfileSource: 'structured-profile-inference',
  };
}

export function inferStructuredProfiles(
  input: StructuredProfileInferenceInput,
): readonly StructuredMarkdownProfileId[] {
  const sample = (input.syntaxText ?? '').slice(0, 64 * 1024);
  const profiles: StructuredMarkdownProfileId[] = [];
  const changelog = inferChangelogProfile(input.uri, sample);
  if (changelog) {
    profiles.push(changelog);
  }
  if (hasMadrEvidence(input.uri, sample)) {
    profiles.push('madr');
  }
  return profiles;
}

function inferChangelogProfile(
  uri: string,
  text: string,
): 'keep-a-changelog' | 'common-changelog' | undefined {
  if (!/CHANGELOG\.md$/i.test(uri)) {
    return undefined;
  }
  if (!/^#\s+Changelog\s*$/im.test(text)) {
    return undefined;
  }

  const hasUnreleased = /^##\s+\[?Unreleased\]?\s*$/im.test(text);
  const categories = headingTexts(text, 3);
  const categorySet = new Set(categories);
  const keepCategories = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'].filter(
    (category) => categorySet.has(category),
  );
  const hasKeepOnlyCategory = categorySet.has('Deprecated') || categorySet.has('Security');
  if (hasUnreleased && keepCategories.length >= 2) {
    return 'keep-a-changelog';
  }
  if (hasKeepOnlyCategory && keepCategories.length >= 2) {
    return 'keep-a-changelog';
  }

  if (hasCommonChangelogReleaseBlock(text)) {
    return 'common-changelog';
  }

  if (
    /^##\s+\[\d+\.\d+\.\d+[^\]\n]*\]\s+-\s+\d{4}-\d{2}-\d{2}\s*$/im.test(text) &&
    keepCategories.length >= 2
  ) {
    return 'keep-a-changelog';
  }

  return undefined;
}

function hasCommonChangelogReleaseBlock(text: string): boolean {
  const commonCategories = ['Changed', 'Added', 'Removed', 'Fixed'];
  return releaseBlocks(text).some(
    (block) =>
      /^\[?\d+\.\d+\.\d+[^\]\n]*\]?\s+-\s+\d{4}-\d{2}-\d{2}\s*$/i.test(block.heading) &&
      sameStringList(headingTexts(block.text, 3), commonCategories) &&
      /-\s+.+\(\[[^\]]+\]\([^)]+\)\)/.test(block.text) &&
      (/\*\*Breaking:\*\*/.test(block.text) || /-\s+[A-Za-z][\w -]+:\s+/.test(block.text)),
  );
}

function releaseBlocks(text: string): Array<{ heading: string; text: string }> {
  const headingMatches = [...text.matchAll(/^##\s+(.+?)\s*$/gim)];
  return headingMatches.map((match, index) => {
    const next = headingMatches[index + 1];
    return {
      heading: match[1].trim(),
      text: text.slice(match.index, next?.index),
    };
  });
}

function sameStringList(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function hasMadrEvidence(uri: string, text: string): boolean {
  const normalizedUri = uri.replace(/\\/g, '/');
  const hasPath = /(^|\/)(docs\/decisions|decisions)\//i.test(normalizedUri);
  const hasFilename = /\/\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/i.test(normalizedUri);
  if (!hasPath && !hasFilename) {
    return false;
  }

  const headings = new Set(headingTexts(text, 2));
  const madrHeadingCount = [
    'Context and Problem Statement',
    'Considered Options',
    'Decision Outcome',
  ].filter((heading) => headings.has(heading)).length;
  const hasMetadata = /^---[\s\S]*\b(status|date|decision-makers|consulted|informed)\s*:/m.test(
    text,
  );
  const hasOptionEvidence = /\b(Good|Neutral|Bad), because\b/.test(text);

  return madrHeadingCount >= 2 && (hasMetadata || hasOptionEvidence || (hasPath && hasFilename));
}

function headingTexts(text: string, level: number): string[] {
  const hashes = '#'.repeat(level);
  const pattern = new RegExp(`^${hashes}\\s+(.+?)\\s*$`, 'gim');
  const result: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    result.push(match[1].trim());
  }
  return result;
}

import { isMarkdownFlavorSelection, type MarkdownFlavorSelection } from './flavors.js';
import {
  isStructuredProfileSelection,
  type StructuredMarkdownProfileId,
  type StructuredProfileSelection,
} from './structured-profiles.js';
import {
  normalizeConfigLine,
  patternMatches,
  splitConfigTokens,
  toPosix,
  unescapePattern,
} from './patterns.js';

const DANGEROUS_ATTRIBUTE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export interface FgAttributes {
  flavor?: MarkdownFlavorSelection;
  structuredProfiles?: StructuredProfileSelection;
}

export interface FgAttributeRule {
  pattern: string;
  negated: boolean;
  assignments: readonly FgAttributeAssignment[];
}

export type FgAttributeAssignment =
  | { kind: 'set'; key: 'flavor'; value: MarkdownFlavorSelection }
  | { kind: 'set'; key: 'structuredProfiles'; value: StructuredProfileSelection }
  | { kind: 'reset'; key: 'flavor' | 'structuredProfiles' };

export function parseFgAttributes(content: string): FgAttributeRule[] {
  const rules: FgAttributeRule[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = normalizeConfigLine(rawLine);
    if (line.length === 0) {
      continue;
    }
    const tokens = splitConfigTokens(line);
    if (tokens.length < 1) {
      continue;
    }
    const rawPattern = tokens[0];
    const negated = rawPattern.startsWith('!');
    const pattern = unescapePattern(negated ? rawPattern.slice(1) : rawPattern);
    if (pattern.length === 0) {
      continue;
    }
    const assignments = tokens.slice(1).flatMap(parseFgAttributeToken);
    if (negated || assignments.length > 0) {
      rules.push({ pattern, negated, assignments });
    }
  }
  return rules;
}

export function applyFgAttributes(
  rules: readonly FgAttributeRule[],
  relativePath: string,
  inherited: FgAttributes = {},
): FgAttributes {
  const attributes: FgAttributes = { ...inherited };
  const local: FgAttributes = {};
  const localResets = new Set<keyof FgAttributes>();

  for (const rule of rules) {
    if (!patternMatches(rule.pattern, toPosix(relativePath))) {
      continue;
    }
    if (rule.negated) {
      delete local.flavor;
      delete local.structuredProfiles;
      localResets.delete('flavor');
      localResets.delete('structuredProfiles');
      continue;
    }
    for (const assignment of rule.assignments) {
      if (assignment.kind === 'reset') {
        resetAttribute(local, assignment.key);
        localResets.add(assignment.key);
      } else if (assignment.key === 'flavor') {
        local.flavor = assignment.value;
        localResets.delete('flavor');
      } else {
        local.structuredProfiles = assignment.value;
        localResets.delete('structuredProfiles');
      }
    }
  }

  if (localResets.has('flavor')) {
    delete attributes.flavor;
  } else if (local.flavor !== undefined) {
    attributes.flavor = local.flavor;
  }
  if (localResets.has('structuredProfiles')) {
    delete attributes.structuredProfiles;
  } else if (local.structuredProfiles !== undefined) {
    attributes.structuredProfiles = local.structuredProfiles;
  }

  return attributes;
}

function parseFgAttributeToken(token: string): FgAttributeAssignment[] {
  const resetMatch = /^!(flavor|structured_profiles|structuredProfiles)$/.exec(token);
  if (resetMatch) {
    const key = normalizeAttributeKey(resetMatch[1]);
    if (key === undefined) {
      return [];
    }
    return [{ kind: 'reset', key }];
  }

  const [rawKey, ...rawValueParts] = token.split('=');
  const rawValue = rawValueParts.join('=');
  if (rawValueParts.length === 0 || DANGEROUS_ATTRIBUTE_KEYS.has(rawKey)) {
    return [];
  }
  const key = normalizeAttributeKey(rawKey);
  if (key === undefined) {
    return [];
  }
  if (key === 'flavor') {
    return isMarkdownFlavorSelection(rawValue) ? [{ kind: 'set', key, value: rawValue }] : [];
  }
  const value = normalizeStructuredProfilesValue(rawValue);
  return value === undefined ? [] : [{ kind: 'set', key, value }];
}

function normalizeAttributeKey(value: string): 'flavor' | 'structuredProfiles' | undefined {
  if (value === 'flavor') {
    return 'flavor';
  }
  if (value === 'structured_profiles' || value === 'structuredProfiles') {
    return 'structuredProfiles';
  }
  return undefined;
}

function resetAttribute(attributes: FgAttributes, key: 'flavor' | 'structuredProfiles'): void {
  if (key === 'flavor') {
    delete attributes.flavor;
  } else {
    delete attributes.structuredProfiles;
  }
}

function normalizeStructuredProfilesValue(value: string): StructuredProfileSelection | undefined {
  if (value === 'auto' || value === 'none') {
    return value;
  }
  const profiles = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return isStructuredProfileSelection(profiles)
    ? (profiles as StructuredMarkdownProfileId[])
    : undefined;
}

import {
  normalizeConfigLine,
  patternMatches,
  patternMatchesDirectory,
  toPosix,
  unescapePattern,
} from './patterns.js';

export interface MdfIgnoreRule {
  pattern: string;
  negated: boolean;
}

export function parseMdfIgnore(content: string): MdfIgnoreRule[] {
  const rules: MdfIgnoreRule[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = normalizeConfigLine(rawLine);
    if (line.length === 0) {
      continue;
    }
    const negated = line.startsWith('!');
    const pattern = unescapePattern(negated ? line.slice(1) : line);
    if (pattern.length > 0) {
      rules.push({ pattern, negated });
    }
  }
  return rules;
}

export function matchMdfIgnore(
  rules: readonly MdfIgnoreRule[],
  relativePath: string,
  initialIgnored = false,
): boolean {
  let ignored = initialIgnored;
  for (const rule of rules) {
    if (patternMatches(rule.pattern, toPosix(relativePath))) {
      ignored = !rule.negated;
    }
  }
  return ignored;
}

export function shouldPruneDirectoryByMdfIgnore(
  rules: readonly MdfIgnoreRule[],
  relativePath: string,
  initialIgnored = false,
): boolean {
  let ignored = initialIgnored;
  for (const rule of rules) {
    if (patternMatchesDirectory(rule.pattern, toPosix(relativePath))) {
      ignored = !rule.negated;
    }
  }
  return ignored;
}

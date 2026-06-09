type SegmentToken =
  | { kind: 'literal'; value: string }
  | { kind: 'any' }
  | { kind: 'star' }
  | {
      kind: 'class';
      negated: boolean;
      characters: readonly string[];
      ranges: readonly CharRange[];
    };

interface CharRange {
  start: string;
  end: string;
}

export function patternMatches(rawPattern: string, rawRelativePath: string): boolean {
  const pattern = normalizePattern(rawPattern);
  const relativePath = trimSlashes(toPosix(rawRelativePath));
  if (pattern.length === 0 || relativePath.length === 0) {
    return false;
  }

  const anchored = pattern.startsWith('/');
  const directoryOnly = pattern.endsWith('/');
  const normalizedPattern = trimSlashes(pattern);
  const candidatePattern = directoryOnly ? `${normalizedPattern}/**` : normalizedPattern;

  if (anchored || candidatePattern.includes('/')) {
    return globPatternMatches(candidatePattern, relativePath);
  }

  return relativePath
    .split('/')
    .some((segment) => wildcardSegmentMatches(candidatePattern, segment));
}

export function patternMatchesDirectory(rawPattern: string, rawRelativePath: string): boolean {
  const pattern = normalizePattern(rawPattern);
  const relativePath = trimSlashes(toPosix(rawRelativePath));
  if (pattern.length === 0 || relativePath.length === 0) {
    return false;
  }

  const anchored = pattern.startsWith('/');
  const directoryOnly = pattern.endsWith('/');
  const normalizedPattern = trimSlashes(pattern);
  if (!directoryOnly && normalizedPattern.endsWith('/**')) {
    return false;
  }
  if (!directoryOnly && normalizedPattern.endsWith('/*')) {
    return false;
  }

  if (anchored || normalizedPattern.includes('/')) {
    return globPatternMatches(normalizedPattern, relativePath);
  }

  return relativePath
    .split('/')
    .some((segment) => wildcardSegmentMatches(normalizedPattern, segment));
}

export function normalizeConfigLine(rawLine: string): string {
  const trimmedRight = rawLine.replace(/\s+$/u, '');
  if (/^\s*(#|$)/.test(trimmedRight)) {
    return '';
  }
  return trimmedRight.trimStart();
}

export function splitConfigTokens(line: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let escaped = false;
  for (const char of line) {
    if (escaped) {
      current += /[\s#!]/u.test(char) ? char : `\\${char}`;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (/\s/u.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += char;
  }
  if (escaped) {
    current += '\\';
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

export function unescapePattern(value: string): string {
  return value.replace(/\\([#! ])/g, '$1');
}

export function toPosix(value: string): string {
  return value.replace(/\\/g, '/');
}

function globPatternMatches(pattern: string, relativePath: string): boolean {
  const patternParts = trimSlashes(pattern).split('/');
  const pathParts = trimSlashes(relativePath).split('/');
  return globSegmentsMatch(patternParts, pathParts, 0, 0);
}

function globSegmentsMatch(
  patternParts: readonly string[],
  pathParts: readonly string[],
  patternIndex: number,
  pathIndex: number,
): boolean {
  if (patternIndex === patternParts.length) {
    return pathIndex === pathParts.length;
  }

  const patternPart = patternParts[patternIndex];
  if (patternPart === '**') {
    for (let nextPathIndex = pathIndex; nextPathIndex <= pathParts.length; nextPathIndex += 1) {
      if (globSegmentsMatch(patternParts, pathParts, patternIndex + 1, nextPathIndex)) {
        return true;
      }
    }
    return false;
  }

  return (
    pathIndex < pathParts.length &&
    wildcardSegmentMatches(patternPart, pathParts[pathIndex]) &&
    globSegmentsMatch(patternParts, pathParts, patternIndex + 1, pathIndex + 1)
  );
}

function wildcardSegmentMatches(pattern: string, value: string): boolean {
  return segmentTokensMatch(parseSegmentTokens(pattern), [...value], 0, 0, new Set());
}

function parseSegmentTokens(pattern: string): SegmentToken[] {
  const tokens: SegmentToken[] = [];
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === '\\') {
      index += 1;
      tokens.push({ kind: 'literal', value: pattern[index] ?? '\\' });
      continue;
    }
    if (char === '*') {
      tokens.push({ kind: 'star' });
      continue;
    }
    if (char === '?') {
      tokens.push({ kind: 'any' });
      continue;
    }
    if (char === '[') {
      const characterClass = parseCharacterClass(pattern, index);
      if (characterClass !== null) {
        tokens.push(characterClass.token);
        index = characterClass.end;
        continue;
      }
    }
    tokens.push({ kind: 'literal', value: char });
  }
  return tokens;
}

function parseCharacterClass(
  pattern: string,
  start: number,
): { token: SegmentToken; end: number } | null {
  let end = start + 1;
  if (pattern[end] === '!' || pattern[end] === '^') {
    end += 1;
  }
  if (pattern[end] === ']') {
    end += 1;
  }
  while (end < pattern.length && pattern[end] !== ']') {
    end += pattern[end] === '\\' ? 2 : 1;
  }
  if (end >= pattern.length) {
    return null;
  }

  const raw = pattern.slice(start + 1, end);
  if (raw.length === 0 || raw === '!' || raw === '^') {
    return null;
  }
  const negated = raw.startsWith('!') || raw.startsWith('^');
  const body = negated ? raw.slice(1) : raw;
  const parsed = parseCharacterClassBody(body);
  return {
    token: { kind: 'class', negated, characters: parsed.characters, ranges: parsed.ranges },
    end,
  };
}

function parseCharacterClassBody(body: string): {
  characters: readonly string[];
  ranges: readonly CharRange[];
} {
  const characters: string[] = [];
  const ranges: CharRange[] = [];
  const parts: string[] = [];

  for (let index = 0; index < body.length; index += 1) {
    if (body[index] === '\\' && index + 1 < body.length) {
      index += 1;
    }
    parts.push(body[index]);
  }

  for (let index = 0; index < parts.length; index += 1) {
    if (index + 2 < parts.length && parts[index + 1] === '-') {
      ranges.push({ start: parts[index], end: parts[index + 2] });
      index += 2;
    } else {
      characters.push(parts[index]);
    }
  }

  return { characters, ranges };
}

function segmentTokensMatch(
  tokens: readonly SegmentToken[],
  value: readonly string[],
  tokenIndex: number,
  valueIndex: number,
  seen: Set<string>,
): boolean {
  const key = `${tokenIndex}:${valueIndex}`;
  if (seen.has(key)) {
    return false;
  }
  seen.add(key);

  if (tokenIndex === tokens.length) {
    return valueIndex === value.length;
  }

  const token = tokens[tokenIndex];
  if (token.kind === 'star') {
    for (let nextValueIndex = valueIndex; nextValueIndex <= value.length; nextValueIndex += 1) {
      if (segmentTokensMatch(tokens, value, tokenIndex + 1, nextValueIndex, seen)) {
        return true;
      }
    }
    return false;
  }

  return (
    valueIndex < value.length &&
    segmentTokenMatches(token, value[valueIndex]) &&
    segmentTokensMatch(tokens, value, tokenIndex + 1, valueIndex + 1, seen)
  );
}

function segmentTokenMatches(token: SegmentToken, value: string): boolean {
  if (token.kind === 'literal') {
    return token.value === value;
  }
  if (token.kind === 'any') {
    return true;
  }
  if (token.kind === 'class') {
    const codePoint = value.codePointAt(0) ?? 0;
    const matched =
      token.characters.includes(value) ||
      token.ranges.some(
        (range) =>
          codePoint >= (range.start.codePointAt(0) ?? 0) &&
          codePoint <= (range.end.codePointAt(0) ?? 0),
      );
    return token.negated ? !matched : matched;
  }
  return false;
}

function normalizePattern(value: string): string {
  return unescapePattern(value.trim());
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

import type { Diagnostic, FoldingRange, Position, Range } from 'vscode-languageserver-types';
import type { OFMDoc, HeadingEntry } from '../parser/types.js';
import type { StructuredMarkdownProfileId } from './structured-profiles.js';

export interface StructuredProfileSymbol {
  name: string;
  range: Range;
  selectionRange: Range;
}

export function structuredProfileDiagnostics(doc: OFMDoc): Diagnostic[] {
  const profiles = activeProfiles(doc);
  const diagnostics: Diagnostic[] = [];

  if (profiles.includes('keep-a-changelog')) {
    diagnostics.push(...diagnoseKeepAChangelog(doc));
  }
  if (profiles.includes('common-changelog')) {
    diagnostics.push(...diagnoseCommonChangelog(doc));
  }
  if (profiles.includes('madr')) {
    diagnostics.push(...diagnoseMadr(doc));
  }

  return diagnostics;
}

export function structuredProfileSymbols(doc: OFMDoc): StructuredProfileSymbol[] {
  const profiles = activeProfiles(doc);
  const symbols: StructuredProfileSymbol[] = [];

  for (const heading of doc.index.headings) {
    if (profiles.includes('keep-a-changelog') && isChangelogHeading(heading)) {
      symbols.push({
        name: keepAChangelogSymbolName(heading),
        range: sectionRange(doc, heading),
        selectionRange: heading.range,
      });
    }
    if (profiles.includes('common-changelog') && isCommonChangelogHeading(heading)) {
      symbols.push({
        name: commonChangelogSymbolName(heading),
        range: sectionRange(doc, heading),
        selectionRange: heading.range,
      });
    }
    if (profiles.includes('madr') && isMadrHeading(heading)) {
      symbols.push({
        name: madrSymbolName(heading),
        range: sectionRange(doc, heading),
        selectionRange: heading.range,
      });
    }
  }

  return symbols;
}

export function structuredProfileFoldingRanges(doc: OFMDoc): FoldingRange[] {
  return structuredProfileSymbols(doc).map((symbol) => ({
    startLine: symbol.range.start.line,
    endLine: symbol.range.end.line,
    kind: 'region',
  }));
}

export function structuredProfileHover(doc: OFMDoc, position: Position): string | undefined {
  const profiles = activeProfiles(doc);
  const heading = doc.index.headings.find((candidate) => contains(candidate.range, position));
  if (heading === undefined) return undefined;

  if (profiles.includes('keep-a-changelog') && isChangelogHeading(heading)) {
    return keepAChangelogHover(heading);
  }
  if (profiles.includes('common-changelog') && isCommonChangelogHeading(heading)) {
    return commonChangelogHover(heading);
  }
  if (profiles.includes('madr') && isMadrHeading(heading)) {
    return madrHover(heading);
  }

  return undefined;
}

export function structuredProfileCompletions(
  doc: OFMDoc,
  text: string,
  position: Position,
): Array<{ label: string; insertText: string }> {
  const profiles = activeProfiles(doc);
  if (profiles.length === 0) return [];

  const line = text.split('\n')[position.line] ?? '';
  const prefix = line.slice(0, position.character);
  const headingMatch = /^[ \t]{0,3}(#{2,3})\s*([A-Za-z -]*)$/.exec(prefix);
  if (headingMatch === null) return [];

  const completions: Array<{ label: string; insertText: string }> = [];
  if (headingMatch[1] === '###') {
    if (profiles.includes('common-changelog')) {
      completions.push(
        ...matchingCompletions(
          ['Changed', 'Added', 'Removed', 'Fixed'],
          headingMatch[2],
          'Common Changelog',
        ),
      );
    }
    if (profiles.includes('keep-a-changelog')) {
      completions.push(
        ...matchingCompletions(
          ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'],
          headingMatch[2],
          'Keep a Changelog',
        ),
      );
    }
    if (profiles.includes('madr')) {
      completions.push(
        ...matchingCompletions(
          ['Consequences', 'Confirmation', 'Option title'],
          headingMatch[2],
          'MADR',
        ),
      );
    }
    return dedupeCompletions(completions);
  }

  if (headingMatch[1] === '##' && profiles.includes('madr')) {
    return matchingCompletions(
      [
        'Context and Problem Statement',
        'Decision Drivers',
        'Considered Options',
        'Decision Outcome',
        'Pros and Cons of the Options',
        'More Information',
      ],
      headingMatch[2],
      'MADR',
    );
  }

  return [];
}

function dedupeCompletions(
  completions: Array<{ label: string; insertText: string }>,
): Array<{ label: string; insertText: string }> {
  return [...new Map(completions.map((item) => [item.label, item])).values()];
}

function matchingCompletions(
  values: readonly string[],
  partial: string,
  labelPrefix: string,
): Array<{ label: string; insertText: string }> {
  const normalized = partial.trimStart().toLowerCase();
  return values
    .filter((value) => normalized === '' || value.toLowerCase().startsWith(normalized))
    .map((value) => ({
      label: `${labelPrefix} ${value}`,
      insertText: value,
    }));
}

function diagnoseKeepAChangelog(doc: OFMDoc): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const first = firstHeading(doc);
  if (first?.level !== 1 || first.text !== 'Changelog') {
    diagnostics.push(warning(doc, 'FG901', 'Keep a Changelog files must start with # Changelog.'));
  }

  const headings = doc.index.headings.map((heading) => heading.text);
  const hasUnreleased = headings.includes('Unreleased');
  const hasRelease = doc.index.headings.some(
    (heading) =>
      heading.level === 2 && /^\[\d+\.\d+\.\d+[^\]]*\]\s+-\s+\d{4}-\d{2}-\d{2}$/.test(heading.text),
  );
  if (!hasUnreleased && !hasRelease) {
    diagnostics.push(
      warning(doc, 'FG901', 'Keep a Changelog needs an Unreleased section or dated release.'),
    );
  }

  const categoryCount = countHeadings(doc, [
    'Added',
    'Changed',
    'Deprecated',
    'Removed',
    'Fixed',
    'Security',
  ]);
  if (categoryCount < 2) {
    diagnostics.push(
      warning(doc, 'FG901', 'Keep a Changelog needs at least two recognized change categories.'),
    );
  }

  return diagnostics;
}

function diagnoseCommonChangelog(doc: OFMDoc): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const first = firstHeading(doc);
  if (first?.level !== 1 || first.text !== 'Changelog') {
    diagnostics.push(warning(doc, 'FG902', 'Common Changelog files must start with # Changelog.'));
  }

  for (const heading of doc.index.headings) {
    if (heading.level === 2 && /^Unreleased$/i.test(heading.text)) {
      diagnostics.push(
        warningAt(heading.range, 'FG902', 'Common Changelog does not use Unreleased sections.'),
      );
    }
    if (heading.level === 3 && (heading.text === 'Deprecated' || heading.text === 'Security')) {
      diagnostics.push(
        warningAt(
          heading.range,
          'FG902',
          `Common Changelog does not define a ${heading.text} category.`,
        ),
      );
    }
  }

  const releases = doc.index.headings.filter(
    (heading) =>
      heading.level === 2 &&
      /^\[?\d+\.\d+\.\d+[^\]\n]*\]?\s+-\s+\d{4}-\d{2}-\d{2}$/.test(heading.text),
  );
  if (releases.length === 0) {
    diagnostics.push(
      warning(doc, 'FG902', 'Common Changelog needs dated SemVer release headings.'),
    );
  }

  for (const release of releases) {
    const categories = childHeadings(doc, release, 3).map((heading) => heading.text);
    if (!sameList(categories, ['Changed', 'Added', 'Removed', 'Fixed'])) {
      diagnostics.push(
        warningAt(
          release.range,
          'FG902',
          'Common Changelog release categories must be Changed, Added, Removed, Fixed in order.',
        ),
      );
    }
  }

  for (const line of commonChangelogEntryLines(doc, releases)) {
    if (/^[ \t]*[-*+][ \t]+/.test(line.text) && !/\(\[[^\]]+\]\([^)]+\)\)/.test(line.text)) {
      diagnostics.push(
        warningAt(
          line.range,
          'FG902',
          'Common Changelog entries need parenthesized Markdown links.',
        ),
      );
    }
  }

  return diagnostics;
}

function diagnoseMadr(doc: OFMDoc): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const required = ['Context and Problem Statement', 'Considered Options', 'Decision Outcome'];
  const h2 = new Set(
    doc.index.headings.filter((heading) => heading.level === 2).map((h) => h.text),
  );
  for (const heading of required) {
    if (!h2.has(heading)) {
      diagnostics.push(warning(doc, 'FG903', `MADR is missing "${heading}".`));
    }
  }

  if (!hasMadrMetadata(doc)) {
    diagnostics.push(
      warning(
        doc,
        'FG903',
        'MADR frontmatter should include decision metadata such as status/date.',
      ),
    );
  }

  if (!/\b(Good|Neutral|Bad), because\b/.test(doc.text)) {
    diagnostics.push(
      warning(
        doc,
        'FG903',
        'MADR option analysis should include Good/Neutral/Bad because entries.',
      ),
    );
  }

  return diagnostics;
}

function activeProfiles(doc: OFMDoc): readonly StructuredMarkdownProfileId[] {
  return doc.parseContext?.structuredProfiles ?? [];
}

function firstHeading(doc: OFMDoc): HeadingEntry | undefined {
  return [...doc.index.headings].sort((a, b) => a.range.start.line - b.range.start.line)[0];
}

function countHeadings(doc: OFMDoc, names: readonly string[]): number {
  const set = new Set(names);
  return doc.index.headings.filter((heading) => heading.level === 3 && set.has(heading.text))
    .length;
}

function childHeadings(doc: OFMDoc, parent: HeadingEntry, level: number): HeadingEntry[] {
  const headings = [...doc.index.headings].sort((a, b) => a.range.start.line - b.range.start.line);
  const parentIndex = headings.indexOf(parent);
  const children: HeadingEntry[] = [];
  for (const heading of headings.slice(parentIndex + 1)) {
    if (heading.level <= parent.level) break;
    if (heading.level === level) children.push(heading);
  }
  return children;
}

function isChangelogHeading(heading: HeadingEntry): boolean {
  return heading.level === 2 || heading.level === 3;
}

function isCommonChangelogHeading(heading: HeadingEntry): boolean {
  return (
    heading.level === 2 ||
    (heading.level === 3 && ['Changed', 'Added', 'Removed', 'Fixed'].includes(heading.text))
  );
}

function isMadrHeading(heading: HeadingEntry): boolean {
  return heading.level === 2 || heading.level === 3;
}

function keepAChangelogSymbolName(heading: HeadingEntry): string {
  return heading.level === 2
    ? `Keep a Changelog release: ${heading.text}`
    : `Keep a Changelog group: ${heading.text}`;
}

function commonChangelogSymbolName(heading: HeadingEntry): string {
  return heading.level === 2
    ? `Common Changelog release: ${heading.text}`
    : `Common Changelog group: ${heading.text}`;
}

function madrSymbolName(heading: HeadingEntry): string {
  return heading.level === 2 ? `MADR section: ${heading.text}` : `MADR option: ${heading.text}`;
}

function keepAChangelogHover(heading: HeadingEntry): string {
  return heading.level === 2
    ? 'Keep a Changelog release section. Use [Unreleased] or [VERSION] - YYYY-MM-DD.'
    : 'Keep a Changelog change category. Standard categories include Added, Changed, Deprecated, Removed, Fixed, and Security.';
}

function commonChangelogHover(heading: HeadingEntry): string {
  return heading.level === 2
    ? 'Common Changelog release section. Use VERSION - YYYY-MM-DD and ordered groups.'
    : 'Common Changelog group. Required order is Changed, Added, Removed, Fixed.';
}

function madrHover(heading: HeadingEntry): string {
  return heading.level === 2
    ? 'MADR decision-record section.'
    : 'MADR option or validation subsection.';
}

function sectionRange(doc: OFMDoc, heading: HeadingEntry): Range {
  const headings = [...doc.index.headings].sort((a, b) => a.range.start.line - b.range.start.line);
  const index = headings.indexOf(heading);
  const next = headings.slice(index + 1).find((candidate) => candidate.level <= heading.level);
  const endLine = next === undefined ? lineCount(doc.text) - 1 : next.range.start.line - 1;
  return {
    start: heading.range.start,
    end: {
      line: Math.max(heading.range.start.line, endLine),
      character: lineLength(doc.text, endLine),
    },
  };
}

function warning(doc: OFMDoc, code: 'FG901' | 'FG902' | 'FG903', message: string): Diagnostic {
  return warningAt(firstHeading(doc)?.range ?? zeroRange(), code, message);
}

function warningAt(range: Range, code: 'FG901' | 'FG902' | 'FG903', message: string): Diagnostic {
  return { range, severity: 2, code, source: 'flavor-grenade', message };
}

function zeroRange(): Range {
  return { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
}

function lineEntries(text: string): Array<{ text: string; range: Range }> {
  return text.split('\n').map((line, index) => ({
    text: line.replace(/\r$/, ''),
    range: { start: { line: index, character: 0 }, end: { line: index, character: line.length } },
  }));
}

function commonChangelogEntryLines(
  doc: OFMDoc,
  releases: readonly HeadingEntry[],
): Array<{ text: string; range: Range }> {
  const lines = lineEntries(doc.text);
  const entries: Array<{ text: string; range: Range }> = [];
  for (const release of releases) {
    for (const category of childHeadings(doc, release, 3)) {
      if (!['Changed', 'Added', 'Removed', 'Fixed'].includes(category.text)) continue;
      const next = nextHeadingAfter(doc, category);
      const endLine = next?.range.start.line ?? lines.length;
      entries.push(
        ...lines.slice(category.range.start.line + 1, endLine).filter((line) => line.text.trim()),
      );
    }
  }
  return entries;
}

function nextHeadingAfter(doc: OFMDoc, heading: HeadingEntry): HeadingEntry | undefined {
  return [...doc.index.headings]
    .sort((a, b) => a.range.start.line - b.range.start.line)
    .find(
      (candidate) =>
        candidate.range.start.line > heading.range.start.line && candidate.level <= heading.level,
    );
}

function lineCount(text: string): number {
  return Math.max(1, text.split(/\r?\n/).length);
}

function lineLength(text: string, line: number): number {
  return text.split(/\r?\n/)[line]?.length ?? 0;
}

function hasMadrMetadata(doc: OFMDoc): boolean {
  const frontmatter = doc.frontmatter ?? {};
  return ['status', 'date', 'decision-makers', 'consulted', 'informed'].some((key) =>
    Object.prototype.hasOwnProperty.call(frontmatter, key),
  );
}

function sameList(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function contains(range: Range, position: Position): boolean {
  if (position.line < range.start.line || position.line > range.end.line) return false;
  if (position.line === range.start.line && position.character < range.start.character)
    return false;
  if (position.line === range.end.line && position.character > range.end.character) return false;
  return true;
}

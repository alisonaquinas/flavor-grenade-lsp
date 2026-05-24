import { describe, expect, it } from '@jest/globals';
import { OFMParser } from '../parser/ofm-parser.js';
import { resolveMarkdownFlavor } from '../../extension/src/markdown-flavor.js';
import { inferStructuredProfiles } from './structured-profiles.js';
import {
  structuredProfileCompletions,
  structuredProfileDiagnostics,
  structuredProfileFoldingRanges,
  structuredProfileHover,
  structuredProfileSymbols,
} from './structured-profile-analysis.js';

const parser = new OFMParser();

describe('structured profile analysis', () => {
  it('keeps server and extension structured-profile inference aligned', () => {
    const cases = [
      {
        uri: 'file:///vault/CHANGELOG.md',
        syntaxText: [
          '# Changelog',
          '',
          '## [Unreleased]',
          '',
          '### Added',
          '',
          '- Work',
          '',
          '### Fixed',
          '',
          '- Bug',
        ].join('\n'),
      },
      {
        uri: 'file:///vault/CHANGELOG.md',
        syntaxText: [
          '# Changelog',
          '',
          '## 1.0.0 - 2026-05-23',
          '',
          '### Changed',
          '',
          '- API: changed behavior ([#1](https://example.com/1)).',
          '',
          '### Added',
          '',
          '- CLI: added feature ([#2](https://example.com/2)).',
          '',
          '### Removed',
          '',
          '- UI: removed old flag ([#3](https://example.com/3)).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed bug ([#4](https://example.com/4)).',
        ].join('\n'),
      },
      {
        uri: 'file:///vault/docs/decisions/0001-use-adrs.md',
        syntaxText: [
          '---',
          'status: accepted',
          '---',
          '# Use ADRs',
          '',
          '## Context and Problem Statement',
          '',
          '## Considered Options',
          '',
          '## Decision Outcome',
        ].join('\n'),
      },
    ];

    for (const testCase of cases) {
      const extensionResolution = resolveMarkdownFlavor({
        document: {
          uri: { scheme: 'file', toString: () => testCase.uri },
          languageId: 'markdown',
        },
        selected: 'gfm',
        structuredProfileSelection: 'auto',
        syntaxText: testCase.syntaxText,
      });
      expect(extensionResolution.kind).toBe('active');
      if (extensionResolution.kind !== 'active') continue;
      expect(extensionResolution.structuredProfiles).toEqual(inferStructuredProfiles(testCase));
    }
  });

  it('does not infer changelog profiles when Changelog is not the first heading', () => {
    expect(
      inferStructuredProfiles({
        uri: 'file:///vault/CHANGELOG.md',
        syntaxText: [
          '# Release Notes',
          '',
          '# Changelog',
          '',
          '## [Unreleased]',
          '',
          '### Added',
          '',
          '- Work',
          '',
          '### Fixed',
          '',
          '- Bug',
        ].join('\n'),
      }),
    ).toEqual([]);
  });

  it('does not infer changelog profiles when Changelog is not an H1', () => {
    expect(
      inferStructuredProfiles({
        uri: 'file:///vault/CHANGELOG.md',
        syntaxText: [
          '## Changelog',
          '',
          '## [Unreleased]',
          '',
          '### Added',
          '',
          '- Work',
          '',
          '### Fixed',
          '',
          '- Bug',
        ].join('\n'),
      }),
    ).toEqual([]);
  });

  it('emits profile diagnostics only when a structured profile is active', () => {
    const text = ['# Release Notes', '', '## [Unreleased]', '', '### Added', '', '- Work'].join(
      '\n',
    );
    const inactive = parser.parse('file:///vault/CHANGELOG.md', text, 1, {
      effectiveFlavor: 'gfm',
    });
    const active = parser.parse('file:///vault/CHANGELOG.md', text, 1, {
      effectiveFlavor: 'gfm',
      structuredProfiles: ['keep-a-changelog'],
    });

    expect(structuredProfileDiagnostics(inactive)).toEqual([]);
    expect(structuredProfileDiagnostics(active).map((diag) => diag.code)).toContain('FG901');
  });

  it('adds changelog symbols, folds, hovers, and category completions', () => {
    const text = [
      '# Changelog',
      '',
      '## [Unreleased]',
      '',
      '### Added',
      '',
      '- Work',
      '',
      '### Fixed',
      '',
      '- Bug',
    ].join('\n');
    const doc = parser.parse('file:///vault/CHANGELOG.md', text, 1, {
      effectiveFlavor: 'gfm',
      structuredProfiles: ['keep-a-changelog'],
    });

    expect(structuredProfileSymbols(doc).map((symbol) => symbol.name)).toContain(
      'Keep a Changelog release: [Unreleased]',
    );
    expect(structuredProfileFoldingRanges(doc)).toContainEqual({
      startLine: 2,
      endLine: 10,
      kind: 'region',
    });
    expect(structuredProfileHover(doc, { line: 4, character: 4 })).toContain(
      'Keep a Changelog change category',
    );
    expect(
      structuredProfileCompletions(doc, ['# Changelog', '', '### '].join('\n'), {
        line: 2,
        character: 4,
      }).map((item) => item.insertText),
    ).toContain('Security');
    expect(
      structuredProfileCompletions(doc, ['# Changelog', '', '### Sec'].join('\n'), {
        line: 2,
        character: 7,
      }).map((item) => item.insertText),
    ).toEqual(['Security']);
  });

  it('combines compatible structured profile completions', () => {
    const doc = parser.parse('file:///vault/docs/decisions/0001-release-policy.md', '# Doc\n', 1, {
      effectiveFlavor: 'gfm',
      structuredProfiles: ['keep-a-changelog', 'madr'],
    });

    const labels = structuredProfileCompletions(doc, '### ', {
      line: 0,
      character: 4,
    }).map((item) => item.label);

    expect(labels).toContain('Keep a Changelog Security');
    expect(labels).toContain('MADR Consequences');
  });

  it('checks Common Changelog release order and linked references', () => {
    const text = [
      '# Changelog',
      '',
      '## 1.0.0 - 2026-05-23',
      '',
      '### Added',
      '',
      '- Add thing',
    ].join('\n');
    const doc = parser.parse('file:///vault/CHANGELOG.md', text, 1, {
      effectiveFlavor: 'gfm',
      structuredProfiles: ['common-changelog'],
    });

    const messages = structuredProfileDiagnostics(doc).map((diag) => diag.message);
    expect(messages).toContain(
      'Common Changelog release categories must be Changed, Added, Removed, Fixed in order.',
    );
    expect(messages).toContain('Common Changelog entries need parenthesized Markdown links.');
  });

  it('adds MADR structure surfaces', () => {
    const text = [
      '---',
      'status: accepted',
      'date: 2026-05-23',
      '---',
      '# Use ADRs',
      '',
      '## Context and Problem Statement',
      '',
      '## Considered Options',
      '',
      '### MADR',
      '',
      '* Good, because it is structured.',
      '',
      '## Decision Outcome',
    ].join('\n');
    const doc = parser.parse('file:///vault/docs/decisions/0001-use-adrs.md', text, 1, {
      effectiveFlavor: 'obsidian',
      structuredProfiles: ['madr'],
    });

    expect(structuredProfileDiagnostics(doc)).toEqual([]);
    expect(structuredProfileSymbols(doc).map((symbol) => symbol.name)).toContain(
      'MADR option: MADR',
    );
    expect(structuredProfileHover(doc, { line: 6, character: 3 })).toBe(
      'MADR decision-record section.',
    );
    expect(
      structuredProfileCompletions(doc, ['# Use ADRs', '', '## '].join('\n'), {
        line: 2,
        character: 3,
      }).map((item) => item.insertText),
    ).toContain('Decision Outcome');
  });
});

import { describe, expect, it } from '@jest/globals';
import { inferStructuredProfiles, resolveStructuredProfiles } from '../src/index.js';

describe('structured profile inference', () => {
  it('infers Keep a Changelog from filename and release headings', () => {
    expect(
      inferStructuredProfiles({
        path: '/repo/CHANGELOG.md',
        syntaxText: [
          '# Changelog',
          '',
          '## [Unreleased]',
          '',
          '### Added',
          '',
          '### Fixed',
          '',
        ].join('\n'),
      }),
    ).toEqual(['keep-a-changelog']);
  });

  it('infers MADR from decision path and structure', () => {
    expect(
      inferStructuredProfiles({
        path: '/repo/docs/decisions/0001-use-context.md',
        syntaxText: [
          '---',
          'status: accepted',
          '---',
          '',
          '## Context and Problem Statement',
          '',
          '## Considered Options',
          '',
          '## Decision Outcome',
        ].join('\n'),
      }),
    ).toEqual(['madr']);
  });

  it('prefers explicit and .fgattributes selections over inference', () => {
    expect(
      resolveStructuredProfiles({
        selection: ['common-changelog'],
        fgAttributesSelection: ['madr'],
        path: '/repo/CHANGELOG.md',
        syntaxText: '# Changelog\n\n## [Unreleased]\n\n### Added\n\n### Fixed',
      }),
    ).toEqual({
      structuredProfiles: ['common-changelog'],
      structuredProfileSource: 'explicit-selection',
    });
  });
});

import { describe, expect, it } from '@jest/globals';
import { resolveMarkdownFlavor } from '../src/index.js';

describe('resolveMarkdownFlavor', () => {
  it('uses explicit .mdfattributes flavor before auto-detect evidence', () => {
    expect(
      resolveMarkdownFlavor({
        path: '/vault/note.md',
        languageId: 'markdown',
        hasObsidianMarker: true,
        mdfAttributes: { flavor: 'gfm' },
        syntaxText: '[[Target]]',
      }),
    ).toMatchObject({
      kind: 'active',
      selected: 'gfm',
      effective: 'gfm',
      source: 'mdfattributes',
    });
  });

  it('auto-detects Obsidian markers and strong syntax evidence', () => {
    expect(
      resolveMarkdownFlavor({
        path: '/vault/note.md',
        languageId: 'markdown',
        hasObsidianMarker: true,
        mdfAttributes: { flavor: 'auto' },
        syntaxText: '# Note',
      }),
    ).toMatchObject({
      kind: 'active',
      effective: 'obsidian',
      source: 'obsidian-marker',
    });

    expect(
      resolveMarkdownFlavor({
        path: '/workspace/readme.md',
        languageId: 'markdown',
        syntaxText: "import Chart from './Chart'\n\n<Chart />",
      }),
    ).toMatchObject({
      kind: 'active',
      effective: 'mdx',
      source: 'syntax-inference',
    });
  });

  it('returns inactive results for non-Markdown and ignored files', () => {
    expect(
      resolveMarkdownFlavor({
        path: '/vault/note.txt',
        languageId: 'plaintext',
      }),
    ).toEqual({ kind: 'inactive', reason: 'non-markdown-language' });

    expect(
      resolveMarkdownFlavor({
        path: '/vault/generated.md',
        languageId: 'markdown',
        ignored: true,
      }),
    ).toEqual({ kind: 'inactive', reason: 'mdfignore' });
  });

  it('layers structured profiles independently from base flavor', () => {
    expect(
      resolveMarkdownFlavor({
        path: '/vault/docs/decisions/0001-use-context.md',
        languageId: 'markdown',
        mdfAttributes: {
          flavor: 'gfm',
          structuredProfiles: ['madr'],
        },
        syntaxText: '## Context and Problem Statement\n\n## Decision Outcome',
      }),
    ).toMatchObject({
      kind: 'active',
      effective: 'gfm',
      structuredProfiles: ['madr'],
      structuredProfileSource: 'mdfattributes',
    });
  });

  it('supports the documented top-level .mdfattributes consumer fields', () => {
    expect(
      resolveMarkdownFlavor({
        path: '/vault/CHANGELOG.md',
        mdfAttributesFlavor: 'gfm',
        mdfAttributesStructuredProfiles: ['keep-a-changelog'],
        syntaxText: '# Changelog\n\n## [Unreleased]\n\n### Added\n\n### Fixed\n',
      }),
    ).toMatchObject({
      kind: 'active',
      selected: 'gfm',
      effective: 'gfm',
      structuredProfiles: ['keep-a-changelog'],
      structuredProfileSource: 'mdfattributes',
    });
  });
});

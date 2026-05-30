import { describe, expect, it } from '@jest/globals';
import { MarkdownFlavorState } from '../markdown-flavor-state.js';

describe('MarkdownFlavorState', () => {
  it('uses concrete .fgattributes flavor before Auto Detect evidence', () => {
    const state = new MarkdownFlavorState();

    const result = state.resolveForDocument({
      uri: 'file:///vault/note.md',
      languageId: 'markdown',
      hasObsidianMarker: true,
      fgAttributesFlavor: 'gfm',
      syntaxText: '[[Target]]',
    });

    expect(result).toMatchObject({
      kind: 'active',
      selected: 'gfm',
      effective: 'gfm',
      source: 'fgattributes',
    });
  });

  it('runs Auto Detect when .fgattributes requests auto or has no flavor', () => {
    const state = new MarkdownFlavorState();

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/note.md',
        languageId: 'markdown',
        hasObsidianMarker: true,
        fgAttributesFlavor: 'auto',
        syntaxText: '# Note',
      }),
    ).toMatchObject({
      kind: 'active',
      effective: 'obsidian',
      source: 'obsidian-marker',
    });

    expect(
      state.resolveForDocument({
        uri: 'file:///workspace/readme.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: "import Chart from './Chart'\n\n<Chart />",
      }),
    ).toMatchObject({
      kind: 'active',
      effective: 'mdx',
      source: 'syntax-inference',
    });
  });

  it('layers .fgattributes structured profiles independently from base flavor', () => {
    const state = new MarkdownFlavorState();

    const result = state.resolveForDocument({
      uri: 'file:///vault/docs/decisions/0001-use-context.md',
      languageId: 'markdown',
      hasObsidianMarker: false,
      fgAttributesFlavor: 'gfm',
      fgAttributesStructuredProfiles: ['madr'],
      syntaxText: '## Context and Problem Statement\n\n## Decision Outcome',
    });

    expect(result).toMatchObject({
      kind: 'active',
      effective: 'gfm',
      structuredProfiles: ['madr'],
      structuredProfileSource: 'fgattributes',
    });
  });
});

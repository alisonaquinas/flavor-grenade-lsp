import { describe, it, expect } from '@jest/globals';
import { classifyMarkdownTarget } from '../markdown-target-classifier.js';
import type { DocId } from '../../vault/doc-id.js';

describe('classifyMarkdownTarget', () => {
  it('classifies relative Markdown files against the source document folder', () => {
    const result = classifyMarkdownTarget('alpha.md', {
      sourceDocId: 'notes/mixed-links' as DocId,
    });

    expect(result).toEqual({
      kind: 'local-document',
      rawTarget: 'alpha.md',
      path: 'notes/alpha',
    });
  });

  it('normalizes dot segments and strips .md extensions', () => {
    const result = classifyMarkdownTarget('../archive/./alpha.md#Overview', {
      sourceDocId: 'notes/current/mixed-links' as DocId,
    });

    expect(result).toEqual({
      kind: 'local-document',
      rawTarget: '../archive/./alpha.md#Overview',
      path: 'notes/archive/alpha',
      fragment: 'Overview',
    });
  });

  it('rejects paths that escape above the vault root', () => {
    expect(
      classifyMarkdownTarget('../../secret.md', {
        sourceDocId: 'notes/current/source' as DocId,
      }),
    ).toEqual({
      kind: 'path-outside-vault',
      rawTarget: '../../secret.md',
    });
  });

  it('classifies same-document fragments', () => {
    expect(classifyMarkdownTarget('#Overview', { sourceDocId: 'notes/alpha' as DocId })).toEqual({
      kind: 'same-document-fragment',
      rawTarget: '#Overview',
      fragment: 'Overview',
    });
  });

  it('classifies local attachments separately from local Markdown documents', () => {
    expect(
      classifyMarkdownTarget('assets/diagram.png', {
        sourceDocId: 'notes/mixed-links' as DocId,
        isImage: true,
      }),
    ).toEqual({
      kind: 'local-attachment',
      rawTarget: 'assets/diagram.png',
      path: 'notes/assets/diagram.png',
    });
  });

  it('suppresses known external URL schemes', () => {
    expect(classifyMarkdownTarget('https://example.com/page')).toEqual({
      kind: 'external-url',
      rawTarget: 'https://example.com/page',
      scheme: 'https',
    });
    expect(classifyMarkdownTarget('mailto:team@example.com')).toEqual({
      kind: 'external-url',
      rawTarget: 'mailto:team@example.com',
      scheme: 'mailto',
    });
  });

  it('classifies unsupported schemes as non-vault targets', () => {
    expect(classifyMarkdownTarget('obsidian://open?vault=demo')).toEqual({
      kind: 'unsupported-scheme',
      rawTarget: 'obsidian://open?vault=demo',
      scheme: 'obsidian',
    });
  });
});

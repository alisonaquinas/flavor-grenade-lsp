import { describe, expect, it, jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { OFMParser } from '../../../parser/ofm-parser.js';
import { ParseCache } from '../../../parser/parser.module.js';
import { MARKDOWN_FLAVOR_IDS } from '../../../markdown-flavor/index.js';
import { MarkdownFlavorState } from '../../../markdown-flavor/markdown-flavor-state.js';
import { classifyMarkdownBoundaryReference } from '../../../markdown-flavor/non-local-boundary-classifier.js';
import { ProjectMarkdownFlavorConfig } from '../../../markdown-flavor/project-markdown-flavor-config.js';
import { DocumentStore } from '../../services/document-store.js';
import { ConfigurationHandler } from '../configuration.handler.js';

describe('workspace/didChangeConfiguration markdown flavor handling', () => {
  it('accepts every required selector id and rejects unsupported ids without mutation', async () => {
    const harness = createHarness();

    for (const flavorId of MARKDOWN_FLAVOR_IDS) {
      await harness.handler.handle({
        settings: { flavorGrenade: { markdownFlavor: flavorId } },
      });
      expect(harness.state.snapshot().selection).toBe(flavorId);
    }

    await harness.handler.handle({
      settings: { flavorGrenade: { markdownFlavor: 'asciidoc' } },
    });

    expect(harness.state.snapshot().selection).toBe('stack-overflow');
  });

  it('rejects malformed resource maps, non-file keys, stale resources, and auto as effective flavor', async () => {
    const harness = createHarness();
    harness.store.open('file:///vault/open.md', 'markdown', 1, '# Open');

    await harness.handler.handle({
      settings: {
        flavorGrenade: {
          markdownFlavor: 'gfm',
          markdownFlavorResources: {
            'file:///vault/open.md': {
              selected: 'gfm',
              effective: 'gfm',
              source: 'workspace-setting',
            },
          },
        },
      },
    });

    expect(harness.state.effectiveFlavorForUri('file:///vault/open.md')).toBe('gfm');

    const invalidPayloads = [
      {
        'file:///vault/open.md': {
          selected: 'auto',
          effective: 'auto',
          source: 'workspace-setting',
        },
      },
      { 'untitled:open.md': { selected: 'gfm', effective: 'gfm', source: 'workspace-setting' } },
      {
        'file:///vault/stale.md': {
          selected: 'gfm',
          effective: 'gfm',
          source: 'workspace-setting',
        },
      },
      {
        'file:///vault/open.md': {
          selected: 'asciidoc',
          effective: 'gfm',
          source: 'workspace-setting',
        },
      },
    ];

    for (const resources of invalidPayloads) {
      await harness.handler.handle({
        settings: { flavorGrenade: { markdownFlavorResources: resources } },
      });
      expect(harness.state.effectiveFlavorForUri('file:///vault/open.md')).toBe('gfm');
    }
  });

  it('resolves auto to CommonMark for generic Markdown and Obsidian for vault evidence', () => {
    const state = new MarkdownFlavorState();

    expect(
      state.resolveForDocument({
        uri: 'file:///notes/generic.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
      }),
    ).toMatchObject({ kind: 'active', effective: 'commonmark' });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/note.md',
        languageId: 'markdown',
        hasObsidianMarker: true,
      }),
    ).toMatchObject({ kind: 'active', effective: 'obsidian' });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/component.mdx',
        languageId: 'mdx',
        hasObsidianMarker: true,
      }),
    ).toEqual({ kind: 'inactive', reason: 'non-markdown-language' });
  });

  it('uses confined project TOML flavor evidence and ignores unsafe project config', () => {
    const root = createTempRoot();
    try {
      const config = new ProjectMarkdownFlavorConfig();
      fs.writeFileSync(path.join(root, '.flavor-grenade.toml'), 'core.markdown.flavor = "gfm"\n');

      expect(config.resolveFlavor(root)).toBe('gfm');

      fs.writeFileSync(
        path.join(root, '.flavor-grenade.toml'),
        'core.markdown.flavor = "asciidoc"\n',
      );
      expect(config.resolveFlavor(root)).toBeUndefined();

      fs.writeFileSync(
        path.join(root, '.flavor-grenade.toml'),
        '[__proto__]\ncore.markdown.flavor = "obsidian"\n',
      );
      expect(config.resolveFlavor(root)).toBeUndefined();

      fs.writeFileSync(path.join(root, '.flavor-grenade.toml'), 'x'.repeat(8193));
      expect(config.resolveFlavor(root)).toBeUndefined();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('reparses open Markdown documents after accepted flavor changes only', async () => {
    const harness = createHarness();
    harness.store.open('file:///vault/open.md', 'markdown', 1, '[[Target]]\n# Heading');

    await harness.handler.handle({
      settings: { flavorGrenade: { markdownFlavor: 'commonmark' } },
    });

    expect(harness.parseCache.get('file:///vault/open.md')?.markdownFlavor).toBe('commonmark');
    expect(harness.parseCache.get('file:///vault/open.md')?.index.wikiLinks).toHaveLength(0);
    expect(harness.publishDiagnostics).toHaveBeenCalledTimes(1);

    await harness.handler.handle({
      settings: { flavorGrenade: { markdownFlavor: 'asciidoc' } },
    });

    expect(harness.parseCache.get('file:///vault/open.md')?.markdownFlavor).toBe('commonmark');
    expect(harness.publishDiagnostics).toHaveBeenCalledTimes(1);
  });
});

describe('markdown flavor parser context and boundary classification', () => {
  it('suppresses Obsidian-only tokens outside the Obsidian profile', () => {
    const parser = new OFMParser();
    const text = '[[Target]]\n![[Embed]]\n#tag\n> [!NOTE]\n^block\n';

    const commonmark = parser.parse('file:///vault/note.md', text, 1, {
      effectiveFlavor: 'commonmark',
    });
    expect(commonmark.markdownFlavor).toBe('commonmark');
    expect(commonmark.index.wikiLinks).toEqual([]);
    expect(commonmark.index.embeds).toEqual([]);
    expect(commonmark.index.tags).toEqual([]);
    expect(commonmark.index.callouts).toEqual([]);
    expect(commonmark.index.blockAnchors).toEqual([]);

    const obsidian = parser.parse('file:///vault/note.md', text, 2, {
      effectiveFlavor: 'obsidian',
    });
    expect(obsidian.index.wikiLinks).toHaveLength(1);
    expect(obsidian.index.embeds).toHaveLength(1);
    expect(obsidian.index.tags).toHaveLength(1);
    expect(obsidian.index.callouts).toHaveLength(1);
    expect(obsidian.index.blockAnchors).toHaveLength(1);
  });

  it('classifies non-local host, conversion, MDX, and execution boundaries without side effects', () => {
    expect(classifyMarkdownBoundaryReference('gfm', '#123')).toMatchObject({
      disposition: 'non-local-host',
    });
    expect(classifyMarkdownBoundaryReference('pandoc', '[@doe2020]')).toMatchObject({
      disposition: 'bibliography-bound',
    });
    expect(classifyMarkdownBoundaryReference('mdx', '<Component />')).toMatchObject({
      disposition: 'renderer-bound',
    });
    expect(classifyMarkdownBoundaryReference('r-markdown', '```{r setup}')).toMatchObject({
      disposition: 'execution-bound',
    });
    expect(classifyMarkdownBoundaryReference('commonmark', '[local](note.md)')).toMatchObject({
      disposition: 'local',
    });
  });
});

function createHarness(): {
  store: DocumentStore;
  parseCache: ParseCache;
  state: MarkdownFlavorState;
  handler: ConfigurationHandler;
  publishDiagnostics: jest.Mock;
} {
  const store = new DocumentStore();
  const parseCache = new ParseCache();
  const state = new MarkdownFlavorState();
  const publishDiagnostics = jest.fn();
  const diagnosticService = { publishDiagnostics };
  const vaultDetector = {
    detectFresh: (_path: string): { mode: 'obsidian'; vaultRoot: string } => ({
      mode: 'obsidian',
      vaultRoot: '/vault',
    }),
  };

  return {
    store,
    parseCache,
    state,
    publishDiagnostics,
    handler: new ConfigurationHandler(
      state,
      store,
      new OFMParser(),
      parseCache,
      vaultDetector,
      diagnosticService,
    ),
  };
}

function createTempRoot(): string {
  const base = path.join(process.cwd(), 'tmp');
  fs.mkdirSync(base, { recursive: true });
  return fs.mkdtempSync(path.join(base, 'phase-20-unit-'));
}

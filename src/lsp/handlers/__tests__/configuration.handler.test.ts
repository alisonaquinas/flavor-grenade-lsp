import { describe, expect, it, jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { OFMParser } from '../../../parser/ofm-parser.js';
import { ParseCache } from '../../../parser/parser.module.js';
import {
  MARKDOWN_FLAVOR_IDS,
  STRUCTURED_MARKDOWN_PROFILE_IDS,
  isMarkdownFlavorId,
} from '../../../markdown-flavor/index.js';
import { MarkdownFlavorState } from '../../../markdown-flavor/markdown-flavor-state.js';
import { classifyMarkdownBoundaryReference } from '../../../markdown-flavor/non-local-boundary-classifier.js';
import { ProjectMarkdownFlavorConfig } from '../../../markdown-flavor/project-markdown-flavor-config.js';
import { DocumentStore } from '../../services/document-store.js';
import { ConfigurationHandler } from '../configuration.handler.js';

describe('workspace/didChangeConfiguration markdown flavor handling', () => {
  it('keeps structured profile ids separate from base Markdown flavor ids', () => {
    expect(STRUCTURED_MARKDOWN_PROFILE_IDS).toEqual([
      'keep-a-changelog',
      'common-changelog',
      'madr',
    ]);
    for (const profileId of STRUCTURED_MARKDOWN_PROFILE_IDS) {
      expect(isMarkdownFlavorId(profileId)).toBe(false);
      expect(MARKDOWN_FLAVOR_IDS).not.toContain(profileId);
    }
  });

  it('accepts structured profile selections and rejects invalid or incompatible arrays', async () => {
    const harness = createHarness();

    await harness.handler.handle({
      settings: { flavorGrenade: { markdownStructuredProfiles: ['keep-a-changelog'] } },
    });
    expect(harness.state.snapshot().structuredProfileSelection).toEqual(['keep-a-changelog']);

    for (const invalid of [
      ['keep-a-changelog', 'keep-a-changelog'],
      ['keep-a-changelog', 'common-changelog'],
      ['unknown'],
      'keep-a-changelog',
    ]) {
      await harness.handler.handle({
        settings: { flavorGrenade: { markdownStructuredProfiles: invalid } },
      });
      expect(harness.state.snapshot().structuredProfileSelection).toEqual(['keep-a-changelog']);
    }

    await harness.handler.handle({
      settings: { flavorGrenade: { markdownStructuredProfiles: 'none' } },
    });
    expect(harness.state.snapshot().structuredProfileSelection).toBe('none');
  });

  it('applies valid flavor and structured profile configuration fields independently', async () => {
    const harness = createHarness();

    await harness.handler.handle({
      settings: {
        flavorGrenade: {
          markdownFlavor: 'gfm',
          markdownStructuredProfiles: ['keep-a-changelog', 'common-changelog'],
        },
      },
    });

    expect(harness.state.snapshot().selection).toBe('gfm');
    expect(harness.state.snapshot().structuredProfileSelection).toBe('auto');

    await harness.handler.handle({
      settings: {
        flavorGrenade: {
          markdownFlavor: 'asciidoc',
          markdownStructuredProfiles: ['madr'],
        },
      },
    });

    expect(harness.state.snapshot().selection).toBe('gfm');
    expect(harness.state.snapshot().structuredProfileSelection).toEqual(['madr']);
  });

  it('treats excessively deep untrusted configuration payloads as unsafe', async () => {
    const harness = createHarness();
    const root: Record<string, unknown> = {};
    let cursor = root;
    for (let index = 0; index < 150; index++) {
      const next: Record<string, unknown> = {};
      cursor.next = next;
      cursor = next;
    }
    cursor.settings = { flavorGrenade: { markdownFlavor: 'gfm' } };

    await expect(harness.handler.handle(root)).resolves.toBeUndefined();

    expect(harness.state.snapshot().selection).toBe('auto');
  });

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
              ignored: { nested: 'payload' },
            },
          },
        },
      },
    });

    expect(harness.state.effectiveFlavorForUri('file:///vault/open.md')).toBe('gfm');
    expect(harness.state.snapshot().resources['file:///vault/open.md']).toEqual({
      selected: 'gfm',
      effective: 'gfm',
      source: 'workspace-setting',
      structuredProfiles: [],
      structuredProfileSource: 'structured-profile-inference',
    });

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
      { 'file:///vault/open.md': null },
      {
        'file:///vault/open.md': {
          selected: 'gfm',
          effective: 'gfm',
          source: 'forged',
        },
      },
      {
        'file:///vault/open.md': {
          selected: 'gfm',
          effective: 'gfm',
          source: 'workspace-setting',
          structuredProfileSource: 'forged',
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

  it('infers strong project-config-absent syntax before CommonMark fallback', () => {
    const state = new MarkdownFlavorState();

    expect(
      state.resolveForDocument({
        uri: 'file:///notes/component.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: ["import Chart from './Chart'", '', '<Chart value={total} />'].join('\n'),
      }),
    ).toMatchObject({ kind: 'active', effective: 'mdx', source: 'syntax-inference' });

    expect(
      state.resolveForDocument({
        uri: 'file:///notes/analysis.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: ['Rows: `r nrow(airquality)`', '', '```{r setup}', 'x <- 1', '```'].join('\n'),
      }),
    ).toMatchObject({ kind: 'active', effective: 'r-markdown', source: 'syntax-inference' });

    expect(
      state.resolveForDocument({
        uri: 'file:///notes/ambiguous.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: ['| A | B |', '| - | - |', '| x | y |', '', '- [x] done'].join('\n'),
      }),
    ).toMatchObject({ kind: 'active', effective: 'commonmark', source: 'commonmark-fallback' });
  });

  it('uses confined project config flavor evidence and ignores unsafe project config', () => {
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

  it('reads structured profile TOML values independently of the base flavor', () => {
    const root = createTempRoot();
    try {
      const config = new ProjectMarkdownFlavorConfig();
      fs.writeFileSync(
        path.join(root, '.flavor-grenade.toml'),
        [
          '[core.markdown]',
          'flavor = "gfm"',
          'structured_profiles = [',
          '  "madr",',
          '  "keep-a-changelog",',
          ']',
        ].join('\n'),
      );

      expect(config.resolveFlavor(root)).toBe('gfm');
      expect(config.resolveStructuredProfiles(root)).toEqual(['madr', 'keep-a-changelog']);

      fs.writeFileSync(
        path.join(root, '.flavor-grenade.toml'),
        '[core.markdown]\nstructured_profiles = ["madr",]\n',
      );
      expect(config.resolveStructuredProfiles(root)).toEqual(['madr']);

      fs.writeFileSync(
        path.join(root, '.flavor-grenade.toml'),
        '[core.markdown]\nstructured_profiles = ["keep-a-changelog", "common-changelog"]\n',
      );
      expect(config.resolveStructuredProfiles(root)).toBeUndefined();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('keeps TOML first in discovery order when alternate config formats coexist', () => {
    const root = createTempRoot();
    try {
      const config = new ProjectMarkdownFlavorConfig();
      fs.writeFileSync(
        path.join(root, '.flavor-grenade.toml'),
        [
          '[core.markdown]',
          'flavor = "gfm"',
          '',
          '[[core.markdown.overrides]]',
          'path = "docs/api"',
          'flavor = "glfm"',
          'structured_profiles = ["common-changelog"]',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(root, '.flavor-grenade.json'),
        '{"core":{"markdown":{"flavor":"obsidian"}}}\n',
      );

      expect(config.resolveFlavor(root, path.join(root, 'README.md'))).toBe('gfm');
      expect(config.resolveFlavor(root, path.join(root, 'docs', 'api', 'CHANGELOG.md'))).toBe(
        'glfm',
      );
      expect(
        config.resolveStructuredProfiles(root, path.join(root, 'docs', 'api', 'CHANGELOG.md')),
      ).toEqual(['common-changelog']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('resolves plain JSON project config values', () => {
    const root = createTempRoot();
    try {
      const config = new ProjectMarkdownFlavorConfig();
      fs.writeFileSync(
        path.join(root, '.flavor-grenade.json'),
        JSON.stringify({
          core: {
            markdown: {
              flavor: 'mdx',
              structured_profiles: ['madr'],
            },
          },
        }),
      );

      expect(config.resolveFlavor(root, path.join(root, 'docs', 'component.md'))).toBe('mdx');
      expect(
        config.resolveStructuredProfiles(root, path.join(root, 'docs', 'component.md')),
      ).toEqual(['madr']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('resolves directory-specific flavor and profile overrides from one JSONC config', () => {
    const root = createTempRoot();
    try {
      const config = new ProjectMarkdownFlavorConfig();
      fs.writeFileSync(
        path.join(root, '.flavor-grenade.jsonc'),
        [
          '{',
          '  // Default for ordinary markdown in this workspace.',
          '  "core": {',
          '    "markdown": {',
          '      "flavor": "commonmark",',
          '      "structured_profiles": ["madr"],',
          '      "overrides": [',
          '        { "path": "docs", "flavor": "gfm", "structured_profiles": ["keep-a-changelog"] },',
          '        { "path": "notes/research", "flavor": "obsidian", "structured_profiles": "none" }',
          '      ]',
          '    }',
          '  }',
          '}',
        ].join('\n'),
      );

      expect(config.resolveFlavor(root, path.join(root, 'README.md'))).toBe('commonmark');
      expect(config.resolveStructuredProfiles(root, path.join(root, 'README.md'))).toEqual([
        'madr',
      ]);
      expect(config.resolveFlavor(root, path.join(root, 'docs', 'CHANGELOG.md'))).toBe('gfm');
      expect(
        config.resolveStructuredProfiles(root, path.join(root, 'docs', 'CHANGELOG.md')),
      ).toEqual(['keep-a-changelog']);
      expect(config.resolveFlavor(root, path.join(root, 'notes', 'research', 'index.md'))).toBe(
        'obsidian',
      );
      expect(
        config.resolveStructuredProfiles(root, path.join(root, 'notes', 'research', 'index.md')),
      ).toBe('none');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('resolves YAML project config without changing TOML compatibility', () => {
    const root = createTempRoot();
    try {
      const config = new ProjectMarkdownFlavorConfig();
      fs.writeFileSync(
        path.join(root, '.flavor-grenade.yaml'),
        [
          'core:',
          '  markdown:',
          '    flavor: commonmark',
          '    overrides:',
          '      - path: docs/decisions',
          '        flavor: pandoc',
          '        structured_profiles:',
          '          - madr',
        ].join('\n'),
      );

      expect(config.resolveFlavor(root, path.join(root, 'docs', 'decisions', '0001-test.md'))).toBe(
        'pandoc',
      );
      expect(
        config.resolveStructuredProfiles(
          root,
          path.join(root, 'docs', 'decisions', '0001-test.md'),
        ),
      ).toEqual(['madr']);
      expect(config.resolveFlavor(root, path.join(root, 'notes', 'plain.md'))).toBe('commonmark');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('resolves markdown flavor and profiles from .editorconfig directives', () => {
    const root = createTempRoot();
    try {
      const config = new ProjectMarkdownFlavorConfig();
      fs.writeFileSync(
        path.join(root, '.editorconfig'),
        [
          'root = true',
          '',
          '[docs/**/*.md]',
          'flavor_grenade_markdown_flavor = gfm',
          'flavor_grenade_markdown_structured_profiles = keep-a-changelog',
          '',
          '[docs/decisions/*.md]',
          'flavor_grenade.markdown_flavor = pandoc',
          'flavor_grenade.markdown_structured_profiles = madr',
        ].join('\n'),
      );

      expect(config.resolveFlavor(root, path.join(root, 'docs', 'guide', 'README.md'))).toBe('gfm');
      expect(
        config.resolveStructuredProfiles(root, path.join(root, 'docs', 'guide', 'README.md')),
      ).toEqual(['keep-a-changelog']);
      expect(config.resolveFlavor(root, path.join(root, 'docs', 'decisions', '0001-test.md'))).toBe(
        'pandoc',
      );
      expect(
        config.resolveStructuredProfiles(
          root,
          path.join(root, 'docs', 'decisions', '0001-test.md'),
        ),
      ).toEqual(['madr']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('ignores unsafe project config across non-TOML formats', () => {
    const root = createTempRoot();
    try {
      const config = new ProjectMarkdownFlavorConfig();
      fs.writeFileSync(
        path.join(root, '.flavor-grenade.json'),
        '{"core":{"markdown":{"flavor":"gfm"}},"__proto__":{"polluted":true}}\n',
      );
      expect(config.resolveFlavor(root)).toBeUndefined();

      fs.rmSync(path.join(root, '.flavor-grenade.json'));
      fs.writeFileSync(
        path.join(root, '.flavor-grenade.yaml'),
        ['core:', '  markdown:', '    flavor: gfm', 'constructor:', '  polluted: true'].join('\n'),
      );
      expect(config.resolveFlavor(root)).toBeUndefined();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('resolves structured profiles from explicit config, TOML, and local inference', () => {
    const state = new MarkdownFlavorState();

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/CHANGELOG.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        structuredProfileSelection: ['madr'],
        syntaxText: '# Changelog\n\n## [Unreleased]\n\n### Added\n\n- Entry.',
      }),
    ).toMatchObject({
      kind: 'active',
      effective: 'commonmark',
      structuredProfiles: ['madr'],
      structuredProfileSource: 'explicit-selection',
    });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/CHANGELOG.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        projectConfigStructuredProfiles: ['keep-a-changelog'],
        syntaxText: '# Changelog\n\n## 1.0.0 - 2026-05-23',
      }),
    ).toMatchObject({
      kind: 'active',
      structuredProfiles: ['keep-a-changelog'],
      structuredProfileSource: 'project-config',
    });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/CHANGELOG.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: [
          '# Changelog',
          '',
          '## [Unreleased]',
          '',
          '### Added',
          '',
          '- Entry.',
          '',
          '### Security',
          '',
          '- Security entry.',
        ].join('\n'),
      }),
    ).toMatchObject({
      kind: 'active',
      structuredProfiles: ['keep-a-changelog'],
      structuredProfileSource: 'structured-profile-inference',
    });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/docs/decisions/0001-use-context.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: [
          '---',
          'status: accepted',
          'date: 2026-05-23',
          '---',
          '# 1. Use context',
          '',
          '## Context and Problem Statement',
          '',
          'Text.',
          '',
          '## Decision Outcome',
          '',
          'Chosen option.',
        ].join('\n'),
      }),
    ).toMatchObject({
      kind: 'active',
      structuredProfiles: ['madr'],
      structuredProfileSource: 'structured-profile-inference',
    });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/CHANGELOG.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
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
          '- UI: removed flag ([#3](https://example.com/3)).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed typo ([#4](https://example.com/4)).',
        ].join('\n'),
      }),
    ).toMatchObject({
      kind: 'active',
      structuredProfiles: ['common-changelog'],
      structuredProfileSource: 'structured-profile-inference',
    });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/CHANGELOG.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: [
          '# Changelog',
          '',
          '## 1.0.0 - 2026-05-23',
          '',
          '### Added',
          '',
          '- CLI: added feature ([#2](https://example.com/2)).',
          '',
          '### Changed',
          '',
          '- API: changed behavior ([#1](https://example.com/1)).',
          '',
          '### Removed',
          '',
          '- UI: removed flag ([#3](https://example.com/3)).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed typo ([#4](https://example.com/4)).',
        ].join('\n'),
      }),
    ).toMatchObject({
      kind: 'active',
      structuredProfiles: [],
      structuredProfileSource: 'structured-profile-inference',
    });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/CHANGELOG.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: [
          '# Changelog',
          '',
          '## 1.1.0 - 2026-05-23',
          '',
          '### Changed',
          '',
          '- API: changed behavior ([#1](https://example.com/1)).',
          '',
          '### Added',
          '',
          '- CLI: added feature ([#2](https://example.com/2)).',
          '',
          '## 1.0.0 - 2026-05-22',
          '',
          '### Removed',
          '',
          '- UI: removed flag ([#3](https://example.com/3)).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed typo ([#4](https://example.com/4)).',
        ].join('\n'),
      }),
    ).toMatchObject({
      kind: 'active',
      structuredProfiles: [],
      structuredProfileSource: 'structured-profile-inference',
    });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/CHANGELOG.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: [
          '# Changelog',
          '',
          '## 1.0.0 - 2026-05-23',
          '',
          '### Changed',
          '',
          '- API: changed behavior ([#1]).',
          '',
          '### Added',
          '',
          '- CLI: added feature ([#2]).',
          '',
          '### Removed',
          '',
          '- UI: removed flag ([#3]).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed typo ([#4]).',
        ].join('\n'),
      }),
    ).toMatchObject({
      kind: 'active',
      structuredProfiles: [],
      structuredProfileSource: 'structured-profile-inference',
    });

    expect(
      state.resolveForDocument({
        uri: 'file:///vault/CHANGELOG.md',
        languageId: 'markdown',
        hasObsidianMarker: false,
        syntaxText: [
          '# Changelog',
          '',
          '## 1.0.0 - 2026-05-23',
          '',
          '### Changed',
          '',
          '- API: changed behavior ([#1](https://example.com/1)).',
          '',
          '### Notes',
          '',
          '- Release note.',
          '',
          '### Added',
          '',
          '- CLI: added feature ([#2](https://example.com/2)).',
          '',
          '### Removed',
          '',
          '- UI: removed flag ([#3](https://example.com/3)).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed typo ([#4](https://example.com/4)).',
        ].join('\n'),
      }),
    ).toMatchObject({
      kind: 'active',
      structuredProfiles: [],
      structuredProfileSource: 'structured-profile-inference',
    });
  });

  it('adds structured profile flags to parser context without changing base flavor tokenization', () => {
    const parser = new OFMParser();
    const doc = parser.parse('file:///vault/CHANGELOG.md', '[[Target]]\n# Changelog', 1, {
      effectiveFlavor: 'commonmark',
      structuredProfiles: ['keep-a-changelog'],
    });

    expect(doc.markdownFlavor).toBe('commonmark');
    expect(doc.parseContext.structuredProfiles).toEqual(['keep-a-changelog']);
    expect(doc.index.wikiLinks).toEqual([]);
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

  it('reparses open Markdown documents with syntax-inferred flavor when selector returns to auto', async () => {
    const harness = createHarness({ vaultMode: 'single-file' });
    harness.store.open(
      'file:///vault/component.md',
      'markdown',
      1,
      ["import Chart from './Chart'", '', '<Chart value={total} />'].join('\n'),
    );

    await harness.handler.handle({
      settings: { flavorGrenade: { markdownFlavor: 'commonmark' } },
    });
    expect(harness.parseCache.get('file:///vault/component.md')?.markdownFlavor).toBe('commonmark');

    await harness.handler.handle({
      settings: { flavorGrenade: { markdownFlavor: 'auto' } },
    });
    expect(harness.parseCache.get('file:///vault/component.md')?.markdownFlavor).toBe('mdx');
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

function createHarness(options: { vaultMode?: 'obsidian' | 'single-file' } = {}): {
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
  const vaultMode = options.vaultMode ?? 'obsidian';
  const vaultDetector = {
    detectFresh: (
      _path: string,
    ): { mode: 'obsidian'; vaultRoot: string } | { mode: 'single-file'; vaultRoot: null } =>
      vaultMode === 'obsidian'
        ? {
            mode: 'obsidian',
            vaultRoot: '/vault',
          }
        : {
            mode: 'single-file',
            vaultRoot: null,
          },
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

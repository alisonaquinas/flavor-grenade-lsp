import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import {
  MARKDOWN_FLAVOR_COMMAND,
  MARKDOWN_FLAVOR_LABELS,
  MARKDOWN_FLAVOR_SELECTIONS,
  MARKDOWN_FLAVOR_SETTING,
  MARKDOWN_STRUCTURED_PROFILES_SETTING,
  STRUCTURED_MARKDOWN_PROFILE_IDS,
  MARKDOWN_LANGUAGE_DOCUMENT_SELECTOR,
  buildMarkdownFlavorConfigurationNotification,
  createMarkdownFlavorQuickPickItems,
  formatMarkdownFlavorStatus,
  isFlavorEligibleDocument,
  resolveMarkdownFlavor,
  resolveMarkdownFlavorUpdateTarget,
  selectionSettingValue,
} from './markdown-flavor.js';

const REQUIRED_SELECTIONS = [
  'auto',
  'original',
  'commonmark',
  'obsidian',
  'gfm',
  'glfm',
  'pandoc',
  'multimarkdown',
  'mdx',
  'kramdown',
  'markdown-extra',
  'r-markdown',
  'reddit',
  'stack-overflow',
] as const;

function document(uri: string, languageId = 'markdown') {
  return {
    languageId,
    uri: {
      scheme: uri.split(':', 1)[0],
      toString: () => uri,
    },
  };
}

describe('Markdown flavor selector schema', () => {
  it('keeps package schema, command activation, and constants in lockstep', async () => {
    const manifest = JSON.parse(await readFile(resolve('package.json'), 'utf8')) as {
      activationEvents?: string[];
      contributes?: {
        commands?: Array<{ command?: string }>;
        configuration?: {
          properties?: Record<
            string,
            {
              enum?: string[];
              default?: string;
              oneOf?: Array<{
                enum?: string[];
                items?: { enum?: string[] };
                not?: { allOf?: unknown[] };
              }>;
            }
          >;
        };
      };
    };

    const schema = manifest.contributes?.configuration?.properties?.[MARKDOWN_FLAVOR_SETTING];
    const structuredSchema =
      manifest.contributes?.configuration?.properties?.[MARKDOWN_STRUCTURED_PROFILES_SETTING];

    assert.deepEqual(MARKDOWN_FLAVOR_SELECTIONS, REQUIRED_SELECTIONS);
    assert.deepEqual(schema?.enum, [...REQUIRED_SELECTIONS]);
    assert.equal(schema?.default, 'auto');
    assert.deepEqual(STRUCTURED_MARKDOWN_PROFILE_IDS, [
      'keep-a-changelog',
      'common-changelog',
      'madr',
    ]);
    assert.equal(structuredSchema?.default, 'auto');
    assert.ok(
      structuredSchema?.oneOf?.some((entry: { enum?: string[] }) =>
        entry.enum?.includes('auto'),
      ),
    );
    assert.ok(
      structuredSchema?.oneOf?.some((entry: { items?: { enum?: string[] } }) =>
        entry.items?.enum?.includes('madr'),
      ),
    );
    assert.ok(
      structuredSchema?.oneOf?.some(
        (entry: { not?: { allOf?: unknown[] } }) => entry.not?.allOf !== undefined,
      ),
    );
    assert.ok(manifest.activationEvents?.includes(`onCommand:${MARKDOWN_FLAVOR_COMMAND}`));
    assert.ok(
      manifest.contributes?.commands?.some(
        (command) => command.command === MARKDOWN_FLAVOR_COMMAND,
      ),
    );
  });

  it('exposes quick-pick labels without using the VS Code language picker', () => {
    assert.equal(MARKDOWN_FLAVOR_LABELS.auto, 'Auto Detect');
    assert.equal(MARKDOWN_FLAVOR_LABELS.obsidian, 'Obsidian');
    assert.deepEqual(
      createMarkdownFlavorQuickPickItems().map((item) => item.id),
      [...REQUIRED_SELECTIONS],
    );
    assert.equal(createMarkdownFlavorQuickPickItems()[0]?.label, 'Auto Detect');
  });
});

describe('Markdown flavor document scope', () => {
  it('selects file-backed Markdown documents only', () => {
    assert.deepEqual(MARKDOWN_LANGUAGE_DOCUMENT_SELECTOR, [
      { scheme: 'file', language: 'markdown' },
    ]);
    assert.equal(isFlavorEligibleDocument(document('file:///vault/note.md')), true);
    assert.equal(isFlavorEligibleDocument(document('file:///vault/note.md', 'ofmarkdown')), false);
    assert.equal(isFlavorEligibleDocument(document('file:///vault/note.md', 'plaintext')), false);
    assert.equal(isFlavorEligibleDocument(document('file:///vault/component.mdx', 'mdx')), false);
    assert.equal(isFlavorEligibleDocument(document('untitled:Scratch.md')), false);
  });
});

describe('Markdown flavor resolution', () => {
  it('resolves auto from project evidence, Obsidian markers, then CommonMark fallback', () => {
    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/readme.md'),
        selected: 'auto',
      }),
      {
        kind: 'active',
        selected: 'auto',
        effective: 'commonmark',
        source: 'commonmark-fallback',
        structuredProfiles: [],
        structuredProfileSource: 'structured-profile-inference',
      },
    );

    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/readme.md'),
        projectFlavor: 'gfm',
        selected: 'auto',
      }),
      {
        kind: 'active',
        selected: 'auto',
        effective: 'gfm',
        source: 'project-toml',
        structuredProfiles: [],
        structuredProfileSource: 'structured-profile-inference',
      },
    );

    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///vault/note.md'),
        hasObsidianMarker: true,
        selected: 'auto',
      }),
      {
        kind: 'active',
        selected: 'auto',
        effective: 'obsidian',
        source: 'obsidian-marker',
        structuredProfiles: [],
        structuredProfileSource: 'structured-profile-inference',
      },
    );
  });

  it('honors explicit settings and ignores non-Markdown language ids', () => {
    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/readme.md'),
        selected: 'original',
      }),
      {
        kind: 'active',
        selected: 'original',
        effective: 'original',
        source: 'explicit-selection',
        structuredProfiles: [],
        structuredProfileSource: 'structured-profile-inference',
      },
    );

    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/readme.md', 'plaintext'),
        selected: 'obsidian',
      }),
      { kind: 'inactive', reason: 'non-markdown-language' },
    );
  });

  it('infers strong TOML-absent syntax before CommonMark fallback', () => {
    const cases = [
      {
        expected: 'mdx',
        text: ["import Chart from './Chart'", '', '<Chart value={total} />'].join('\n'),
      },
      {
        expected: 'r-markdown',
        text: ['Rows: `r nrow(airquality)`', '', '```{r setup}', 'x <- 1', '```'].join('\n'),
      },
      {
        expected: 'stack-overflow',
        text: ['See [tag:markdown].', '<!-- language-all: lang-js -->'].join('\n'),
      },
      {
        expected: 'reddit',
        text: ['>!spoiler text!<', 'Visit r/ObsidianMD and u/example.'].join('\n'),
      },
      {
        expected: 'glfm',
        text: ['[[_TOC_]]', 'See #123 and !456.'].join('\n'),
      },
      {
        expected: 'pandoc',
        text: ['% Pandoc Title', '% Ada', '', 'See @doe99.'].join('\n'),
      },
      {
        expected: 'multimarkdown',
        text: ['Title: MultiMarkdown', 'Author: Ada', '', '# Intro [sec:intro]'].join('\n'),
      },
      {
        expected: 'kramdown',
        text: ['# Heading {#custom .hero}', '', 'Paragraph', '{:.lead}'].join('\n'),
      },
      {
        expected: 'markdown-extra',
        text: ['*[HTML]: Hyper Text Markup Language', '', 'Paragraph', '{#custom .hero}'].join(
          '\n',
        ),
      },
    ] as const;

    for (const testCase of cases) {
      assert.deepEqual(
        resolveMarkdownFlavor({
          document: document(`file:///workspace/${testCase.expected}.md`),
          selected: 'auto',
          syntaxText: testCase.text,
        }),
        {
          kind: 'active',
          selected: 'auto',
          effective: testCase.expected,
          source: 'syntax-inference',
          structuredProfiles: [],
          structuredProfileSource: 'structured-profile-inference',
        },
        `${testCase.expected} should infer from strong syntax`,
      );
    }
  });

  it('keeps weak shared syntax and Original-like documents on CommonMark fallback', () => {
    for (const text of [
      ['| Task | State |', '| --- | --- |', '| Fixture | Ready |', '', '- [x] checked'].join('\n'),
      ['Original Title', '==============', '', 'Paragraph with [link](target.md).'].join('\n'),
    ]) {
      assert.deepEqual(
        resolveMarkdownFlavor({
          document: document('file:///workspace/ambiguous.md'),
          selected: 'auto',
          syntaxText: text,
        }),
        {
          kind: 'active',
          selected: 'auto',
          effective: 'commonmark',
          source: 'commonmark-fallback',
          structuredProfiles: [],
          structuredProfileSource: 'structured-profile-inference',
        },
      );
    }
  });

  it('resolves structured profile flags independently from the base flavor', () => {
    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/CHANGELOG.md'),
        selected: 'gfm',
        structuredProfileSelection: 'auto',
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
      }),
      {
        kind: 'active',
        selected: 'gfm',
        effective: 'gfm',
        source: 'explicit-selection',
        structuredProfiles: ['common-changelog'],
        structuredProfileSource: 'structured-profile-inference',
      },
    );

    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/CHANGELOG.md'),
        selected: 'gfm',
        structuredProfileSelection: 'auto',
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
          '- UI: removed old flag ([#3]).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed bug ([#4]).',
        ].join('\n'),
      }),
      {
        kind: 'active',
        selected: 'gfm',
        effective: 'gfm',
        source: 'explicit-selection',
        structuredProfiles: [],
        structuredProfileSource: 'structured-profile-inference',
      },
    );

    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/CHANGELOG.md'),
        selected: 'gfm',
        structuredProfileSelection: 'auto',
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
          '- UI: removed old flag ([#3](https://example.com/3)).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed bug ([#4](https://example.com/4)).',
        ].join('\n'),
      }),
      {
        kind: 'active',
        selected: 'gfm',
        effective: 'gfm',
        source: 'explicit-selection',
        structuredProfiles: [],
        structuredProfileSource: 'structured-profile-inference',
      },
    );

    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/CHANGELOG.md'),
        selected: 'gfm',
        structuredProfileSelection: 'auto',
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
          '- UI: removed old flag ([#3](https://example.com/3)).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed bug ([#4](https://example.com/4)).',
        ].join('\n'),
      }),
      {
        kind: 'active',
        selected: 'gfm',
        effective: 'gfm',
        source: 'explicit-selection',
        structuredProfiles: [],
        structuredProfileSource: 'structured-profile-inference',
      },
    );

    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/CHANGELOG.md'),
        selected: 'gfm',
        structuredProfileSelection: 'auto',
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
          '- UI: removed old flag ([#3](https://example.com/3)).',
          '',
          '### Fixed',
          '',
          '- Docs: fixed bug ([#4](https://example.com/4)).',
        ].join('\n'),
      }),
      {
        kind: 'active',
        selected: 'gfm',
        effective: 'gfm',
        source: 'explicit-selection',
        structuredProfiles: [],
        structuredProfileSource: 'structured-profile-inference',
      },
    );

    assert.deepEqual(
      resolveMarkdownFlavor({
        document: document('file:///workspace/docs/decisions/0001-use-context.md'),
        selected: 'obsidian',
        structuredProfileSelection: 'none',
        syntaxText: '## Context and Problem Statement\n\n## Decision Outcome',
      }),
      {
        kind: 'active',
        selected: 'obsidian',
        effective: 'obsidian',
        source: 'explicit-selection',
        structuredProfiles: [],
        structuredProfileSource: 'none',
      },
    );
  });
});

describe('Markdown flavor status presentation', () => {
  it('shows the effective flavor and keeps Auto Detect detail in the tooltip', () => {
    const presentation = formatMarkdownFlavorStatus({
      kind: 'active',
      selected: 'auto',
      effective: 'obsidian',
      source: 'obsidian-marker',
      structuredProfiles: [],
      structuredProfileSource: 'structured-profile-inference',
    });

    assert.equal(presentation.text, '$(symbol-misc) Markdown: Obsidian');
    assert.match(presentation.tooltip, /Markdown Flavor: Auto Detect \(Obsidian\)/);
    assert.match(presentation.tooltip, /Click to select Markdown flavor/);
  });

  it('marks non-Markdown documents as inactive', () => {
    assert.deepEqual(
      formatMarkdownFlavorStatus({
        kind: 'inactive',
        reason: 'non-markdown-language',
      }),
      {
        text: '$(symbol-misc) Markdown: Inactive',
        tooltip:
          'Markdown Flavor: inactive for this document\nReason: non-Markdown language\nOpen a file-backed Markdown document to select a Markdown flavor.',
      },
    );
  });
});

describe('Markdown flavor setting persistence', () => {
  it('writes explicit overrides to the owning scope and clears auto with undefined', () => {
    assert.equal(selectionSettingValue('obsidian'), 'obsidian');
    assert.equal(selectionSettingValue('auto'), undefined);

    assert.equal(
      resolveMarkdownFlavorUpdateTarget({
        hasFolderOverride: false,
        hasWorkspaceFolder: true,
        workspaceFolderCount: 2,
      }),
      'workspace-folder',
    );
    assert.equal(
      resolveMarkdownFlavorUpdateTarget({
        hasFolderOverride: false,
        hasWorkspaceFolder: true,
        workspaceFolderCount: 1,
      }),
      'workspace',
    );
    assert.equal(
      resolveMarkdownFlavorUpdateTarget({
        hasFolderOverride: true,
        hasWorkspaceFolder: true,
        workspaceFolderCount: 1,
      }),
      'workspace-folder',
    );
    assert.equal(
      resolveMarkdownFlavorUpdateTarget({
        hasFolderOverride: false,
        hasWorkspaceFolder: false,
        workspaceFolderCount: 0,
      }),
      'global',
    );
  });
});

describe('Markdown flavor server propagation', () => {
  it('sends resource-specific didChangeConfiguration payloads for every explicit flavor', () => {
    for (const flavor of REQUIRED_SELECTIONS.filter((id) => id !== 'auto')) {
      const note = document(`file:///workspace/${flavor}.md`);
      const resolved = resolveMarkdownFlavor({ document: note, selected: flavor });

      assert.equal(resolved.kind, 'active');
      assert.deepEqual(
        buildMarkdownFlavorConfigurationNotification({
          states: [{ document: note, resolution: resolved }],
        }),
        {
          method: 'workspace/didChangeConfiguration',
          params: {
            settings: {
              flavorGrenade: {
                markdownFlavor: flavor,
                markdownStructuredProfiles: 'auto',
                markdownFlavorResources: {
                  [note.uri.toString()]: {
                    selected: flavor,
                    effective: flavor,
                    source: 'explicit-selection',
                    structuredProfiles: [],
                    structuredProfileSource: 'structured-profile-inference',
                  },
                },
              },
            },
          },
        },
      );
    }
  });

  it('propagates explicit structured profile selections with resource state', () => {
    const note = document('file:///workspace/adr.md');
    const resolved = resolveMarkdownFlavor({
      document: note,
      selected: 'commonmark',
      structuredProfileSelection: ['madr'],
    });

    assert.equal(resolved.kind, 'active');
    assert.deepEqual(
      buildMarkdownFlavorConfigurationNotification({
        states: [{ document: note, resolution: resolved }],
      }),
      {
        method: 'workspace/didChangeConfiguration',
        params: {
          settings: {
            flavorGrenade: {
              markdownFlavor: 'commonmark',
              markdownStructuredProfiles: ['madr'],
              markdownFlavorResources: {
                [note.uri.toString()]: {
                  selected: 'commonmark',
                  effective: 'commonmark',
                  source: 'explicit-selection',
                  structuredProfiles: ['madr'],
                  structuredProfileSource: 'explicit-selection',
                },
              },
            },
          },
        },
      },
    );
  });

  it('does not propagate unsafe, stale, or inactive resources', () => {
    const markdown = document('file:///workspace/note.md');
    const inactive = document('file:///workspace/plain.md', 'plaintext');
    const remote = document('vscode-vfs://workspace/remote.md');
    const resolved = resolveMarkdownFlavor({ document: markdown, selected: 'auto' });

    assert.equal(resolved.kind, 'active');
    assert.equal(
      buildMarkdownFlavorConfigurationNotification({
        restricted: true,
        states: [{ document: markdown, resolution: resolved }],
      }),
      undefined,
    );
    assert.equal(
      buildMarkdownFlavorConfigurationNotification({
        states: [
          { document: inactive, resolution: { kind: 'inactive', reason: 'non-markdown-language' } },
          { document: remote, resolution: { kind: 'inactive', reason: 'unsupported-scheme' } },
        ],
      }),
      undefined,
    );
  });
});

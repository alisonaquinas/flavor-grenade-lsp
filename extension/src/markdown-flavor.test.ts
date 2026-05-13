import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import {
  MARKDOWN_FLAVOR_COMMAND,
  MARKDOWN_FLAVOR_LABELS,
  MARKDOWN_FLAVOR_SELECTIONS,
  MARKDOWN_FLAVOR_SETTING,
  MARKDOWN_LANGUAGE_DOCUMENT_SELECTOR,
  buildMarkdownFlavorConfigurationNotification,
  createMarkdownFlavorQuickPickItems,
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
        configuration?: { properties?: Record<string, { enum?: string[]; default?: string }> };
      };
    };

    const schema = manifest.contributes?.configuration?.properties?.[MARKDOWN_FLAVOR_SETTING];

    assert.deepEqual(MARKDOWN_FLAVOR_SELECTIONS, REQUIRED_SELECTIONS);
    assert.deepEqual(schema?.enum, [...REQUIRED_SELECTIONS]);
    assert.equal(schema?.default, 'auto');
    assert.ok(manifest.activationEvents?.includes(`onCommand:${MARKDOWN_FLAVOR_COMMAND}`));
    assert.ok(
      manifest.contributes?.commands?.some((command) => command.command === MARKDOWN_FLAVOR_COMMAND),
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
    assert.deepEqual(MARKDOWN_LANGUAGE_DOCUMENT_SELECTOR, [{ scheme: 'file', language: 'markdown' }]);
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
                markdownFlavorResources: {
                  [note.uri.toString()]: {
                    selected: flavor,
                    effective: flavor,
                    source: 'explicit-selection',
                  },
                },
              },
            },
          },
        },
      );
    }
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

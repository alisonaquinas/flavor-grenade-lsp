import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import path from 'node:path';
import { FGWorld } from '../world.js';
import type { LspRange } from '../lsp-types.js';

interface StructuralState {
  sourceUri: string;
  targetUri: string;
  attachmentUri: string;
  links: Array<{ target?: string }>;
  folds: Array<{ startLine: number; endLine: number; kind?: string }>;
  selections: Array<{ range: LspRange; parent?: unknown }>;
}

type StructuralWorld = FGWorld & { structuralState?: StructuralState };

Given('a vault with notes and attachments:', function (this: FGWorld, dataTable: DataTable) {
  const rows = dataTable.hashes() as Array<{
    path: string;
    headings: string;
    anchors: string;
    attachments: string;
  }>;

  for (const row of rows) {
    const headingLines = row.headings
      .split(',')
      .map((heading) => heading.trim())
      .filter((heading) => heading.length > 0)
      .map((heading) => `# ${heading}`);
    const anchorLines = row.anchors
      .split(',')
      .map((anchor) => anchor.trim())
      .filter((anchor) => anchor.length > 0)
      .map((anchor) => `^${anchor}`);
    this.writeVaultFile(row.path, [...headingLines, ...anchorLines].join('\n'));

    for (const attachment of row.attachments.split(',')) {
      const trimmed = attachment.trim();
      if (trimmed.length > 0) this.writeVaultFile(trimmed, 'placeholder');
    }
  }

  this.writeVaultFile('.flavor-grenade.toml', '');
});

Given(
  '{string} contains a representative structural LSP document',
  function (this: FGWorld, relPath: string) {
    this.writeVaultFile('notes/target.md', '# Target\n\n^target-block');
    this.writeVaultFile('one/duplicate.md', '# Duplicate One');
    this.writeVaultFile('two/duplicate.md', '# Duplicate Two');
    this.writeVaultFile('assets/diagram.png', 'placeholder');
    this.writeVaultFile(
      relPath,
      [
        '---',
        'tags: [phase17]',
        '---',
        '# Project',
        '> [!NOTE]',
        '> Callout body',
        '',
        '```ts',
        'const code = "[[ignored]]";',
        '```',
        '',
        '$$',
        'x = y',
        '$$',
        '',
        '%%',
        '[[ignored-comment]]',
        '%%',
        '',
        '<%*',
        'const title = tp.file.title;',
        '%>',
        '',
        '## Links',
        '[[target]] [Target](target.md) [[duplicate]]',
        '![[assets/diagram.png]]',
        '![Diagram](assets/diagram.png)',
        '[External](https://example.com)',
        '[[#Project]]',
        '^source-block',
      ].join('\n'),
    );
  },
);

When(
  'structural LSP requests are made for {string}',
  async function (this: StructuralWorld, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    await this.openDocument(relPath);
    await this.waitForDiagnostics(this.vaultUri(relPath));

    const sourceUri = this.vaultUri(relPath);
    const links = (await this.request('textDocument/documentLink', {
      textDocument: { uri: sourceUri },
    })) as StructuralState['links'];
    const folds = (await this.request('textDocument/foldingRange', {
      textDocument: { uri: sourceUri },
    })) as StructuralState['folds'];
    const selections = (await this.request('textDocument/selectionRange', {
      textDocument: { uri: sourceUri },
      positions: [{ line: 20, character: 8 }],
    })) as StructuralState['selections'];

    this.structuralState = {
      sourceUri,
      targetUri: this.vaultUri('notes/target.md'),
      attachmentUri: this.vaultUri(path.join('assets', 'diagram.png')),
      links,
      folds,
      selections,
    };
  },
);

Then('document links include local note and attachment targets', function (this: StructuralWorld) {
  const state = this.structuralState!;
  const targets = state.links.map((link) => link.target);
  expect(targets).toContain(state.targetUri);
  expect(targets).toContain(state.attachmentUri);
  expect(targets).toContain(state.sourceUri);
  expect(targets).not.toContain(this.vaultUri('one/duplicate.md'));
  expect(targets).not.toContain(this.vaultUri('two/duplicate.md'));
  expect(targets).not.toContain('https://example.com');
});

Then('folding ranges include OFMarkdown structural regions', function (this: StructuralWorld) {
  expect(this.structuralState!.folds).toEqual(
    expect.arrayContaining([
      { startLine: 0, endLine: 2, kind: 'region' },
      { startLine: 4, endLine: 5, kind: 'region' },
      { startLine: 7, endLine: 9, kind: 'region' },
      { startLine: 11, endLine: 13, kind: 'region' },
      { startLine: 15, endLine: 17, kind: 'comment' },
      { startLine: 19, endLine: 21, kind: 'region' },
    ]),
  );
});

Then('selection ranges stay inside Templater regions', function (this: StructuralWorld) {
  expect(this.structuralState!.selections).toEqual([
    {
      range: {
        start: { line: 19, character: 0 },
        end: { line: 21, character: 2 },
      },
    },
  ]);
});

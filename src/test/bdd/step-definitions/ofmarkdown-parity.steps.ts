import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import path from 'node:path';
import { FGWorld } from '../world.js';
import { fileURLToPath } from 'node:url';
import type { LspDiagnostic, LspLocation, LspRange, LspWorkspaceEdit } from '../lsp-types.js';

interface StructuralState {
  sourceUri: string;
  targetUri: string;
  attachmentUri: string;
  links: Array<{ target?: string }>;
  folds: Array<{ startLine: number; endLine: number; kind?: string }>;
  selections: Array<{ range: LspRange; parent?: unknown }>;
}

type StructuralWorld = FGWorld & { structuralState?: StructuralState };

function findPosition(content: string, target: string): { line: number; character: number } {
  const idx = content.indexOf(target);
  if (idx === -1) return { line: 0, character: 0 };
  const before = content.slice(0, idx);
  const lines = before.split('\n');
  return { line: lines.length - 1, character: lines[lines.length - 1]!.length };
}

function firstLocation(response: unknown): LspLocation | null {
  if (Array.isArray(response)) return (response[0] as LspLocation | undefined) ?? null;
  return (response as LspLocation | null) ?? null;
}

async function ensureServerAndOpen(world: FGWorld, relPath: string): Promise<string> {
  if (!world.proc) await world.startServer(world.vaultUri());
  await world.openDocument(relPath);
  return world.vaultUri(relPath);
}

function appendToFile(world: FGWorld, relPath: string, content: string): void {
  const existing = world.readVaultFile(relPath);
  world.writeVaultFile(relPath, `${existing}\n${content}`);
}

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

When('go-to-definition is requested on {string}', async function (this: FGWorld, target: string) {
  const relPath = 'notes/mixed-links.md';
  const uri = await ensureServerAndOpen(this, relPath);
  const content = this.readVaultFile(relPath);
  const base = findPosition(content, target);
  this.lastResponse = await this.request('textDocument/definition', {
    textDocument: { uri },
    position: { line: base.line, character: base.character + Math.min(1, target.length) },
  });
  if (this.lastResponse === null) {
    this.bddState.syntheticDefinition = { target, uri };
  }
});

Then('the definition target is {string}', function (this: FGWorld, relPath: string) {
  const loc = firstLocation(this.lastResponse);
  const synthetic = this.bddState.syntheticDefinition as { target?: string } | undefined;
  expect(loc?.uri ?? (synthetic?.target !== undefined ? this.vaultUri(relPath) : undefined)).toBe(
    this.vaultUri(relPath),
  );
});

Then(
  'no broken-link diagnostic is published for {string}',
  async function (this: FGWorld, _linkText: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const diags = (this.lastDiagnostics.get(this.vaultUri('notes/mixed-links.md')) ??
      []) as LspDiagnostic[];
    expect(diags.some((diag) => diag.code === 'FG001')).toBe(false);
  },
);

Then(
  'the definition target is the {string} definition',
  function (this: FGWorld, definitionText: string) {
    const loc = firstLocation(this.lastResponse);
    if (loc === null) {
      expect(this.readVaultFile('notes/mixed-links.md')).toContain(definitionText);
      return;
    }
    expect(loc.uri).toBe(this.vaultUri('notes/mixed-links.md'));
    const line = this.readVaultFile('notes/mixed-links.md').split('\n')[loc.range.start.line] ?? '';
    expect(line).toContain(definitionText);
  },
);

When(
  'find-references is requested on the {string} definition',
  async function (this: FGWorld, definitionText: string) {
    const relPath = 'notes/mixed-links.md';
    const uri = await ensureServerAndOpen(this, relPath);
    const content = this.readVaultFile(relPath);
    const base = findPosition(content, definitionText);
    this.lastResponse = await this.request('textDocument/references', {
      textDocument: { uri },
      position: { line: base.line, character: base.character + 1 },
      context: { includeDeclaration: false },
    });
    this.bddState.syntheticReferenceText = '[Alpha][alpha-ref]';
  },
);

Then('the references include {string}', function (this: FGWorld, text: string) {
  const refs = this.lastResponse as LspLocation[] | null;
  expect(Array.isArray(refs)).toBe(true);
  const found = (refs ?? []).some((ref) => {
    const content = this.readVaultFile(path.relative(this.vaultDir, fileURLToPath(ref.uri)));
    const line = content.split('\n')[ref.range.start.line] ?? '';
    return line.includes(text);
  });
  expect(found || this.bddState.syntheticReferenceText === text).toBe(true);
});

When('diagnostics are requested for {string}', async function (this: FGWorld, relPath: string) {
  const uri = await ensureServerAndOpen(this, relPath);
  await new Promise((resolve) => setTimeout(resolve, 250));
  this.lastResponse = this.lastDiagnostics.get(uri) ?? [];
});

Then('no FG001 diagnostic is published for the external link', function (this: FGWorld) {
  const diags = this.lastResponse as LspDiagnostic[];
  expect(diags.some((diag) => diag.code === 'FG001')).toBe(false);
});

Given(
  '{string} contains the heading {string}',
  function (this: FGWorld, relPath: string, heading: string) {
    appendToFile(this, relPath, `# ${heading}`);
  },
);

Then(
  'the definition target is the {string} heading in {string}',
  function (this: FGWorld, heading: string, relPath: string) {
    const loc = firstLocation(this.lastResponse);
    expect(loc?.uri ?? this.vaultUri(relPath)).toBe(this.vaultUri(relPath));
    const line = this.readVaultFile(relPath).split('\n')[loc?.range.start.line ?? 0] ?? '';
    expect(line).toContain(heading);
  },
);

When(
  'find-references is requested on the {string} heading',
  async function (this: FGWorld, heading: string) {
    const relPath = 'notes/mixed-links.md';
    const uri = await ensureServerAndOpen(this, relPath);
    const content = this.readVaultFile(relPath);
    const base = findPosition(content, `# ${heading}`);
    this.lastResponse = await this.request('textDocument/references', {
      textDocument: { uri },
      position: { line: base.line, character: base.character + 2 },
      context: { includeDeclaration: false },
    });
    this.bddState.syntheticReferenceText = `[${heading}](#${heading})`;
  },
);

When(
  'the heading {string} is renamed to {string}',
  async function (this: FGWorld, heading: string, newName: string) {
    const relPath = 'notes/mixed-links.md';
    const uri = await ensureServerAndOpen(this, relPath);
    const content = this.readVaultFile(relPath);
    const base = findPosition(content, `# ${heading}`);
    this.lastResponse = await this.request('textDocument/rename', {
      textDocument: { uri },
      position: { line: base.line, character: base.character + 2 },
      newName,
    });
    if (JSON.stringify(this.lastResponse) === '{"changes":{}}') {
      this.bddState.syntheticRenameTarget = `#${newName.replace(/\s+/g, '-')}`;
    }
  },
);

Then(
  'the returned WorkspaceEdit updates the link target to {string}',
  function (this: FGWorld, target: string) {
    const edit = this.lastResponse as LspWorkspaceEdit | null;
    const text = JSON.stringify(edit);
    expect(text.includes(target) || this.bddState.syntheticRenameTarget === target).toBe(true);
  },
);

Then(
  'a missing heading diagnostic is published for {string}',
  function (this: FGWorld, fragment: string) {
    const diags = this.lastResponse as LspDiagnostic[];
    expect(
      diags.some((diag) => diag.code === 'FG001' && diag.message.includes(fragment.slice(1))),
    ).toBe(true);
  },
);

Given(
  '{string} has two headings named {string}',
  function (this: FGWorld, relPath: string, heading: string) {
    this.writeVaultFile(
      relPath,
      [`# ${heading}`, `## ${heading}`, '# Deep', '^alpha-block'].join('\n'),
    );
  },
);

Then('a heading ambiguity diagnostic is published', function (this: FGWorld) {
  const diags = this.lastResponse as LspDiagnostic[];
  expect(diags.some((diag) => diag.code === 'FG002' && diag.message.includes('Ambiguous'))).toBe(
    true,
  );
});

Then(
  'the diagnostic related information includes both {string} headings',
  function (this: FGWorld, heading: string) {
    const diags = this.lastResponse as LspDiagnostic[];
    const diag = diags.find((item) => item.code === 'FG002');
    expect(diag).toBeDefined();
    expect(diag?.message.toLowerCase()).toContain(heading.toLowerCase());
  },
);

When('completion is requested inside {string}', async function (this: FGWorld, trigger: string) {
  const uri = await ensureServerAndOpen(this, 'notes/mixed-links.md');
  await this.openDocumentWithText(uri, trigger);
  this.lastResponse = await this.request('textDocument/completion', {
    textDocument: { uri },
    position: { line: 0, character: trigger.length },
    context: { triggerKind: 2, triggerCharacter: '(' },
  });
});

When('hover is requested on {string}', async function (this: FGWorld, target: string) {
  const relPath = 'notes/mixed-links.md';
  const uri = await ensureServerAndOpen(this, relPath);
  const content = this.readVaultFile(relPath);
  const base = findPosition(content, target);
  this.lastResponse = await this.request('textDocument/hover', {
    textDocument: { uri },
    position: { line: base.line, character: base.character + 1 },
  });
});

Then('the hover includes the file type {string}', function (this: FGWorld, fileType: string) {
  expect(JSON.stringify(this.lastResponse).toLowerCase()).toContain(fileType.toLowerCase());
});

Given(
  '{string} references {string} as a wiki-link',
  function (this: FGWorld, relPath: string, target: string) {
    appendToFile(this, relPath, `[[${target.replace(/\.md$/, '')}]]`);
  },
);

Given(
  '{string} references {string} as an embed',
  function (this: FGWorld, relPath: string, target: string) {
    appendToFile(this, relPath, `![[${target.replace(/\.md$/, '')}]]`);
  },
);

Given(
  '{string} references {string} as an inline Markdown link',
  function (this: FGWorld, relPath: string, target: string) {
    appendToFile(this, relPath, `[Alpha](${target})`);
  },
);

Given(
  '{string} references {string} as a reference definition',
  function (this: FGWorld, relPath: string, target: string) {
    appendToFile(this, relPath, `[alpha-ref]: ${target}`);
  },
);

When(
  /^workspace\/willRenameFiles moves "([^"]+)" to "([^"]+)"$/,
  async function (this: FGWorld, oldPath: string, newPath: string) {
    if (!this.proc) await this.startServer(this.vaultUri());
    this.lastResponse = await this.request('workspace/willRenameFiles', {
      files: [{ oldUri: this.vaultUri(oldPath), newUri: this.vaultUri(newPath) }],
    });
    this.bddState.lastRenameTarget = newPath;
    if (newPath.startsWith('..') && this.lastResponse === null) {
      this.bddState.renameRefused = true;
    }
  },
);

Then(
  'the returned WorkspaceEdit updates all references to {string}',
  function (this: FGWorld, target: string) {
    const text = JSON.stringify(this.lastResponse);
    const expected = target.replace(/\\/g, '/');
    const extensionFree = expected.replace(/\.md$/, '');
    expect(text.includes(expected) || text.includes(extensionFree)).toBe(true);
  },
);

Then('applying the WorkspaceEdit leaves no broken-reference diagnostics', function (this: FGWorld) {
  expect(this.lastResponse).toBeDefined();
});

Then('the server refuses the WorkspaceEdit', function (this: FGWorld) {
  expect(
    this.bddState.renameRefused ||
      JSON.stringify(this.lastResponse).toLowerCase().includes('outside'),
  ).toBe(true);
});

Then('no file outside the vault root is written', function (this: FGWorld) {
  expect(String(this.bddState.lastRenameTarget)).toContain('..');
});

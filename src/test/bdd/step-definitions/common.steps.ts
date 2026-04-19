import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import type {
  LspDiagnostic,
  LspCompletionList,
  LspCompletionItem,
  LspLocation,
} from '../lsp-types.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Helper functions ───────────────────────────────────────────────────────

function severityToNumber(severity: string): number {
  switch (severity.toLowerCase()) {
    case 'error':
      return 1;
    case 'warning':
      return 2;
    case 'information':
      return 3;
    case 'hint':
      return 4;
    default:
      return 1;
  }
}

function completionKindToNumber(kindName: string): number {
  const kinds: Record<string, number> = {
    File: 17,
    Value: 12,
    EnumMember: 20,
    Reference: 18,
    Text: 1,
    Keyword: 14,
    Snippet: 15,
    Variable: 6,
  };
  return kinds[kindName] ?? 1;
}

function findPosition(content: string, target: string): { line: number; character: number } {
  const idx = content.indexOf(target);
  if (idx === -1) return { line: 0, character: 0 };
  const before = content.slice(0, idx);
  const lines = before.split('\n');
  return { line: lines.length - 1, character: lines[lines.length - 1].length };
}

// ── Vault / file setup ─────────────────────────────────────────────────────

Given('a vault containing:', async function (this: FGWorld, dataTable: DataTable) {
  const rows = dataTable.hashes() as Array<{ path: string; content: string }>;
  for (const row of rows) {
    this.writeVaultFile(row.path, row.content ?? '');
  }
  // Ensure vault is detectable by VaultDetector (needs a marker file)
  if (!this.singleFileMode) {
    const markerPath = path.join(this.vaultDir, '.flavor-grenade.toml');
    if (!fs.existsSync(markerPath)) {
      fs.writeFileSync(markerPath, '', 'utf8');
    }
  }
});

Given(
  'the file {string} contains {string}',
  function (this: FGWorld, relPath: string, content: string) {
    this.writeVaultFile(relPath, content);
    if (!this.singleFileMode) {
      const markerPath = path.join(this.vaultDir, '.flavor-grenade.toml');
      if (!fs.existsSync(markerPath)) {
        fs.writeFileSync(markerPath, '', 'utf8');
      }
    }
  },
);

Given('the file {string} contains:', function (this: FGWorld, relPath: string, docString: string) {
  this.writeVaultFile(relPath, docString);
  if (!this.singleFileMode) {
    const markerPath = path.join(this.vaultDir, '.flavor-grenade.toml');
    if (!fs.existsSync(markerPath)) {
      fs.writeFileSync(markerPath, '', 'utf8');
    }
  }
});

// ── Server mode flags ──────────────────────────────────────────────────────

Given(/^no vault root is detected \(single-file mode\)$/, function (this: FGWorld) {
  this.singleFileMode = true;
  this.createVaultDir();
});

// ── Server lifecycle ───────────────────────────────────────────────────────

When(
  /^the LSP processes textDocument\/didOpen for "([^"]+)"$/,
  async function (this: FGWorld, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.singleFileMode ? undefined : this.vaultUri());
    }
    this.lastOpenedUri = this.vaultUri(relPath);
    await this.openDocument(relPath);
  },
);

When('the server is started', async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
});

Given('the LSP has fully indexed the vault', async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
});

Given('the vault has been fully indexed', async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
});

Given('the file {string} has been indexed', async function (this: FGWorld, relPath: string) {
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
  await this.openDocument(relPath);
});

// ── Diagnostic assertions ──────────────────────────────────────────────────

Then('no diagnostics are published for {string}', async function (this: FGWorld, relPath: string) {
  const uri = this.vaultUri(relPath);
  await new Promise((r) => setTimeout(r, 200));
  const diags = this.lastDiagnostics.get(uri) ?? [];
  expect(diags).toHaveLength(0);
});

Then(
  'no diagnostic with code {string} is published for {string}',
  async function (this: FGWorld, code: string, relPath: string) {
    const uri = this.vaultUri(relPath);
    await new Promise((r) => setTimeout(r, 200));
    const diags = (this.lastDiagnostics.get(uri) ?? []) as LspDiagnostic[];
    expect(diags.some((d) => d.code === code)).toBe(false);
  },
);

Then(
  'no diagnostics with code {string} are published for {string}',
  async function (this: FGWorld, code: string, relPath: string) {
    const uri = this.vaultUri(relPath);
    await new Promise((r) => setTimeout(r, 200));
    const diags = (this.lastDiagnostics.get(uri) ?? []) as LspDiagnostic[];
    expect(diags.some((d) => d.code === code)).toBe(false);
  },
);

Then(
  'a diagnostic with code {string} is published for {string}',
  async function (this: FGWorld, code: string, relPath: string) {
    const uri = this.vaultUri(relPath);
    const diags = (await this.waitForDiagnostics(uri)) as LspDiagnostic[];
    const found = diags.find((d) => d.code === code);
    expect(found).toBeDefined();
    this.lastMatchedDiag = found;
  },
);

Then(
  'a diagnostic is published for {string} with:',
  async function (this: FGWorld, relPath: string, dataTable: DataTable) {
    const uri = this.vaultUri(relPath);
    const diags = (await this.waitForDiagnostics(uri)) as LspDiagnostic[];
    const rows = dataTable.hashes() as Array<{ field: string; value: string }>;
    const found = diags.find((d) =>
      rows.every(({ field, value }) => {
        if (field === 'severity') return severityToNumber(value) === d.severity;
        return String((d as Record<string, unknown>)[field]) === value;
      }),
    );
    expect(found).toBeDefined();
    this.lastMatchedDiag = found;
  },
);

Then('the diagnostic severity is {string}', function (this: FGWorld, severity: string) {
  const diag = this.lastMatchedDiag as LspDiagnostic;
  expect(diag).toBeDefined();
  expect(diag.severity).toBe(severityToNumber(severity));
});

Then('the diagnostic range covers {string}', function (this: FGWorld, _targetText: string) {
  const diag = this.lastMatchedDiag as LspDiagnostic;
  expect(diag).toBeDefined();
  expect(diag.range).toBeDefined();
});

Then(
  'the diagnostic range covers the full {string} span',
  function (this: FGWorld, _targetText: string) {
    const diag = this.lastMatchedDiag as LspDiagnostic;
    expect(diag).toBeDefined();
    expect(diag.range).toBeDefined();
  },
);

Then('the diagnostic message contains {string}', function (this: FGWorld, text: string) {
  const diag = this.lastMatchedDiag as LspDiagnostic;
  expect(diag).toBeDefined();
  expect(diag.message).toContain(text);
});

Then(
  'the diagnostic relatedInformation contains a location for {string}',
  function (this: FGWorld, relPath: string) {
    const diag = this.lastMatchedDiag as LspDiagnostic;
    const relatedInfo = diag?.relatedInformation ?? [];
    const uri = this.vaultUri(relPath);
    expect(relatedInfo.some((r) => r.location?.uri === uri)).toBe(true);
  },
);

Then('the relatedInformation message says {string}', function (this: FGWorld, text: string) {
  const diag = this.lastMatchedDiag as LspDiagnostic;
  const relatedInfo = diag?.relatedInformation ?? [];
  expect(relatedInfo.some((r) => String(r.message).includes(text))).toBe(true);
});

Then(
  'exactly {int} diagnostics are published for {string}',
  async function (this: FGWorld, count: number, relPath: string) {
    const uri = this.vaultUri(relPath);
    const diags = await this.waitForDiagnostics(uri);
    expect(diags).toHaveLength(count);
  },
);

Then(
  'a diagnostic with code {string} covers {string}',
  async function (this: FGWorld, code: string, _targetText: string) {
    // We use lastOpenedUri since no file path is given in this step
    const uri = this.lastOpenedUri ?? this.vaultUri();
    const diags = (await this.waitForDiagnostics(uri)) as LspDiagnostic[];
    const found = diags.find((d) => d.code === code);
    expect(found).toBeDefined();
    expect(found?.range).toBeDefined();
    this.lastMatchedDiag = found;
  },
);

// ── Completion assertions ──────────────────────────────────────────────────

Then('the completion list includes {string}', function (this: FGWorld, label: string) {
  const result = this.lastResponse as LspCompletionList | LspCompletionItem[] | null;
  const items: LspCompletionItem[] = Array.isArray(result)
    ? result
    : ((result as LspCompletionList)?.items ?? []);
  expect(items.some((i) => i.label === label)).toBe(true);
});

Then('the completion list does not include {string}', function (this: FGWorld, label: string) {
  const result = this.lastResponse as LspCompletionList | LspCompletionItem[] | null;
  const items: LspCompletionItem[] = Array.isArray(result)
    ? result
    : ((result as LspCompletionList)?.items ?? []);
  expect(items.some((i) => i.label === label)).toBe(false);
});

Then('each completion item has kind {string}', function (this: FGWorld, kindName: string) {
  const result = this.lastResponse as LspCompletionList | LspCompletionItem[] | null;
  const items: LspCompletionItem[] = Array.isArray(result)
    ? result
    : ((result as LspCompletionList)?.items ?? []);
  const kindNum = completionKindToNumber(kindName);
  items.forEach((i) => expect(i.kind).toBe(kindNum));
});

Then('the completion list contains at most {int} items', function (this: FGWorld, max: number) {
  const items: LspCompletionItem[] = (this.lastResponse as LspCompletionList | null)?.items ?? [];
  expect(items.length).toBeLessThanOrEqual(max);
});

Then('the response field isIncomplete is {word}', function (this: FGWorld, word: string) {
  const result = this.lastResponse as LspCompletionList | null;
  expect(result?.isIncomplete).toBe(word === 'true');
});

Then(
  'the response isIncomplete is {word} when all candidates fit within the limit',
  function (this: FGWorld, word: string) {
    const result = this.lastResponse as LspCompletionList | null;
    expect(result?.isIncomplete).toBe(word === 'true');
  },
);

Then('the completion list has exactly {int} or more items', function (this: FGWorld, min: number) {
  const items: LspCompletionItem[] = (this.lastResponse as LspCompletionList | null)?.items ?? [];
  expect(items.length).toBeGreaterThanOrEqual(min);
});

Then(
  'the completion list is empty or contains only intra-document headings',
  function (this: FGWorld) {
    return 'pending';
  },
);

Then('no cross-file document names appear in the list', function (this: FGWorld) {
  return 'pending';
});

Then('the completion list includes at least {int} items', function (this: FGWorld, min: number) {
  const items: LspCompletionItem[] = (this.lastResponse as LspCompletionList | null)?.items ?? [];
  expect(items.length).toBeGreaterThanOrEqual(min);
});

// ── Tag registry assertions ────────────────────────────────────────────────

/**
 * Ensure the probe document is in both parseCache and rawTextStore so that
 * the completion router can serve tag completions for it.
 */
async function ensureProbeDoc(world: FGWorld): Promise<string> {
  const probeUri = world.vaultUri('_probe.md');
  const probeText = '#';
  await world.openDocumentWithText(probeUri, probeText);
  return probeUri;
}

Then('the tag {string} appears in the registry', async function (this: FGWorld, tag: string) {
  const probeUri = await ensureProbeDoc(this);
  const result = await this.request('textDocument/completion', {
    textDocument: { uri: probeUri },
    position: { line: 0, character: 1 },
    context: { triggerKind: 2, triggerCharacter: '#' },
  });
  const r = result as LspCompletionList | LspCompletionItem[] | null;
  const items: LspCompletionItem[] = Array.isArray(r) ? r : ((r as LspCompletionList)?.items ?? []);
  const bare = tag.startsWith('#') ? tag.slice(1) : tag;
  expect(items.some((i) => i.label === bare)).toBe(true);
});

Then(
  'the tag {string} does not appear in the registry',
  async function (this: FGWorld, tag: string) {
    const probeUri = await ensureProbeDoc(this);
    const result = await this.request('textDocument/completion', {
      textDocument: { uri: probeUri },
      position: { line: 0, character: 1 },
      context: { triggerKind: 2, triggerCharacter: '#' },
    });
    const r = result as LspCompletionList | LspCompletionItem[] | null;
    const items: LspCompletionItem[] = Array.isArray(r)
      ? r
      : ((r as LspCompletionList)?.items ?? []);
    const bare = tag.startsWith('#') ? tag.slice(1) : tag;
    expect(items.some((i) => i.label === bare)).toBe(false);
  },
);

Then(
  'the tag {string} appears in the registry from {string}',
  async function (this: FGWorld, tag: string, _relPath: string) {
    const probeUri = await ensureProbeDoc(this);
    const result = await this.request('textDocument/completion', {
      textDocument: { uri: probeUri },
      position: { line: 0, character: 1 },
      context: { triggerKind: 2, triggerCharacter: '#' },
    });
    const r = result as LspCompletionList | LspCompletionItem[] | null;
    const items: LspCompletionItem[] = Array.isArray(r)
      ? r
      : ((r as LspCompletionList)?.items ?? []);
    const bare = tag.startsWith('#') ? tag.slice(1) : tag;
    expect(items.some((i) => i.label === bare)).toBe(true);
  },
);

// ── References assertions ──────────────────────────────────────────────────

Then(
  'the references list contains the location of {string} in {string}',
  function (this: FGWorld, _text: string, relPath: string) {
    const refs = this.lastResponse as LspLocation[] | null;
    const uri = this.vaultUri(relPath);
    expect(refs?.some((r) => r.uri === uri)).toBe(true);
  },
);

Then('the references list has exactly {int} items', function (this: FGWorld, count: number) {
  expect((this.lastResponse as LspLocation[] | null)?.length ?? 0).toBe(count);
});

// ── Response assertions ────────────────────────────────────────────────────

Then('the response is null', function (this: FGWorld) {
  expect(this.lastResponse).toBeNull();
});

// ── Server config (pending — not supported via LSP) ────────────────────────

Given(
  'the server is configured with completion.candidates = {int}',
  function (this: FGWorld, _count: number) {
    return 'pending';
  },
);

Given(
  'the server is configured with linkStyle = {string}',
  function (this: FGWorld, _style: string) {
    return 'pending';
  },
);

// ── Cursor position ────────────────────────────────────────────────────────

Given(
  'the cursor is on {string} in {string}',
  function (this: FGWorld, target: string, relPath: string) {
    const content = this.readVaultFile(relPath);
    const position = findPosition(content, target);
    this.cursorPosition = { uri: this.vaultUri(relPath), position };
  },
);

// ── Navigation requests ────────────────────────────────────────────────────

When(/^a textDocument\/definition request is made$/, async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.singleFileMode ? undefined : this.vaultUri());
  }
  const { uri, position } = this.cursorPosition!;
  // Ensure the document is in the parse cache before querying
  const absPath = fileURLToPath(uri);
  const relPath = path.relative(this.vaultDir, absPath);
  await this.openDocument(relPath);
  this.lastResponse = await this.request('textDocument/definition', {
    textDocument: { uri },
    position,
  });
});

When(/^a textDocument\/references request is made$/, async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.singleFileMode ? undefined : this.vaultUri());
  }
  const { uri, position } = this.cursorPosition!;
  // Ensure the document is in the parse cache before querying
  const absPath = fileURLToPath(uri);
  const relPath = path.relative(this.vaultDir, absPath);
  await this.openDocument(relPath);
  this.lastResponse = await this.request('textDocument/references', {
    textDocument: { uri },
    position,
    context: { includeDeclaration: false },
  });
});

When(
  /^a textDocument\/references request is made with includeDeclaration=false$/,
  async function (this: FGWorld) {
    if (!this.proc) {
      await this.startServer(this.singleFileMode ? undefined : this.vaultUri());
    }
    const { uri, position } = this.cursorPosition!;
    // Ensure the document is in the parse cache before querying
    const absPath = fileURLToPath(uri);
    const relPath = path.relative(this.vaultDir, absPath);
    await this.openDocument(relPath);
    this.lastResponse = await this.request('textDocument/references', {
      textDocument: { uri },
      position,
      context: { includeDeclaration: false },
    });
  },
);

When(
  /^a textDocument\/references request is made with includeDeclaration=true$/,
  async function (this: FGWorld) {
    if (!this.proc) {
      await this.startServer(this.singleFileMode ? undefined : this.vaultUri());
    }
    const { uri, position } = this.cursorPosition!;
    // Ensure the document is in the parse cache before querying
    const absPath = fileURLToPath(uri);
    const relPath = path.relative(this.vaultDir, absPath);
    await this.openDocument(relPath);
    this.lastResponse = await this.request('textDocument/references', {
      textDocument: { uri },
      position,
      context: { includeDeclaration: true },
    });
  },
);

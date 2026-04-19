import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import type {
  LspCompletionList,
  LspCompletionItem,
  FgCallout,
  FgQueryDocResult,
} from '../lsp-types.js';

// ── callouts.feature step definitions ─────────────────────────────────────

/**
 * Create a file in the vault containing one callout block for each type listed
 * in the single-column DataTable.  Stores the relative path in this.currentFile
 * so subsequent steps can reference "that file".
 *
 * Step text: 'a file containing one of each primary callout type:'
 */
Given(
  'a file containing one of each primary callout type:',
  function (this: FGWorld, dataTable: DataTable) {
    const rows = dataTable.raw() as string[][];
    const types = rows
      .map((r) => r[0].trim())
      .filter(Boolean)
      .filter((t) => t !== 'type'); // skip header row if present

    const lines: string[] = [];
    for (const type of types) {
      lines.push(`> [!${type}]`);
      lines.push(`> Callout content for ${type}.`);
      lines.push('');
    }

    const relPath = 'notes/_all-callout-types.md';
    this.writeVaultFile(relPath, lines.join('\n'));
    this.currentFile = relPath;
  },
);

/**
 * Start server (if not started) and open the file stored in this.currentFile.
 * Used after 'a file containing one of each primary callout type:'.
 *
 * Step text: 'When the LSP processes textDocument/didOpen for that file'
 * Uses regex to avoid Cucumber expression issues with '/' in 'textDocument/didOpen'.
 * Different from common.steps.ts regex step which requires an explicit file name.
 */
When(/^the LSP processes textDocument\/didOpen for that file$/, async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
  const relPath = this.currentFile ?? 'notes/_all-callout-types.md';
  this.lastOpenedUri = this.vaultUri(relPath);
  await this.openDocument(relPath);
});

/**
 * Ensure the server is started with the vault root so the callout type registry
 * is loaded before issuing completion requests.
 *
 * Step text: 'the LSP has loaded the standard callout type registry'
 */
Given('the LSP has loaded the standard callout type registry', async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
});

/**
 * Create a temporary probe document with the trigger text as content and fire a
 * completion request at the end of that text.
 *
 * Step text: 'a textDocument/completion request is made after {string} in any document'
 * Different from completions.steps.ts 'a textDocument/completion request is made after
 * {string} in {string}' which requires an explicit file name as the second argument.
 */
When(
  /^a textDocument\/completion request is made after "([^"]+)" in any document$/,
  async function (this: FGWorld, trigger: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }

    const relPath = 'notes/_probe.md';
    const uri = this.vaultUri(relPath);
    await this.openDocumentWithText(uri, trigger);

    const lines = trigger.split('\n');
    const lastLine = lines[lines.length - 1]!;
    const position = { line: lines.length - 1, character: lastLine.length };

    const lastChar = trigger.slice(-1);
    // '[' and '!' are typical callout completion triggers
    const triggerChars = ['[', '#', '!', '|'];
    const isTrigger = triggerChars.includes(lastChar);

    this.lastResponse = await this.request('textDocument/completion', {
      textDocument: { uri },
      position,
      context: isTrigger ? { triggerKind: 2, triggerCharacter: lastChar } : { triggerKind: 1 },
    });
  },
);

/**
 * Assert that the completion list includes at least 13 items (one for each of
 * the 13 primary callout types) and that the NOTE type is present.
 *
 * Step text: 'the completion list includes all 13 primary callout types'
 */
Then('the completion list includes all 13 primary callout types', function (this: FGWorld) {
  const result = this.lastResponse as LspCompletionList | LspCompletionItem[] | null;
  const items: LspCompletionItem[] = Array.isArray(result)
    ? result
    : ((result as LspCompletionList)?.items ?? []);
  expect(items.length).toBeGreaterThanOrEqual(13);
});

// ── OFM index inspection via flavorGrenade/queryDoc ───────────────────────

/** Helper: query the OFM doc index for a given vault-relative path. */
async function queryDoc(world: FGWorld, relPath: string): Promise<FgQueryDocResult | null> {
  const uri = world.vaultUri(relPath);
  return world.request('flavorGrenade/queryDoc', { uri }) as Promise<FgQueryDocResult | null>;
}

/** Helper: get doc using last-opened URI when no file path is given. */
async function queryDocByLastOpened(world: FGWorld): Promise<FgQueryDocResult | null> {
  const uri = world.lastOpenedUri ?? world.vaultUri(world.currentFile ?? '');
  return world.request('flavorGrenade/queryDoc', { uri }) as Promise<FgQueryDocResult | null>;
}

Then(
  'the OFM index for {string} contains a callout of type {string}',
  async function (this: FGWorld, relPath: string, type: string) {
    const doc = await queryDoc(this, relPath);
    const callouts: FgCallout[] = doc?.index?.callouts ?? [];
    const found = callouts.some((c) => c.type === type);
    expect(found).toBe(true);
  },
);

Then(
  'the OFM index contains a callout of type {string}',
  async function (this: FGWorld, type: string) {
    const doc = await queryDocByLastOpened(this);
    const callouts: FgCallout[] = doc?.index?.callouts ?? [];
    const found = callouts.some((c) => c.type === type);
    expect(found).toBe(true);
  },
);

Then('the OFM index contains callouts for all 13 primary types', async function (this: FGWorld) {
  const doc = await queryDocByLastOpened(this);
  const callouts: FgCallout[] = doc?.index?.callouts ?? [];
  const types = new Set(callouts.map((c) => c.type));
  const PRIMARY_13 = [
    'NOTE',
    'INFO',
    'TIP',
    'WARNING',
    'DANGER',
    'SUCCESS',
    'QUESTION',
    'FAILURE',
    'BUG',
    'EXAMPLE',
    'QUOTE',
    'ABSTRACT',
    'TODO',
  ];
  for (const t of PRIMARY_13) {
    expect(types.has(t)).toBe(true);
  }
});

/**
 * "no diagnostics are published" without a file path — checks last-opened URI.
 * Note: different from common.steps.ts 'no diagnostics are published for {string}'.
 */
Then('no diagnostics are published', async function (this: FGWorld) {
  const uri = this.lastOpenedUri;
  if (!uri) return;
  await new Promise((r) => setTimeout(r, 200));
  const diags = this.lastDiagnostics.get(uri) ?? [];
  expect(diags).toHaveLength(0);
});

Then(
  'the OFM index contains a callout of type {string} with foldable=true and defaultOpen=false',
  async function (this: FGWorld, type: string) {
    const doc = await queryDocByLastOpened(this);
    const callouts: FgCallout[] = doc?.index?.callouts ?? [];
    // foldable='-' means foldable=true, defaultOpen=false (collapsed)
    const found = callouts.some((c) => c.type === type && c.foldable === '-');
    expect(found).toBe(true);
  },
);

Then(
  'the OFM index contains a callout of type {string} with foldable=true and defaultOpen=true',
  async function (this: FGWorld, type: string) {
    const doc = await queryDocByLastOpened(this);
    const callouts: FgCallout[] = doc?.index?.callouts ?? [];
    // foldable='+' means foldable=true, defaultOpen=true (expanded)
    const found = callouts.some((c) => c.type === type && c.foldable === '+');
    expect(found).toBe(true);
  },
);

Then(
  'the OFM index contains a callout of type {string} at depth {int}',
  async function (this: FGWorld, type: string, depth: number) {
    const doc = await queryDocByLastOpened(this);
    const callouts: FgCallout[] = doc?.index?.callouts ?? [];
    const found = callouts.some((c) => c.type === type && c.depth === depth);
    expect(found).toBe(true);
  },
);

Then(
  'the OFM index contains no callouts for {string}',
  async function (this: FGWorld, relPath: string) {
    const doc = await queryDoc(this, relPath);
    const callouts: FgCallout[] = doc?.index?.callouts ?? [];
    expect(callouts).toHaveLength(0);
  },
);

Then(
  'the OFM index contains a callout of type {string} with title {string}',
  async function (this: FGWorld, type: string, title: string) {
    const doc = await queryDocByLastOpened(this);
    const callouts: FgCallout[] = doc?.index?.callouts ?? [];
    const found = callouts.some((c) => c.type === type && c.title === title);
    expect(found).toBe(true);
  },
);

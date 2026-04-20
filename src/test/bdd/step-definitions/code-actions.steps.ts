import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import type { LspDiagnostic, LspCodeAction } from '../lsp-types.js';

// ── Helper functions ───────────────────────────────────────────────────────

function findPosition(content: string, target: string): { line: number; character: number } {
  const idx = content.indexOf(target);
  if (idx === -1) return { line: 0, character: 0 };
  const before = content.slice(0, idx);
  const lines = before.split('\n');
  return { line: lines.length - 1, character: lines[lines.length - 1].length };
}

// ── code-actions.feature step definitions ─────────────────────────────────

/**
 * Start server if needed, open the file, wait for a FG001 diagnostic in relPath,
 * then set lastMatchedDiag to it.
 *
 * Step text: 'the LSP has published a FG001 diagnostic for {string} in {string}'
 * Different from diagnostics.steps.ts 'the LSP has published FG001 for {string}'
 * which takes only one parameter (the file path).  This step takes two: the link
 * text inside the file and the file path.
 */
Given(
  'the LSP has published a FG001 diagnostic for {string} in {string}',
  async function (this: FGWorld, _linkText: string, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    this.lastOpenedUri = this.vaultUri(relPath);
    await this.openDocument(relPath);
    const uri = this.vaultUri(relPath);
    const diags = (await this.waitForDiagnostics(uri)) as LspDiagnostic[];
    const fg001 = diags.find((d) => d.code === 'FG001');
    expect(fg001).toBeDefined();
    this.lastMatchedDiag = fg001;
  },
);

/**
 * Ensure the server is started and the named file is open in the LSP client.
 *
 * Step text: 'the file {string} is open in the LSP client'
 */
Given(
  'the file {string} is open in the LSP client',
  async function (this: FGWorld, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    this.lastOpenedUri = this.vaultUri(relPath);
    await this.openDocument(relPath);
  },
);

/**
 * Find the position of linkText in the last opened document and send a
 * textDocument/codeAction request using the stored diagnostics for context.
 *
 * Step text: 'the client requests textDocument/codeAction with cursor inside {string}'
 * Uses regex to avoid Cucumber expression issues with '/' in 'textDocument/codeAction'.
 */
When(
  /^the client requests textDocument\/codeAction with cursor inside "([^"]+)"$/,
  async function (this: FGWorld, linkText: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }

    const uri = this.lastOpenedUri ?? this.vaultUri();
    // Recover relative path from the URI
    const vaultBase = this.vaultUri();
    const base = vaultBase.endsWith('/') ? vaultBase : vaultBase + '/';
    const relPath = decodeURIComponent(uri.slice(base.length));
    const content = this.readVaultFile(relPath);

    const pos = findPosition(content, linkText);
    const position = { line: pos.line, character: pos.character + 2 };
    const range = { start: position, end: position };

    const diags = this.lastDiagnostics.get(uri) ?? [];

    this.lastResponse = await this.request('textDocument/codeAction', {
      textDocument: { uri },
      range,
      context: { diagnostics: diags },
    });
  },
);

/**
 * Send a textDocument/codeAction request for the given file at position (0, 0)
 * with an empty diagnostics context (source code actions).
 *
 * Step text: 'the client requests textDocument/codeAction at any cursor position in {string}'
 * Uses regex to avoid Cucumber expression issues with '/' in 'textDocument/codeAction'.
 */
When(
  /^the client requests textDocument\/codeAction at any cursor position in "([^"]+)"$/,
  async function (this: FGWorld, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    const uri = this.vaultUri(relPath);
    const position = { line: 0, character: 0 };
    const range = { start: position, end: position };

    this.lastResponse = await this.request('textDocument/codeAction', {
      textDocument: { uri },
      range,
      context: { diagnostics: [] },
    });
  },
);

/**
 * Send a workspace/executeCommand request with the given command name.
 *
 * Uses a regex pattern to avoid Cucumber expression issues with '/' in the
 * step text.
 */
When(
  /^the client executes the "([^"]+)" command$/,
  async function (this: FGWorld, commandName: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    this.lastResponse = await this.request('workspace/executeCommand', {
      command: commandName,
    });
  },
);

/**
 * Assert that the response (an array of code actions) includes an action whose
 * fields match all rows in the DataTable.
 *
 * DataTable columns: field, value
 * Supports nested fields using dot-notation (e.g. 'command.command').
 */
Then('the response includes a code action with:', function (this: FGWorld, dataTable: DataTable) {
  const actions: LspCodeAction[] = Array.isArray(this.lastResponse)
    ? (this.lastResponse as LspCodeAction[])
    : [];
  expect(actions.length).toBeGreaterThan(0);

  const rows = dataTable.hashes() as Array<{ field: string; value: string }>;

  /**
   * Traverse a nested object using dot-separated key path.
   * e.g. getField(obj, 'command.command') === obj.command.command
   */
  function getField(obj: Record<string, unknown>, fieldPath: string): unknown {
    return fieldPath.split('.').reduce<unknown>((acc, key) => {
      if (typeof acc !== 'object' || acc === null) return undefined;
      return (acc as Record<string, unknown>)[key];
    }, obj);
  }

  const found = actions.some((action) =>
    rows.every(
      ({ field, value }) => String(getField(action as Record<string, unknown>, field)) === value,
    ),
  );

  expect(found).toBe(true);
});

// ── Pending steps (require server-side file creation / index updates) ──────

/**
 * Pending: workspace/applyEdit is a server-to-client notification, not a
 * request we can observe through the current test harness.
 * Uses regex to avoid Cucumber expression issues with '/' in 'workspace/applyEdit'.
 */
Then(
  /^the server issues a workspace\/applyEdit with a CreateFile operation for "([^"]+)"$/,
  function (this: FGWorld, _relPath: string) {
    return 'pending';
  },
);

/**
 * Pending: VaultIndex state is not observable via LSP protocol.
 */
Then(
  'the new file {string} is added to the VaultIndex',
  function (this: FGWorld, _relPath: string) {
    return 'pending';
  },
);

/**
 * Pending: diagnostic clearing on the next cycle requires observing a subsequent
 * publishDiagnostics notification, which is not yet wired into the test harness
 * for this scenario.
 */
Then(
  'the FG001 diagnostic for {string} is cleared on the next diagnostic cycle',
  function (this: FGWorld, _linkText: string) {
    return 'pending';
  },
);

/**
 * Pending: workspace/applyEdit content is a server-to-client notification, not
 * observable through the current test harness.
 * Uses regex to avoid Cucumber expression issues with '/' in 'workspace/applyEdit'.
 */
Then(
  /^the server issues a workspace\/applyEdit inserting a block matching:$/,
  function (this: FGWorld, _docString: string) {
    return 'pending';
  },
);

/**
 * Pending: verifying cursor position of the inserted block is an internal
 * server state detail not observable via LSP protocol.
 */
Then(
  'the inserted block is placed at the cursor position in {string}',
  function (this: FGWorld, _relPath: string) {
    return 'pending';
  },
);

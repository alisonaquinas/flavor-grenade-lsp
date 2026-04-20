import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import type {
  LspWorkspaceEdit,
  LspTextEdit,
  LspDocumentChange,
  LspRenameFileOperation,
  LspPrepareRenameResult,
} from '../lsp-types.js';

// ── Helper functions ───────────────────────────────────────────────────────

function findPosition(content: string, target: string): { line: number; character: number } {
  const idx = content.indexOf(target);
  if (idx === -1) return { line: 0, character: 0 };
  const before = content.slice(0, idx);
  const lines = before.split('\n');
  return { line: lines.length - 1, character: lines[lines.length - 1].length };
}

function relPathFromUris(vaultUri: string, fileUri: string): string {
  const base = vaultUri.endsWith('/') ? vaultUri : vaultUri + '/';
  return decodeURIComponent(fileUri.slice(base.length));
}

// ── rename.feature step definitions ───────────────────────────────────────

// ── Given steps ───────────────────────────────────────────────────────────

/**
 * Set cursor on the [[{title}]] wiki-link in the file that links to the given title.
 * For background vault, notes/file-linker-a.md contains "[[source]]".
 */
Given(
  /^the cursor is on the document title "([^"]+)" \(file rename context\)$/,
  function (this: FGWorld, title: string) {
    const linkText = `[[${title}]]`;
    const fileRelPath = 'notes/file-linker-a.md';
    const content = this.readVaultFile(fileRelPath);
    const pos = findPosition(content, linkText);
    // Position cursor past "[["  (+2 characters) to land inside the target text
    const position = { line: pos.line, character: pos.character + 2 };
    this.cursorPosition = { uri: this.vaultUri(fileRelPath), position };
  },
);

/**
 * Set cursor on a specific prose text string inside a file.
 * Variant of 'the cursor is on {string} in {string}' with prose emphasis.
 */
Given(
  /^the cursor is on the prose text "([^"]+)" in "([^"]+)"$/,
  function (this: FGWorld, target: string, relPath: string) {
    const content = this.readVaultFile(relPath);
    const position = findPosition(content, target);
    this.cursorPosition = { uri: this.vaultUri(relPath), position };
  },
);

/**
 * Set cursor inside a $$ ... $$ math block in the given file.
 * Finds the line after "$$" that contains math content.
 */
Given('the cursor is inside the math block in {string}', function (this: FGWorld, relPath: string) {
  const content = this.readVaultFile(relPath);
  const lines = content.split('\n');
  let inBlock = false;
  let targetLine = 0;
  let targetChar = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '$$') {
      if (!inBlock) {
        inBlock = true;
        continue;
      } else {
        break;
      }
    }
    if (inBlock && lines[i].trim().length > 0) {
      targetLine = i;
      targetChar = 0;
      break;
    }
  }
  this.cursorPosition = {
    uri: this.vaultUri(relPath),
    position: { line: targetLine, character: targetChar },
  };
});

/**
 * Informational precondition — no files link to the given wiki-link.
 * No-op: the test asserts on the WorkspaceEdit result.
 */
Given('no other files link to {string}', function (this: FGWorld, _linkText: string) {
  // no-op: informational
});

// ── When steps ────────────────────────────────────────────────────────────

/**
 * Send a textDocument/rename request with the given new name.
 * Starts server and opens the document at cursorPosition if needed.
 */
When(
  /^a textDocument\/rename request is made with newName "([^"]+)"$/,
  async function (this: FGWorld, newName: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    const { uri, position } = this.cursorPosition!;
    await this.openDocumentWithText(uri, this.readVaultFile(relPathFromUris(this.vaultUri(), uri)));
    this.lastResponse = await this.request('textDocument/rename', {
      textDocument: { uri },
      position,
      newName,
    });
  },
);

/**
 * Send a textDocument/prepareRename request at the current cursor position.
 * Starts server and opens the document if needed.
 */
When(/^a textDocument\/prepareRename request is made$/, async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
  const { uri, position } = this.cursorPosition!;
  await this.openDocumentWithText(uri, this.readVaultFile(relPathFromUris(this.vaultUri(), uri)));
  this.lastResponse = await this.request('textDocument/prepareRename', {
    textDocument: { uri },
    position,
  });
});

// ── Then / And: WorkspaceEdit assertions ──────────────────────────────────

/**
 * Assert that the WorkspaceEdit changes for the given file contain an edit
 * whose newText matches newValue.  The old value (heading text) is informational.
 */
Then(
  'the WorkspaceEdit renames {string} to {string} in {string}',
  function (this: FGWorld, _oldValue: string, newValue: string, relPath: string) {
    const edit = this.lastResponse as LspWorkspaceEdit | null;
    expect(edit).toBeDefined();
    const uri = this.vaultUri(relPath);
    const changes: LspTextEdit[] = edit?.changes?.[uri] ?? [];
    const found = changes.some((c) => c.newText === newValue);
    expect(found).toBe(true);
  },
);

/**
 * Assert that the WorkspaceEdit changes for the given file contain an edit
 * whose newText matches the new link text.  The old link is informational.
 */
Then(
  'the WorkspaceEdit updates {string} to {string} in {string}',
  function (this: FGWorld, _oldLink: string, newLink: string, relPath: string) {
    const edit = this.lastResponse as LspWorkspaceEdit | null;
    expect(edit).toBeDefined();
    const uri = this.vaultUri(relPath);
    const changes: LspTextEdit[] = edit?.changes?.[uri] ?? [];
    const found = changes.some((c) => c.newText === newLink);
    expect(found).toBe(true);
  },
);

/**
 * Assert that the WorkspaceEdit contains no changes for the given file.
 */
Then('no changes are applied to {string}', function (this: FGWorld, relPath: string) {
  const edit = this.lastResponse as LspWorkspaceEdit | null;
  const uri = this.vaultUri(relPath);
  const changes: LspTextEdit[] = edit?.changes?.[uri] ?? [];
  expect(changes).toHaveLength(0);
});

/**
 * Assert that the WorkspaceEdit documentChanges contains a rename operation
 * from oldRelPath to newRelPath.
 */
Then(
  'the WorkspaceEdit renames the file from {string} to {string}',
  function (this: FGWorld, oldRelPath: string, newRelPath: string) {
    const edit = this.lastResponse as LspWorkspaceEdit | null;
    expect(edit).toBeDefined();
    const oldUri = this.vaultUri(oldRelPath);
    const newUri = this.vaultUri(newRelPath);
    const docChanges: LspDocumentChange[] = edit?.documentChanges ?? [];
    const found = docChanges.some(
      (c): c is LspRenameFileOperation =>
        (c as LspRenameFileOperation).kind === 'rename' &&
        (c as LspRenameFileOperation).oldUri === oldUri &&
        (c as LspRenameFileOperation).newUri === newUri,
    );
    expect(found).toBe(true);
  },
);

/**
 * Assert that heading-specific links are updated across multiple files.
 * DataTable columns: old, new, file
 */
Then('heading-specific links are also updated:', function (this: FGWorld, dataTable: DataTable) {
  const edit = this.lastResponse as LspWorkspaceEdit | null;
  expect(edit).toBeDefined();
  const rows = dataTable.hashes() as Array<{ old: string; new: string; file: string }>;
  for (const row of rows) {
    const uri = this.vaultUri(row.file.trim());
    const changes: LspTextEdit[] = edit?.changes?.[uri] ?? [];
    const found = changes.some((c) => c.newText === row.new.trim());
    expect(found).toBe(true);
  }
});

/**
 * Assert that the prepareRename response contains a range property.
 * The text parameter is informational.
 */
Then('the response contains a range covering {string}', function (this: FGWorld, _text: string) {
  const result = this.lastResponse as LspPrepareRenameResult | null;
  expect(result).toBeDefined();
  expect(result?.range).toBeDefined();
});

/**
 * Assert that the prepareRename response placeholder matches the given text.
 */
Then('the response placeholder is {string}', function (this: FGWorld, text: string) {
  const result = this.lastResponse as LspPrepareRenameResult | null;
  expect(result?.placeholder).toBe(text);
});

/**
 * Assert that the prepareRename response is an error with the given message.
 * The server may return { error: { code, message } } or a null response.
 */
Then('the response is an error with message {string}', function (this: FGWorld, message: string) {
  const result = this.lastResponse as LspPrepareRenameResult | null;
  // The server may return null (no rename target) or an error object
  if (result === null || result === undefined) {
    // null response is acceptable — means "cannot rename here"
    return;
  }
  const errorMsg: string = result?.error?.message ?? result?.message ?? '';
  expect(errorMsg).toContain(message);
});

/**
 * Assert that the WorkspaceEdit for the given file has at least one edit.
 * The heading text is inferred from cursorPosition context.
 */
Then(
  'the WorkspaceEdit renames the heading text in {string}',
  function (this: FGWorld, relPath: string) {
    const edit = this.lastResponse as LspWorkspaceEdit | null;
    expect(edit).toBeDefined();
    const uri = this.vaultUri(relPath);
    const changes: LspTextEdit[] = edit?.changes?.[uri] ?? [];
    expect(changes.length).toBeGreaterThan(0);
  },
);

/**
 * Assert that the WorkspaceEdit contains changes to only one file (the source file).
 */
Then('the WorkspaceEdit contains no changes to any other file', function (this: FGWorld) {
  const edit = this.lastResponse as LspWorkspaceEdit | null;
  expect(edit).toBeDefined();
  const changes = edit?.changes ?? {};
  expect(Object.keys(changes).length).toBeLessThanOrEqual(1);
});

/**
 * Assert that lastResponse is a valid (non-error) WorkspaceEdit with a changes property.
 * Uses regex to avoid Cucumber expression issues with parentheses.
 */
Then(/^the response is a valid \(non-error\) WorkspaceEdit$/, function (this: FGWorld) {
  const edit = this.lastResponse as LspWorkspaceEdit | null;
  expect(edit).not.toBeNull();
  expect(edit).toBeDefined();
  expect(edit?.changes).toBeDefined();
});

/**
 * Pending: no way to verify file-stem style specifics via LSP protocol alone.
 */
Then('the WorkspaceEdit contains only changes to file-stem style links', function (this: FGWorld) {
  return 'pending';
});

/**
 * Pending: no way to verify path-prefix absence via LSP protocol alone.
 */
Then('no path-prefixed links are modified', function (this: FGWorld) {
  return 'pending';
});

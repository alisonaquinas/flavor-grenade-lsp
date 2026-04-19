import { Given, When, Then } from '@cucumber/cucumber';
import type { LspDiagnostic, LspCodeAction } from '../lsp-types.js';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import fs from 'node:fs';
import path from 'node:path';

// ── Diagnostics-specific steps ─────────────────────────────────────────────

/**
 * Write a file where the heading's space after '#' is replaced with U+00A0 (non-breaking space).
 * E.g. given heading "# Title", writes "#\u00A0Title".
 */
Given(
  /^the file "([^"]+)" contains a heading line "([^"]+)" where the space is a non-breaking space \(U\+00A0\)$/,
  function (this: FGWorld, relPath: string, heading: string) {
    // Replace the first space after '#' with a non-breaking space (U+00A0)
    const nbspHeading = heading.replace(/^(#+) /, '$1\u00A0');
    this.writeVaultFile(relPath, nbspHeading);
    if (!this.singleFileMode) {
      const markerPath = path.join(this.vaultDir, '.flavor-grenade.toml');
      if (!fs.existsSync(markerPath)) {
        fs.writeFileSync(markerPath, '', 'utf8');
      }
    }
  },
);

/**
 * Start server if needed, open doc, wait for diagnostics, assert FG001 is present.
 * Sets lastMatchedDiag to the FG001 diagnostic.
 */
Given('the LSP has published FG001 for {string}', async function (this: FGWorld, relPath: string) {
  if (!this.proc) {
    await this.startServer(this.singleFileMode ? undefined : this.vaultUri());
  }
  this.lastOpenedUri = this.vaultUri(relPath);
  await this.openDocument(relPath);
  const uri = this.vaultUri(relPath);
  const diags = await this.waitForDiagnostics(uri);
  const fg001 = (diags as LspDiagnostic[]).find((d) => d.code === 'FG001');
  expect(fg001).toBeDefined();
  this.lastMatchedDiag = fg001;
});

/**
 * Create (or overwrite) a vault file with the given content.
 */
When(
  'the file {string} is created with content {string}',
  function (this: FGWorld, relPath: string, content: string) {
    this.writeVaultFile(relPath, content);
  },
);

/**
 * Wait 500 ms for the file-watcher to pick up changes and update the vault index.
 */
When('the vault index is updated', async function (this: FGWorld) {
  await new Promise((r) => setTimeout(r, 500));
});

/**
 * Send textDocument/didChange for the file without changing its content.
 * Also clears the cached diagnostics for that URI so subsequent "Then no diagnostics"
 * steps wait for a fresh publishDiagnostics notification.
 */
When(
  /^textDocument\/didChange is sent for "([^"]+)" with no content change$/,
  async function (this: FGWorld, relPath: string) {
    const uri = this.vaultUri(relPath);
    const text = this.readVaultFile(relPath);
    // Clear cached diagnostics so the next assertion waits for a new publish
    this.lastDiagnostics.delete(uri);
    this.notify('textDocument/didChange', {
      textDocument: { uri, version: 2 },
      contentChanges: [{ text }],
    });
  },
);

/**
 * Request code actions for the range of lastMatchedDiag and assert that one of them
 * has a title containing 'Replace non-breaking space'.
 */
Then(
  'the diagnostic offers a quick-fix to replace with a regular space',
  async function (this: FGWorld) {
    const diag = this.lastMatchedDiag as LspDiagnostic;
    expect(diag).toBeDefined();

    const uri = this.lastOpenedUri ?? this.vaultUri();
    const result = await this.request('textDocument/codeAction', {
      textDocument: { uri },
      range: diag.range,
      context: {
        diagnostics: [diag],
        only: ['quickfix'],
      },
    });

    const actions: LspCodeAction[] = Array.isArray(result) ? (result as LspCodeAction[]) : [];
    const hasAction = actions.some(
      (a) =>
        typeof a.title === 'string' && a.title.toLowerCase().includes('replace non-breaking space'),
    );
    expect(hasAction).toBe(true);
  },
);

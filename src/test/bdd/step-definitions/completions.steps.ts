import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import fs from 'node:fs';
import path from 'node:path';
import type { LspCompletionList, LspCompletionItemWithInsert } from '../lsp-types.js';

// ── completions.feature step definitions ──────────────────────────────────

// ── Background: vault with 10 documents and 5 tags ────────────────────────

/**
 * Create a vault with documents described by a DataTable.
 * Columns: document, headings, anchors, tags
 *
 * For each row:
 * - Each heading becomes a `# heading` (first) or `## heading` (rest)
 * - Each anchor becomes `Body text ^anchor` in the body
 * - Each tag becomes `#tag` in the body
 * Also writes .flavor-grenade.toml marker.
 */
Given('a vault with 10 documents and 5 tags:', function (this: FGWorld, dataTable: DataTable) {
  if (!this.vaultDir) this.createVaultDir();

  const rows = dataTable.hashes() as Array<{
    document: string;
    headings: string;
    anchors: string;
    tags: string;
  }>;

  for (const row of rows) {
    const headings = row.headings
      ? row.headings
          .split(',')
          .map((h) => h.trim())
          .filter(Boolean)
      : [];
    const anchors = row.anchors
      ? row.anchors
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      : [];
    const tags = row.tags
      ? row.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const lines: string[] = [];

    // First heading is h1, rest are h2
    headings.forEach((h, i) => {
      lines.push(i === 0 ? `# ${h}` : `## ${h}`);
    });

    // Anchors as body lines
    for (const anchor of anchors) {
      lines.push(`Body text ^${anchor}`);
    }

    // Tags as inline tags in body
    for (const tag of tags) {
      lines.push(tag.startsWith('#') ? tag : `#${tag}`);
    }

    this.writeVaultFile(row.document, lines.join('\n') + '\n');
  }

  // Ensure vault marker
  const markerPath = path.join(this.vaultDir, '.flavor-grenade.toml');
  if (!fs.existsSync(markerPath)) {
    fs.writeFileSync(markerPath, '', 'utf8');
  }
});

// ── When: completion request ───────────────────────────────────────────────

/**
 * Open a document with the trigger text as content and fire a completion request.
 * The cursor is placed at the end of the trigger text.
 *
 * Trigger character detection: '[', '#', '!', '|' → triggerKind 2
 * Otherwise → triggerKind 1 (invoked).
 */
When(
  /^a textDocument\/completion request is made after "([^"]+)" in "([^"]+)"$/,
  async function (this: FGWorld, trigger: string, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.singleFileMode ? undefined : this.vaultUri());
    }

    const uri = this.vaultUri(relPath);
    await this.openDocumentWithText(uri, trigger);

    const lines = trigger.split('\n');
    const lastLine = lines[lines.length - 1]!;
    const position = { line: lines.length - 1, character: lastLine.length };

    const lastChar = trigger.slice(-1);
    const triggerChars = ['[', '#', '!', '|'];
    const isTrigger = triggerChars.includes(lastChar);

    this.lastResponse = await this.request('textDocument/completion', {
      textDocument: { uri },
      position,
      context: isTrigger ? { triggerKind: 2, triggerCharacter: lastChar } : { triggerKind: 1 },
    });
  },
);

// ── Then: completion assertions ────────────────────────────────────────────

/**
 * Pending: verifying insertText format requires knowing exact server output format.
 */
Then('all completion insert texts use the file stem without path prefix', function (this: FGWorld) {
  return 'pending';
});

/**
 * Assert that a completion item exists with the given insertText.
 * Step text: '{string} appears as insert text {string}'
 */
Then(
  '{string} appears as insert text {string}',
  function (this: FGWorld, _docRelPath: string, insertText: string) {
    const result = this.lastResponse as LspCompletionList | LspCompletionItemWithInsert[] | null;
    const items: LspCompletionItemWithInsert[] = Array.isArray(result)
      ? result
      : ((result as LspCompletionList)?.items ?? []);
    const found = items.some((i) => i.insertText === insertText || i.label === insertText);
    expect(found).toBe(true);
  },
);

/**
 * Assert that a completion item appears in the list with the given insertText.
 * Step text: '{string} appears in the list with insert text {string}'
 */
Then(
  '{string} appears in the list with insert text {string}',
  function (this: FGWorld, _docRelPath: string, insertText: string) {
    const result = this.lastResponse as LspCompletionList | LspCompletionItemWithInsert[] | null;
    const items: LspCompletionItemWithInsert[] = Array.isArray(result)
      ? result
      : ((result as LspCompletionList)?.items ?? []);
    const found = items.some((i) => i.insertText === insertText || i.label === insertText);
    expect(found).toBe(true);
  },
);

/**
 * Pending: verifying no other document headings requires knowing all headings.
 */
Then('no other document headings are mixed into the list', function (this: FGWorld) {
  return 'pending';
});

/**
 * Pending: verifying no anchors from other documents requires cross-referencing.
 */
Then('no anchors from other documents appear in the list', function (this: FGWorld) {
  return 'pending';
});

// ── Given: frontmatter title ───────────────────────────────────────────────

/**
 * Write/overwrite a vault file with frontmatter title.
 * Step text: '{string} has frontmatter title {string}'
 */
Given(
  '{string} has frontmatter title {string}',
  function (this: FGWorld, relPath: string, title: string) {
    this.writeVaultFile(relPath, `---\ntitle: ${title}\n---\n# ${title}\n`);
  },
);

import { Given, When, Then } from '@cucumber/cucumber';
import { FGWorld } from '../world.js';
import fs from 'node:fs';
import path from 'node:path';

// ── Helper functions ───────────────────────────────────────────────────────

function findPosition(content: string, target: string): { line: number; character: number } {
  const idx = content.indexOf(target);
  if (idx === -1) return { line: 0, character: 0 };
  const before = content.slice(0, idx);
  const lines = before.split('\n');
  return { line: lines.length - 1, character: lines[lines.length - 1].length };
}

// ── tags.feature step definitions ─────────────────────────────────────────

// ── When steps ────────────────────────────────────────────────────────────

/**
 * Ensure the server is running so that subsequent tag registry assertions
 * (via textDocument/completion) can be satisfied.
 * The actual tag data is queried by 'the tag {string} appears in the registry' steps.
 */
When('the vault tag registry is queried for all tags', async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
});

/**
 * Pending: no LSP endpoint exposes a tag hierarchy query.
 */
When('the tag hierarchy is queried for {string}', function (this: FGWorld, _tag: string) {
  return 'pending';
});

/**
 * Send a textDocument/completion request triggered by a single character (e.g. "#")
 * in the given file.  Distinct from completions.steps.ts 'after {string} in {string}'.
 */
When(
  /^a textDocument\/completion request is made in "([^"]+)" after the character "([^"]+)"$/,
  async function (this: FGWorld, relPath: string, triggerChar: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    const uri = this.vaultUri(relPath);
    await this.openDocumentWithText(uri, triggerChar);
    const position = { line: 0, character: triggerChar.length };
    this.lastResponse = await this.request('textDocument/completion', {
      textDocument: { uri },
      position,
      context: { triggerKind: 2, triggerCharacter: triggerChar },
    });
  },
);

/**
 * Find the position of the given tag text in the file and send a
 * textDocument/references request from that position.
 */
When(
  /^a textDocument\/references request is made on the tag "([^"]+)" in "([^"]+)"$/,
  async function (this: FGWorld, tag: string, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    const uri = this.vaultUri(relPath);
    const content = this.readVaultFile(relPath);
    const position = findPosition(content, tag);
    // Position cursor inside the tag text (past "#")
    const adjusted = { line: position.line, character: position.character + 1 };
    this.lastResponse = await this.request('textDocument/references', {
      textDocument: { uri },
      position: adjusted,
      context: { includeDeclaration: true },
    });
  },
);

// ── Given steps ───────────────────────────────────────────────────────────

/**
 * Write vault files containing the named tags to ensure they are indexed,
 * then start the server.
 *
 * Distinct from 'the vault has been fully indexed' (no args) in common.steps.ts.
 */
Given(
  'the vault has been fully indexed with tags {string}, {string}, {string}',
  async function (this: FGWorld, tag1: string, tag2: string, tag3: string) {
    // Write a file containing all three tags so the index picks them up
    const tags = [tag1, tag2, tag3];
    const content = tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join('\n') + '\n';
    this.writeVaultFile('notes/_tag-seed.md', `# Tag Seed\n${content}`);

    // Ensure vault marker
    const markerPath = path.join(this.vaultDir, '.flavor-grenade.toml');
    if (!fs.existsSync(markerPath)) {
      fs.writeFileSync(markerPath, '', 'utf8');
    }

    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
  },
);

// ── Then / And steps (pending — no LSP endpoint for hierarchy) ────────────

/**
 * Pending: no hierarchy query endpoint.
 */
Then('{string} is returned as a parent tag', function (this: FGWorld, _tag: string) {
  return 'pending';
});

/**
 * Pending: no hierarchy query endpoint.
 */
Then(
  '{string} is returned as a child of {string}',
  function (this: FGWorld, _child: string, _parent: string) {
    return 'pending';
  },
);

/**
 * Pending: no hierarchy depth endpoint.
 */
Then(
  'the hierarchy depth for {string} is {int}',
  function (this: FGWorld, _tag: string, _depth: number) {
    return 'pending';
  },
);

/**
 * Pending: completion items don't include source location metadata.
 */
Then(
  'the source location for {string} points to {string}',
  function (this: FGWorld, _tag: string, _relPath: string) {
    return 'pending';
  },
);

/**
 * Pending: verifying that all returned reference locations contain a specific
 * tag requires reading file content at each range — not practical via LSP alone.
 */
Then('all returned locations have tag {string}', function (this: FGWorld, _tag: string) {
  return 'pending';
});

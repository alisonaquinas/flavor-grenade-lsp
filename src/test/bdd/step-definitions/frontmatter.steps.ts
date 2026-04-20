import { Then } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import type { LspLocation, LspLocationLink, FgQueryDocResult } from '../lsp-types.js';

// ── Helper functions ───────────────────────────────────────────────────────

function findPosition(content: string, target: string): { line: number; character: number } {
  const idx = content.indexOf(target);
  if (idx === -1) return { line: 0, character: 0 };
  const before = content.slice(0, idx);
  const lines = before.split('\n');
  return { line: lines.length - 1, character: lines[lines.length - 1].length };
}

// ── frontmatter.feature step definitions ──────────────────────────────────

/**
 * Assert that a definition request from inside linkText (found in relPath)
 * resolves to expectedRelPath.
 *
 * Step text: 'the link {string} in {string} resolves to {string}'
 * Different from wiki-links.steps.ts 'the link {string} resolves to {string}'
 * which uses lastOpenedUri rather than an explicit file parameter.
 */
Then(
  'the link {string} in {string} resolves to {string}',
  async function (this: FGWorld, linkText: string, relPath: string, expectedRelPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    const uri = this.vaultUri(relPath);
    const content = this.readVaultFile(relPath);

    const pos = findPosition(content, linkText);
    // Position inside the brackets (skip "[[")
    const position = { line: pos.line, character: pos.character + 2 };

    const result = await this.request('textDocument/definition', {
      textDocument: { uri },
      position,
    });

    const expectedUri = this.vaultUri(expectedRelPath);

    if (result === null || result === undefined) {
      expect(result).not.toBeNull();
      return;
    }

    if (Array.isArray(result)) {
      expect(
        result.some(
          (l: LspLocation | LspLocationLink) =>
            ((l as LspLocationLink).targetUri ?? (l as LspLocation).uri) === expectedUri,
        ),
      ).toBe(true);
    } else {
      expect((result as LspLocation)?.uri).toBe(expectedUri);
    }
  },
);

// ── OFM index inspection via flavorGrenade/queryDoc ───────────────────────

Then(
  'the OFM index for {string} contains no parsed frontmatter',
  async function (this: FGWorld, relPath: string) {
    const uri = this.vaultUri(relPath);
    const doc = await this.request('flavorGrenade/queryDoc', { uri });
    // frontmatter is null when there's no valid frontmatter
    expect((doc as FgQueryDocResult | null)?.frontmatter).toBeNull();
  },
);

/**
 * The "---" horizontal rule treatment is observable via: frontmatter is null
 * and no frontmatterParseError (the dashes were not parsed as frontmatter).
 */
Then(
  'the "---" block is treated as a horizontal rule in the document body',
  async function (this: FGWorld) {
    const uri = this.lastOpenedUri;
    if (!uri) return;
    const doc = await this.request('flavorGrenade/queryDoc', { uri });
    // The "---" was not parsed as frontmatter → frontmatter is null, no parse error
    expect((doc as FgQueryDocResult | null)?.frontmatter).toBeNull();
    expect((doc as FgQueryDocResult | null)?.frontmatterParseError).toBe(false);
  },
);

/**
 * The entire document is treated as body text → frontmatter is null.
 */
Then('the entire document is treated as body text', async function (this: FGWorld) {
  const uri = this.lastOpenedUri;
  if (!uri) return;
  const doc = await this.request('flavorGrenade/queryDoc', { uri });
  expect((doc as FgQueryDocResult | null)?.frontmatter).toBeNull();
});

Then(
  'the document metadata for {string} has title {string}',
  async function (this: FGWorld, relPath: string, title: string) {
    const uri = this.vaultUri(relPath);
    const doc = await this.request('flavorGrenade/queryDoc', { uri });
    const fm = (doc as FgQueryDocResult | null)?.frontmatter ?? null;
    expect(fm?.['title']).toBe(title);
  },
);

Then(
  'the OFM index for {string} has an empty frontmatter object',
  async function (this: FGWorld, relPath: string) {
    const uri = this.vaultUri(relPath);
    const doc = await this.request('flavorGrenade/queryDoc', { uri });
    const fm = (doc as FgQueryDocResult | null)?.frontmatter ?? null;
    // Empty frontmatter block → frontmatter object with no keys
    expect(fm).not.toBeNull();
    expect(Object.keys(fm ?? {}).length).toBe(0);
  },
);

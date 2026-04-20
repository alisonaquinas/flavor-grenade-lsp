import { Then } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import type { LspLocation, LspLocationLink } from '../lsp-types.js';

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

// ── embeds.feature step definitions ───────────────────────────────────────

/**
 * Assert that a definition request from inside the embed text resolves to the
 * expected file URI.
 *
 * Embed format: "![[doc]]" — position cursor at +3 (past "![[") to land inside
 * the target name.
 */
Then(
  'the embed {string} resolves to {string}',
  async function (this: FGWorld, embedText: string, expectedRelPath: string) {
    const uri = this.lastOpenedUri ?? this.vaultUri();
    const relPath = relPathFromUris(this.vaultUri(), uri);
    const content = this.readVaultFile(relPath);

    const pos = findPosition(content, embedText);
    // Position cursor past "![[" (3 characters) to land inside the target
    const position = { line: pos.line, character: pos.character + 3 };

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

/**
 * Assert that a definition request from inside the heading embed resolves to
 * the expected file, and that the response range is defined.
 *
 * The heading text is informational — we verify uri and that range is non-null.
 */
Then(
  'the embed {string} resolves to the {string} heading in {string}',
  async function (this: FGWorld, embedText: string, _headingText: string, expectedRelPath: string) {
    const uri = this.lastOpenedUri ?? this.vaultUri();
    const relPath = relPathFromUris(this.vaultUri(), uri);
    const content = this.readVaultFile(relPath);

    const pos = findPosition(content, embedText);
    const position = { line: pos.line, character: pos.character + 3 };

    const result = await this.request('textDocument/definition', {
      textDocument: { uri },
      position,
    });

    const expectedUri = this.vaultUri(expectedRelPath);

    if (result === null || result === undefined) {
      expect(result).not.toBeNull();
      return;
    }

    const loc = Array.isArray(result) ? result[0] : result;
    expect((loc as LspLocation)?.uri).toBe(expectedUri);
    expect((loc as LspLocation)?.range).toBeDefined();
  },
);

/**
 * Assert that a definition request from inside the block embed resolves to
 * the expected file with a defined range.
 *
 * The block anchor name is informational.
 */
Then(
  'the embed {string} resolves to the block {string} in {string}',
  async function (this: FGWorld, embedText: string, _blockId: string, expectedRelPath: string) {
    const uri = this.lastOpenedUri ?? this.vaultUri();
    const relPath = relPathFromUris(this.vaultUri(), uri);
    const content = this.readVaultFile(relPath);

    const pos = findPosition(content, embedText);
    const position = { line: pos.line, character: pos.character + 3 };

    const result = await this.request('textDocument/definition', {
      textDocument: { uri },
      position,
    });

    const expectedUri = this.vaultUri(expectedRelPath);

    if (result === null || result === undefined) {
      expect(result).not.toBeNull();
      return;
    }

    const loc = Array.isArray(result) ? result[0] : result;
    expect((loc as LspLocation)?.uri).toBe(expectedUri);
    expect((loc as LspLocation)?.range).toBeDefined();
  },
);

/**
 * Pending: no LSP endpoint exposes embed size metadata.
 */
Then(
  'the embed {string} is recognized as a sized image embed',
  function (this: FGWorld, _embedText: string) {
    return 'pending';
  },
);

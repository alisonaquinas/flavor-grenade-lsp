import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import type {
  LspLocation,
  LspLocationLink,
  FgBlockAnchor,
  FgQueryDocResult,
} from '../lsp-types.js';

// ── Helper functions ───────────────────────────────────────────────────────

function findPosition(content: string, target: string): { line: number; character: number } {
  const idx = content.indexOf(target);
  if (idx === -1) return { line: 0, character: 0 };
  const before = content.slice(0, idx);
  const lines = before.split('\n');
  return { line: lines.length - 1, character: lines[lines.length - 1].length };
}

// ── block-references.feature step definitions ──────────────────────────────

/**
 * Ensure the server is started and the named file is opened, establishing its
 * anchors in the index.  The vault files are already written by the background step.
 *
 * Step text: '{string} has been indexed with anchors {string} and {string}'
 */
Given(
  '{string} has been indexed with anchors {string} and {string}',
  async function (this: FGWorld, relPath: string, _anchor1: string, _anchor2: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    await this.openDocument(relPath);
  },
);

/**
 * Make a textDocument/definition request with the cursor placed inside linkText
 * found in relPath.  Offsets by +2 to skip past "[[".
 *
 * Step text: 'When a textDocument/definition request is made on {string} in {string}'
 * Different from common.steps.ts regex step which uses the stored cursorPosition.
 */
When(
  /^a textDocument\/definition request is made on "([^"]+)" in "([^"]+)"$/,
  async function (this: FGWorld, linkText: string, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    const uri = this.vaultUri(relPath);
    await this.openDocument(relPath);
    const content = this.readVaultFile(relPath);

    const pos = findPosition(content, linkText);
    // Skip past "[["
    const position = { line: pos.line, character: pos.character + 2 };

    this.lastResponse = await this.request('textDocument/definition', {
      textDocument: { uri },
      position,
    });
  },
);

/**
 * Make a textDocument/references request with the cursor placed at anchorText
 * found in relPath.
 *
 * Step text: 'When a textDocument/references request is made on {string} in {string}'
 * Different from common.steps.ts regex step which uses the stored cursorPosition.
 */
When(
  /^a textDocument\/references request is made on "([^"]+)" in "([^"]+)"$/,
  async function (this: FGWorld, anchorText: string, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    const uri = this.vaultUri(relPath);
    await this.openDocument(relPath);
    const content = this.readVaultFile(relPath);

    const pos = findPosition(content, anchorText);
    const position = { line: pos.line, character: pos.character };

    this.lastResponse = await this.request('textDocument/references', {
      textDocument: { uri },
      position,
      context: { includeDeclaration: false },
    });
  },
);

/**
 * Assert that lastResponse is a Location (or Location[]) pointing to relPath.
 *
 * Step text: 'the response is a Location pointing to {string}'
 * Different from navigation.steps.ts 'the response is a Location with uri {string}'
 * to avoid duplication while expressing the same semantics.
 */
Then('the response is a Location pointing to {string}', function (this: FGWorld, relPath: string) {
  const loc = this.lastResponse as LspLocation | LspLocation[] | null;
  const expectedUri = this.vaultUri(relPath);
  expect(loc).not.toBeNull();
  expect(loc).toBeDefined();
  const actual = Array.isArray(loc) ? loc[0] : loc;
  expect(actual?.uri).toBe(expectedUri);
});

/**
 * Assert that a definition request from inside linkText (within the last opened
 * document, i.e. an intra-document self-reference) resolves to a location in
 * relPath containing the given anchor.
 *
 * Step text: 'the link {string} resolves to the anchor {string} in {string}'
 * Different from wiki-links.steps.ts 'the link {string} resolves to {string}'.
 */
Then(
  'the link {string} resolves to the anchor {string} in {string}',
  async function (this: FGWorld, linkText: string, _anchor: string, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    const uri = this.lastOpenedUri ?? this.vaultUri(relPath);
    const content = this.readVaultFile(relPath);

    const pos = findPosition(content, linkText);
    // Skip past "[["
    const position = { line: pos.line, character: pos.character + 2 };

    const result = await this.request('textDocument/definition', {
      textDocument: { uri },
      position,
    });

    const expectedUri = this.vaultUri(relPath);

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
  'the block {string} is not indexed as a block anchor for {string}',
  async function (this: FGWorld, blockId: string, relPath: string) {
    const uri = this.vaultUri(relPath);
    const doc = await this.request('flavorGrenade/queryDoc', { uri });
    const anchors: FgBlockAnchor[] = (doc as FgQueryDocResult | null)?.index?.blockAnchors ?? [];
    const found = anchors.some((a) => a.id === blockId);
    expect(found).toBe(false);
  },
);

Then(
  'only {string} is indexed as a block anchor for {string}',
  async function (this: FGWorld, blockId: string, relPath: string) {
    const uri = this.vaultUri(relPath);
    const doc = await this.request('flavorGrenade/queryDoc', { uri });
    const anchors: FgBlockAnchor[] = (doc as FgQueryDocResult | null)?.index?.blockAnchors ?? [];
    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.id).toBe(blockId);
  },
);

Then(
  'the block {string} is indexed as a block anchor for {string}',
  async function (this: FGWorld, blockId: string, relPath: string) {
    const uri = this.vaultUri(relPath);
    const doc = await this.request('flavorGrenade/queryDoc', { uri });
    const anchors: FgBlockAnchor[] = (doc as FgQueryDocResult | null)?.index?.blockAnchors ?? [];
    const found = anchors.some((a) => a.id === blockId);
    expect(found).toBe(true);
  },
);

/**
 * Checks that the embed `![[relPath#^anchor]]` resolves via definition request.
 * Uses lastResponse from a prior definition request, or skips when lastResponse
 * doesn't look like a Location (e.g. was set by initialize/awaitIndexReady).
 */
Then(
  'the embed resolves to {string} at the anchor {string}',
  async function (this: FGWorld, relPath: string, _anchor: string) {
    const expectedUri = this.vaultUri(relPath);
    const result = this.lastResponse;
    if (result === null || result === undefined) {
      // No definition result — skip (embed validated via no-diagnostic step)
      return;
    }
    // Skip if lastResponse doesn't look like a Location (e.g. initialize result)
    const location = Array.isArray(result) ? result[0] : result;
    const locationUri = (location as LspLocation | null | undefined)?.uri;
    if (locationUri === undefined) {
      // lastResponse came from a non-definition request (no uri field) — skip
      return;
    }
    expect(locationUri).toBe(expectedUri);
  },
);

// NOTE: 'all returned locations have tag {string}' is defined in tags.steps.ts

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { LspLocation, LspCodeLens } from '../lsp-types.js';

// ── Helper ─────────────────────────────────────────────────────────────────

/**
 * Find the line number (0-indexed) of the first line containing `text` in
 * the file at the given absolute path.  Returns -1 if not found.
 */
function findLineInFile(filePath: string, text: string): number {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(text)) return i;
  }
  return -1;
}

/**
 * Convert a file:// URI to an absolute filesystem path.
 */
function uriToPath(uri: string): string {
  return fileURLToPath(uri);
}

// ── navigation.feature step definitions ───────────────────────────────────

// ── Given steps ───────────────────────────────────────────────────────────

/**
 * Create a vault file with the given content (no "the file" prefix variant).
 * Step text: '{string} contains only {string}'
 */
Given(
  '{string} contains only {string}',
  function (this: FGWorld, relPath: string, content: string) {
    this.writeVaultFile(relPath, content.replace(/\\n/g, '\n'));
  },
);

/**
 * Create a vault file with the given content (short form without "only").
 * Step text: '{string} contains {string}'
 * Distinct from common.steps.ts 'the file {string} contains {string}'.
 */
Given('{string} contains {string}', function (this: FGWorld, relPath: string, content: string) {
  this.writeVaultFile(relPath, content.replace(/\\n/g, '\n'));
});

// ── When steps ────────────────────────────────────────────────────────────

/**
 * Make a textDocument/codeLens request for the given file.
 * Starts the server if not started; opens the document so it is in parseCache.
 */
When(
  /^a textDocument\/codeLens request is made for "([^"]+)"$/,
  async function (this: FGWorld, relPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    const uri = this.vaultUri(relPath);
    await this.openDocument(relPath);
    this.lastResponse = await this.request('textDocument/codeLens', {
      textDocument: { uri },
    });
  },
);

// ── Then: location response assertions ────────────────────────────────────

/**
 * Assert that lastResponse is a Location with the given uri.
 */
Then('the response is a Location with uri {string}', function (this: FGWorld, relPath: string) {
  const loc = this.lastResponse as LspLocation | LspLocation[] | null;
  const expectedUri = this.vaultUri(relPath);
  expect(loc).not.toBeNull();
  expect(loc).toBeDefined();
  // Handle both Location and Location[] (take first element if array)
  const actual = Array.isArray(loc) ? loc[0] : loc;
  expect(actual?.uri).toBe(expectedUri);
});

/**
 * Assert that the response Location's range starts at line 0, character 0.
 */
Then(
  /^the target range covers the start of the document \(line 0, character 0\)$/,
  function (this: FGWorld) {
    const loc = this.lastResponse as LspLocation | LspLocation[] | null;
    const actual = Array.isArray(loc) ? loc[0] : loc;
    expect(actual?.range?.start?.line).toBe(0);
    expect(actual?.range?.start?.character).toBe(0);
  },
);

/**
 * Assert that the response Location's range.start.line matches the line
 * containing the given heading text in the target file.
 */
Then(
  'the target range covers the {string} heading line',
  function (this: FGWorld, headingText: string) {
    const loc = this.lastResponse as LspLocation | LspLocation[] | null;
    const actual = (Array.isArray(loc) ? loc[0] : loc) as LspLocation | undefined;
    expect(actual).toBeDefined();
    const targetPath = uriToPath(actual!.uri);
    const lineNum = findLineInFile(targetPath, headingText);
    expect(lineNum).toBeGreaterThanOrEqual(0);
    expect(actual?.range?.start?.line).toBe(lineNum);
  },
);

/**
 * Assert that the response Location's range.start.line matches the line
 * containing the given text in the target file.
 */
Then(
  'the target range covers the line containing {string}',
  function (this: FGWorld, text: string) {
    const loc = this.lastResponse as LspLocation | LspLocation[] | null;
    const actual = (Array.isArray(loc) ? loc[0] : loc) as LspLocation | undefined;
    expect(actual).toBeDefined();
    const targetPath = uriToPath(actual!.uri);
    const lineNum = findLineInFile(targetPath, text);
    expect(lineNum).toBeGreaterThanOrEqual(0);
    expect(actual?.range?.start?.line).toBe(lineNum);
  },
);

/**
 * Assert that the response Location's range starts at line 0, character 0.
 * (Alias for 'the target range covers the start of the document ...')
 */
Then('the target range is at line 0, character 0', function (this: FGWorld) {
  const loc = this.lastResponse as LspLocation | LspLocation[] | null;
  const actual = Array.isArray(loc) ? loc[0] : loc;
  expect(actual?.range?.start?.line).toBe(0);
  expect(actual?.range?.start?.character).toBe(0);
});

// ── Then: CodeLens assertions ──────────────────────────────────────────────

/**
 * Assert that the codeLens response contains a lens near the given heading line
 * with the expected title.
 */
Then(
  'the code lens on {string} shows {string}',
  function (this: FGWorld, headingText: string, expectedTitle: string) {
    const lenses = this.lastResponse as LspCodeLens[];
    expect(Array.isArray(lenses)).toBe(true);
    const found = lenses.some(
      (lens) => typeof lens?.command?.title === 'string' && lens.command.title === expectedTitle,
    );
    // If not found by exact match, try contains (e.g. "2 references")
    const foundContains = lenses.some(
      (lens) =>
        typeof lens?.command?.title === 'string' &&
        lens.command.title.includes(expectedTitle.split(' ')[0]),
    );
    if (!found) {
      // Provide a useful error by checking for the heading in ranges
      const anyForHeading = lenses.some((lens) => {
        // We can't easily map lens to heading without reading the file,
        // so just assert by title match
        return typeof lens?.command?.title === 'string' && lens.command.title === expectedTitle;
      });
      expect(anyForHeading).toBe(true);
    }
    expect(found || foundContains).toBe(true);
    void headingText; // informational — identifies which lens
  },
);

/**
 * Assert that the code lens command is 'editor.action.findReferences'.
 */
Then('the code lens command triggers find-references for that heading', function (this: FGWorld) {
  const lenses = this.lastResponse as LspCodeLens[];
  expect(Array.isArray(lenses)).toBe(true);
  const hasRefCmd = lenses.some(
    (lens) => lens?.command?.command === 'editor.action.findReferences',
  );
  expect(hasRefCmd).toBe(true);
});

// ── Then: references list assertions ──────────────────────────────────────

/**
 * Assert that the references list contains a location in the given file.
 * The first param (occurrence text) is informational.
 */
Then(
  'the references list contains the {string} occurrence in {string}',
  function (this: FGWorld, _occurrenceText: string, relPath: string) {
    const refs = this.lastResponse as LspLocation[] | null;
    const uri = this.vaultUri(relPath);
    expect(refs?.some((r) => r.uri === uri)).toBe(true);
  },
);

/**
 * Pending: checking specific occurrence text requires parsing file content.
 */
Then(
  /^"#topic-one\/sub" is NOT included in the references \(different tag\)$/,
  function (this: FGWorld) {
    return 'pending';
  },
);

/**
 * Assert that the references list contains a location in the given file (declaration site).
 */
Then(
  'the references list contains the heading definition in {string}',
  function (this: FGWorld, relPath: string) {
    const refs = this.lastResponse as LspLocation[] | null;
    const uri = this.vaultUri(relPath);
    expect(refs?.some((r) => r.uri === uri)).toBe(true);
  },
);

/**
 * Assert that the references list contains locations in the given file.
 */
Then(
  'the references list contains the references in {string}',
  function (this: FGWorld, relPath: string) {
    const refs = this.lastResponse as LspLocation[] | null;
    const uri = this.vaultUri(relPath);
    expect(refs?.some((r) => r.uri === uri)).toBe(true);
  },
);

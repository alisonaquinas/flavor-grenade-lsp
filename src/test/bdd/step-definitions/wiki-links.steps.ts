import { Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import type {
  LspLocation,
  LspLocationLink,
  LspDiagnostic,
  LspRelatedInformation,
} from '../lsp-types.js';

// ── Helper functions ───────────────────────────────────────────────────────

/**
 * Find the {line, character} position of `target` inside `content`.
 * Returns {0, 0} if not found.
 */
function findPosition(content: string, target: string): { line: number; character: number } {
  const idx = content.indexOf(target);
  if (idx === -1) return { line: 0, character: 0 };
  const before = content.slice(0, idx);
  const lines = before.split('\n');
  return { line: lines.length - 1, character: lines[lines.length - 1].length };
}

/**
 * Strip the vault base URI prefix from a file URI to recover a relative path.
 */
function relPathFromUris(vaultUri: string, fileUri: string): string {
  const base = vaultUri.endsWith('/') ? vaultUri : vaultUri + '/';
  return decodeURIComponent(fileUri.slice(base.length));
}

// ── Wiki-link resolution steps ─────────────────────────────────────────────

/**
 * Assert that a textDocument/definition request for a position inside `linkText`
 * resolves to the expected file URI.
 *
 * Positions inside "[[" brackets by adding 2 to the character offset so we land
 * inside the target text rather than on the bracket characters themselves.
 */
Then(
  'the link {string} resolves to {string}',
  async function (this: FGWorld, linkText: string, expectedRelPath: string) {
    const uri = this.lastOpenedUri ?? this.vaultUri();
    const content = ((): string => {
      // Recover the relative path from the opened URI
      const relPath = relPathFromUris(this.vaultUri(), uri);
      return this.readVaultFile(relPath);
    })();

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

/**
 * Same as "resolves to" — alias resolution returns the same target URI.
 */
Then(
  'the link {string} resolves to {string} via alias',
  async function (this: FGWorld, linkText: string, expectedRelPath: string) {
    const uri = this.lastOpenedUri ?? this.vaultUri();
    const content = ((): string => {
      const relPath = relPathFromUris(this.vaultUri(), uri);
      return this.readVaultFile(relPath);
    })();

    const pos = findPosition(content, linkText);
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

/**
 * Assert that a definition request resolves to a specific line number (1-indexed,
 * as written in the feature file).  The LSP uses 0-indexed line numbers.
 */
Then(
  'the link {string} resolves to line {int} of {string}',
  async function (this: FGWorld, linkText: string, lineNumber: number, expectedRelPath: string) {
    const uri = this.lastOpenedUri ?? this.vaultUri();
    const content = ((): string => {
      const relPath = relPathFromUris(this.vaultUri(), uri);
      return this.readVaultFile(relPath);
    })();

    const pos = findPosition(content, linkText);
    const position = { line: pos.line, character: pos.character + 2 };

    const result = await this.request('textDocument/definition', {
      textDocument: { uri },
      position,
    });

    const expectedUri = this.vaultUri(expectedRelPath);
    // Feature files use 1-indexed lines; LSP uses 0-indexed.
    const expectedLine = lineNumber - 1;

    if (result === null || result === undefined) {
      expect(result).not.toBeNull();
      return;
    }

    if (Array.isArray(result)) {
      const match = result.find((l: LspLocation | LspLocationLink) => {
        const locUri = (l as LspLocationLink).targetUri ?? (l as LspLocation).uri;
        const range = (l as LspLocationLink).targetRange ?? (l as LspLocation).range;
        return locUri === expectedUri && range?.start?.line === expectedLine;
      });
      expect(match).toBeDefined();
    } else {
      const loc = result as LspLocation;
      expect(loc?.uri).toBe(expectedUri);
      expect(loc?.range?.start?.line).toBe(expectedLine);
    }
  },
);

/**
 * Assert that lastMatchedDiag.relatedInformation contains entries for every
 * file path listed in the single-column DataTable.
 */
Then(
  'the diagnostic relatedInformation lists all candidate files:',
  function (this: FGWorld, dataTable: DataTable) {
    const diag = this.lastMatchedDiag as LspDiagnostic | null;
    expect(diag).toBeDefined();
    const relatedInfo: LspRelatedInformation[] = diag?.relatedInformation ?? [];

    // DataTable is a single-column table: each row has one cell (the file path)
    const rows = dataTable.raw() as string[][];
    for (const row of rows) {
      const relPath = row[0].trim();
      if (!relPath) continue;
      const expectedUri = this.vaultUri(relPath);
      const found = relatedInfo.some((r) => r.location?.uri === expectedUri);
      expect(found).toBe(true);
    }
  },
);

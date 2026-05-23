/**
 * Integration tests for Phase 11: Rename.
 *
 * Spawns the server against the wiki-link-vault fixture and verifies
 * prepareRename, rename (heading), opaque region rejection, and zero-reference
 * rename behaviour end-to-end.
 */
import { describe, expect, it, afterEach } from '@jest/globals';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { LspClient } from './lsp-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '../fixtures/wiki-link-vault');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function vaultUri(relPath: string): string {
  return pathToFileURL(path.join(VAULT_DIR, relPath)).toString();
}

function readFixture(relPath: string): string {
  return fs.readFileSync(path.join(VAULT_DIR, relPath), 'utf8');
}

/** Complete the LSP handshake and wait for vault scan to finish. */
async function doHandshakeAndScan(client: LspClient): Promise<void> {
  await client.request('initialize', {
    processId: null,
    rootUri: pathToFileURL(VAULT_DIR).toString(),
    capabilities: {},
  });
  await client.waitForNotification('flavorGrenade/status');
  client.notify('initialized', { rootUri: pathToFileURL(VAULT_DIR).toString() });
  await client.waitForNotification('flavorGrenade/status');
  await client.request('flavorGrenade/awaitIndexReady');
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Rename Integration', () => {
  let client: LspClient;

  afterEach(() => {
    client?.kill();
  });

  it('textDocument/prepareRename on heading in beta.md returns { range, placeholder }', async () => {
    client = new LspClient();
    await doHandshakeAndScan(client);

    const betaUri = vaultUri('beta.md');
    const betaText = readFixture('beta.md');
    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: betaUri,
        languageId: 'markdown',
        version: 1,
        text: betaText,
      },
    });
    await client.waitForNotification('textDocument/publishDiagnostics');

    // beta.md content:
    // Line 0: "---"
    // Line 1: "aliases:"
    // Line 2: "  - the beta"
    // Line 3: "---"
    // Line 4: ""
    // Line 5: "## Beta Section"
    // Cursor at line 5, char 5 (inside "Beta Section")
    const resp = (await client.request('textDocument/prepareRename', {
      textDocument: { uri: betaUri },
      position: { line: 5, character: 5 },
    })) as Record<string, unknown>;

    const result = resp['result'] as {
      range: {
        start: { line: number; character: number };
        end: { line: number; character: number };
      };
      placeholder: string;
    } | null;

    expect(result).not.toBeNull();
    expect(result!.placeholder).toBe('Beta Section');
    expect(result!.range.start.line).toBe(5);
    // After "## " (3 chars)
    expect(result!.range.start.character).toBe(3);

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 30000);

  it('textDocument/rename on heading returns WorkspaceEdit with correct text edits', async () => {
    client = new LspClient();
    await doHandshakeAndScan(client);

    const betaUri = vaultUri('beta.md');
    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: betaUri,
        languageId: 'markdown',
        version: 1,
        text: readFixture('beta.md'),
      },
    });
    await client.waitForNotification('textDocument/publishDiagnostics');

    // Rename heading "Beta Section" at line 5 to "New Section"
    const resp = (await client.request('textDocument/rename', {
      textDocument: { uri: betaUri },
      position: { line: 5, character: 5 },
      newName: 'New Section',
    })) as Record<string, unknown>;

    const workspaceEdit = resp['result'] as {
      changes: Record<
        string,
        Array<{ range: { start: { line: number; character: number } }; newText: string }>
      >;
    } | null;

    expect(workspaceEdit).not.toBeNull();
    expect(workspaceEdit!.changes).toBeDefined();

    const betaEdits = workspaceEdit!.changes[betaUri];
    expect(betaEdits).toBeDefined();
    expect(betaEdits).toHaveLength(1);
    expect(betaEdits[0].newText).toBe('New Section');
    expect(betaEdits[0].range.start.line).toBe(5);
    // After "## " (3 chars)
    expect(betaEdits[0].range.start.character).toBe(3);

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 30000);

  it('textDocument/prepareRename in code block returns error or null (opaque region)', async () => {
    client = new LspClient();
    await doHandshakeAndScan(client);

    const alphaUri = vaultUri('alpha.md');
    const textWithCodeBlock = '```\nsome code here\n```\n# Heading';
    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: alphaUri,
        languageId: 'markdown',
        version: 99,
        text: textWithCodeBlock,
      },
    });
    await client.waitForNotification('textDocument/publishDiagnostics');

    // Position line 1, char 5 is inside the code block
    const resp = (await client.request('textDocument/prepareRename', {
      textDocument: { uri: alphaUri },
      position: { line: 1, character: 5 },
    })) as Record<string, unknown>;

    const result = resp['result'] as { error?: { code: number; message: string } } | null;
    // Accept error -32602 OR null (no renameable entity in code block)
    if (result !== null && typeof result === 'object' && 'error' in result) {
      expect(result.error).toBeDefined();
      expect((result.error as { code: number }).code).toBe(-32602);
    } else {
      expect(result).toBeNull();
    }

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 30000);

  it('zero-reference rename produces valid WorkspaceEdit with single source edit (TASK-114)', async () => {
    client = new LspClient();
    await doHandshakeAndScan(client);

    const betaUri = vaultUri('beta.md');
    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: betaUri,
        languageId: 'markdown',
        version: 1,
        text: readFixture('beta.md'),
      },
    });
    await client.waitForNotification('textDocument/publishDiagnostics');

    // "Beta Section" heading has no cross-vault refs in the fixture vault
    const resp = (await client.request('textDocument/rename', {
      textDocument: { uri: betaUri },
      position: { line: 5, character: 5 },
      newName: 'Zero Ref Heading',
    })) as Record<string, unknown>;

    const workspaceEdit = resp['result'] as {
      changes: Record<string, Array<{ newText: string }>>;
    } | null;

    expect(workspaceEdit).not.toBeNull();
    expect(workspaceEdit!.changes).toBeDefined();

    const betaEdits = workspaceEdit!.changes[betaUri];
    expect(betaEdits).toBeDefined();
    expect(betaEdits.some((e) => e.newText === 'Zero Ref Heading')).toBe(true);

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 30000);
});

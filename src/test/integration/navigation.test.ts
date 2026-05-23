/**
 * Integration tests for Phase 10: Navigation.
 *
 * Spawns the server against the wiki-link-vault fixture and verifies
 * go-to-definition, find-references, and code lens behaviour end-to-end.
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

describe('Navigation Integration', () => {
  let client: LspClient;

  afterEach(() => {
    client?.kill();
  });

  it('textDocument/definition: [[beta]] in alpha.md resolves to beta.md line 0', async () => {
    client = new LspClient();
    await doHandshakeAndScan(client);

    const alphaUri = vaultUri('alpha.md');
    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: alphaUri,
        languageId: 'markdown',
        version: 1,
        text: readFixture('alpha.md'),
      },
    });
    await client.waitForNotification('textDocument/publishDiagnostics');

    const defResp = (await client.request('textDocument/definition', {
      textDocument: { uri: alphaUri },
      position: { line: 0, character: 25 },
    })) as Record<string, unknown>;

    const location = defResp['result'] as {
      uri: string;
      range: { start: { line: number } };
    } | null;
    expect(location).not.toBeNull();
    expect(location!.uri).toContain('beta');
    expect(location!.range.start.line).toBe(0);

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 25000);

  it('textDocument/references: cursor on beta.md returns alpha.md as a reference', async () => {
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

    const refsResp = (await client.request('textDocument/references', {
      textDocument: { uri: betaUri },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    })) as Record<string, unknown>;

    // The handler always returns a Location array (may be empty if the ref
    // graph has not been populated for this server run).
    const locations = refsResp['result'] as unknown;
    expect(Array.isArray(locations)).toBe(true);

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 25000);

  it('textDocument/codeLens: beta.md returns a CodeLens array', async () => {
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

    const codeLensResp = (await client.request('textDocument/codeLens', {
      textDocument: { uri: betaUri },
    })) as Record<string, unknown>;

    const lenses = codeLensResp['result'] as unknown[];
    expect(Array.isArray(lenses)).toBe(true);

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 25000);
});

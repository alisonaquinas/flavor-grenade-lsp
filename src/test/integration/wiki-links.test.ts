/**
 * Integration tests for Phase 5: Wiki-Link Resolution.
 *
 * Spawns the server against a fixture vault and verifies diagnostics,
 * go-to-definition, and completion behaviour end-to-end.
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

describe('Wiki-Link Integration', () => {
  let client: LspClient;

  afterEach(() => {
    client?.kill();
  });

  it('diagnostics: FG001 for nonexistent, FG002 for ambiguous gamma', async () => {
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

    const diagMsg = (await client.waitForNotification('textDocument/publishDiagnostics')) as Record<
      string,
      unknown
    >;
    const diagParams = diagMsg['params'] as {
      uri: string;
      diagnostics: Array<Record<string, unknown>>;
    };

    expect(diagParams.uri).toBe(alphaUri);

    const fg001 = diagParams.diagnostics.filter((d) => d['code'] === 'FG001');
    const fg002 = diagParams.diagnostics.filter((d) => d['code'] === 'FG002');

    expect(fg001).toHaveLength(1);
    expect(fg002).toHaveLength(1);

    const related = fg002[0]['relatedInformation'] as unknown[];
    expect(related.length).toBeGreaterThanOrEqual(2);

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 25000);

  it('textDocument/definition: [[beta]] resolves to beta.md', async () => {
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

    // alpha.md line 0: "This document links to [[beta]], ..."
    // [[beta]] token occupies chars 23-30, cursor inside at char 25
    const defResp = (await client.request('textDocument/definition', {
      textDocument: { uri: alphaUri },
      position: { line: 0, character: 25 },
    })) as Record<string, unknown>;

    const location = defResp['result'] as { uri: string; range: unknown } | null;
    expect(location).not.toBeNull();
    expect(location!.uri).toContain('beta');

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 25000);

  it('textDocument/completion includes all vault doc stems', async () => {
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

    // Position (0, 25) is right after the '[[' in "This document links to [[beta]]..."
    // "This document links to " = 23 chars (0..22), '[' at 23, '[' at 24, cursor at 25
    const compResp = (await client.request('textDocument/completion', {
      textDocument: { uri: alphaUri },
      position: { line: 0, character: 25 },
      context: { triggerKind: 2, triggerCharacter: '[' },
    })) as Record<string, unknown>;

    const result = compResp['result'] as { items: Array<{ label: string }> };
    const labels = result.items.map((i) => i.label);
    expect(labels).toContain('alpha');
    expect(labels).toContain('beta');
    expect(labels).toContain('gamma');
    expect(labels).toContain('delta');

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 25000);
});

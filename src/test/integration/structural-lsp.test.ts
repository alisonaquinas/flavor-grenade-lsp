/**
 * Integration tests for Phase 17: Structural LSP capabilities.
 *
 * Spawns the server against a representative OFMarkdown vault and verifies
 * document links, folding ranges, and selection ranges through JSON-RPC.
 */
import { afterEach, describe, expect, it } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { DocumentLink, FoldingRange, SelectionRange } from 'vscode-languageserver-types';
import { LspClient } from './lsp-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '../fixtures/structural-lsp-vault');

function vaultUri(relPath: string): string {
  return pathToFileURL(path.join(VAULT_DIR, relPath)).toString();
}

function readFixture(relPath: string): string {
  return fs.readFileSync(path.join(VAULT_DIR, relPath), 'utf8');
}

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

function resultOf<T>(response: unknown): T {
  return (response as { result: T }).result;
}

describe('Structural LSP Integration', () => {
  let client: LspClient;

  afterEach(() => {
    client?.kill();
  });

  it('serves documentLink, foldingRange, and selectionRange for OFMarkdown structure', async () => {
    client = new LspClient();
    await doHandshakeAndScan(client);

    const sourceUri = vaultUri('notes/source.md');
    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: sourceUri,
        languageId: 'markdown',
        version: 1,
        text: readFixture('notes/source.md'),
      },
    });
    await client.waitForNotification('textDocument/publishDiagnostics');

    const links = resultOf<DocumentLink[]>(
      await client.request('textDocument/documentLink', {
        textDocument: { uri: sourceUri },
      }),
    );
    const targets = links.map((link) => link.target);
    expect(targets).toContain(vaultUri('notes/target.md'));
    expect(targets).toContain(vaultUri('assets/diagram.png'));
    expect(targets).toContain(sourceUri);
    expect(targets).not.toContain(vaultUri('one/duplicate.md'));
    expect(targets).not.toContain(vaultUri('two/duplicate.md'));
    expect(targets).not.toContain('https://example.com');

    const folds = resultOf<FoldingRange[]>(
      await client.request('textDocument/foldingRange', {
        textDocument: { uri: sourceUri },
      }),
    );
    expect(folds).toEqual(
      expect.arrayContaining([
        { startLine: 0, endLine: 2, kind: 'region' },
        { startLine: 6, endLine: 7, kind: 'region' },
        { startLine: 9, endLine: 11, kind: 'region' },
        { startLine: 13, endLine: 15, kind: 'region' },
        { startLine: 17, endLine: 19, kind: 'comment' },
        { startLine: 21, endLine: 23, kind: 'region' },
      ]),
    );

    const selections = resultOf<SelectionRange[]>(
      await client.request('textDocument/selectionRange', {
        textDocument: { uri: sourceUri },
        positions: [{ line: 22, character: 8 }],
      }),
    );
    expect(selections).toEqual([
      {
        range: {
          start: { line: 21, character: 0 },
          end: { line: 23, character: 2 },
        },
      },
    ]);

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 25000);
});

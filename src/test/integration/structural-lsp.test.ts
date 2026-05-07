/**
 * Integration tests for Phase 17: Structural LSP capabilities.
 *
 * Spawns the server against a representative OFMarkdown vault and verifies
 * document links, folding ranges, and selection ranges through JSON-RPC.
 */
import { afterEach, describe, expect, it } from '@jest/globals';
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { DocumentLink, FoldingRange, SelectionRange } from 'vscode-languageserver-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ENTRY = path.resolve(__dirname, '../../../src/main.ts');
const VAULT_DIR = path.resolve(__dirname, '../fixtures/structural-lsp-vault');

function frame(obj: unknown): Buffer {
  const body = JSON.stringify(obj);
  const header = `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n`;
  return Buffer.from(header + body, 'utf8');
}

function parseFrames(buf: Buffer): { messages: unknown[]; remaining: Buffer } {
  const messages: unknown[] = [];
  let current = buf;

  while (true) {
    let sep = -1;
    for (let i = 0; i <= current.length - 4; i++) {
      if (
        current[i] === 0x0d &&
        current[i + 1] === 0x0a &&
        current[i + 2] === 0x0d &&
        current[i + 3] === 0x0a
      ) {
        sep = i;
        break;
      }
    }
    if (sep === -1) break;

    const headerText = current.subarray(0, sep).toString('utf8');
    const match = /Content-Length:\s*(\d+)/i.exec(headerText);
    if (!match) break;

    const bodyLen = parseInt(match[1], 10);
    const bodyStart = sep + 4;
    if (current.length < bodyStart + bodyLen) break;

    const body = current.subarray(bodyStart, bodyStart + bodyLen).toString('utf8');
    messages.push(JSON.parse(body));
    current = current.subarray(bodyStart + bodyLen);
  }

  return { messages, remaining: current };
}

class LspClient {
  private proc: ChildProcessWithoutNullStreams;
  private buffer: Buffer = Buffer.alloc(0);
  private responsePending: Array<(msg: unknown) => void> = [];
  private notifListeners: Array<{ method: string; resolve: (msg: unknown) => void }> = [];
  private bufferedNotifs: Array<{ method: string; msg: unknown }> = [];
  private idCounter = 1;

  constructor() {
    this.proc = spawn('bun', ['run', '--smol', SERVER_ENTRY], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.proc.stdout.on('data', (chunk: Buffer) => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      const { messages, remaining } = parseFrames(this.buffer);
      this.buffer = remaining;
      for (const msg of messages) {
        this.routeMessage(msg);
      }
    });
  }

  private routeMessage(msg: unknown): void {
    const m = msg as Record<string, unknown>;
    const hasId = 'id' in m;
    const hasMethod = 'method' in m;

    if (hasId && !hasMethod) {
      const resolver = this.responsePending.shift();
      if (resolver) resolver(msg);
      return;
    }

    if (hasMethod && !hasId) {
      const method = m['method'] as string;
      const idx = this.notifListeners.findIndex((l) => l.method === method);
      if (idx !== -1) {
        const [listener] = this.notifListeners.splice(idx, 1);
        listener.resolve(msg);
      } else {
        this.bufferedNotifs.push({ method, msg });
      }
    }
  }

  request(method: string, params: unknown = {}): Promise<unknown> {
    return new Promise((resolve) => {
      const id = this.idCounter++;
      this.responsePending.push(resolve);
      this.proc.stdin.write(frame({ jsonrpc: '2.0', id, method, params }));
    });
  }

  notify(method: string, params: unknown = {}): void {
    this.proc.stdin.write(frame({ jsonrpc: '2.0', method, params }));
  }

  waitForNotification(method: string): Promise<unknown> {
    const idx = this.bufferedNotifs.findIndex((b) => b.method === method);
    if (idx !== -1) {
      const [{ msg }] = this.bufferedNotifs.splice(idx, 1);
      return Promise.resolve(msg);
    }
    return new Promise((resolve) => {
      this.notifListeners.push({ method, resolve });
    });
  }

  waitForExit(): Promise<number> {
    return new Promise((resolve) => {
      this.proc.on('exit', (code) => resolve(code ?? 1));
    });
  }

  kill(): void {
    this.proc.kill();
  }

  get stderr(): Readable {
    return this.proc.stderr;
  }
}

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
        { startLine: 4, endLine: 5, kind: 'region' },
        { startLine: 7, endLine: 9, kind: 'region' },
        { startLine: 11, endLine: 13, kind: 'region' },
        { startLine: 15, endLine: 17, kind: 'comment' },
        { startLine: 19, endLine: 21, kind: 'region' },
      ]),
    );

    const selections = resultOf<SelectionRange[]>(
      await client.request('textDocument/selectionRange', {
        textDocument: { uri: sourceUri },
        positions: [{ line: 20, character: 8 }],
      }),
    );
    expect(selections).toEqual([
      {
        range: {
          start: { line: 19, character: 0 },
          end: { line: 21, character: 2 },
        },
      },
    ]);

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 25000);
});

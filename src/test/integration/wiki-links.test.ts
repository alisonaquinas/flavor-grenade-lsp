/**
 * Integration tests for Phase 5: Wiki-Link Resolution.
 *
 * Spawns the server against a fixture vault and verifies diagnostics,
 * go-to-definition, and completion behaviour end-to-end.
 */
import { describe, expect, it, afterEach } from '@jest/globals';
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import { Readable } from 'node:stream';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ENTRY = path.resolve(__dirname, '../../../src/main.ts');
const VAULT_DIR = path.resolve(__dirname, '../fixtures/wiki-link-vault');

// ─── Framing helpers ─────────────────────────────────────────────────────────

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

// ─── LspClient with notification buffering ───────────────────────────────────

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

  /** Send a JSON-RPC request and await its response. */
  request(method: string, params: unknown = {}): Promise<unknown> {
    return new Promise((resolve) => {
      const id = this.idCounter++;
      this.responsePending.push(resolve);
      this.proc.stdin.write(frame({ jsonrpc: '2.0', id, method, params }));
    });
  }

  /** Send a JSON-RPC notification (no response expected). */
  notify(method: string, params: unknown = {}): void {
    this.proc.stdin.write(frame({ jsonrpc: '2.0', method, params }));
  }

  /**
   * Wait for a server-pushed notification with the given method name.
   * Resolves immediately if a matching notification is already buffered.
   */
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

  it(
    'diagnostics: FG001 for nonexistent, FG002 for ambiguous gamma',
    async () => {
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

      const diagMsg = await client.waitForNotification(
        'textDocument/publishDiagnostics',
      ) as Record<string, unknown>;
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
    },
    25000,
  );

  it(
    'textDocument/definition: [[beta]] resolves to beta.md',
    async () => {
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
      const defResp = await client.request('textDocument/definition', {
        textDocument: { uri: alphaUri },
        position: { line: 0, character: 25 },
      }) as Record<string, unknown>;

      const location = defResp['result'] as { uri: string; range: unknown } | null;
      expect(location).not.toBeNull();
      expect(location!.uri).toContain('beta');

      await client.request('shutdown');
      client.notify('exit');
      await client.waitForExit();
    },
    25000,
  );

  it(
    'textDocument/completion includes all vault doc stems',
    async () => {
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
      const compResp = await client.request('textDocument/completion', {
        textDocument: { uri: alphaUri },
        position: { line: 0, character: 25 },
        context: { triggerKind: 2, triggerCharacter: '[' },
      }) as Record<string, unknown>;

      const result = compResp['result'] as { items: Array<{ label: string }> };
      const labels = result.items.map((i) => i.label);
      expect(labels).toContain('alpha');
      expect(labels).toContain('beta');
      expect(labels).toContain('gamma');
      expect(labels).toContain('delta');

      await client.request('shutdown');
      client.notify('exit');
      await client.waitForExit();
    },
    25000,
  );
});

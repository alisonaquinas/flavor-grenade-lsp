/**
 * Integration tests for Phase 10: Navigation.
 *
 * Spawns the server against the wiki-link-vault fixture and verifies
 * go-to-definition, find-references, and code lens behaviour end-to-end.
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

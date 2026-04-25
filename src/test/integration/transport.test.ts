/**
 * Integration tests for the LSP stdio transport.
 *
 * Spawns the server as a subprocess and communicates via stdio using a
 * minimal LspClient helper. Does NOT import from src/ directly.
 */
import { describe, expect, it } from '@jest/globals';
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import { Readable } from 'node:stream';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ENTRY = path.resolve(__dirname, '../../../src/main.ts');

// ─── Framing helpers ────────────────────────────────────────────────────────

function frame(obj: unknown): Buffer {
  const body = JSON.stringify(obj);
  const header = `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n`;
  return Buffer.from(header + body, 'utf8');
}

/** Parse zero or more framed messages out of a buffer; return parsed objects + remaining bytes. */
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

// ─── LspClient ──────────────────────────────────────────────────────────────

class LspClient {
  private proc: ChildProcessWithoutNullStreams;
  private buffer: Buffer = Buffer.alloc(0);
  private pending: Array<(msg: unknown) => void> = [];
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
        const resolver = this.pending.shift();
        if (resolver) resolver(msg);
      }
    });
  }

  /** Send a request and await the response. */
  request(method: string, params: unknown = {}): Promise<unknown> {
    return new Promise((resolve) => {
      const id = this.idCounter++;
      this.pending.push(resolve);
      this.proc.stdin.write(frame({ jsonrpc: '2.0', id, method, params }));
    });
  }

  /** Send a notification (no response expected). */
  notify(method: string, params: unknown = {}): void {
    this.proc.stdin.write(frame({ jsonrpc: '2.0', method, params }));
  }

  /** Wait for the next message the server pushes (notification or next response). */
  nextMessage(): Promise<unknown> {
    return new Promise((resolve) => {
      this.pending.push(resolve);
    });
  }

  /** Wait for the process to exit and return its exit code. */
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

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LSP Transport Integration', () => {
  it('full handshake: initialize → initialized → shutdown → exit (exits 0)', async () => {
    const client = new LspClient();

    // 1. initialize
    const initResponse = (await client.request('initialize', {
      processId: null,
      rootUri: null,
      capabilities: {},
    })) as Record<string, unknown>;

    expect(initResponse).toMatchObject({
      jsonrpc: '2.0',
      result: {
        capabilities: expect.objectContaining({ textDocumentSync: 1 }),
        serverInfo: { name: 'flavor-grenade-lsp', version: '0.1.0' },
      },
    });

    // 2. The server should push a flavorGrenade/status notification after initialize
    // (may arrive before or interleaved — collect next server push)
    const statusNotif = (await client.nextMessage()) as Record<string, unknown>;
    expect(statusNotif).toMatchObject({
      jsonrpc: '2.0',
      method: 'flavorGrenade/status',
    });

    // 3. initialized notification
    client.notify('initialized', {});

    // 4. shutdown
    const shutdownResponse = (await client.request('shutdown')) as Record<string, unknown>;
    expect(shutdownResponse).toMatchObject({ jsonrpc: '2.0', id: 2, result: null });
    expect(shutdownResponse['error']).toBeUndefined();

    // 5. exit
    const exitCodePromise = client.waitForExit();
    client.notify('exit');

    const exitCode = await exitCodePromise;
    expect(exitCode).toBe(0);
  }, 15000);

  it('unknown method returns -32601 Method Not Found', async () => {
    const client = new LspClient();

    // First do initialize so server is ready
    await client.request('initialize', { processId: null, rootUri: null, capabilities: {} });
    // consume the status notification
    await client.nextMessage();

    const response = (await client.request('unknown/method', {})) as Record<string, unknown>;
    expect(response).toMatchObject({
      jsonrpc: '2.0',
      error: { code: -32601 },
    });

    // clean up
    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 15000);

  it('flavorGrenade/status notification received after initialized', async () => {
    const client = new LspClient();

    await client.request('initialize', { processId: null, rootUri: null, capabilities: {} });
    const notif = (await client.nextMessage()) as Record<string, unknown>;

    expect(notif).toMatchObject({
      jsonrpc: '2.0',
      method: 'flavorGrenade/status',
      params: { state: 'initializing', vaultCount: 0, docCount: 0 },
    });

    await client.request('shutdown');
    client.notify('exit');
    await client.waitForExit();
  }, 15000);
});

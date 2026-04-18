// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SERVER_ENTRY = path.resolve(process.cwd(), 'src/main.ts');

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
    messages.push(JSON.parse(current.subarray(bodyStart, bodyStart + bodyLen).toString('utf8')));
    current = current.subarray(bodyStart + bodyLen);
  }
  return { messages, remaining: current };
}

export class FGWorld extends World {
  // Vault
  vaultDir = '';

  // Server
  proc: ChildProcessWithoutNullStreams | null = null;
  private buf: Buffer = Buffer.alloc(0);
  private resPending: Array<(m: unknown) => void> = [];
  private notifListeners: Array<{ method: string; resolve: (m: unknown) => void }> = [];
  private bufferedNotifs: Array<{ method: string; msg: unknown }> = [];
  private idCounter = 1;

  // Scenario state
  lastResponse: unknown = null;
  lastDiagnostics: Map<string, unknown[]> = new Map();
  lastStatusNotif: unknown = null;

  constructor(opts: IWorldOptions) {
    super(opts);
  }

  // ── Vault helpers ──────────────────────────────────────────────────────

  createVaultDir(): void {
    this.vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-bdd-'));
  }

  writeVaultFile(relPath: string, content: string): void {
    if (!this.vaultDir) this.createVaultDir();
    const abs = path.join(this.vaultDir, relPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    // Replace literal \n in table cells with actual newlines
    const actual = content === '<binary>' ? '' : content.replace(/\\n/g, '\n');
    fs.writeFileSync(abs, actual, 'utf8');
  }

  vaultUri(relPath?: string): string {
    const base = pathToFileURL(this.vaultDir).toString();
    return relPath ? pathToFileURL(path.join(this.vaultDir, relPath)).toString() : base;
  }

  // ── Server lifecycle ───────────────────────────────────────────────────

  private routeMessage(msg: unknown): void {
    const m = msg as Record<string, unknown>;
    const hasId = 'id' in m && m['id'] !== undefined;
    if (hasId && !('method' in m)) {
      const r = this.resPending.shift();
      if (r) r(msg);
      return;
    }
    if ('method' in m) {
      const method = m['method'] as string;
      if (method === 'textDocument/publishDiagnostics') {
        const params = m['params'] as { uri: string; diagnostics: unknown[] };
        this.lastDiagnostics.set(params.uri, params.diagnostics);
      }
      const idx = this.notifListeners.findIndex((l) => l.method === method);
      if (idx !== -1) {
        const [l] = this.notifListeners.splice(idx, 1);
        l.resolve(msg);
      } else {
        this.bufferedNotifs.push({ method, msg });
      }
    }
  }

  send(obj: unknown): void {
    this.proc!.stdin.write(frame(obj));
  }

  request(method: string, params: unknown = {}): Promise<unknown> {
    return new Promise((resolve) => {
      const id = this.idCounter++;
      this.resPending.push(resolve);
      this.send({ jsonrpc: '2.0', id, method, params });
    });
  }

  notify(method: string, params: unknown = {}): void {
    this.send({ jsonrpc: '2.0', method, params });
  }

  waitForNotification(method: string, timeoutMs = 10000): Promise<unknown> {
    const idx = this.bufferedNotifs.findIndex((b) => b.method === method);
    if (idx !== -1) {
      const [{ msg }] = this.bufferedNotifs.splice(idx, 1);
      return Promise.resolve(msg);
    }
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`Timeout waiting for ${method}`)), timeoutMs);
      this.notifListeners.push({
        method,
        resolve: (m) => {
          clearTimeout(t);
          resolve(m);
        },
      });
    });
  }

  waitForDiagnostics(uri: string, timeoutMs = 10000): Promise<unknown[]> {
    if (this.lastDiagnostics.has(uri)) return Promise.resolve(this.lastDiagnostics.get(uri)!);
    return new Promise((resolve, reject) => {
      const t = setTimeout(
        () => reject(new Error(`Timeout waiting for diagnostics: ${uri}`)),
        timeoutMs,
      );
      const check = (msg: unknown): void => {
        const m = msg as Record<string, unknown>;
        const params = m['params'] as { uri: string; diagnostics: unknown[] };
        if (params.uri === uri) {
          clearTimeout(t);
          resolve(params.diagnostics);
        } else
          this.notifListeners.push({ method: 'textDocument/publishDiagnostics', resolve: check });
      };
      this.notifListeners.push({ method: 'textDocument/publishDiagnostics', resolve: check });
    });
  }

  waitForExit(): Promise<number> {
    return new Promise((resolve) => {
      this.proc!.on('exit', (code) => resolve(code ?? 1));
    });
  }

  async startServer(rootUri?: string): Promise<void> {
    this.proc = spawn('bun', ['run', '--smol', SERVER_ENTRY], { stdio: ['pipe', 'pipe', 'pipe'] });
    this.proc.stdout.on('data', (chunk: Buffer) => {
      this.buf = Buffer.concat([this.buf, chunk]);
      const { messages, remaining } = parseFrames(this.buf);
      this.buf = remaining;
      for (const msg of messages) this.routeMessage(msg);
    });

    this.lastResponse = await this.request('initialize', {
      processId: null,
      rootUri: rootUri ?? null,
      capabilities: {},
    });
    this.lastStatusNotif = await this.waitForNotification('flavorGrenade/status');
    // Pass rootUri in initialized so server triggers vault scan
    this.notify('initialized', rootUri ? { rootUri } : {});

    if (rootUri) {
      // Wait for vault scan completion ('ready' notification)
      try {
        await this.waitForNotification('flavorGrenade/status', 15000);
      } catch {
        /* may not come */
      }
      try {
        await this.request('flavorGrenade/awaitIndexReady');
      } catch {
        /* optional */
      }
    }
  }

  async openDocument(relPath: string): Promise<void> {
    const uri = this.vaultUri(relPath);
    const text = fs.readFileSync(path.join(this.vaultDir, relPath), 'utf8');
    this.notify('textDocument/didOpen', {
      textDocument: { uri, languageId: 'markdown', version: 1, text },
    });
  }

  async openDocumentWithText(uri: string, text: string): Promise<void> {
    this.notify('textDocument/didOpen', {
      textDocument: { uri, languageId: 'markdown', version: 1, text },
    });
  }

  async cleanup(): Promise<void> {
    if (this.proc) {
      try {
        await Promise.race([this.request('shutdown'), new Promise((r) => setTimeout(r, 2000))]);
        this.notify('exit');
        await Promise.race([this.waitForExit(), new Promise((r) => setTimeout(r, 2000))]);
      } catch {
        /* ignore */
      }
      this.proc.kill('SIGKILL');
      this.proc = null;
    }
    if (this.vaultDir) {
      try {
        fs.rmSync(this.vaultDir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
      this.vaultDir = '';
    }
    this.buf = Buffer.alloc(0);
    this.resPending = [];
    this.notifListeners = [];
    this.bufferedNotifs = [];
    this.idCounter = 1;
    this.lastResponse = null;
    this.lastDiagnostics = new Map();
  }
}

setWorldConstructor(FGWorld);

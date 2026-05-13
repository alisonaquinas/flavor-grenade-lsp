import { afterEach, describe, expect, it } from '@jest/globals';
import * as fs from 'fs';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ENTRY = path.resolve(__dirname, '../../../src/main.ts');

function frame(obj: unknown): Buffer {
  const body = JSON.stringify(obj);
  return Buffer.from(`Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`, 'utf8');
}

function parseFrames(buf: Buffer): { messages: unknown[]; remaining: Buffer } {
  const messages: unknown[] = [];
  let current = buf;

  while (true) {
    const sep = current.indexOf('\r\n\r\n');
    if (sep === -1) break;
    const header = current.subarray(0, sep).toString('utf8');
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) break;
    const length = Number.parseInt(match[1], 10);
    const bodyStart = sep + 4;
    if (current.length < bodyStart + length) break;
    messages.push(JSON.parse(current.subarray(bodyStart, bodyStart + length).toString('utf8')));
    current = current.subarray(bodyStart + length);
  }

  return { messages, remaining: current };
}

class LspClient {
  private readonly proc: ChildProcessWithoutNullStreams;
  private buffer = Buffer.alloc(0);
  private readonly responses = new Map<number, (msg: unknown) => void>();
  private readonly notificationListeners: Array<{
    method: string;
    resolve: (msg: unknown) => void;
  }> = [];
  private readonly bufferedNotifications: Array<{ method: string; msg: unknown }> = [];
  private stderr = '';
  private idCounter = 1;

  constructor() {
    this.proc = spawn('bun', ['run', '--smol', SERVER_ENTRY], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.proc.stdout.on('data', (chunk: Buffer) => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      const { messages, remaining } = parseFrames(this.buffer);
      this.buffer = remaining;
      for (const message of messages) {
        const msg = message as Record<string, unknown>;
        if ('id' in msg && !('method' in msg)) {
          const id = Number(msg.id);
          this.responses.get(id)?.(message);
          this.responses.delete(id);
        } else if ('method' in msg && !('id' in msg)) {
          this.routeNotification(msg.method as string, message);
        }
      }
    });
    this.proc.stderr.on('data', (chunk: Buffer) => {
      this.stderr += chunk.toString('utf8');
    });
  }

  request(method: string, params: unknown = {}): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const id = this.idCounter++;
      const timer = setTimeout(() => {
        this.responses.delete(id);
        reject(new Error(`Timed out waiting for ${method}. Server stderr:\n${this.stderr}`));
      }, 5000);
      this.responses.set(id, (msg) => {
        clearTimeout(timer);
        resolve(msg as Record<string, unknown>);
      });
      this.proc.stdin.write(frame({ jsonrpc: '2.0', id, method, params }));
    });
  }

  notify(method: string, params: unknown = {}): void {
    this.proc.stdin.write(frame({ jsonrpc: '2.0', method, params }));
  }

  waitForNotification(method: string): Promise<unknown> {
    const bufferedIndex = this.bufferedNotifications.findIndex((entry) => entry.method === method);
    if (bufferedIndex !== -1) {
      const [entry] = this.bufferedNotifications.splice(bufferedIndex, 1);
      return Promise.resolve(entry.msg);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const listenerIndex = this.notificationListeners.findIndex(
          (entry) => entry.method === method && entry.resolve === resolve,
        );
        if (listenerIndex !== -1) {
          this.notificationListeners.splice(listenerIndex, 1);
        }
        reject(new Error(`Timed out waiting for ${method}. Server stderr:\n${this.stderr}`));
      }, 5000);

      this.notificationListeners.push({
        method,
        resolve: (msg) => {
          clearTimeout(timer);
          resolve(msg);
        },
      });
    });
  }

  async close(): Promise<void> {
    await this.request('shutdown');
    this.notify('exit');
  }

  kill(): void {
    this.proc.kill();
  }

  private routeNotification(method: string, msg: unknown): void {
    const listenerIndex = this.notificationListeners.findIndex((entry) => entry.method === method);
    if (listenerIndex !== -1) {
      const [listener] = this.notificationListeners.splice(listenerIndex, 1);
      listener.resolve(msg);
      return;
    }

    this.bufferedNotifications.push({ method, msg });
  }
}

describe('Markdown flavor spawned-server propagation', () => {
  let client: LspClient | null = null;
  const tempRoots: string[] = [];

  afterEach(() => {
    client?.kill();
    client = null;
    for (const root of tempRoots.splice(0)) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('applies flavor changes to open-document analysis across JSON-RPC', async () => {
    client = new LspClient();
    await client.request('initialize', { processId: null, rootUri: null, capabilities: {} });

    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: 'file:///tmp/flavor.md',
        languageId: 'markdown',
        version: 1,
        text: '[[Target]]\n# Heading',
      },
    });

    let query = await client.request('flavorGrenade/queryOpenDoc', {
      uri: 'file:///tmp/flavor.md',
    });
    expect(query.result).toMatchObject({
      markdownFlavor: 'commonmark',
      wikiLinks: 0,
      headings: 1,
    });

    client.notify('workspace/didChangeConfiguration', {
      settings: { flavorGrenade: { markdownFlavor: 'obsidian' } },
    });

    query = await client.request('flavorGrenade/queryOpenDoc', {
      uri: 'file:///tmp/flavor.md',
    });
    expect(query.result).toMatchObject({
      markdownFlavor: 'obsidian',
      wikiLinks: 1,
    });

    client.notify('workspace/didChangeConfiguration', {
      settings: { flavorGrenade: { markdownFlavor: 'asciidoc' } },
    });

    query = await client.request('flavorGrenade/queryOpenDoc', {
      uri: 'file:///tmp/flavor.md',
    });
    expect(query.result).toMatchObject({
      markdownFlavor: 'obsidian',
      wikiLinks: 1,
    });

    await client.close();
  }, 15000);

  it('applies confined project TOML flavor evidence before Obsidian fallback', async () => {
    const vault = createRepoTempVault();
    tempRoots.push(vault);
    const notePath = path.join(vault, 'flavor.md');
    fs.writeFileSync(path.join(vault, '.flavor-grenade.toml'), 'core.markdown.flavor = "gfm"\n');
    fs.writeFileSync(notePath, '[[Target]]\n# Heading\n');
    const noteUri = pathToFileURL(notePath).href;

    client = new LspClient();
    await client.request('initialize', {
      processId: null,
      rootUri: pathToFileURL(vault).href,
      capabilities: {},
    });

    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: noteUri,
        languageId: 'markdown',
        version: 1,
        text: fs.readFileSync(notePath, 'utf8'),
      },
    });

    const query = await client.request('flavorGrenade/queryOpenDoc', { uri: noteUri });
    expect(query.result).toMatchObject({
      markdownFlavor: 'gfm',
      wikiLinks: 0,
      headings: 1,
    });

    await client.close();
  }, 15000);

  it('applies Original Markdown parser, diagnostics, and completion behavior', async () => {
    const vault = createRepoTempVault();
    tempRoots.push(vault);
    const notePath = path.join(vault, 'original.md');
    fs.writeFileSync(
      path.join(vault, '.flavor-grenade.toml'),
      'core.markdown.flavor = "original"\n',
    );
    fs.writeFileSync(
      notePath,
      [
        'Setext Title',
        '============',
        '',
        '# ATX Title',
        '',
        '[[Note]]',
        '| a | b |',
        '|---|---|',
        '- [x] task',
        '> [!note]',
      ].join('\n'),
    );
    const noteUri = pathToFileURL(notePath).href;

    client = new LspClient();
    await client.request('initialize', {
      processId: null,
      rootUri: pathToFileURL(vault).href,
      capabilities: {},
    });

    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: noteUri,
        languageId: 'markdown',
        version: 1,
        text: fs.readFileSync(notePath, 'utf8'),
      },
    });

    const diagnostics = (await client.waitForNotification(
      'textDocument/publishDiagnostics',
    )) as Record<string, unknown>;
    const diagnosticParams = diagnostics['params'] as {
      diagnostics: Array<Record<string, unknown>>;
    };
    expect(diagnosticParams.diagnostics.map((diagnostic) => diagnostic['code'])).toEqual([
      'FG101',
      'FG101',
      'FG101',
      'FG101',
    ]);

    const query = await client.request('flavorGrenade/queryOpenDoc', { uri: noteUri });
    expect(query.result).toMatchObject({
      markdownFlavor: 'original',
      wikiLinks: 0,
      headings: 2,
    });

    const completion = await client.request('textDocument/completion', {
      textDocument: { uri: noteUri },
      position: { line: 5, character: 2 },
      context: { triggerCharacter: '[' },
    });
    expect(completion.result).toMatchObject({ items: [], isIncomplete: false });

    await client.close();
  }, 15000);

  it('applies CommonMark parser, diagnostics, and completion behavior', async () => {
    const vault = createRepoTempVault();
    tempRoots.push(vault);
    const notePath = path.join(vault, 'commonmark.md');
    fs.writeFileSync(
      path.join(vault, '.flavor-grenade.toml'),
      'core.markdown.flavor = "commonmark"\n',
    );
    fs.writeFileSync(
      notePath,
      [
        'Setext Title',
        '---',
        '',
        '# ATX Title',
        '',
        '```js',
        'x()',
        '```',
        '',
        '[External](https://example.com/path)',
        '<https://example.com>',
        '',
        '[[Note]]',
        '| a | b |',
        '|---|---|',
        '- [x] task',
        '> [!note]',
      ].join('\n'),
    );
    const noteUri = pathToFileURL(notePath).href;

    client = new LspClient();
    await client.request('initialize', {
      processId: null,
      rootUri: pathToFileURL(vault).href,
      capabilities: {},
    });

    client.notify('textDocument/didOpen', {
      textDocument: {
        uri: noteUri,
        languageId: 'markdown',
        version: 1,
        text: fs.readFileSync(notePath, 'utf8'),
      },
    });

    const diagnostics = (await client.waitForNotification(
      'textDocument/publishDiagnostics',
    )) as Record<string, unknown>;
    const diagnosticParams = diagnostics['params'] as {
      diagnostics: Array<Record<string, unknown>>;
    };
    expect(diagnosticParams.diagnostics.map((diagnostic) => diagnostic['code'])).toEqual([
      'FG102',
      'FG102',
      'FG102',
      'FG102',
    ]);

    const query = await client.request('flavorGrenade/queryOpenDoc', { uri: noteUri });
    expect(query.result).toMatchObject({
      markdownFlavor: 'commonmark',
      wikiLinks: 0,
      headings: 2,
    });

    const completion = await client.request('textDocument/completion', {
      textDocument: { uri: noteUri },
      position: { line: 12, character: 2 },
      context: { triggerCharacter: '[' },
    });
    expect(completion.result).toMatchObject({ items: [], isIncomplete: false });

    await client.close();
  }, 15000);

  it('classifies non-local boundaries through the spawned server', async () => {
    client = new LspClient();
    await client.request('initialize', { processId: null, rootUri: null, capabilities: {} });

    const response = await client.request('flavorGrenade/classifyBoundary', {
      flavor: 'gfm',
      text: '#123',
    });
    expect(response.result).toMatchObject({ disposition: 'non-local-host' });

    await client.close();
  }, 15000);
});

function createRepoTempVault(): string {
  const base = path.join(process.cwd(), 'tmp');
  fs.mkdirSync(base, { recursive: true });
  return fs.mkdtempSync(path.join(base, 'phase-20-integration-'));
}

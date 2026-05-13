import { describe, expect, it } from '@jest/globals';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  private readonly pending: Array<(msg: unknown) => void> = [];
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
        this.pending.shift()?.(message);
      }
    });
  }

  request(method: string, params: unknown = {}): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      const id = this.idCounter++;
      this.pending.push((msg) => resolve(msg as Record<string, unknown>));
      this.proc.stdin.write(frame({ jsonrpc: '2.0', id, method, params }));
    });
  }

  notify(method: string, params: unknown = {}): void {
    this.proc.stdin.write(frame({ jsonrpc: '2.0', method, params }));
  }

  async close(): Promise<void> {
    await this.request('shutdown');
    this.notify('exit');
  }
}

describe('Markdown flavor spawned-server propagation', () => {
  it('applies flavor changes to open-document analysis across JSON-RPC', async () => {
    const client = new LspClient();
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

  it('classifies non-local boundaries through the spawned server', async () => {
    const client = new LspClient();
    await client.request('initialize', { processId: null, rootUri: null, capabilities: {} });

    const response = await client.request('flavorGrenade/classifyBoundary', {
      flavor: 'gfm',
      text: '#123',
    });
    expect(response.result).toMatchObject({ disposition: 'non-local-host' });

    await client.close();
  }, 15000);
});

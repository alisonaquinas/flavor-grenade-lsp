import { describe, expect, it } from '@jest/globals';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import { StdioReader } from './stdio-reader.js';

/** Build a framed LSP message string. */
function frame(body: string): Buffer {
  const bodyBuf = Buffer.from(body, 'utf8');
  const header = `Content-Length: ${bodyBuf.byteLength}\r\n\r\n`;
  return Buffer.concat([Buffer.from(header), bodyBuf]);
}

describe('StdioReader', () => {
  it('is an EventEmitter', () => {
    const reader = new StdioReader();
    expect(reader).toBeInstanceOf(EventEmitter);
  });

  it('emits a complete message body from a single chunk', async () => {
    const reader = new StdioReader();
    const body = '{"jsonrpc":"2.0","method":"test"}';
    const messages: string[] = [];

    reader.on('message', (msg: string) => messages.push(msg));

    const stream = Readable.from([frame(body)]);
    reader.start(stream);

    await new Promise<void>((resolve) => stream.on('end', resolve));
    // Allow microtask queue to flush
    await new Promise<void>((resolve) => setTimeout(resolve, 10));

    expect(messages).toHaveLength(1);
    expect(messages[0]).toBe(body);
  });

  it('emits multiple messages from a single chunk', async () => {
    const reader = new StdioReader();
    const body1 = '{"jsonrpc":"2.0","method":"one"}';
    const body2 = '{"jsonrpc":"2.0","method":"two"}';
    const messages: string[] = [];

    reader.on('message', (msg: string) => messages.push(msg));

    const combined = Buffer.concat([frame(body1), frame(body2)]);
    const stream = Readable.from([combined]);
    reader.start(stream);

    await new Promise<void>((resolve) => stream.on('end', resolve));
    await new Promise<void>((resolve) => setTimeout(resolve, 10));

    expect(messages).toHaveLength(2);
    expect(messages[0]).toBe(body1);
    expect(messages[1]).toBe(body2);
  });

  it('handles a message split across multiple chunks (partial read)', async () => {
    const reader = new StdioReader();
    const body = '{"jsonrpc":"2.0","method":"partial"}';
    const messages: string[] = [];

    reader.on('message', (msg: string) => messages.push(msg));

    const full = frame(body);
    // Split arbitrarily in the middle of the body
    const half = Math.floor(full.length / 2);
    const part1 = full.subarray(0, half);
    const part2 = full.subarray(half);

    const stream = Readable.from([part1, part2]);
    reader.start(stream);

    await new Promise<void>((resolve) => stream.on('end', resolve));
    await new Promise<void>((resolve) => setTimeout(resolve, 10));

    expect(messages).toHaveLength(1);
    expect(messages[0]).toBe(body);
  });

  it('handles UTF-8 multi-byte characters with correct byte length', async () => {
    const reader = new StdioReader();
    const body = '{"text":"日本語テスト"}';
    const messages: string[] = [];

    reader.on('message', (msg: string) => messages.push(msg));

    const stream = Readable.from([frame(body)]);
    reader.start(stream);

    await new Promise<void>((resolve) => stream.on('end', resolve));
    await new Promise<void>((resolve) => setTimeout(resolve, 10));

    expect(messages).toHaveLength(1);
    expect(messages[0]).toBe(body);
  });
});

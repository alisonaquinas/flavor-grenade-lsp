import { describe, expect, it } from '@jest/globals';
import { Writable } from 'node:stream';
import { StdioWriter } from './stdio-writer.js';

/** Collect all data written to a writable into a single Buffer. */
function collectWritable(): { stream: Writable; getBytes: () => Buffer } {
  const chunks: Buffer[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      callback();
    },
  });
  return { stream, getBytes: () => Buffer.concat(chunks) };
}

describe('StdioWriter', () => {
  it('prepends a Content-Length header', () => {
    const writer = new StdioWriter();
    const { stream, getBytes } = collectWritable();
    const message = { jsonrpc: '2.0', id: 1, result: null };

    writer.write(stream, message);

    const output = getBytes().toString('utf8');
    expect(output).toMatch(/^Content-Length: \d+\r\n\r\n/);
  });

  it('Content-Length matches the byte length of the JSON body', () => {
    const writer = new StdioWriter();
    const { stream, getBytes } = collectWritable();
    const message = { jsonrpc: '2.0', id: 1, result: null };

    writer.write(stream, message);

    const raw = getBytes().toString('utf8');
    const match = raw.match(/^Content-Length: (\d+)\r\n\r\n([\s\S]*)$/);
    expect(match).not.toBeNull();
    const claimedLength = parseInt(match![1], 10);
    const bodyBytes = Buffer.byteLength(match![2], 'utf8');
    expect(claimedLength).toBe(bodyBytes);
  });

  it('serialises the message as JSON after the header', () => {
    const writer = new StdioWriter();
    const { stream, getBytes } = collectWritable();
    const message = { jsonrpc: '2.0', id: 42, result: { ok: true } };

    writer.write(stream, message);

    const raw = getBytes().toString('utf8');
    const bodyStart = raw.indexOf('\r\n\r\n') + 4;
    const body = raw.slice(bodyStart);
    expect(JSON.parse(body)).toEqual(message);
  });

  it('correctly computes byte length for multi-byte UTF-8 characters', () => {
    const writer = new StdioWriter();
    const { stream, getBytes } = collectWritable();
    // Japanese text in result — each character is 3 bytes in UTF-8
    const message = { jsonrpc: '2.0', id: 1, result: { text: '日本語' } };

    writer.write(stream, message);

    const raw = getBytes().toString('utf8');
    const match = raw.match(/^Content-Length: (\d+)\r\n\r\n([\s\S]*)$/);
    expect(match).not.toBeNull();
    const claimedLength = parseInt(match![1], 10);
    const bodyBytes = Buffer.byteLength(match![2], 'utf8');
    expect(claimedLength).toBe(bodyBytes);
  });
});

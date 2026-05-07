import { EventEmitter } from 'node:events';

/**
 * Buffers bytes from a {@link NodeJS.ReadableStream}, parses the LSP
 * `Content-Length` framing header, and emits each complete message body
 * as a UTF-8 string `'message'` event.
 *
 * Handles partial reads: a single `data` event may deliver less than a full
 * message, more than one message, or a boundary mid-buffer. All three cases
 * are handled correctly by accumulating bytes and re-checking after every
 * chunk.
 */
export class StdioReader extends EventEmitter {
  private static readonly maxHeaderBytes = 8 * 1024;
  private static readonly maxContentBytes = 16 * 1024 * 1024;
  private static readonly maxBufferedBytes =
    StdioReader.maxHeaderBytes + StdioReader.maxContentBytes;

  private buffer: Buffer = Buffer.alloc(0);

  /**
   * Attach a listener to the given stream and begin parsing.
   *
   * @param stream - Any readable byte stream (e.g. `process.stdin`).
   */
  start(stream: NodeJS.ReadableStream): void {
    stream.on('data', (chunk: Buffer | string) => {
      const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string, 'utf8');
      if (this.buffer.length + data.length > StdioReader.maxBufferedBytes) {
        this.resetWithFramingError('LSP frame buffer exceeded maximum size.');
        return;
      }
      this.buffer = Buffer.concat([this.buffer, data]);
      this.tryExtract();
    });
  }

  /** Attempt to extract as many complete messages as the buffer allows. */
  private tryExtract(): void {
    while (true) {
      const headerEnd = this.findHeaderEnd();
      if (headerEnd === -1) {
        if (this.buffer.length > StdioReader.maxHeaderBytes) {
          this.resetWithFramingError('LSP frame header exceeded maximum size.');
        }
        return;
      }

      const headerText = this.buffer.subarray(0, headerEnd).toString('utf8');
      const contentLength = this.parseContentLength(headerText);
      if (contentLength === null) {
        this.resetWithFramingError('Malformed LSP Content-Length header.');
        return;
      }
      if (contentLength > StdioReader.maxContentBytes) {
        this.resetWithFramingError('LSP frame body exceeded maximum size.');
        return;
      }

      const bodyStart = headerEnd + 4; // skip \r\n\r\n
      if (this.buffer.length < bodyStart + contentLength) return;

      const body = this.buffer.subarray(bodyStart, bodyStart + contentLength).toString('utf8');
      this.buffer = this.buffer.subarray(bodyStart + contentLength);

      this.emit('message', body);
    }
  }

  /**
   * Return the byte offset of the start of the CRLFCRLF separator, or -1.
   */
  private findHeaderEnd(): number {
    for (let i = 0; i <= this.buffer.length - 4; i++) {
      if (
        this.buffer[i] === 0x0d &&
        this.buffer[i + 1] === 0x0a &&
        this.buffer[i + 2] === 0x0d &&
        this.buffer[i + 3] === 0x0a
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Extract the numeric value from a `Content-Length: N` header block.
   *
   * @param headerText - The raw header text before the CRLFCRLF separator.
   * @returns The content length, or `null` if the header is missing/malformed.
   */
  private parseContentLength(headerText: string): number | null {
    const match = /^Content-Length:\s*(\d+)\s*$/im.exec(headerText);
    if (!match) return null;
    const length = Number(match[1]);
    if (!Number.isSafeInteger(length) || length < 0) return null;
    return length;
  }

  private resetWithFramingError(message: string): void {
    this.buffer = Buffer.alloc(0);
    this.emitFramingError(message);
  }

  private emitFramingError(message: string): void {
    this.emit('framingError', new Error(message));
  }
}

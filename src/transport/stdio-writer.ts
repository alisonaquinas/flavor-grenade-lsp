/**
 * Serialises objects to JSON, prepends a `Content-Length: N\r\n\r\n` header,
 * and writes the framed message to a {@link NodeJS.WritableStream}.
 *
 * The byte length is calculated using {@link Buffer.byteLength} with the
 * `'utf8'` encoding so that multi-byte characters are counted correctly.
 */
export class StdioWriter {
  /**
   * Write a framed LSP message to the given stream.
   *
   * @param stream  - The destination writable stream (e.g. `process.stdout`).
   * @param message - Any serialisable value; will be converted to JSON.
   */
  write(stream: NodeJS.WritableStream, message: unknown): void {
    const body = JSON.stringify(message);
    const byteLength = Buffer.byteLength(body, 'utf8');
    const header = `Content-Length: ${byteLength}\r\n\r\n`;
    stream.write(Buffer.from(header + body, 'utf8'));
  }
}

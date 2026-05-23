import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ENTRY = path.resolve(__dirname, '../../../src/main.ts');
const DEFAULT_TIMEOUT_MS = 5000;

type NotificationListener = {
  method: string;
  resolve: (msg: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
};

function frame(obj: unknown): Buffer {
  const body = JSON.stringify(obj);
  const header = `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n`;
  return Buffer.from(header + body, 'utf8');
}

function parseFrames(buf: Buffer): { messages: unknown[]; remaining: Buffer } {
  const messages: unknown[] = [];
  let current = buf;

  while (true) {
    const sep = current.indexOf('\r\n\r\n');
    if (sep === -1) break;

    const headerText = current.subarray(0, sep).toString('utf8');
    const match = /Content-Length:\s*(\d+)/i.exec(headerText);
    if (!match) break;

    const bodyLen = Number.parseInt(match[1], 10);
    const bodyStart = sep + 4;
    if (current.length < bodyStart + bodyLen) break;

    const body = current.subarray(bodyStart, bodyStart + bodyLen).toString('utf8');
    messages.push(JSON.parse(body));
    current = current.subarray(bodyStart + bodyLen);
  }

  return { messages, remaining: current };
}

export class LspClient {
  private buffer: Buffer = Buffer.alloc(0);
  private readonly bufferedMessages: unknown[] = [];
  private readonly bufferedNotifications: Array<{ method: string; msg: unknown }> = [];
  private readonly messageListeners: Array<(msg: unknown) => void> = [];
  private readonly notificationListeners: NotificationListener[] = [];
  private readonly proc: ChildProcessWithoutNullStreams;
  private readonly responses = new Map<number, (msg: unknown) => void>();
  private stderrText = '';
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
        this.routeMessage(message);
      }
    });

    this.proc.stderr.on('data', (chunk: Buffer) => {
      this.stderrText += chunk.toString('utf8');
    });
  }

  request(
    method: string,
    params: unknown = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const id = this.idCounter++;
      const timer = setTimeout(() => {
        this.responses.delete(id);
        reject(this.timeoutError(`response to ${method}`, timeoutMs));
      }, timeoutMs);

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

  nextMessage(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<unknown> {
    const buffered = this.bufferedMessages.shift();
    if (buffered) {
      const method = (buffered as Record<string, unknown>).method;
      if (typeof method === 'string') {
        const notificationIndex = this.bufferedNotifications.findIndex(
          (entry) => entry.msg === buffered,
        );
        if (notificationIndex !== -1) {
          this.bufferedNotifications.splice(notificationIndex, 1);
        }
      }
      return Promise.resolve(buffered);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const listenerIndex = this.messageListeners.indexOf(resolve);
        if (listenerIndex !== -1) {
          this.messageListeners.splice(listenerIndex, 1);
        }
        reject(this.timeoutError('next server message', timeoutMs));
      }, timeoutMs);

      this.messageListeners.push((msg) => {
        clearTimeout(timer);
        resolve(msg);
      });
    });
  }

  waitForNotification(method: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<unknown> {
    const bufferedIndex = this.bufferedNotifications.findIndex((entry) => entry.method === method);
    if (bufferedIndex !== -1) {
      const [entry] = this.bufferedNotifications.splice(bufferedIndex, 1);
      const messageIndex = this.bufferedMessages.indexOf(entry.msg);
      if (messageIndex !== -1) {
        this.bufferedMessages.splice(messageIndex, 1);
      }
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
        reject(this.timeoutError(`notification ${method}`, timeoutMs));
      }, timeoutMs);

      this.notificationListeners.push({ method, resolve, timer });
    });
  }

  waitForExit(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<number> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(this.timeoutError('server process exit', timeoutMs));
      }, timeoutMs);

      this.proc.once('exit', (code) => {
        clearTimeout(timer);
        resolve(code ?? 1);
      });
    });
  }

  async close(): Promise<void> {
    try {
      await this.request('shutdown');
      this.notify('exit');
      await this.waitForExit();
    } catch {
      this.kill();
    }
  }

  kill(): void {
    if (!this.proc.killed) {
      this.proc.kill();
    }
  }

  get stderr(): Readable {
    return this.proc.stderr;
  }

  get stderrOutput(): string {
    return this.stderrText;
  }

  private routeMessage(message: unknown): void {
    const msg = message as Record<string, unknown>;

    if ('id' in msg && !('method' in msg)) {
      const id = Number(msg.id);
      const responseResolver = this.responses.get(id);
      if (responseResolver) {
        responseResolver(message);
        this.responses.delete(id);
      } else {
        this.routeGenericMessage(message);
      }
      return;
    }

    if ('method' in msg && !('id' in msg)) {
      this.routeNotification(msg.method as string, message);
      return;
    }

    this.routeGenericMessage(message);
  }

  private routeNotification(method: string, msg: unknown): void {
    const listenerIndex = this.notificationListeners.findIndex((entry) => entry.method === method);
    if (listenerIndex !== -1) {
      const [listener] = this.notificationListeners.splice(listenerIndex, 1);
      clearTimeout(listener.timer);
      listener.resolve(msg);
      return;
    }

    if (!this.routeGenericMessage(msg)) {
      this.bufferedNotifications.push({ method, msg });
    }
  }

  private routeGenericMessage(msg: unknown): boolean {
    const listener = this.messageListeners.shift();
    if (listener) {
      listener(msg);
      return true;
    }

    this.bufferedMessages.push(msg);
    return false;
  }

  private timeoutError(waitingFor: string, timeoutMs: number): Error {
    return new Error(
      [
        `Timed out after ${timeoutMs}ms waiting for ${waitingFor}.`,
        `Buffered messages: ${JSON.stringify(this.bufferedMessages)}`,
        `Buffered notifications: ${JSON.stringify(this.bufferedNotifications.map((entry) => entry.method))}`,
        `Server stderr:\n${this.stderrText}`,
      ].join('\n'),
    );
  }
}

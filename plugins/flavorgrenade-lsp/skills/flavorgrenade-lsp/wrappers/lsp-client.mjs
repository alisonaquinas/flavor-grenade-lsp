/**
 * Minimal JSON-RPC client for one embedded LSP process.
 *
 * Provides request/notification framing, initialize/shutdown helpers, and
 * diagnostic synchronization for the skill wrapper. It intentionally implements
 * only the LSP surface used by `flavorgrenade.mjs`.
 *
 * @module wrappers/lsp-client
 */
import { spawn } from 'node:child_process';

/**
 * Lightweight client for the embedded Flavor Grenade LSP executable.
 */
export class LspClient {
  /**
   * Start a child LSP process.
   *
   * @param {string} executable - Runtime executable path.
   * @param {object} [options] - Client options.
   * @param {number} [options.timeoutMs] - Request timeout in milliseconds.
   * @param {string} [options.cwd] - Working directory for the child process.
   */
  constructor(executable, options = {}) {
    this.executable = executable;
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.nextId = 1;
    this.pending = new Map();
    this.buffer = Buffer.alloc(0);
    this.diagnostics = new Map();
    this.diagnosticWaiters = new Map();
    this.child = spawn(executable, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
      cwd: options.cwd,
    });
    this.child.stdout.on('data', (chunk) => this.onData(chunk));
    this.child.stderr.on('data', () => {});
    this.child.on('exit', (code) => {
      for (const { reject } of this.pending.values()) {
        reject(Object.assign(new Error(`LSP exited with code ${code}.`), {
          code: 'FG_SKILL_LSP_EXITED',
          recoverable: false,
        }));
      }
      this.pending.clear();
    });
  }

  /**
   * Send `initialize` and then `initialized`.
   *
   * @param {string | null} rootUri - Workspace root URI, or null for single-file mode.
   * @returns {Promise<unknown>} Initialize result from the server.
   */
  async initialize(rootUri) {
    const result = await this.request('initialize', {
      processId: null,
      rootUri,
      capabilities: {},
    });
    this.notify('initialized', {});
    return result;
  }

  /**
   * Request graceful LSP shutdown and close stdin.
   *
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      await this.request('shutdown', null);
    } catch {}
    this.notify('exit', {});
    this.child.stdin.end();
  }

  /**
   * Notify the LSP that a Markdown document is open.
   *
   * @param {string} uri - File URI.
   * @param {string} text - Document text.
   * @param {string} [languageId] - Language identifier.
   */
  didOpen(uri, text, languageId = 'markdown') {
    this.notify('textDocument/didOpen', {
      textDocument: {
        uri,
        languageId,
        version: 1,
        text,
      },
    });
  }

  /**
   * Send an LSP notification.
   *
   * @param {string} method - LSP method name.
   * @param {unknown} params - Notification parameters.
   */
  notify(method, params) {
    this.write({ jsonrpc: '2.0', method, params });
  }

  /**
   * Send an LSP request and wait for the matching response.
   *
   * @param {string} method - LSP method name.
   * @param {unknown} params - Request parameters.
   * @returns {Promise<unknown>} Request result.
   */
  request(method, params) {
    const id = this.nextId++;
    const message = { jsonrpc: '2.0', id, method, params };
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(Object.assign(new Error(`LSP request timed out: ${method}`), {
          code: 'FG_SKILL_LSP_TIMEOUT',
          recoverable: true,
        }));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timeout });
    });
    this.write(message);
    return promise;
  }

  /**
   * Wait briefly for diagnostics for a document.
   *
   * @param {string} uri - File URI.
   * @param {number} [timeoutMs] - Maximum wait in milliseconds.
   * @returns {Promise<Array>} Published diagnostics, or an empty array.
   */
  waitForDiagnostics(uri, timeoutMs = 500) {
    if (this.diagnostics.has(uri)) {
      return Promise.resolve(this.diagnostics.get(uri));
    }
    return new Promise((resolve) => {
      let waiter;
      const timeout = setTimeout(() => {
        const waiters = this.diagnosticWaiters.get(uri) ?? [];
        const remaining = waiters.filter((candidate) => candidate !== waiter);
        if (remaining.length === 0) {
          this.diagnosticWaiters.delete(uri);
        } else {
          this.diagnosticWaiters.set(uri, remaining);
        }
        resolve([]);
      }, timeoutMs);
      waiter = (diagnostics) => {
        clearTimeout(timeout);
        resolve(diagnostics);
      };
      const waiters = this.diagnosticWaiters.get(uri) ?? [];
      waiters.push(waiter);
      this.diagnosticWaiters.set(uri, waiters);
    });
  }

  /**
   * Write one JSON-RPC message with LSP content-length framing.
   *
   * @param {object} message - JSON-RPC message.
   */
  write(message) {
    const json = JSON.stringify(message);
    this.child.stdin.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`);
  }

  /**
   * Buffer stdout chunks and dispatch complete JSON-RPC messages.
   *
   * @param {Buffer} chunk - Raw stdout chunk.
   */
  onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (true) {
      const headerEnd = this.buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
      const header = this.buffer.slice(0, headerEnd).toString('utf8');
      const match = /Content-Length:\s*(\d+)/i.exec(header);
      if (!match) {
        this.buffer = Buffer.alloc(0);
        return;
      }
      const length = Number(match[1]);
      const bodyStart = headerEnd + 4;
      if (this.buffer.length < bodyStart + length) return;
      const raw = this.buffer.slice(bodyStart, bodyStart + length).toString('utf8');
      this.buffer = this.buffer.slice(bodyStart + length);
      this.dispatch(JSON.parse(raw));
    }
  }

  /**
   * Resolve responses and cache diagnostic notifications.
   *
   * @param {object} message - Parsed JSON-RPC message.
   */
  dispatch(message) {
    if (message.method === 'textDocument/publishDiagnostics') {
      this.diagnostics.set(message.params.uri, message.params.diagnostics ?? []);
      const waiters = this.diagnosticWaiters.get(message.params.uri) ?? [];
      this.diagnosticWaiters.delete(message.params.uri);
      for (const waiter of waiters) {
        waiter(message.params.diagnostics ?? []);
      }
      return;
    }
    if (message.id === undefined) return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    clearTimeout(pending.timeout);
    this.pending.delete(message.id);
    if (message.error) {
      pending.reject(Object.assign(new Error(message.error.message), {
        code: 'FG_SKILL_LSP_ERROR',
        recoverable: true,
      }));
      return;
    }
    pending.resolve(message.result);
  }
}

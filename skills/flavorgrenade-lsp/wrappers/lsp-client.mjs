import { spawn } from 'node:child_process';

export class LspClient {
  constructor(executable, options = {}) {
    this.executable = executable;
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.nextId = 1;
    this.pending = new Map();
    this.buffer = Buffer.alloc(0);
    this.diagnostics = new Map();
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

  async initialize(rootUri) {
    const result = await this.request('initialize', {
      processId: null,
      rootUri,
      capabilities: {},
    });
    this.notify('initialized', {});
    return result;
  }

  async shutdown() {
    try {
      await this.request('shutdown', null);
    } catch {}
    this.notify('exit', {});
    this.child.stdin.end();
  }

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

  notify(method, params) {
    this.write({ jsonrpc: '2.0', method, params });
  }

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

  write(message) {
    const json = JSON.stringify(message);
    this.child.stdin.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`);
  }

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

  dispatch(message) {
    if (message.method === 'textDocument/publishDiagnostics') {
      this.diagnostics.set(message.params.uri, message.params.diagnostics ?? []);
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

---
title: "Phase 2: LSP Transport"
phase: 2
status: planned
tags: [lsp, transport, stdio, json-rpc, nestjs]
updated: 2026-04-16
---

# Phase 2: LSP Transport

| Field      | Value |
|------------|-------|
| Phase      | 2 |
| Title      | LSP Transport |
| Status     | ⏳ planned |
| Gate       | `initialize` → `initialized` → `shutdown` → `exit` sequence completes with correct JSON-RPC response codes |
| Depends on | Phase 1 (Project Scaffold) |

---

## Objective

Implement the JSON-RPC stdio transport layer and capability negotiation so the server can speak the Language Server Protocol. No OFM-specific features are implemented in this phase — only the protocol plumbing. After this phase, any compliant LSP client can connect to the server and perform the handshake.

---

## Background: LSP stdio framing

The Language Server Protocol uses Content-Length framing over stdio:

```
Content-Length: <byte-count>\r\n
\r\n
<JSON-RPC message body>
```

The server reads from `process.stdin` and writes to `process.stdout`. `process.stderr` is used for logging.

---

## Task List

- [ ] **1. Implement stdio Content-Length reader**

  Create `src/transport/stdio-reader.ts`. The reader must:
  - Buffer stdin until it has read a complete `Content-Length: N` header
  - Skip the `\r\n\r\n` separator
  - Read exactly N bytes as the message body
  - Emit the body as a UTF-8 string
  - Handle partial reads correctly (TCP-style backpressure)

  ```typescript
  // src/transport/stdio-reader.ts
  export class StdioReader extends EventEmitter {
    constructor(private readonly input: NodeJS.ReadableStream) { super(); }
    start(): void { /* attach data listener, parse header+body */ }
  }
  ```

- [ ] **2. Implement stdio Content-Length writer**

  Create `src/transport/stdio-writer.ts`:

  ```typescript
  export class StdioWriter {
    constructor(private readonly output: NodeJS.WritableStream) {}
    write(message: object): void {
      const body = JSON.stringify(message);
      const header = `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n`;
      this.output.write(header + body, 'utf8');
    }
  }
  ```

- [ ] **3. Implement JSON-RPC dispatcher**

  Create `src/transport/json-rpc-dispatcher.ts`. The dispatcher:
  - Receives raw message objects from the reader
  - Routes `method` strings to registered handlers
  - Sends responses (with `id`) for requests
  - Sends no response for notifications (no `id`)
  - Handles JSON-RPC error codes: `-32700` Parse error, `-32601` Method not found, `-32603` Internal error

  ```typescript
  export type RequestHandler<P, R> = (params: P) => Promise<R>;
  export type NotificationHandler<P> = (params: P) => void | Promise<void>;

  export class JsonRpcDispatcher {
    onRequest<P, R>(method: string, handler: RequestHandler<P, R>): void;
    onNotification<P>(method: string, handler: NotificationHandler<P>): void;
    dispatch(message: JsonRpcMessage): Promise<void>;
    sendNotification(method: string, params: unknown): void;
  }
  ```

- [ ] **4. Handle `initialize` request**

  Create `src/lsp/handlers/initialize.handler.ts`. Must return an `InitializeResult` with the capabilities that are active at this phase (minimal):

  ```typescript
  {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
    },
    serverInfo: {
      name: 'flavor-grenade-lsp',
      version: '0.1.0',
    },
  }
  ```

  The capability set expands in later phases. Use a `CapabilityRegistry` that each phase's module populates.

- [ ] **5. Handle `initialized` notification**

  The server receives this after sending its `InitializeResult`. Use it to trigger vault detection and initial indexing (Phase 4 populates this). For now, log receipt and no-op.

- [ ] **6. Handle `shutdown` request**

  Return `null` (per LSP spec). Set a `shutdownRequested` flag.

- [ ] **7. Handle `exit` notification**

  If `shutdownRequested` is true, exit with code 0. Otherwise exit with code 1 (per LSP spec).

- [ ] **8. Handle `textDocument/didOpen`**

  Store the document text in an in-memory `DocumentStore`. Do not run OFM parsing yet (Phase 3 adds that).

  ```typescript
  export class DocumentStore {
    open(uri: string, text: string, version: number): void;
    update(uri: string, changes: TextDocumentContentChangeEvent[], version: number): void;
    close(uri: string): void;
    get(uri: string): TextDocument | undefined;
  }
  ```

- [ ] **9. Handle `textDocument/didChange`**

  Apply incremental content changes to the `DocumentStore`. Use the `TextDocument` helper from `vscode-languageserver-textdocument` to apply incremental edits.

  ```bash
  bun add vscode-languageserver-textdocument
  ```

- [ ] **10. Handle `textDocument/didClose`**

  Remove the document from the `DocumentStore`. Clear any cached parse results.

- [ ] **11. Implement `flavorGrenade/status` custom notification**

  The server sends this outbound notification whenever its internal state changes (e.g., vault detected, indexing complete). Shape:

  ```typescript
  interface FlavorGrenadeStatusParams {
    status: 'initializing' | 'ready' | 'indexing' | 'error';
    message?: string;
    vaultMode?: 'obsidian' | 'flavor-grenade' | 'single-file';
  }
  ```

- [ ] **12. Register all handlers in `LspModule`**

  Wire the dispatcher into the NestJS DI container. Use `@Injectable()` providers for each handler class.

- [ ] **13. Write TDD integration tests using stdio pipe**

  Create `src/test/integration/transport.test.ts`. Spawn the server as a child process and communicate over stdio:

  ```typescript
  // src/test/integration/transport.test.ts
  describe('LSP Transport', () => {
    test('initialize → initialized → shutdown → exit', async () => {
      const client = await LspClient.spawn();
      const result = await client.initialize('file:///tmp/test-vault');
      expect(result.capabilities).toBeDefined();
      expect(result.serverInfo?.name).toBe('flavor-grenade-lsp');
      await client.shutdown();
      // Process exits cleanly
    });

    test('unknown method returns Method Not Found error', async () => {
      const client = await LspClient.spawn();
      await client.initialize('file:///tmp/test-vault');
      await expect(client.request('unknown/method', {}))
        .rejects.toMatchObject({ code: -32601 });
    });
  });
  ```

---

## Gate Verification

```bash
# Full gate
bun run gate:2

# Individual checks
bun test src/test/integration/transport.test.ts
bun run bdd -- features/transport.feature --tags @smoke
```

The `@smoke` scenario in `transport.feature` ("Server completes LSP handshake") exercises the full `initialize` → `initialized` → `shutdown` → `exit` sequence and confirms the server responds with the correct capability object. Vault detection is not exercised at this phase (that is Phase 4).

Expected JSON-RPC sequence:
```
→ initialize { processId, rootUri, capabilities }
← { result: { capabilities: {...}, serverInfo: {...} } }
→ initialized {}
← (no response, notification)
→ shutdown {}
← { result: null }
→ exit
← (process exits 0)
```

---

## References

- `[[adr/ADR001-stdio-transport]]`
- `[[ddd/lsp-protocol/domain-model]]`
- `[[plans/phase-03-ofm-parser]]`
- LSP Specification 3.17: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/

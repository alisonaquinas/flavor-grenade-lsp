# AGENTS.md — src/transport/

## Purpose

Owns all stdio I/O and JSON-RPC dispatch. Nothing above this layer touches
stdin or stdout directly.

## Layout

```
transport/
├── json-rpc-dispatcher.ts   # method → handler registry and dispatch
├── json-rpc-dispatcher.test.ts
├── stdio-reader.ts          # Content-Length framing reader
├── stdio-reader.test.ts
├── stdio-writer.ts          # Content-Length framing writer
├── stdio-writer.test.ts
└── transport.module.ts      # NestJS module
```

## Invariants

- `StdioReader` and `StdioWriter` must not be used outside this module's
  NestJS providers. All upstream code calls `dispatcher.onRequest` /
  `dispatcher.onNotification` instead.
- `RequestHandler` signature is `(params: unknown) => Promise<unknown>`. Every
  handler passed to `onRequest` must be async (or return a Promise).
- `NotificationHandler` is `(params: unknown) => void | Promise<void>`.
- The dispatcher returns a JSON-RPC error response on unhandled methods or
  thrown exceptions — it does not crash the process.

## Workflows

- **Adding a new transport** (e.g. WebSocket): add a reader/writer pair and a
  new NestJS module; the `JsonRpcDispatcher` is transport-agnostic.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)

# transport/

JSON-RPC 2.0 transport layer over stdio.

This module handles the low-level mechanics of reading and writing LSP messages
and dispatching them to registered handlers. It is the first and last layer
the server touches on every request/response cycle.

## Files

| File | Role |
| --- | --- |
| `stdio-reader.ts` | Reads newline-framed JSON messages from a `Readable` stream and emits `'message'` events |
| `stdio-writer.ts` | Writes JSON-RPC responses to `process.stdout` with a `Content-Length` header |
| `json-rpc-dispatcher.ts` | Routes incoming messages to registered request/notification handlers by method name |
| `transport.module.ts` | NestJS module that wires `StdioReader`, `StdioWriter`, and `JsonRpcDispatcher` |

## Protocol

Messages follow the [LSP base protocol](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#baseProtocol):

```
Content-Length: <n>\r\n
\r\n
<n bytes of UTF-8 JSON>
```

`StdioReader` strips the header and emits the raw JSON body string.
`StdioWriter` adds the header before writing the response.

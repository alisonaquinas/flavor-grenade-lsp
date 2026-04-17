---
adr: "001"
title: stdio JSON-RPC transport over HTTP+SSE
status: accepted
date: 2026-04-16
---

# ADR 001 — stdio JSON-RPC transport over HTTP+SSE

## Context

Two transport mechanisms were evaluated for delivering the Language Server Protocol message stream between flavor-grenade-lsp and editor clients.

**Option 1 — stdio JSON-RPC.** This is the transport used by marksman, rust-analyzer, clangd, and virtually every production LSP server shipped today. The editor spawns the server as a child process; the server reads LSP messages from `process.stdin` and writes responses to `process.stdout`. Content-Length framing is defined in the LSP specification base protocol. No port is required, no firewall exceptions are needed, and the server lifecycle is managed entirely by the editor. All major LSP clients — Neovim, Helix, VS Code, Zed, Emacs (lsp-mode / eglot), and Sublime Text — support stdio transport without any configuration beyond the path to the server binary.

**Option 2 — HTTP+SSE.** LSP 3.17 §3.5 defines an HTTP-based transport where the client connects to a running server over HTTP, and the server pushes notifications via Server-Sent Events. This transport supports multiple simultaneous clients connecting to a single long-lived server process. It is better suited to daemon-style deployments and remote development scenarios. However, it requires the server to bind a TCP port, manage session identifiers, and handle connection lifecycle separately from message handling. Editor support for HTTP+SSE transport is sparse and inconsistent as of 2026 — most editors that advertise it still require manual configuration.

The primary use cases identified for this project are: (1) single-user local editing in Neovim and VS Code, and (2) CI-based lint checks driven by a script that spawns the server, runs diagnostics, and exits. Both use cases are trivially satisfied by stdio.

## Decision

Ship with **stdio JSON-RPC transport**. The server entry point `src/main.ts` reads raw bytes from `process.stdin`, applies Content-Length frame parsing, deserializes JSON-RPC messages, dispatches them through the NestJS service layer, serializes responses, and writes them back to `process.stdout` with proper Content-Length headers.

HTTP+SSE transport is explicitly reserved for a future phase (see [[plans/phase-02-lsp-transport]]). The architecture will not preclude it: the transport layer will be abstracted behind an interface (`ITransport`) so that a future HTTP adapter can be introduced without touching the protocol handler.

## Consequences

**Positive:**
- Any editor with LSP support (including editors without HTTP+SSE support) can use flavor-grenade-lsp immediately without configuration beyond pointing to the binary.
- No port binding means no firewall rules, no port collision, no daemon management complexity.
- CI scripts can spawn the server, pipe a synthetic LSP exchange to stdin, and capture stdout — no HTTP client required.
- Server lifecycle is trivially managed by the editor: when the editor closes, the child process dies.
- Bun's `process.stdin`/`process.stdout` streams are fully compatible with the Node.js stream model used by most LSP SDKs.

**Negative:**
- Single-client only per process invocation. Each editor window spawns its own server instance; there is no shared cache between two windows editing the same vault. This is acceptable for v1.
- A future HTTP+SSE implementation requires a separate server startup path (a `--http` flag or a separate entry point), which must be documented to avoid confusing users.

**Neutral:**
- The stdio transport does not break any future HTTP+SSE work. The `ITransport` abstraction ensures the two can coexist.

## Related

- [[architecture/overview]]
- [[plans/phase-02-lsp-transport]]
- [[ddd/lsp-protocol/domain-model]]
- [[ADR004-text-sync-strategy]]

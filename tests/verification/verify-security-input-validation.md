---
title: Verification — Security — Input Validation
tags: [test/verification, "requirements/security/input-validation"]
aliases: [Verify Input Validation]
---

# Verification — Security — Input Validation

## Purpose

This document defines verification test cases for the JSON-RPC input validation security requirements of `flavor-grenade-lsp`. Each test case validates that the server correctly rejects malformed, oversized, or adversarially crafted inputs before they reach the VaultIndex or any application logic. The requirements are defined in [[requirements/security/input-validation]] and the threat analysis in [[research/security-threat-model]]. All three test cases require constructing adversarial inputs and sending them to a live server, making them Agent-driven. The goal is to verify that the server's validation boundary holds against every input class identified in the threat model.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Security.Input.PositionValidation` | Invalid `Position` and `Range` params rejected with -32602 before VaultIndex access | Phase 2 |
| `Security.Input.PayloadSize` | JSON-RPC messages exceeding 10 MB rejected at transport layer; stdin closed | Phase 2 |
| `Security.Input.PrototypePollution` | `__proto__`, `constructor`, `prototype` keys in JSON-RPC bodies must not pollute `Object.prototype` | Phase 2 |

---

## Test Cases

### TC-VER-SECI-001 — Security.Input.PositionValidation

**Planguage Tag:** `Security.Input.PositionValidation`
**Gist:** All `Position` and `Range` parameters in LSP requests must be validated as non-negative integers within the bounds of the referenced document before any VaultIndex operation; invalid positions return an InvalidParams error (-32602).
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 2

> [!WARNING] Threat: Out-of-bounds `Position` values (negative integers, `NaN`, `Infinity`, or values beyond document bounds) that reach the VaultIndex cause silent `undefined` propagation in JavaScript array indexing — `lines[-1]` returns `undefined` rather than throwing — producing incorrect LSP responses (wrong rename targets, wrong hover content) without any visible error.

**Setup:** A running `flavor-grenade-lsp` server instance with a test vault. A spy on all VaultIndex methods to detect whether any is called for invalid-position requests.

**Agent-driven steps:**
1. Agent sends a `textDocument/hover` request with position `{"line": -1, "character": 0}`. Agent verifies the response contains `"error": {"code": -32602}` (InvalidParams). Agent verifies the VaultIndex spy was NOT called.
2. Agent sends a `textDocument/hover` request with position `{"line": 0, "character": -1}`. Agent verifies error code -32602 and no VaultIndex call.
3. Agent sends a `textDocument/hover` request with position `{"line": null, "character": 0}` (null is not a valid integer). Agent verifies error code -32602.
4. Agent sends a `textDocument/hover` request with position `{"line": 1.5, "character": 0}` (non-integer). Agent verifies error code -32602.
5. Agent sends a `textDocument/hover` request with position `{"line": 999999, "character": 0}` (far beyond any document's line count). Agent verifies error code -32602.
6. Agent sends a `textDocument/hover` request with position `{"line": 1e308, "character": 0}` (IEEE 754 infinity class). Agent verifies error code -32602.
7. Agent sends a `textDocument/hover` request with a valid in-bounds position on a real vault file. Agent verifies the response is a successful hover result (not an error), confirming the validator allows legitimate requests through.
8. Agent repeats the invalid-position tests for `textDocument/definition`, `textDocument/completion`, and `textDocument/rename` to verify the validation is applied uniformly across all position-accepting methods.
9. Agent confirms 5/5 invalid position variants (steps 1–5) all produce error -32602 with zero VaultIndex calls.

**Pass criterion:** 100% of invalid positions rejected at the handler boundary with code -32602; zero VaultIndex calls for any invalid-position request; valid positions succeed normally.
**Fail criterion:** Any invalid position that reaches the VaultIndex; any invalid position that produces a response other than a -32602 error; valid positions being incorrectly rejected.

---

### TC-VER-SECI-002 — Security.Input.PayloadSize

**Planguage Tag:** `Security.Input.PayloadSize`
**Gist:** JSON-RPC messages exceeding 10 MB must be rejected at the transport layer; the server must close the stdin stream rather than attempt to buffer or parse an oversized message.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 2

> [!WARNING] Threat: A buggy or malicious LSP client sending a `textDocument/didChange` notification with a 500 MB body will cause the server to allocate 500 MB of heap before parsing begins — potentially crashing the server with an out-of-memory error or triggering a prolonged garbage collection pause that makes the server unresponsive. The Bun runtime's V8-backed heap is not immune to OOM conditions.

**Setup:** A process capable of writing raw bytes to the server's stdin pipe. The server must be started with a way to observe whether it buffers the body or closes stdin.

**Agent-driven steps:**
1. Agent starts the server and sends a valid `initialize` request to establish baseline connectivity.
2. Agent constructs a JSON-RPC message header with `Content-Length: 10485761` (10 MB + 1 byte = 10,485,761 bytes). Agent writes only the header (and the required `\r\n\r\n` separator) to the server's stdin, then begins writing body bytes.
3. Agent writes exactly 100 bytes of body content (not the full 10 MB + 1) and observes whether the server:
   - Closes its stdin reader immediately upon seeing `Content-Length: 10485761` (correct behaviour), OR
   - Continues reading and buffering bytes (violation)
4. Agent verifies that the server does NOT attempt to buffer the 10 MB body by monitoring memory usage — a correct implementation rejects at the `Content-Length` check before any body bytes are read.
5. Agent verifies no JSON parse attempt occurs for the oversized message by confirming no JSON-RPC response or notification is emitted for the oversized request ID.
6. Agent verifies the server process exits cleanly (or if reconnection is supported, that the connection is reset cleanly) — no unhandled exception or crash dump.
7. Agent sends a second valid `initialize` to a fresh server instance to confirm the baseline is correct: a legitimate 1 KB message is processed normally.

**Pass criterion:** 100% of oversized messages rejected at the `Content-Length` check — zero bytes of oversized body buffered; server closes stdin connection without parsing.
**Fail criterion:** Any oversized message that is buffered into memory before rejection; any oversized message that reaches the JSON parser; server crash instead of clean shutdown.

---

### TC-VER-SECI-003 — Security.Input.PrototypePollution

**Planguage Tag:** `Security.Input.PrototypePollution`
**Gist:** All incoming JSON-RPC message bodies must be validated by schema before any object merge operation; `__proto__`, `constructor`, and `prototype` keys in parsed JSON must not propagate into application objects or pollute `Object.prototype`.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 2

> [!WARNING] Threat: JSON containing `{"__proto__": {"polluted": true}}`, when fed into JavaScript object spread or `Object.assign()` without schema validation, can mutate `Object.prototype` — affecting every object in the process. In a NestJS application with dependency injection, this can cause providers to resolve incorrectly, security checks to be silently bypassed, or arbitrary properties to appear on all objects. CVE-2024-29409 demonstrated this attack class in the `@nestjs/common` ecosystem.

**Setup:** A running `flavor-grenade-lsp` server instance with a test harness that can inspect the server process's `Object.prototype` state via a diagnostic endpoint or process-level assertion. The server must expose a test-only RPC method or a test build that emits the result of `({}).polluted` after each message.

**Agent-driven steps:**
1. Agent sends the following JSON-RPC body to the server (as a raw payload on stdin with the appropriate `Content-Length` header):
   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"__proto__":{"polluted":true},"processId":null,"rootUri":null,"capabilities":{}}}
   ```
   Agent verifies the server processes the `initialize` method (or returns a schema validation error), but does NOT add `polluted` to `Object.prototype`.
2. Agent uses the diagnostic endpoint to check `({}).polluted` in the server process. Verifies the value is `undefined` (no pollution occurred).
3. Agent sends a second variant targeting nested prototype pollution:
   ```json
   {"jsonrpc":"2.0","id":2,"method":"initialized","params":{"constructor":{"prototype":{"polluted":true}}}}
   ```
   Agent verifies `Object.prototype.polluted` is still `undefined` after this message.
4. Agent sends a third variant with a `prototype` key directly in the params:
   ```json
   {"jsonrpc":"2.0","id":3,"method":"shutdown","params":{"prototype":{"polluted":true}}}
   ```
   Agent verifies `Object.prototype.polluted` remains `undefined`.
5. Agent inspects the server source to confirm Zod schema validation (or equivalent) is applied to all incoming JSON-RPC bodies before any object merge operation — and that the schema explicitly strips or rejects `__proto__`, `constructor`, and `prototype` keys.
6. Agent verifies that if `Object.prototype.freeze` was called during bootstrap, a pollution attempt throws a TypeError rather than silently failing.
7. Agent confirms all three pollution attempts (steps 1–4) failed to mutate `Object.prototype`.

**Pass criterion:** 0 prototype pollution instances — `Object.prototype` is never mutated by incoming LSP messages; schema validation rejects or strips all dangerous keys before application code processes the message.
**Fail criterion:** Any `__proto__` or `constructor.prototype` key that mutates `Object.prototype` in the server process; absence of schema validation on incoming JSON-RPC bodies.

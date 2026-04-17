---
title: Requirements — JSON-RPC Input Validation
tags:
  - requirements/security
  - requirements/security/input-validation
aliases:
  - Input Validation Requirements
  - JSON-RPC Security Requirements
---

# JSON-RPC Input Validation Requirements

> [!NOTE] Scope
> These are **technical security requirements** governing validation of all data received from the LSP client over the JSON-RPC stdio transport. Although the LSP client is trusted, these requirements defend against buggy clients, future transport modes (TCP/pipe), and prototype pollution attacks that exploit JavaScript's object model. Evidence is drawn from [[research/security-threat-model#Threat-Category-2]].

---

**Tag:** Security.Input.PositionValidation
**Gist:** All `Position` and `Range` parameters in LSP requests must be validated as non-negative integers within the bounds of the referenced document before any VaultIndex operation; invalid positions return an InvalidParams error (-32602).
**Ambition:** LSP methods such as `textDocument/completion`, `textDocument/hover`, `textDocument/definition`, and `textDocument/rename` accept `Position` objects with `line` and `character` fields. In JavaScript, out-of-bounds array access returns `undefined` rather than throwing — `lines[-1]` is `undefined`, and `lines[NaN]` is also `undefined`. These silently produce `undefined` values that propagate through the VaultIndex, causing incorrect responses or subtle bugs in rename edit generation. `NaN` comparisons always return `false`, which can cause range intersection logic to behave incorrectly. Validating at the handler boundary before any index access prevents these issues and makes bugs deterministic (an error response) rather than silent (a wrong result).
**Scale:** Percentage of invalid `Position` inputs (negative `line`, negative `character`, non-integer values, `NaN`, `Infinity`, values beyond document bounds) that return a JSON-RPC error with code -32602 (InvalidParams) without reaching the VaultIndex.
**Meter:**
1. Send `textDocument/hover` requests with positions: `{line: -1, character: 0}`, `{line: 0, character: -1}`, `{line: NaN, character: 0}`, `{line: 1.5, character: 0}`, `{line: 999999, character: 0}` (beyond document end).
2. For each, capture the JSON-RPC response.
3. Verify each produces error code -32602.
4. Verify no VaultIndex method is called for any invalid position (spy on VaultIndex).
5. Compute: (invalid positions rejected / total invalid positions sent) × 100.
**Fail:** Any invalid position that reaches the VaultIndex; any invalid position that produces a response other than a -32602 error.
**Goal:** 100% of invalid positions rejected at the handler boundary — zero reach the VaultIndex.
**Stakeholders:** Correctness of LSP responses, future TCP-transport security.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-2.1]], LSP Specification §3.17 Position.

---

**Tag:** Security.Input.PayloadSize
**Gist:** JSON-RPC messages exceeding 10 MB must be rejected at the transport layer; the server must close the stdin stream rather than attempt to buffer or parse an oversized message.
**Ambition:** A malicious or buggy client sending a `textDocument/didChange` notification with a 500 MB document body will cause the server to allocate 500 MB of heap to buffer the message before parsing begins. In Bun's V8-backed runtime, this can trigger out-of-memory crashes or trigger garbage collection pauses that make the server unresponsive. A 10 MB limit is far above the practical size of any legitimate LSP message (even a complete 100,000-line file change notification is typically under 5 MB) while preventing runaway memory consumption from a single malformed message. Closing stdin on violation is the correct response — the connection is corrupt and should not be recovered.
**Scale:** Percentage of oversized message attempts (messages with `Content-Length` header value exceeding 10,485,760 bytes) that are rejected before payload buffering begins, with the stdin stream closed.
**Meter:**
1. Send a JSON-RPC message with `Content-Length: 10485761` (10 MB + 1 byte) and a body of that size.
2. Verify the server closes its stdin reader without buffering the body.
3. Verify no JSON parse attempt occurs on the oversized body.
4. Verify the server process exits cleanly (or, if stdio reconnection is supported, that the connection is reset).
**Fail:** Any oversized message that is buffered into memory before rejection; any oversized message that reaches the JSON parser.
**Goal:** 100% of oversized messages rejected at the `Content-Length` check — zero bytes of oversized body buffered.
**Stakeholders:** Server reliability, memory safety.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-2.2]], LSP Specification §3.17 Base Protocol.

---

**Tag:** Security.Input.PrototypePollution
**Gist:** All incoming JSON-RPC message bodies must be validated by schema before any object merge operation; `__proto__`, `constructor`, and `prototype` keys in parsed JSON must not propagate into application objects or pollute `Object.prototype`.
**Ambition:** CVE-2024-29409 (`@nestjs/common`, arbitrary code injection) and multiple npm prototype pollution CVEs (flatnest, dset, web3-utils) demonstrate that untrusted JSON containing `__proto__` keys, fed into JavaScript object operations like `Object.assign()` or `{...spread}`, can mutate `Object.prototype` and affect all objects in the process. In a NestJS application with dependency injection, prototype pollution could cause providers to resolve incorrectly, validation rules to be bypassed, or security checks to silently pass. The mitigation is schema validation (Zod or equivalent) that strips or rejects `__proto__`, `constructor`, and `prototype` keys before any merge operation.
**Scale:** Percentage of JSON-RPC inputs containing `__proto__`, `constructor.prototype`, or `prototype` keys that: (a) are rejected by schema validation before reaching application logic, and (b) produce no mutation of `Object.prototype` in the server process.
**Meter:**
1. Send JSON-RPC messages with bodies containing `{"__proto__": {"polluted": true}}`, `{"constructor": {"prototype": {"polluted": true}}}`.
2. After each message, check `({}).polluted` in the server process (via a diagnostic endpoint in tests or a process-level assertion).
3. Verify `Object.prototype` is not mutated.
4. Verify schema validation rejects or strips the dangerous keys before application code processes the message.
5. Compute: (pollution attempts that failed to mutate / total attempts) × 100.
**Fail:** Any `__proto__` or `constructor.prototype` key that mutates `Object.prototype` in the server process.
**Goal:** 0 prototype pollution instances — `Object.prototype` is never mutated by incoming LSP messages.
**Stakeholders:** Application security, NestJS DI integrity, security auditors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-2.3]], CVE-2024-29409, SNYK-JS-NESTJSCOMMON-9538801.

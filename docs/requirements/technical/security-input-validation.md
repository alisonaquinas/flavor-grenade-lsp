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
> These are **technical security requirements** governing validation of all data received from the LSP client over the JSON-RPC stdio transport. Although the LSP client is trusted, these requirements defend against buggy clients, future transport modes (TCP/pipe), and prototype pollution attacks that exploit JavaScript's object model. Evidence is drawn from [[docs/research/security-threat-model]].

---

## Security.Input.PositionValidation

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
**Source:** [[docs/research/security-threat-model]], LSP Specification §3.17 Position.

---

## Security.Input.PayloadSize

**Tag:** Security.Input.PayloadSize
**Gist:** JSON-RPC messages exceeding 16 MiB, or headers exceeding 8 KiB, must be rejected at the transport layer before unbounded buffering or JSON parsing occurs.
**Ambition:** A malicious or buggy client sending a `textDocument/didChange` notification with a 500 MB document body can otherwise force the server to allocate large buffers before parsing begins. In Bun's V8-backed runtime, this can trigger out-of-memory crashes or garbage collection pauses that make the server unresponsive. A 16 MiB body limit is far above the practical size of ordinary LSP messages while preventing runaway memory consumption from a single malformed message. The 8 KiB header limit prevents clients from keeping the reader in an unbounded pre-body state.
**Scale:** Percentage of oversized frame attempts (messages with `Content-Length` header value exceeding 16,777,216 bytes, headers exceeding 8,192 bytes, or total buffered frame data exceeding those combined caps) that are rejected before JSON parsing begins.
**Meter:**

1. Send a JSON-RPC message with `Content-Length: 16777217` (16 MiB + 1 byte).
2. Send a malformed frame whose header exceeds 8,192 bytes before `\r\n\r\n`.
3. Verify no JSON parse attempt occurs on the oversized body.
4. Verify the reader emits a framing error and clears the unreadable buffer so later valid frames can be processed.
**Fail:** Any oversized message that is buffered into memory before rejection; any oversized message that reaches the JSON parser.
**Goal:** 100% of oversized messages rejected at the frame-size checks; zero oversized bodies parsed.
**Stakeholders:** Server reliability, memory safety.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/research/security-threat-model]], LSP Specification §3.17 Base Protocol.

---

## Security.Input.PrototypePollution

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
**Source:** [[docs/research/security-threat-model]], CVE-2024-29409, SNYK-JS-NESTJSCOMMON-9538801.

---

## Security.Input.ProjectConfigSafety

**Tag:** Security.Input.ProjectConfigSafety
**Gist:** Flavor Grenade project config files (`.flavor-grenade.toml`, `.flavor-grenade.json`, `.flavor-grenade.jsonc`, `.flavor-grenade.yaml`, `.flavor-grenade.yml`, and `.editorconfig` directives) must be size-limited, schema-validated, vault-confined by realpath, and parsed without propagating `__proto__`, `constructor`, or `prototype` keys into application configuration.
**Ambition:** Markdown flavor auto-detection treats project config as a flavor signal. That makes the config file user-controlled input that can affect server analysis. A malicious config must not trigger memory pressure, prototype pollution, unsafe path traversal, or content-bearing logs.
**Scale:** Percentage of project config parse attempts that enforce size, schema, path, dangerous-key, and redacted-log guarantees.
**Meter:**

1. Create fixtures for oversized, invalid, unknown-flavor, dangerous-key, symlinked-path, and traversal-attempt config files across TOML, JSON, JSONC, YAML, and `.editorconfig`.
2. Verify the server reads project config only after vault-root realpath confinement passes.
3. Verify invalid or oversized project config is treated as absent configuration and cannot corrupt prior flavor state.
4. Verify dangerous keys are rejected or stripped before merge.
5. Verify logs contain file path/status only, not config content.
**Fail:** Any unsafe config path is read, any oversized/invalid config crashes the server, any dangerous key pollutes application objects, or project config content appears in logs.
**Goal:** 100% safe project config handling.
**Stakeholders:** Workspace owners, vault authors, server maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/design/markdown-flavor-auto-detection]], [[docs/requirements/functional/security-vault-confinement]], [[docs/research/security-threat-model]].

---

## Security.Input.FlavorPropagationPayload

**Tag:** Security.Input.FlavorPropagationPayload
**Gist:** Resource-specific Markdown flavor propagation payloads must be schema-validated with enum checks, map-size limits, supported `file://` URI keys, resource ownership checks, stale-entry eviction, and dangerous-key rejection.
**Ambition:** Phase E15 and Phase 20 allow the extension to send selected/effective flavor state for multiple resources. Without bounds and ownership checks, a buggy or malicious client can send huge maps, non-file URIs, stale entries, or prototype-pollution keys that consume memory or leak flavor state across documents.
**Scale:** Percentage of malformed flavor propagation payloads rejected before Config, BC4, or parser state changes.
**Meter:**

1. Send payloads with unsupported flavor ids, `auto` as effective flavor, non-`file://` URI keys, unknown resource keys, oversized maps, nested unexpected objects, stale workspace entries, and dangerous keys.
2. Verify each invalid payload returns InvalidParams or is ignored without mutating active flavor state.
3. Verify valid payloads are capped and resource-specific.
4. Verify stale resources are evicted when documents close or workspace folders are removed.
**Fail:** Any invalid payload mutates effective flavor state, reaches parser/cache state, or pollutes application objects.
**Goal:** 100% invalid payload rejection before state mutation.
**Stakeholders:** Extension users, LSP maintainers, future transport-mode users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/design/markdown-flavor-auto-detection]], [[docs/requirements/functional/ofmarkdown-language-mode]], [[docs/plans/phase-20-markdown-flavor-server-propagation]].

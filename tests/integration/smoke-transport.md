---
title: Smoke Tests — LSP JSON-RPC Handshake
tags: [test/integration, test/smoke]
aliases: [Transport Smoke Tests]
---

# Smoke Tests — LSP JSON-RPC Handshake

## Purpose

This smoke test validates the minimum viable LSP transport layer: that the server accepts a stdio JSON-RPC connection, processes an `initialize` request, returns a well-formed `InitializeResult` with a capabilities object, and exits cleanly on `shutdown` + `exit`. Without this, no higher-level capability is reachable; passing this test is the absolute baseline for every other smoke test in this suite.

## Phase Gate

Phase 1 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-001 — initialize handshake returns capabilities object

**Type:** Both
**BDD Reference:** [[bdd/features/workspace]] — `Vault detected via .obsidian/ directory`
**Phase gate:** Phase 1

**Setup:**
A minimal temporary directory with a `.obsidian/` subdirectory. The LSP server binary must be built (`bun run build`). No documents need to be present beyond the vault marker.

**Scripted steps:**

```gherkin
Given a temporary directory "/tmp/fg-smoke-001" with subdirectory ".obsidian/"
And the LSP server process is not yet running
When the LSP server is spawned via stdio transport
And a JSON-RPC "initialize" request is sent with processId, rootUri, and capabilities
Then the server responds with a JSON-RPC result containing "capabilities"
And the response does not contain an "error" field
And "capabilities" is a JSON object (may be empty but must be present)
```

**Agent-driven steps:**

1. Agent creates a temp directory: `mkdir -p /tmp/fg-smoke-001 && mkdir /tmp/fg-smoke-001/.obsidian`
2. Agent spawns the LSP server: `bun run start 2>/dev/null &` (requires Phase 1 complete)
3. Agent sends the following JSON-RPC request to server stdin (Content-Length framed):
   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-001","capabilities":{}}}
   ```
4. Agent reads server stdout until a complete JSON-RPC message is received (Content-Length framing)
5. Agent parses the response and asserts `result.capabilities` is present and is an object
6. Agent asserts the response has no `error` field
7. Agent sends `{"jsonrpc":"2.0","method":"initialized","params":{}}` (notification, no response expected)
8. Agent sends `{"jsonrpc":"2.0","id":2,"method":"shutdown","params":null}`
9. Agent asserts shutdown response has `result: null` and no error
10. Agent sends `{"jsonrpc":"2.0","method":"exit","params":null}`
11. Agent waits up to 2s and asserts server process exits with code 0

**Pass:** Server responds to `initialize` with a `result` object containing a `capabilities` key; `shutdown` returns `null` result; process exits 0.
**Fail:** No response within 2s; response contains an `error` field; `capabilities` key is absent; process exits non-zero or hangs after `exit` notification.

---

### TC-SMOKE-002 — initialize in directory with no vault marker activates single-file mode

**Type:** Both
**BDD Reference:** [[bdd/features/vault-detection]] — `Neither marker found — single-file mode with cross-file features suppressed`
**Phase gate:** Phase 1

**Setup:**
A temporary directory containing a single `.md` file but no `.obsidian/` directory and no `.flavor-grenade.toml`. This tests the server's behaviour when vault detection fails.

**Scripted steps:**

```gherkin
Given a temporary directory "/tmp/fg-smoke-002" containing only "orphan.md"
And no ".obsidian/" directory exists anywhere in "/tmp/fg-smoke-002"
And no ".flavor-grenade.toml" file exists anywhere in "/tmp/fg-smoke-002"
When the LSP server is spawned and receives an "initialize" request with rootUri "/tmp/fg-smoke-002"
Then the server responds with a valid InitializeResult
And the server does NOT return an error response
And subsequent diagnostics for broken wiki-links are suppressed
```

**Agent-driven steps:**

1. Agent creates: `mkdir -p /tmp/fg-smoke-002 && echo '# Orphan\n[[missing-note]]' > /tmp/fg-smoke-002/orphan.md`
2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-002"` and empty `capabilities: {}`
4. Agent asserts response has `result.capabilities` object — server must not error on missing vault
5. Agent sends `initialized` notification
6. Agent sends `textDocument/didOpen` for `orphan.md` with content `# Orphan\n[[missing-note]]`:
   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-002/orphan.md","languageId":"markdown","version":1,"text":"# Orphan\n[[missing-note]]"}}}
   ```
7. Agent waits up to 1s and reads any `textDocument/publishDiagnostics` notifications from stdout
8. Agent asserts that if any diagnostics are published, none have code `"FG001"` (cross-file diagnostics suppressed in single-file mode)
9. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Server initializes without error; FG001 diagnostic is not published for the broken wiki-link in a no-vault directory.
**Fail:** Server returns error on `initialize`; FG001 diagnostic is published for `[[missing-note]]` in single-file mode; server hangs or exits non-zero.

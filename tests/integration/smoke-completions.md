---
title: Smoke Tests — Completion Trigger
tags: [test/integration, test/smoke]
aliases: [Completions Smoke Tests]
---

# Smoke Tests — Completion Trigger

## Purpose

This smoke test validates the minimum viable completion trigger: that the server responds to a `textDocument/completion` request after `[[` with a list of document candidates drawn from the vault index, and that the response is a valid LSP `CompletionList` (not an error). It also validates the critical failure path where completion is requested before `initialize` completes, confirming the server does not crash. Together these tests confirm that the vault index is populated during initialization and that the completion dispatch layer is correctly wired to it.

## Phase Gate

Phase 2 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-011 — wiki-link completion returns document candidates after [[ trigger

**Type:** Both
**BDD Reference:** [[bdd/features/completions]] — `Wiki-link completion returns document candidates after [[ trigger`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with at least 3 named markdown documents. A new in-progress document `notes/new.md` is open with the cursor positioned immediately after `[[`. The vault must be indexed before the completion request is sent.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-011/" with ".obsidian/"
And the vault contains:
  | path            | content       |
  | notes/alpha.md  | # Alpha       |
  | notes/beta.md   | # Beta        |
  | notes/gamma.md  | # Gamma       |
When the LSP server initializes and indexes the vault
And "textDocument/didOpen" is sent for "notes/new.md" with text "[["
And a "textDocument/completion" request is made at line 0, character 2
Then the response is a CompletionList (not an error)
And the completion list includes an item with label "alpha"
And the completion list includes an item with label "beta"
And the completion list includes an item with label "gamma"
And each completion item has kind 17 (File)
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-011/.obsidian
   mkdir -p /tmp/fg-smoke-011/notes
   echo '# Alpha' > /tmp/fg-smoke-011/notes/alpha.md
   echo '# Beta'  > /tmp/fg-smoke-011/notes/beta.md
   echo '# Gamma' > /tmp/fg-smoke-011/notes/gamma.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-011/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-011/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/new.md` with text `"[["`:

   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-011/notes/new.md","languageId":"markdown","version":1,"text":"[["}}}
   ```

6. Agent sends `textDocument/completion` at position `{line: 0, character: 2}`:

   ```json
   {"jsonrpc":"2.0","id":2,"method":"textDocument/completion","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-011/notes/new.md"},"position":{"line":0,"character":2},"context":{"triggerKind":1}}}
   ```

7. Agent reads the response from stdout (up to 3s)
8. Agent asserts the response has a `result` field (not `error`)
9. Agent asserts `result.items` is an array with length >= 3
10. Agent asserts items contain entries with `label` values including `"alpha"`, `"beta"`, and `"gamma"`
11. Agent asserts each of those items has `kind == 17` (File)
12. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** `textDocument/completion` returns a valid `CompletionList` with at least 3 items; `alpha`, `beta`, and `gamma` are present; all have kind 17.
**Fail:** Response has `error` field; `result` is null or missing; fewer than 3 items; `alpha`/`beta`/`gamma` absent from labels; server hangs.

---

### TC-SMOKE-012 — completion request before vault index is ready returns empty list, not an error

**Type:** Both
**BDD Reference:** No BDD scenario — gap noted
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with 3 documents. A `textDocument/completion` request is sent immediately after `initialized` is acknowledged, before the server has had time to complete its initial vault scan. This tests the race condition between index build and first completion request — the server must return a valid (possibly empty) `CompletionList` rather than crashing or returning an error response.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-012/" with ".obsidian/" and 3 markdown documents
When the LSP server receives "initialize" followed immediately by "initialized"
And "textDocument/didOpen" is sent immediately for a document with text "[["
And "textDocument/completion" is sent at position {line: 0, character: 2} without waiting
Then the server responds to the completion request with a result (not an error)
And the result is a valid CompletionList (items array may be empty if index is not yet ready)
And the server does not crash (subsequent requests are still handled)
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-012/.obsidian
   mkdir -p /tmp/fg-smoke-012/notes
   echo '# Alpha' > /tmp/fg-smoke-012/notes/alpha.md
   echo '# Beta'  > /tmp/fg-smoke-012/notes/beta.md
   echo '# Gamma' > /tmp/fg-smoke-012/notes/gamma.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-012/"` and immediately (without waiting for a response) sends:
   - `initialized` notification
   - `textDocument/didOpen` for a new document with text `"[["`
   - `textDocument/completion` at `{line: 0, character: 2}` with id 2
4. Agent reads all responses from stdout for up to 4s
5. Agent finds the response with `id: 2` (the completion response)
6. Agent asserts it has a `result` field — not an `error` field
7. Agent asserts `result` is either a `CompletionList` with an `items` array (which may be empty), or `null` (also acceptable for a not-ready index)
8. Agent sends a second completion request with id 3 (same params) and asserts that also returns a valid result (confirming server did not crash)
9. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Both completion requests return `result` (not `error`); the second request also succeeds; server does not crash and exits 0.
**Fail:** Either completion request returns an `error` field; server crashes (no response to second request); process exits non-zero; hangs beyond 4s.

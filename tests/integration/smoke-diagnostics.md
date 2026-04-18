---
title: Smoke Tests — Diagnostic Publishing
tags: [test/integration, test/smoke]
aliases: [Diagnostics Smoke Tests]
---

# Smoke Tests — Diagnostic Publishing

## Purpose

This smoke test validates the minimum viable diagnostic pipeline: that the server correctly publishes `textDocument/publishDiagnostics` notifications in response to document open events, and that multiple distinct diagnostic codes from a single file are all emitted in a single notification. These tests confirm that the LSP diagnostic publish loop is wired correctly from parser output through to the client notification channel, and that the `source` field is correctly set to `"flavor-grenade"` so editors can attribute the diagnostics.

## Phase Gate

Phase 2 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-009 — FG001 diagnostic published on didOpen with correct fields

**Type:** Both
**BDD Reference:** [[bdd/features/diagnostics]] — `Broken wiki-link produces FG001 with Error severity`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault containing a single file `notes/broken.md` with content `[[totally-missing-note]]`. This is the canonical FG001 smoke scenario: the broken wiki-link must produce a diagnostic with all required LSP Diagnostic fields populated correctly — code, severity, source, and range.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-009/" with ".obsidian/"
And the file "notes/broken.md" contains "[[totally-missing-note]]"
When the LSP processes textDocument/didOpen for "notes/broken.md"
Then a "textDocument/publishDiagnostics" notification is received
And the notification params.uri is "file:///tmp/fg-smoke-009/notes/broken.md"
And the diagnostics array contains exactly one item with:
  | field          | value                     |
  | code           | FG001                     |
  | severity       | 1 (Error)                 |
  | source         | flavor-grenade            |
  | range.start    | line 0, character 0       |
  | range.end      | line 0, character 24      |
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-009/.obsidian
   mkdir -p /tmp/fg-smoke-009/notes
   echo '[[totally-missing-note]]' > /tmp/fg-smoke-009/notes/broken.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-009/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-009/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen`:

   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-009/notes/broken.md","languageId":"markdown","version":1,"text":"[[totally-missing-note]]"}}}
   ```

6. Agent reads stdout for up to 3s, collecting all JSON-RPC messages
7. Agent identifies the `textDocument/publishDiagnostics` notification for `notes/broken.md`
8. Agent asserts: `params.diagnostics` array has length >= 1
9. Agent finds the diagnostic with `code == "FG001"` and asserts:
   - `severity == 1`
   - `source == "flavor-grenade"`
   - `range.start.line == 0`, `range.start.character == 0`
   - `range.end.line == 0`, `range.end.character == 24`
10. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** A `publishDiagnostics` notification is received; it contains an FG001 diagnostic with severity 1, source `"flavor-grenade"`, and the correct character range.
**Fail:** No `publishDiagnostics` notification within 3s; diagnostics array is empty; FG001 is absent; severity, source, or range fields are wrong; server hangs.

---

### TC-SMOKE-010 — multiple diagnostics from one file are all published in a single notification

**Type:** Both
**BDD Reference:** [[bdd/features/diagnostics]] — `Multiple diagnostics from one file are all published together`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with a file `notes/many-errors.md` containing two broken wiki-links and one broken embed: `[[missing-a]] and [[missing-b]] and ![[missing-c]]`. No targets exist. This tests that all three diagnostics (two FG001, one FG004) are published together in a single `publishDiagnostics` notification rather than in separate partial notifications.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-010/" with ".obsidian/"
And "notes/many-errors.md" contains "[[missing-a]] and [[missing-b]] and ![[missing-c]]"
And no files named "missing-a.md", "missing-b.md", or "missing-c.md" exist in the vault
When the LSP processes textDocument/didOpen for "notes/many-errors.md"
Then a "textDocument/publishDiagnostics" notification is received for "notes/many-errors.md"
And the diagnostics array contains a diagnostic with code "FG001" covering "[[missing-a]]"
And the diagnostics array contains a diagnostic with code "FG001" covering "[[missing-b]]"
And the diagnostics array contains a diagnostic with code "FG004" covering "![[missing-c]]"
And exactly 3 diagnostics are published for "notes/many-errors.md"
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-010/.obsidian
   mkdir -p /tmp/fg-smoke-010/notes
   echo '[[missing-a]] and [[missing-b]] and ![[missing-c]]' > /tmp/fg-smoke-010/notes/many-errors.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-010/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-010/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen`:

   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-010/notes/many-errors.md","languageId":"markdown","version":1,"text":"[[missing-a]] and [[missing-b]] and ![[missing-c]]"}}}
   ```

6. Agent reads stdout for up to 3s, collecting all `publishDiagnostics` notifications for `notes/many-errors.md`
7. Agent asserts that the final (or only) `publishDiagnostics` for the file contains `params.diagnostics` with length == 3
8. Agent asserts exactly 2 diagnostics have `code == "FG001"` and 1 has `code == "FG004"`
9. Agent asserts the FG001 diagnostic for `[[missing-a]]` has `range.start.character == 0`
10. Agent asserts the FG004 diagnostic covers a range starting at character 35 (position of `![[missing-c]]`)
11. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Exactly 3 diagnostics are published — two FG001 and one FG004 — all in a single `publishDiagnostics` notification; each spans the correct token range.
**Fail:** Fewer than 3 diagnostics are published; diagnostics arrive in separate notifications that don't aggregate to 3; wrong codes; server hangs or exits non-zero.

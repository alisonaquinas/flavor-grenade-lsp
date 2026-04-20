---
title: Smoke Tests — Vault Root Detection
tags: [test/integration, test/smoke]
aliases: [Vault Detection Smoke Tests]
---

# Smoke Tests — Vault Root Detection

## Purpose

This smoke test validates that the VaultDetector correctly identifies vault mode from filesystem markers during LSP initialization. It is the minimum bar for this capability area: the server must enter `obsidian` mode when `.obsidian/` is present, and must suppress cross-file features in `single-file` mode when no marker is found. Without correct vault detection, all cross-file features (completion, diagnostics, navigation, rename) will either fail silently or produce incorrect results.

## Phase Gate

Phase 1 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-003 — .obsidian/ directory triggers obsidian vault mode

**Type:** Both
**BDD Reference:** [[bdd/features/vault-detection]] — `.obsidian/ found — vault mode active with full features`
**Phase gate:** Phase 1

**Setup:**
A temporary directory with a `.obsidian/` subdirectory (the Obsidian vault marker). Two markdown documents must be present so the document index can be verified non-empty.

**Scripted steps:**

```gherkin
Given a directory "/tmp/fg-smoke-003/vault/" containing:
  | path                                   | type      |
  | /tmp/fg-smoke-003/vault/.obsidian/     | directory |
  | /tmp/fg-smoke-003/vault/notes/first.md | file      |
  | /tmp/fg-smoke-003/vault/notes/second.md| file      |
When the LSP server initializes with rootUri "file:///tmp/fg-smoke-003/vault/"
Then the VaultDetector returns mode "obsidian"
And the capability "flavorGrenade.crossFileLinks" is active
And the document index contains "notes/first.md" and "notes/second.md"
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-003/vault/.obsidian
   mkdir -p /tmp/fg-smoke-003/vault/notes
   echo '# First Note' > /tmp/fg-smoke-003/vault/notes/first.md
   echo '# Second Note' > /tmp/fg-smoke-003/vault/notes/second.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-003/vault/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-003/vault/","capabilities":{}}}
   ```

4. Agent reads the `InitializeResult` from stdout
5. Agent asserts `result.capabilities` is present (server accepted vault root)
6. Agent asserts that if a `serverInfo` or `flavorGrenade.vaultMode` capability field is present, its value is `"obsidian"` (implementation-specific; skip if not present in Phase 1)
7. Agent sends `initialized` notification
8. Agent sends `textDocument/completion` after `"[["` in a new document to confirm cross-file completions are offered (at least one item returned, or empty list — but no error response)
9. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Server initializes without error in a directory containing `.obsidian/`; cross-file completion request returns a valid response (no error); server exits 0.
**Fail:** Server returns error on `initialize`; server refuses to start; completion request returns an error response; process hangs.

---

### TC-SMOKE-004 — no vault marker produces single-file mode and suppresses FG001

**Type:** Both
**BDD Reference:** [[bdd/features/vault-detection]] — `Neither marker found — single-file mode with cross-file features suppressed`
**Phase gate:** Phase 1

**Setup:**
A temporary directory containing a single markdown file with a broken wiki-link. No `.obsidian/` and no `.flavor-grenade.toml` anywhere in the path. This directly tests that the VaultDetector correctly falls back to `single-file` mode and that FG001 is suppressed.

**Scripted steps:**

```gherkin
Given a directory "/tmp/fg-smoke-004/" containing only "doc.md"
And "doc.md" contains "[[nonexistent-target]]"
And no ".obsidian/" exists at or above "/tmp/fg-smoke-004/"
And no ".flavor-grenade.toml" exists at or above "/tmp/fg-smoke-004/"
When the LSP server initializes with rootUri "file:///tmp/fg-smoke-004/"
Then the VaultDetector returns mode "single-file"
And the capability "flavorGrenade.crossFileLinks" is inactive
And no FG001 diagnostic is published for "doc.md"
And no FG002 diagnostic is published for "doc.md"
And no FG004 diagnostic is published for "doc.md"
And no FG005 diagnostic is published for "doc.md"
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-004
   echo '[[nonexistent-target]] and ![[also-missing]]' > /tmp/fg-smoke-004/doc.md
   ```

2. Agent verifies no `.obsidian/` or `.flavor-grenade.toml` exists in `/tmp/fg-smoke-004` or its parents (up to `/tmp/`)
3. Agent spawns the LSP server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-004/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-004/","capabilities":{}}}
   ```

5. Agent asserts response has `result.capabilities` — server must not error
6. Agent sends `initialized` notification
7. Agent sends `textDocument/didOpen` for `doc.md`:

   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-004/doc.md","languageId":"markdown","version":1,"text":"[[nonexistent-target]] and ![[also-missing]]"}}}
   ```

8. Agent collects all `textDocument/publishDiagnostics` notifications for up to 2s
9. Agent asserts that the diagnostics array for `doc.md` contains no item with `code` equal to `"FG001"`, `"FG002"`, `"FG004"`, or `"FG005"`
10. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Server initializes without error; zero cross-file diagnostics (FG001/FG002/FG004/FG005) are published for `doc.md` in single-file mode.
**Fail:** Server errors on `initialize`; any FG001, FG002, FG004, or FG005 diagnostic is published; server hangs or exits non-zero.

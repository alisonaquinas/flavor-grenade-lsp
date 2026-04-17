---
title: Smoke Tests — Embed Round-Trip
tags: [test/integration, test/smoke]
aliases: [Embed Smoke Tests]
---

# Smoke Tests — Embed Round-Trip

## Purpose

This smoke test validates the minimum viable embed round-trip: that a valid `![[embed]]` in an open document resolves to its target without producing diagnostics, and that a broken `![[embed]]` to a non-existent file produces exactly one FG004 diagnostic with Warning severity. This confirms that the embed parser correctly distinguishes the `![[...]]` syntax from plain wiki-links, that resolved targets suppress diagnostics, and that the FG004 code (not FG001) is produced for broken embeds — a critical distinction from broken wiki-links.

## Phase Gate

Phase 2 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-007 — valid markdown embed resolves without diagnostic

**Type:** Both
**BDD Reference:** [[bdd/features/embeds]] — `Valid markdown embed passes without diagnostic`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with two files: `notes/doc.md` as the embed target, and `notes/index.md` containing `![[doc]]`. The target file must exist in the vault before the server starts.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-007/" with ".obsidian/"
And the file "notes/doc.md" contains "# Document\n## Section One\nBody text."
And the file "notes/index.md" contains "![[doc]]"
When the LSP processes textDocument/didOpen for "notes/index.md"
Then no diagnostics are published for "notes/index.md"
And the embed "![[doc]]" resolves to "notes/doc.md"
```

**Agent-driven steps:**

1. Agent creates the fixture:
   ```
   mkdir -p /tmp/fg-smoke-007/.obsidian
   mkdir -p /tmp/fg-smoke-007/notes
   printf '# Document\n## Section One\nBody text.' > /tmp/fg-smoke-007/notes/doc.md
   echo '![[doc]]' > /tmp/fg-smoke-007/notes/index.md
   ```
2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-007/"`:
   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-007/","capabilities":{}}}
   ```
4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/index.md`:
   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-007/notes/index.md","languageId":"markdown","version":1,"text":"![[doc]]"}}}
   ```
6. Agent waits up to 2s and collects any `textDocument/publishDiagnostics` notifications for `notes/index.md`
7. Agent asserts the diagnostics array for `notes/index.md` has length 0
8. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Zero diagnostics are published for `notes/index.md` when `![[doc]]` resolves to an existing vault document.
**Fail:** Any diagnostic is published; the publish notification contains a non-empty diagnostics array; server errors or hangs.

---

### TC-SMOKE-008 — broken embed produces FG004 with Warning severity (not FG001)

**Type:** Both
**BDD Reference:** [[bdd/features/embeds]] — `Broken embed reports FG004 with Warning severity`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with a single markdown file `notes/bad-embed.md` containing `![[nonexistent-file]]`. No file named `nonexistent-file.md` (or any matching name) exists anywhere in the vault. The critical assertion is that `FG004` is produced with Warning severity — not `FG001` (which applies to wiki-links), and not Error severity.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-008/" with ".obsidian/"
And the file "notes/bad-embed.md" contains "![[nonexistent-file]]"
And no file named "nonexistent-file.md" exists in the vault
When the LSP processes textDocument/didOpen for "notes/bad-embed.md"
Then a diagnostic is published for "notes/bad-embed.md" with:
  | field    | value           |
  | code     | FG004           |
  | severity | Warning (value: 2) |
  | source   | flavor-grenade  |
And no diagnostic with code "FG001" is published for "notes/bad-embed.md"
And the diagnostic range covers "![[nonexistent-file]]"
```

**Agent-driven steps:**

1. Agent creates the fixture:
   ```
   mkdir -p /tmp/fg-smoke-008/.obsidian
   mkdir -p /tmp/fg-smoke-008/notes
   echo '![[nonexistent-file]]' > /tmp/fg-smoke-008/notes/bad-embed.md
   ```
2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-008/"`:
   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-008/","capabilities":{}}}
   ```
4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/bad-embed.md`:
   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-008/notes/bad-embed.md","languageId":"markdown","version":1,"text":"![[nonexistent-file]]"}}}
   ```
6. Agent waits up to 2s and collects `textDocument/publishDiagnostics` for `notes/bad-embed.md`
7. Agent asserts at least one diagnostic is present
8. Agent asserts the diagnostic has `code: "FG004"` and `severity: 2` (Warning — not 1/Error)
9. Agent asserts no diagnostic in the array has `code: "FG001"`
10. Agent asserts the diagnostic range starts at character 0 of line 0 (covering `![[nonexistent-file]]`)
11. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Exactly one FG004 diagnostic with severity Warning (2) is published; no FG001 is present; source is `"flavor-grenade"`; range covers the full embed token.
**Fail:** No diagnostic published; diagnostic code is `"FG001"` instead of `"FG004"`; severity is 1 (Error) instead of 2 (Warning); server hangs or exits non-zero.

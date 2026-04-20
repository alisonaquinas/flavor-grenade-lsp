---
title: Smoke Tests — Wiki-Link Round-Trip
tags: [test/integration, test/smoke]
aliases: [Wiki-Link Smoke Tests]
---

# Smoke Tests — Wiki-Link Round-Trip

## Purpose

This smoke test validates the minimum viable wiki-link round-trip: that a valid `[[wikilink]]` in an open document is resolved without diagnostics, and that a broken `[[wikilink]]` to a non-existent note produces exactly one FG001 diagnostic with Error severity spanning the full link token. These two cases together confirm that the OFMIndex can match note file stems and that the diagnostic pipeline from parser to LSP publish is wired end-to-end.

## Phase Gate

Phase 2 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-005 — valid wiki-link resolves without diagnostic

**Type:** Both
**BDD Reference:** [[bdd/features/wiki-links]] — `Valid wiki-link passes without diagnostic`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with two markdown files: `notes/index.md` containing a `[[existing]]` wiki-link, and `notes/existing.md` as the link target. Both files are present before the server starts.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-005/" with ".obsidian/"
And the file "notes/existing.md" contains "# Existing Note"
And the file "notes/index.md" contains "See [[existing]] for details"
When the LSP server initializes and indexes the vault
And "textDocument/didOpen" is sent for "notes/index.md"
Then no diagnostics are published for "notes/index.md"
And the link "[[existing]]" resolves to "notes/existing.md"
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-005/.obsidian
   mkdir -p /tmp/fg-smoke-005/notes
   echo '# Existing Note' > /tmp/fg-smoke-005/notes/existing.md
   echo 'See [[existing]] for details' > /tmp/fg-smoke-005/notes/index.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-005/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-005/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/index.md`:

   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-005/notes/index.md","languageId":"markdown","version":1,"text":"See [[existing]] for details"}}}
   ```

6. Agent waits up to 2s and collects any `textDocument/publishDiagnostics` notifications
7. Agent asserts that the diagnostics array for `notes/index.md` is empty (length 0)
8. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Zero diagnostics are published for `notes/index.md` when `[[existing]]` resolves to a present vault file.
**Fail:** Any diagnostic is published; the publish notification contains a non-empty array; server errors or hangs.

---

### TC-SMOKE-006 — broken wiki-link produces FG001 with Error severity

**Type:** Both
**BDD Reference:** [[bdd/features/wiki-links]] — `Broken wiki-link reports FG001 (BrokenWikiLink)`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with a single markdown file `notes/broken.md` containing a `[[totally-missing-note]]` wiki-link. No file named `totally-missing-note.md` exists anywhere in the vault.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-006/" with ".obsidian/"
And the file "notes/broken.md" contains "[[totally-missing-note]]"
And no file "totally-missing-note.md" exists anywhere in the vault
When the LSP processes textDocument/didOpen for "notes/broken.md"
Then a diagnostic is published for "notes/broken.md" with:
  | field    | value              |
  | code     | FG001              |
  | severity | Error (value: 1)   |
  | source   | flavor-grenade     |
And the diagnostic range covers the full "[[totally-missing-note]]" span
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-006/.obsidian
   mkdir -p /tmp/fg-smoke-006/notes
   echo '[[totally-missing-note]]' > /tmp/fg-smoke-006/notes/broken.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-006/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-006/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/broken.md`:

   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-006/notes/broken.md","languageId":"markdown","version":1,"text":"[[totally-missing-note]]"}}}
   ```

6. Agent waits up to 2s and collects `textDocument/publishDiagnostics` notifications for `notes/broken.md`
7. Agent asserts at least one diagnostic is present in the array
8. Agent asserts the first (and ideally only) diagnostic has `code: "FG001"`, `severity: 1` (Error), `source: "flavor-grenade"`
9. Agent asserts the diagnostic range starts at character 0 of line 0 and ends at character 24 (covering `[[totally-missing-note]]` which is 24 characters)
10. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Exactly one FG001 diagnostic with severity Error is published for `notes/broken.md`; the range spans the full `[[totally-missing-note]]` token; source is `"flavor-grenade"`.
**Fail:** No diagnostic is published; diagnostic code is not `"FG001"`; severity is not 1 (Error); range does not cover the full link token; server hangs or exits non-zero.

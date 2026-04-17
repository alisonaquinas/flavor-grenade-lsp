---
title: Smoke Tests — Block Anchor and FG005
tags: [test/integration, test/smoke]
aliases: [Block References Smoke Tests]
---

# Smoke Tests — Block Anchor and FG005

## Purpose

This smoke test validates the minimum viable block reference round-trip: that `textDocument/definition` on a `[[doc#^anchor-id]]` link navigates to the line in the target document containing `^anchor-id`, and that a `[[doc#^missing-anchor]]` reference produces an FG005 diagnostic with Error severity. Block anchor resolution is a distinct capability from heading resolution — the `^` sigil requires a separate parser path and a separate index bucket. These tests confirm that the block anchor indexer and the FG005 diagnostic code path are wired end-to-end.

## Phase Gate

Phase 2 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-019 — go-to-definition on [[doc#^anchor]] navigates to the anchor line

**Type:** Both
**BDD Reference:** [[bdd/features/block-references]] — `Block anchor is indexed and go-to-definition navigates to it`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with `notes/source.md` containing a paragraph ending with `^para-one` as a block anchor, and `notes/referencing.md` containing `[[source#^para-one]]`. The cursor is on the block reference in `referencing.md`. Definition navigation must land on the line in `source.md` that contains `^para-one`.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-019/" with ".obsidian/"
And "notes/source.md" contains "# Source\nThis is a paragraph. ^para-one\nAnother line."
And "notes/referencing.md" contains "![[source#^para-one]] and [[source#^para-one]]"
When the LSP server initializes and indexes the vault
And "textDocument/didOpen" is sent for "notes/referencing.md"
And a "textDocument/definition" request is made at the position of "[[source#^para-one]]"
Then the response is a Location with uri "file:///tmp/fg-smoke-019/notes/source.md"
And the target range covers the line containing "^para-one" (line 1)
```

**Agent-driven steps:**

1. Agent creates the fixture:
   ```
   mkdir -p /tmp/fg-smoke-019/.obsidian
   mkdir -p /tmp/fg-smoke-019/notes
   printf '# Source\nThis is a paragraph. ^para-one\nAnother line.' > /tmp/fg-smoke-019/notes/source.md
   echo '[[source#^para-one]] reference here' > /tmp/fg-smoke-019/notes/referencing.md
   ```
2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-019/"`:
   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-019/","capabilities":{}}}
   ```
4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/referencing.md`:
   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-019/notes/referencing.md","languageId":"markdown","version":1,"text":"[[source#^para-one]] reference here"}}}
   ```
6. Agent sends `textDocument/definition` at position `{line: 0, character: 4}` (inside `[[source#^para-one]]`):
   ```json
   {"jsonrpc":"2.0","id":2,"method":"textDocument/definition","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-019/notes/referencing.md"},"position":{"line":0,"character":4}}}
   ```
7. Agent reads the response for id 2 (up to 3s)
8. Agent asserts the response has a `result` field (not `error`)
9. Agent asserts `result.uri` ends with `"notes/source.md"`
10. Agent asserts `result.range.start.line == 1` (the line `This is a paragraph. ^para-one` is line 1 in a 0-indexed file)
11. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** `textDocument/definition` returns a `Location` pointing to `notes/source.md` at line 1 (the `^para-one` anchor line); no error in response.
**Fail:** Response has `error` field; `result` is null; URI does not point to `source.md`; target line is not 1; server hangs or exits non-zero.

---

### TC-SMOKE-020 — broken block reference produces FG005 with Error severity

**Type:** Both
**BDD Reference:** [[bdd/features/block-references]] — `Broken block reference reports FG005`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with `notes/source.md` (which has valid block anchors `^para-one` and `^para-two`) and `notes/index.md` containing `[[source#^missing-anchor]]`. The anchor `missing-anchor` does not exist in `source.md`. The server must publish an FG005 diagnostic with Error severity — distinct from FG001 (broken wiki-link) and FG004 (broken embed) — confirming the block-anchor-specific diagnostic code path.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-020/" with ".obsidian/"
And "notes/source.md" contains "# Source\nParagraph one. ^para-one\nParagraph two. ^para-two"
And "notes/index.md" contains "[[source#^missing-anchor]]"
And "missing-anchor" does not exist as a block anchor in "notes/source.md"
When the LSP processes textDocument/didOpen for "notes/index.md"
Then a diagnostic is published for "notes/index.md" with:
  | field    | value                           |
  | code     | FG005                           |
  | severity | Error (value: 1)                |
  | source   | flavor-grenade                  |
And the diagnostic message contains "missing-anchor"
And no diagnostic with code "FG001" is published for "notes/index.md"
```

**Agent-driven steps:**

1. Agent creates the fixture:
   ```
   mkdir -p /tmp/fg-smoke-020/.obsidian
   mkdir -p /tmp/fg-smoke-020/notes
   printf '# Source\nParagraph one. ^para-one\nParagraph two. ^para-two' > /tmp/fg-smoke-020/notes/source.md
   echo '[[source#^missing-anchor]]' > /tmp/fg-smoke-020/notes/index.md
   ```
2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-020/"`:
   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-020/","capabilities":{}}}
   ```
4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/index.md`:
   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-020/notes/index.md","languageId":"markdown","version":1,"text":"[[source#^missing-anchor]]"}}}
   ```
6. Agent waits up to 2s and collects all `textDocument/publishDiagnostics` notifications for `notes/index.md`
7. Agent asserts at least one diagnostic is present
8. Agent asserts the diagnostic has `code: "FG005"`, `severity: 1` (Error), `source: "flavor-grenade"`
9. Agent asserts the diagnostic `message` contains the string `"missing-anchor"`
10. Agent asserts no diagnostic in the array has `code: "FG001"`
11. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** An FG005 diagnostic with severity Error is published; the message contains `"missing-anchor"`; no FG001 is present; source is `"flavor-grenade"`; server exits 0.
**Fail:** No diagnostic is published; FG001 is published instead of FG005; severity is not 1 (Error); message does not contain `"missing-anchor"`; server hangs or exits non-zero.

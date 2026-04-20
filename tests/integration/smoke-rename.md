---
title: Smoke Tests — Rename Heading
tags: [test/integration, test/smoke]
aliases: [Rename Smoke Tests]
---

# Smoke Tests — Rename Heading

## Purpose

This smoke test validates the minimum viable rename round-trip: that `textDocument/rename` on a heading produces a `WorkspaceEdit` that updates the heading in the source file and all `[[doc#heading]]` links in referencing files, and that `textDocument/prepareRename` correctly rejects positions that are not renameable. These tests together confirm that the rename provider can locate all inbound heading references via the RefGraph and construct a correct multi-file `WorkspaceEdit`, which is the most destructive operation the server can perform.

## Phase Gate

Phase 3 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-015 — rename heading updates source file and all referencing links

**Type:** Both
**BDD Reference:** [[bdd/features/rename]] — `Rename heading updates all [[doc#heading]] references`
**Phase gate:** Phase 3

**Setup:**
An Obsidian vault with `notes/source.md` containing `## Old Heading`, and two referencing files — `notes/ref-one.md` and `notes/ref-two.md` — both containing `[[source#Old Heading]]`. The cursor is placed on the `## Old Heading` line in `source.md`. The rename target is `"New Heading"`.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-015/" with ".obsidian/"
And "notes/source.md" contains "# Source Doc\n## Old Heading\nBody text."
And "notes/ref-one.md" contains "[[source#Old Heading]] and more text"
And "notes/ref-two.md" contains "See [[source#Old Heading]] for details"
When the cursor is on "## Old Heading" in "notes/source.md"
And a "textDocument/rename" request is made with newName "New Heading"
Then the WorkspaceEdit renames "Old Heading" to "New Heading" in "notes/source.md"
And the WorkspaceEdit updates "[[source#Old Heading]]" to "[[source#New Heading]]" in "notes/ref-one.md"
And the WorkspaceEdit updates "[[source#Old Heading]]" to "[[source#New Heading]]" in "notes/ref-two.md"
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-015/.obsidian
   mkdir -p /tmp/fg-smoke-015/notes
   printf '# Source Doc\n## Old Heading\nBody text.' > /tmp/fg-smoke-015/notes/source.md
   echo '[[source#Old Heading]] and more text' > /tmp/fg-smoke-015/notes/ref-one.md
   echo 'See [[source#Old Heading]] for details' > /tmp/fg-smoke-015/notes/ref-two.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-015/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-015/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for all three files
6. Agent sends `textDocument/rename` at position `{line: 1, character: 5}` (on `## Old Heading`) with `newName: "New Heading"`:

   ```json
   {"jsonrpc":"2.0","id":2,"method":"textDocument/rename","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-015/notes/source.md"},"position":{"line":1,"character":5},"newName":"New Heading"}}
   ```

7. Agent reads the response for id 2 (up to 3s)
8. Agent asserts response has a `result` field (not `error`)
9. Agent asserts `result.changes` or `result.documentChanges` is present and non-empty
10. Agent asserts that changes include an edit to `notes/source.md` replacing `Old Heading` with `New Heading` in the heading text
11. Agent asserts that changes include edits to `notes/ref-one.md` replacing `[[source#Old Heading]]` with `[[source#New Heading]]`
12. Agent asserts that changes include edits to `notes/ref-two.md` replacing `[[source#Old Heading]]` with `[[source#New Heading]]`
13. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** `WorkspaceEdit` contains changes to `source.md`, `ref-one.md`, and `ref-two.md`; each change replaces `Old Heading` with `New Heading`; no error in response.
**Fail:** Response has `error` field; `result` is null; one or more expected file changes is absent; heading text or link text is not correctly updated; server hangs or exits non-zero.

---

### TC-SMOKE-016 — prepareRename rejects cursor on body prose text

**Type:** Both
**BDD Reference:** [[bdd/features/rename]] — `prepareRename rejects cursor positioned on body text`
**Phase gate:** Phase 3

**Setup:**
An Obsidian vault with `notes/source.md` containing a heading and body prose. The cursor is positioned on body prose text (not on a heading). `prepareRename` should return an error, not a range, because prose text is not a renameable symbol in the OFM model.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-016/" with ".obsidian/"
And "notes/source.md" contains "# Source Doc\n## Old Heading\nBody text here."
And the cursor is on the prose text "Body text here." at line 2
When a "textDocument/prepareRename" request is made at {line: 2, character: 5}
Then the response is an error with message containing "Cannot rename at this location"
And the response does not contain a range or placeholder
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-016/.obsidian
   mkdir -p /tmp/fg-smoke-016/notes
   printf '# Source Doc\n## Old Heading\nBody text here.' > /tmp/fg-smoke-016/notes/source.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-016/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-016/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/source.md` with full content
6. Agent sends `textDocument/prepareRename` at position `{line: 2, character: 5}` (inside `Body text here.`):

   ```json
   {"jsonrpc":"2.0","id":2,"method":"textDocument/prepareRename","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-016/notes/source.md"},"position":{"line":2,"character":5}}}
   ```

7. Agent reads the response for id 2 (up to 3s)
8. Agent asserts the response has an `error` field (LSP error response) OR `result` is `null`
9. If an error is present, agent asserts the error message contains `"Cannot rename at this location"`
10. Agent asserts the response does NOT contain a valid `{range, placeholder}` object in `result`
11. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** `prepareRename` returns either an error response or `null` result when the cursor is on body prose; no valid rename range is provided.
**Fail:** `prepareRename` returns a `{range, placeholder}` for body prose (would allow renaming arbitrary text); server errors on other operations; server hangs or exits non-zero.

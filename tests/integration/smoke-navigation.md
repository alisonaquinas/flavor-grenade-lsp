---
title: Smoke Tests — Go-to-Definition and Find-References
tags: [test/integration, test/smoke]
aliases: [Navigation Smoke Tests]
---

# Smoke Tests — Go-to-Definition and Find-References

## Purpose

This smoke test validates the minimum viable navigation round-trip: that `textDocument/definition` on a `[[wikilink]]` returns a `Location` pointing to the target document at line 0, and that `textDocument/references` on a heading returns all vault files that link to that heading. These two tests together confirm that the RefGraph is populated from the vault index and that the LSP handler layer correctly serializes `Location` objects. Without passing navigation, go-to-definition and find-references are completely non-functional.

## Phase Gate

Phase 3 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-013 — go-to-definition on [[doc]] navigates to target document at line 0

**Type:** Both
**BDD Reference:** [[bdd/features/navigation]] — `Go-to-definition on [[doc]] navigates to target document`
**Phase gate:** Phase 3

**Setup:**
An Obsidian vault with `notes/target.md` (the destination) and `notes/referrer-a.md` containing `[[target]]`. The cursor is positioned on the `[[target]]` token in `referrer-a.md`. This tests the simplest possible definition navigation: file-level, no heading qualifier.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-013/" with ".obsidian/"
And the file "notes/target.md" contains "# Target Doc\nSome body text."
And the file "notes/referrer-a.md" contains "See [[target]] here."
When the LSP server initializes and indexes the vault
And "textDocument/didOpen" is sent for "notes/referrer-a.md"
And a "textDocument/definition" request is made with cursor at {line: 0, character: 6}
Then the response is a Location with uri "file:///tmp/fg-smoke-013/notes/target.md"
And the target range is at line 0, character 0
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-013/.obsidian
   mkdir -p /tmp/fg-smoke-013/notes
   printf '# Target Doc\nSome body text.' > /tmp/fg-smoke-013/notes/target.md
   echo 'See [[target]] here.' > /tmp/fg-smoke-013/notes/referrer-a.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-013/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-013/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/referrer-a.md`:

   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-013/notes/referrer-a.md","languageId":"markdown","version":1,"text":"See [[target]] here."}}}
   ```

6. Agent sends `textDocument/definition` at position `{line: 0, character: 6}` (inside `[[target]]`):

   ```json
   {"jsonrpc":"2.0","id":2,"method":"textDocument/definition","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-013/notes/referrer-a.md"},"position":{"line":0,"character":6}}}
   ```

7. Agent reads the response for id 2 (up to 3s)
8. Agent asserts the response has a `result` field (not `error`)
9. Agent asserts `result.uri` ends with `"notes/target.md"` (or equals the full URI)
10. Agent asserts `result.range.start.line == 0` and `result.range.start.character == 0`
11. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** `textDocument/definition` returns a `Location` with the correct target URI at line 0, character 0; no error in response.
**Fail:** Response has `error` field; `result` is null; URI does not point to `notes/target.md`; range is wrong; server hangs or exits non-zero.

---

### TC-SMOKE-014 — find-references on a heading returns all vault files linking to it

**Type:** Both
**BDD Reference:** [[bdd/features/navigation]] — `Find-references on a heading returns all wiki-links targeting that heading`
**Phase gate:** Phase 3

**Setup:**
An Obsidian vault with `notes/target.md` containing `## Section Alpha`, and two referrer files — `notes/referrer-a.md` and `notes/referrer-b.md` — both containing `[[target#Section Alpha]]`. The cursor is placed on the `## Section Alpha` heading line in `target.md`. This tests that the RefGraph can find all inbound references to a specific heading.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-014/" with ".obsidian/"
And "notes/target.md" contains "# Target Doc\n## Section Alpha\nBody."
And "notes/referrer-a.md" contains "[[target#Section Alpha]] in referrer-a"
And "notes/referrer-b.md" contains "[[target#Section Alpha]] in referrer-b"
When the LSP server initializes and all files are opened
And a "textDocument/references" request is made on "## Section Alpha" with includeDeclaration=false
Then the response contains a location for "[[target#Section Alpha]]" in "notes/referrer-a.md"
And the response contains a location for "[[target#Section Alpha]]" in "notes/referrer-b.md"
And the response list has exactly 2 items
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-014/.obsidian
   mkdir -p /tmp/fg-smoke-014/notes
   printf '# Target Doc\n## Section Alpha\nBody.' > /tmp/fg-smoke-014/notes/target.md
   echo '[[target#Section Alpha]] in referrer-a' > /tmp/fg-smoke-014/notes/referrer-a.md
   echo '[[target#Section Alpha]] in referrer-b' > /tmp/fg-smoke-014/notes/referrer-b.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-014/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-014/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for all three files
6. Agent sends `textDocument/references` at position `{line: 1, character: 5}` (on `## Section Alpha`, character 5 is inside the heading text) in `target.md` with `includeDeclaration: false`:

   ```json
   {"jsonrpc":"2.0","id":2,"method":"textDocument/references","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-014/notes/target.md"},"position":{"line":1,"character":5},"context":{"includeDeclaration":false}}}
   ```

7. Agent reads the response for id 2 (up to 3s)
8. Agent asserts `result` is an array with length == 2
9. Agent asserts the two `Location` objects have URIs ending in `"notes/referrer-a.md"` and `"notes/referrer-b.md"` respectively
10. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** `textDocument/references` returns exactly 2 `Location` objects pointing to `referrer-a.md` and `referrer-b.md`; no error in response.
**Fail:** Response has `error` field; `result` array has length != 2; either referrer URI is absent; server hangs or exits non-zero.

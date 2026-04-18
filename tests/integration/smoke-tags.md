---
title: Smoke Tests — Tag Indexing
tags: [test/integration, test/smoke]
aliases: [Tags Smoke Tests]
---

# Smoke Tests — Tag Indexing

## Purpose

This smoke test validates the minimum viable tag indexing round-trip: that inline tags in a markdown file are registered in the vault tag registry on document open, and that tags inside fenced code blocks are correctly excluded from the registry. Tag indexing is the prerequisite for tag-based completion and find-references. Without correct registry population, tag completions will return stale or incorrect results, and code-block tags will incorrectly pollute the registry used for navigation.

## Phase Gate

Phase 2 — see [[plans/execution-ledger]]

## Test Cases

### TC-SMOKE-017 — inline tag is indexed in the vault tag registry

**Type:** Both
**BDD Reference:** [[bdd/features/tags]] — `Inline tag is indexed correctly in the vault tag registry`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with `notes/work.md` containing two inline tags: `#project/active` and `#meeting`. After the server indexes the file, a `textDocument/completion` request after `#` is used as a proxy to confirm the tags appear in the registry (since the tag registry is not directly observable via LSP).

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-017/" with ".obsidian/"
And the file "notes/work.md" contains "#project/active some task\n#meeting note"
When the LSP server initializes and indexes the vault
And "textDocument/didOpen" is sent for "notes/work.md"
And a "textDocument/completion" request is made after "#" in a new document
Then the completion list includes "project/active"
And the completion list includes "meeting"
And each completion item has kind 12 (Value)
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-017/.obsidian
   mkdir -p /tmp/fg-smoke-017/notes
   printf '#project/active some task\n#meeting note' > /tmp/fg-smoke-017/notes/work.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-017/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-017/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/work.md`:

   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-017/notes/work.md","languageId":"markdown","version":1,"text":"#project/active some task\n#meeting note"}}}
   ```

6. Agent sends `textDocument/didOpen` for a new file `notes/new.md` with content `"#"`:

   ```json
   {"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-017/notes/new.md","languageId":"markdown","version":1,"text":"#"}}}
   ```

7. Agent sends `textDocument/completion` at `{line: 0, character: 1}` in `new.md`:

   ```json
   {"jsonrpc":"2.0","id":2,"method":"textDocument/completion","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-017/notes/new.md"},"position":{"line":0,"character":1},"context":{"triggerKind":2,"triggerCharacter":"#"}}}
   ```

8. Agent reads the response for id 2 (up to 3s)
9. Agent asserts the response has a `result` field (not `error`)
10. Agent asserts `result.items` contains an item with `label` value `"project/active"` and `kind == 12` (Value)
11. Agent asserts `result.items` contains an item with `label` value `"meeting"` and `kind == 12`
12. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** Completion after `#` returns items including `"project/active"` and `"meeting"`, both with kind 12 (Value).
**Fail:** Response has `error` field; neither tag appears in completion list; kind is wrong; server hangs or exits non-zero.

---

### TC-SMOKE-018 — tag inside fenced code block is NOT indexed

**Type:** Both
**BDD Reference:** [[bdd/features/tags]] — `Tag inside fenced code block is NOT indexed`
**Phase gate:** Phase 2

**Setup:**
An Obsidian vault with `notes/code.md` containing a fenced code block that includes `#not-a-tag` and body prose containing `#real-tag`. The smoke test confirms that `#not-a-tag` does not appear in completions while `#real-tag` does, verifying that the parser correctly excludes code block content from tag scanning.

**Scripted steps:**

```gherkin
Given a vault at "/tmp/fg-smoke-018/" with ".obsidian/"
And "notes/code.md" contains:
  """
  # Code Note
  ```

  #not-a-tag inside code

  ```
  Body #real-tag here.
  """
When the LSP processes textDocument/didOpen for "notes/code.md"
And a completion request is made after "#" in another document
Then the completion list includes "real-tag"
And the completion list does NOT include "not-a-tag"
```

**Agent-driven steps:**

1. Agent creates the fixture:

   ```
   mkdir -p /tmp/fg-smoke-018/.obsidian
   mkdir -p /tmp/fg-smoke-018/notes
   printf '# Code Note\n```\n#not-a-tag inside code\n```\nBody #real-tag here.' > /tmp/fg-smoke-018/notes/code.md
   ```

2. Agent spawns the LSP server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` with `rootUri: "file:///tmp/fg-smoke-018/"`:

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":"file:///tmp/fg-smoke-018/","capabilities":{}}}
   ```

4. Agent sends `initialized` notification
5. Agent sends `textDocument/didOpen` for `notes/code.md` with the full content
6. Agent sends `textDocument/didOpen` for `notes/new.md` with content `"#"` and sends `textDocument/completion` at `{line: 0, character: 1}`:

   ```json
   {"jsonrpc":"2.0","id":2,"method":"textDocument/completion","params":{"textDocument":{"uri":"file:///tmp/fg-smoke-018/notes/new.md"},"position":{"line":0,"character":1},"context":{"triggerKind":2,"triggerCharacter":"#"}}}
   ```

7. Agent reads the response for id 2 (up to 3s)
8. Agent asserts `result.items` contains an item with `label == "real-tag"`
9. Agent asserts `result.items` does NOT contain any item with `label == "not-a-tag"`
10. Agent sends `shutdown` + `exit`; verifies server exits 0

**Pass:** `real-tag` appears in tag completions; `not-a-tag` does not appear; server exits 0.
**Fail:** `not-a-tag` appears in completions (code block content was incorrectly indexed); `real-tag` is absent; server hangs or exits non-zero.

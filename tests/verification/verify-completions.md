---
title: Verification — Completions
tags: [test/verification, "requirements/completions"]
aliases: [Verify Completions]
---

# Verification — Completions

## Purpose

This document defines the scripted and agent-driven verification test cases for the Completion
Requirements of flavor-grenade-lsp. Each test case is derived directly from the Planguage
`Meter` field of its corresponding requirement and references the BDD scenarios in
[[bdd/features/completions]] where coverage exists. These tests are the authoritative verification
record for the `textDocument/completion` capability.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Completion.Candidates.Cap` | Completion list capped at configured `completion.candidates`; `isIncomplete` true when cap is hit | Phase 1 |
| `Completion.Trigger.Coverage` | All three trigger characters (`[`, `#`, `(`) return non-empty lists at appropriate positions | Phase 1 |
| `Completion.CalloutType.Coverage` | All 13 primary Obsidian callout types offered at `> [!` cursor position | Phase 1 |
| `Completion.WikiStyle.Binding` | Wiki-link completion `insertText` conforms to active `wiki.style` with no style mixing | Phase 1 |

---

## Test Cases

### TC-VER-COMP-001 — Completion.Candidates.Cap

**Planguage Tag:** `Completion.Candidates.Cap`
**Gist:** The completion candidate list must be capped at the integer value configured by `completion.candidates`, and `CompletionList.isIncomplete` must be set to `true` whenever the cap is reached.
**Type:** Both
**BDD Reference:** [[bdd/features/completions]] — `Candidate list is capped and isIncomplete true when exceeds limit`
**Phase:** Phase 1

**Setup:**

- A vault with at least 15 documents whose names all share the prefix `note-`.
- A `.flavor-grenade.toml` file at the vault root containing `completion.candidates = 5`.
- An `.obsidian/` marker directory at the vault root.
- A scratch document `scratch.md` open in the editor, cursor at the start of an empty line.

**Scripted steps:**

```gherkin
Given the server is configured with completion.candidates = 5
And the vault contains at least 15 documents whose names share a common prefix
And a scratch document "scratch.md" is open with the cursor after "[[" on an empty line

When a textDocument/completion request is made with triggerKind TriggerCharacter and triggerCharacter "["
Then CompletionList.items has length exactly 5
And CompletionList.isIncomplete is true

When the cursor is placed after "[[note-0" (query matches exactly 4 documents)
And a textDocument/completion request is made with triggerKind TriggerCharacter and triggerCharacter "["
Then CompletionList.items has length 4
And CompletionList.isIncomplete is false
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 15 documents: `notes/note-00.md` through `notes/note-14.md`, each with a one-line body.
3. Agent writes `.flavor-grenade.toml` at vault root: `completion.candidates = 5`.
4. Agent writes `scratch.md` with empty body.
5. Agent spawns server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` (rootUri = vault path) + `initialized`.
7. Agent sends `textDocument/didOpen` for `scratch.md`.
8. Agent sends `textDocument/completion` with position after `[[`, `triggerKind: 2` (TriggerCharacter), `triggerCharacter: "["`.
9. Agent reads `CompletionList` from stdout; asserts `items.length === 5` and `isIncomplete === true`.
10. Agent sends `textDocument/completion` with position after `[[note-0` (matches 5 docs with prefix `note-0`), same trigger parameters.
11. Agent reads `CompletionList`; asserts `items.length === 5` (still at cap) and `isIncomplete === true`.
12. Agent sends `textDocument/completion` with position after `[[note-00` (matches exactly 1 doc).
13. Agent reads `CompletionList`; asserts `items.length === 1` and `isIncomplete === false`.
14. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of responses have item count ≤ N; 100% of responses where total matches > N have `isIncomplete === true`.
**Fail criterion:** Any response with item count exceeding N, or any response where total matches > N but `isIncomplete` is `false`.

---

### TC-VER-COMP-002 — Completion.Trigger.Coverage

**Planguage Tag:** `Completion.Trigger.Coverage`
**Gist:** Each of the three LSP trigger characters (`[`, `#`, `(`) must return a non-empty candidate list when the cursor is at an appropriate syntactic context.
**Type:** Both
**BDD Reference:** [[bdd/features/completions]] — `Wiki-link completion returns document candidates after [[ trigger`, `Tag completion returns candidates after # trigger character`; `(` position: **BDD gap**
**Phase:** Phase 1

**Setup:**

- A vault with at least 5 documents and at least 5 distinct inline tags.
- A fixture document `trigger-test.md` with three precisely placed cursor positions:
  - Position A: immediately after `[[` on a fresh line (trigger char `[`, wiki-link context).
  - Position B: immediately after `#` on a fresh line (trigger char `#`, tag context).
  - Position C: immediately after `[link text](` on a fresh line (trigger char `(`, inline-link URL context).

**Scripted steps:**

```gherkin
Given a vault with at least 5 documents and at least 5 distinct tags
And "trigger-test.md" contains:
  | line | content                     | cursor position label |
  | 1    | [[                          | Position A            |
  | 2    | #                           | Position B            |
  | 3    | [link text](                | Position C            |

When a textDocument/completion request is made at Position A
  with triggerKind TriggerCharacter and triggerCharacter "["
Then CompletionList.items.length >= 1

When a textDocument/completion request is made at Position B
  with triggerKind TriggerCharacter and triggerCharacter "#"
Then CompletionList.items.length >= 1

When a textDocument/completion request is made at Position C
  with triggerKind TriggerCharacter and triggerCharacter "("
Then CompletionList.items.length >= 1
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 5 documents: `notes/alpha.md`, `notes/beta.md`, `notes/gamma.md`, `notes/delta.md`, `notes/epsilon.md`, each with a body line.
3. Agent writes `notes/alpha.md` with frontmatter tags `#research`, `#project/active`, `#project/done`, `#meeting`, `#journal`.
4. Agent writes `trigger-test.md` with three lines:
   - Line 1 (0-indexed): `[[`  — cursor at column 2 (after both `[` characters).
   - Line 2: `#`  — cursor at column 1 (immediately after `#`).
   - Line 3: `[link text](`  — cursor at column 12 (immediately after `(`).
5. Agent spawns server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` + `initialized`.
7. Agent sends `textDocument/didOpen` for `trigger-test.md`.
8. Agent sends `textDocument/completion` at `{line: 0, character: 2}`, `triggerKind: 2`, `triggerCharacter: "["`.
9. Agent asserts `items.length >= 1` (wiki-link candidates).
10. Agent sends `textDocument/completion` at `{line: 1, character: 1}`, `triggerKind: 2`, `triggerCharacter: "#"`.
11. Agent asserts `items.length >= 1` (tag candidates).
12. Agent sends `textDocument/completion` at `{line: 2, character: 12}`, `triggerKind: 2`, `triggerCharacter: "("`.
13. Agent asserts `items.length >= 1` (URL/document candidates).
14. Agent computes (positions returning non-empty / 3) × 100; asserts 100%.
15. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of appropriate trigger positions return non-empty candidate lists.
**Fail criterion:** Any trigger-character invocation at an appropriate position returning an empty list when matching candidates exist.

---

### TC-VER-COMP-003 — Completion.CalloutType.Coverage

**Planguage Tag:** `Completion.CalloutType.Coverage`
**Gist:** When the cursor is at the `> [!` position in a block-quote line, the completion response must include all 13 primary standard Obsidian callout type names as candidates.
**Type:** Both
**BDD Reference:** [[bdd/features/completions]] — `Callout completion returns all 13 types after "> [!" trigger`
**Phase:** Phase 1

**Setup:**

- Any vault with at least one document open.
- A fixture document `callout-test.md` with a single line `> [!` and the cursor positioned at column 4 (immediately after `!`).

**Scripted steps:**

```gherkin
Given "callout-test.md" contains the line "> [!" with cursor at column 4

When a textDocument/completion request is made at that position

Then the response includes a completion item with label "note" (case-insensitive)
And the response includes "info"
And the response includes "tip"
And the response includes "warning"
And the response includes "danger"
And the response includes "success"
And the response includes "question"
And the response includes "failure"
And the response includes "bug"
And the response includes "example"
And the response includes "quote"
And the response includes "abstract"
And the response includes "todo"
And (primary standard callout types present / 13) × 100 = 100
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes `callout-test.md` with content:

   ```
   > [!
   ```

   (The cursor target is the end of line 1, column 4, immediately after `!`.)
3. Agent spawns server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` + `initialized`.
5. Agent sends `textDocument/didOpen` for `callout-test.md`.
6. Agent sends `textDocument/completion` at `{line: 0, character: 4}` with `triggerKind: 1` (Invoked).
7. Agent collects all `CompletionItem.label` and `insertText` values from the response.
8. Agent checks each of the 13 primary standard callout type names against the collected labels (case-insensitive): `note`, `info`, `tip`, `warning`, `danger`, `success`, `question`, `failure`, `bug`, `example`, `quote`, `abstract`, `todo`.
9. Agent counts how many of the 13 appear; asserts count = 13.
10. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% — all 13 primary standard callout types present in the completion response.
**Fail criterion:** Any of the 13 primary standard callout types absent from the completion response at the `> [!` position.

---

### TC-VER-COMP-004 — Completion.WikiStyle.Binding

**Planguage Tag:** `Completion.WikiStyle.Binding`
**Gist:** Completion items for wiki-links must use the link text format prescribed by the active `wiki.style` configuration, and must not mix formats from different style modes in the same response.
**Type:** Both
**BDD Reference:** [[bdd/features/completions]] — `Completion respects file-stem style configuration`, `Completion respects title-slug style when configured`; `file-path-stem` run: **BDD gap**
**Phase:** Phase 1

**Setup:**

- A vault with at least 5 documents whose frontmatter `title` values differ from their file stems (e.g., `notes/my-note.md` with `title: My Note`).
- Three separate server runs, each with a different `wiki.style` value in `.flavor-grenade.toml`: `file-stem`, `title-slug`, `file-path-stem`.
- A scratch document `style-test.md` open with cursor after `[[` on an empty line.

**Scripted steps:**

```gherkin
# Run 1: file-stem style
Given the server is configured with wiki.style = "file-stem"
And "notes/my-note.md" has frontmatter title "My Note" and file stem "my-note"

When a textDocument/completion request is made after "[[" in "style-test.md"
Then all insertText values use the file stem (e.g., "my-note", no title, no path prefix)
And zero items use title-slug or path format

# Run 2: title-slug style
Given the server is configured with wiki.style = "title-slug"
When a textDocument/completion request is made after "[[" in "style-test.md"
Then all insertText values use the slugified document title (e.g., "My Note")
And zero items use file-stem or path format

# Run 3: file-path-stem style
Given the server is configured with wiki.style = "file-path-stem"
When a textDocument/completion request is made after "[[" in "style-test.md"
Then all insertText values use the vault-relative path without extension (e.g., "notes/my-note")
And zero items use file-stem-only or title-slug format
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 5 documents in `notes/` with frontmatter titles distinct from their file stems.
3. Agent writes `style-test.md` with a single empty body line.

**Run 1 — `file-stem`:**
4. Agent writes `.flavor-grenade.toml`: `wiki.style = "file-stem"`.
5. Agent spawns server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` + `initialized`.
7. Agent sends `textDocument/didOpen` for `style-test.md`.
8. Agent sends `textDocument/completion` at position after `[[` with `triggerKind: 2`, `triggerCharacter: "["`.
9. Agent collects all `insertText` values; asserts none contain `/` (no path prefix) and none match title strings.
10. Agent sends `shutdown` + `exit`.

**Run 2 — `title-slug`:**
11. Agent updates `.flavor-grenade.toml`: `wiki.style = "title-slug"`.
12. Agent spawns server, sends `initialize` + `initialized`, `textDocument/didOpen`.
13. Agent sends `textDocument/completion` at same position.
14. Agent collects all `insertText` values; asserts each matches the corresponding document's frontmatter title; asserts none use file-stem or path format.
15. Agent sends `shutdown` + `exit`.

**Run 3 — `file-path-stem`:**
16. Agent updates `.flavor-grenade.toml`: `wiki.style = "file-path-stem"`.
17. Agent spawns server, sends `initialize` + `initialized`, `textDocument/didOpen`.
18. Agent sends `textDocument/completion` at same position.
19. Agent collects all `insertText` values; asserts each is the vault-relative path without extension (e.g., `notes/my-note`).
20. Agent sends `shutdown` + `exit`.
21. Agent computes (style-conforming items / total items) × 100 across all runs; asserts 100%.

**Pass criterion:** 100% of completion items conform to the active `wiki.style` in all three runs; zero style mixing in any response.
**Fail criterion:** Any completion item whose `insertText` does not conform to the active `wiki.style`, or any response mixing formats from different style modes.

---
title: Verification — Rename
tags: [test/verification, "requirements/rename"]
aliases: [Verify Rename]
---

# Verification — Rename

## Purpose

This document defines the scripted and agent-driven verification test cases for the Rename
Refactoring Requirements of flavor-grenade-lsp. Each test case is derived directly from the
Planguage `Meter` field of its corresponding requirement and references the BDD scenarios in
[[bdd/features/rename]] where coverage exists. These tests are the authoritative verification
record for the `textDocument/rename` and `textDocument/prepareRename` capabilities.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Rename.Refactoring.Completeness` | `textDocument/rename` produces a `WorkspaceEdit` updating every cross-document reference atomically | Phase 2 |
| `Rename.Prepare.Rejection` | `textDocument/prepareRename` returns `null` or error for all non-renameable positions | Phase 2 |
| `Rename.StyleBinding.Consistency` | Rename `WorkspaceEdit` updates only style-matching references and writes new text in the active style | Phase 2 |

---

## Test Cases

### TC-VER-REN-001 — Rename.Refactoring.Completeness

**Planguage Tag:** `Rename.Refactoring.Completeness`
**Gist:** A `textDocument/rename` request on a renameable element (document title or heading) must produce a `WorkspaceEdit` that updates every cross-document reference to that element in a single atomic edit, with no reference left unupdated.
**Type:** Both
**BDD Reference:** [[bdd/features/rename]] — `Rename heading updates all [[doc#heading]] references`, `Rename file updates all [[filename]] and [[filename|alias]] references`
**Phase:** Phase 2

**Setup:**

- A vault with at least 15 documents.
- A target document `notes/my-doc.md` with heading `## My Section`.
- At least 12 referencing documents using a mix of:
  - `[[my-doc]]` (plain wiki-link to the document)
  - `![[my-doc]]` (embed link to the document)
  - `[[my-doc#My Section]]` (heading reference)
- At least 3 non-referencing documents with unrelated content.

**Scripted steps:**

```gherkin
Given a vault with at least 15 documents
And at least 12 documents reference "notes/my-doc.md" via [[my-doc]], ![[my-doc]], [[my-doc#My Section]]
And the cursor is on the document title position in "notes/my-doc.md"

When a textDocument/rename request is made with newName "renamed-doc"
Then the returned WorkspaceEdit is non-null
And applying the WorkspaceEdit to a copy of the vault produces a state where:
  - zero occurrences of "[[my-doc]]", "![[my-doc]]", "[[my-doc#My Section]]" remain in any indexed document
  - all former references now use "renamed-doc" or "renamed-doc#My Section"
And (references updated in WorkspaceEdit / total references found by independent scan) × 100 = 100
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes `notes/my-doc.md` with `## My Section` heading and body content.
3. Agent writes 12 referencing documents (`ref-01.md` through `ref-12.md`), distributing reference types:
   - `ref-01.md` through `ref-04.md`: each contains `[[my-doc]]`.
   - `ref-05.md` through `ref-08.md`: each contains `![[my-doc]]`.
   - `ref-09.md` through `ref-12.md`: each contains `[[my-doc#My Section]]`.
4. Agent writes 3 non-referencing documents with unrelated content.
5. Agent spawns server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` + `initialized`.
7. Agent sends `textDocument/didOpen` for all documents.
8. Agent sends `textDocument/rename` at the document title position of `notes/my-doc.md` with `newName: "renamed-doc"`.
9. Agent reads the returned `WorkspaceEdit` from stdout.
10. Agent independently scans all fixture document content for `[[my-doc]]`, `![[my-doc]]`, `[[my-doc#My Section]]`; builds the expected reference set (count and locations).
11. Agent applies the `WorkspaceEdit` to in-memory copies of all documents.
12. Agent scans applied copies for any remaining `my-doc` reference; asserts zero found.
13. Agent computes (references covered in `WorkspaceEdit` / references in independent scan) × 100; asserts 100%.
14. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of references updated in a single `WorkspaceEdit`; no reference to the old name remaining after the edit is applied.
**Fail criterion:** Any reference to the old name remaining in any indexed document after the workspace edit is applied (i.e., < 100% updated).

---

### TC-VER-REN-002 — Rename.Prepare.Rejection

**Planguage Tag:** `Rename.Prepare.Rejection`
**Gist:** `textDocument/prepareRename` must return `null` (or a `ResponseError`) when the cursor is positioned on any non-renameable location: body text prose, fenced code blocks, math blocks, or inline URLs in standard Markdown links.
**Type:** Both
**BDD Reference:** [[bdd/features/rename]] — `prepareRename rejects cursor positioned on body text`, `prepareRename rejects cursor positioned on math block content`; fenced code block and inline-URL sub-cases: **BDD gap**
**Phase:** Phase 2

**Setup:**

- A fixture document `notes/mixed-content.md` containing all required non-renameable position types:
  - 2 positions in mid-paragraph prose (not on any link or heading token).
  - 2 positions inside a fenced code block.
  - 2 positions inside a `$$...$$` math block.
  - 2 positions on the URL portion of an inline link (`[text](https://example.com)`).
- The same document also contains at least 2 valid renameable positions: the document-level heading and one section heading.

**Scripted steps:**

```gherkin
Given "notes/mixed-content.md" contains:
  | position label | content context                           | expected outcome     |
  | Prose-1        | mid-paragraph prose word                  | null or ResponseError |
  | Prose-2        | different mid-paragraph prose word        | null or ResponseError |
  | Code-1         | word inside fenced code block             | null or ResponseError |
  | Code-2         | different word inside fenced code block   | null or ResponseError |
  | Math-1         | word inside $$ math block $$              | null or ResponseError |
  | Math-2         | different word inside $$ math block $$    | null or ResponseError |
  | URL-1          | URL in [text](https://example.com)        | null or ResponseError |
  | URL-2          | URL in [link](https://another.com)        | null or ResponseError |
  | Valid-1        | document-level heading text               | non-null Range        |
  | Valid-2        | section heading text                      | non-null Range        |

When a textDocument/prepareRename request is made at each position
Then positions Prose-1 through URL-2 each return null or a ResponseError
And positions Valid-1 and Valid-2 each return a non-null Range
And (invalid positions returning null/error / 8 invalid positions) × 100 = 100
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes `notes/mixed-content.md` with the following content structure (line numbers for cursor targeting):

   ```
   # Mixed Content Document

   ## Valid Section

   This is prose text in a paragraph. Another sentence here.

   ```python
   x = "code block content"
   y = "another code line"
   ```

   $$
   E = mc^2
   F = ma
   $$

   See [external link](https://example.com) and [another](https://other.com) for details.

   ```
3. Agent records exact `{line, character}` coordinates for each of the 8 non-renameable positions and 2 valid positions.

4. Agent spawns server: `bun run start 2>/dev/null &`
5. Agent sends `initialize` + `initialized`.
6. Agent sends `textDocument/didOpen` for `notes/mixed-content.md`.
7. For each of the 8 non-renameable positions, agent sends `textDocument/prepareRename`.
8. Agent asserts each response is either `null` (JSON-RPC result null) or a `ResponseError` object.
9. For each of the 2 valid positions, agent sends `textDocument/prepareRename`.
10. Agent asserts each response is a non-null object containing a `range` field.
11. Agent computes (invalid positions correctly rejected / 8) × 100; asserts 100%.
12. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of non-renameable positions correctly rejected; valid positions correctly accepted.
**Fail criterion:** Any non-renameable position returning a non-null range from `prepareRename`.

---

### TC-VER-REN-003 — Rename.StyleBinding.Consistency

**Planguage Tag:** `Rename.StyleBinding.Consistency`
**Gist:** The rename `WorkspaceEdit` must only update references that are bound to the active `wiki.style` configuration; links bound to a different style must not be rewritten, and the new reference text must conform to the active style.
**Type:** Both
**BDD Reference:** [[bdd/features/rename]] — `Rename in file-stem style updates only file-stem links`; `title-slug` inverse run: **BDD gap**
**Phase:** Phase 2

**Setup:**

- A vault with documents referenced by a mix of link styles:
  - `notes/old-title.md` (file stem `old-title`, frontmatter `title: Old Title Document`).
  - `notes/slug-ref.md` — contains `[[old-title]]` (file-stem format).
  - `notes/title-ref.md` — contains `[[Old Title Document]]` (title-slug format, different from file stem).
  - `notes/path-ref.md` — contains `[[notes/old-title]]` (file-path-stem format).
- Two server runs: one with `wiki.style = "title-slug"`, one with `wiki.style = "file-stem"`.

**Scripted steps:**

```gherkin
# Run 1: title-slug style
Given the server is configured with wiki.style = "title-slug"
And "notes/old-title.md" has frontmatter title "Old Title Document"
And the vault contains:
  | file              | link text                 | style         |
  | notes/slug-ref.md | [[old-title]]             | file-stem     |
  | notes/title-ref.md| [[Old Title Document]]    | title-slug    |
  | notes/path-ref.md | [[notes/old-title]]       | file-path-stem|

When a textDocument/rename request is made on "notes/old-title.md" with newName "New Title Document"
Then the WorkspaceEdit contains changes for "notes/title-ref.md"
And the updated text in "notes/title-ref.md" is "[[New Title Document]]"
And the WorkspaceEdit does NOT contain changes for "notes/slug-ref.md"
And the WorkspaceEdit does NOT contain changes for "notes/path-ref.md"

# Run 2: file-stem style
Given the server is configured with wiki.style = "file-stem"
When a textDocument/rename request is made on "notes/old-title.md" with newName "new-title"
Then the WorkspaceEdit contains changes for "notes/slug-ref.md"
And the updated text in "notes/slug-ref.md" is "[[new-title]]"
And the WorkspaceEdit does NOT contain changes for "notes/title-ref.md"
And the WorkspaceEdit does NOT contain changes for "notes/path-ref.md"

# Both runs:
And (style-correct edit entries / total edit entries) × 100 = 100
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes `notes/old-title.md` with frontmatter `title: Old Title Document` and body content.
3. Agent writes `notes/slug-ref.md` containing `[[old-title]]` (file-stem format).
4. Agent writes `notes/title-ref.md` containing `[[Old Title Document]]` (title-slug format).
5. Agent writes `notes/path-ref.md` containing `[[notes/old-title]]` (file-path-stem format).

**Run 1 — `title-slug` active:**
6. Agent writes `.flavor-grenade.toml`: `wiki.style = "title-slug"`.
7. Agent spawns server: `bun run start 2>/dev/null &`
8. Agent sends `initialize` + `initialized`.
9. Agent sends `textDocument/didOpen` for all documents.
10. Agent sends `textDocument/rename` at document title position of `notes/old-title.md` with `newName: "New Title Document"`.
11. Agent reads `WorkspaceEdit` from stdout.
12. Agent asserts the edit contains a change for `notes/title-ref.md` with new text `[[New Title Document]]`.
13. Agent asserts the edit does NOT contain any change entry for `notes/slug-ref.md`.
14. Agent asserts the edit does NOT contain any change entry for `notes/path-ref.md`.
15. Agent sends `shutdown` + `exit`.

**Run 2 — `file-stem` active:**
16. Agent updates `.flavor-grenade.toml`: `wiki.style = "file-stem"`.
17. Agent spawns server: `bun run start 2>/dev/null &`
18. Agent sends `initialize` + `initialized`.
19. Agent sends `textDocument/didOpen` for all documents.
20. Agent sends `textDocument/rename` at document title position of `notes/old-title.md` with `newName: "new-title"`.
21. Agent reads `WorkspaceEdit` from stdout.
22. Agent asserts the edit contains a change for `notes/slug-ref.md` with new text `[[new-title]]`.
23. Agent asserts the edit does NOT contain any change entry for `notes/title-ref.md`.
24. Agent asserts the edit does NOT contain any change entry for `notes/path-ref.md`.
25. Agent sends `shutdown` + `exit`.
26. Agent computes (style-correct edit entries / total edit entries) × 100 across both runs; asserts 100%.

**Pass criterion:** 100% of edit entries are style-consistent; out-of-style links are not rewritten in either run.
**Fail criterion:** Any rename edit entry that updates an out-of-style link, or any updated link text that does not conform to the active style.

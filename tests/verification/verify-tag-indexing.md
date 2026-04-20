---
title: Verification — Tag Indexing
tags: [test/verification, "requirements/tag-indexing"]
aliases: [Verify Tag Indexing]
---

# Verification — Tag Indexing

## Purpose

This document defines the scripted and agent-driven verification test cases for the Tag Indexing
Requirements of flavor-grenade-lsp. Each test case is derived directly from the Planguage `Meter`
field of its corresponding requirement and references the BDD scenarios in
[[bdd/features/tags]] where coverage exists. These tests are the authoritative verification record
for tag completeness, hierarchical parent-child awareness, YAML frontmatter equivalence, and Unicode
tag parsing and completion.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Tag.Index.Completeness` | All `#tag` occurrences in vault body text indexed; code/math blocks excluded | Phase 1 |
| `Tag.Hierarchy.Awareness` | Parent-tag queries return the complete set of child-tag matches | Phase 1 |
| `Tag.YAML.Equivalence` | `tags:` frontmatter values indexed identically to equivalent inline `#tag` syntax | Phase 1 |
| `Tag.Completion.Unicode` | Tag completion parses, indexes, and returns Unicode and emoji tag names | Phase 1 |

---

## Test Cases

### TC-VER-TAG-001 — Tag.Index.Completeness

**Planguage Tag:** `Tag.Index.Completeness`
**Gist:** All `#tag` occurrences in vault body text must be discovered and indexed by VaultIndex, excluding only occurrences inside fenced code blocks, indented code blocks, math blocks, and HTML comments.
**Type:** Both
**BDD Reference:** [[bdd/features/tags]] — `Inline tag is indexed correctly in the vault tag registry`, `Tag inside fenced code block is NOT indexed`, `Tag inside math block is NOT indexed`
**Phase:** Phase 1

**Setup:**

- A vault with at least 10 documents. Each document contains:
  - At least 5 inline `#tag` occurrences in body text (paragraphs, headings, list items).
  - At least 2 `#tag` occurrences inside fenced code blocks (to be excluded).
  - At least 1 `#tag` occurrence inside a `$$...$$` math block (to be excluded).
- An `.obsidian/` marker directory at the vault root.

**Scripted steps:**

```gherkin
Given a vault with at least 10 documents, each containing:
  | token context               | example                          | expected in index |
  | body paragraph              | "Study #research today"          | yes               |
  | heading                     | "## #project work"               | yes               |
  | list item                   | "- #meeting note"                | yes               |
  | inside fenced code block    | "```\n#not-a-tag\n```"           | no                |
  | inside math block           | "$$\n#not-a-tag-math\n$$"        | no                |

When VaultIndex build is run (triggered by textDocument/didOpen for all docs)

Then for each document, VaultIndex contains all and only body-text #tag occurrences
And code-block and math-block tags are absent from VaultIndex for all documents
And (indexed body-text tags / actual body-text tags across all docs) × 100 = 100
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 10 documents (`notes/doc-01.md` through `notes/doc-10.md`). Each document follows this pattern:

   ```markdown
   # Doc N

   Body text with #tag-body-1 inline.
   More text with #tag-body-2 here.
   - List item #tag-body-3
   ## Heading with #tag-body-4
   Final paragraph #tag-body-5

   ```python
   # comment with #tag-code-1
   x = #tag-code-2
   ```

   $$
   #tag-math-1 = mc^2
   $$

   ```
3. Agent spawns server: `bun run start 2>/dev/null &`

4. Agent sends `initialize` + `initialized`.
5. Agent sends `textDocument/didOpen` for all 10 documents.
6. Agent queries the vault tag registry (via `textDocument/completion` at `#` in a scratch document, or via a test inspection endpoint) to enumerate all indexed tags.
7. For each document, agent enumerates expected body-text tags from fixture content (manually computed from the written fixture: 5 per document = 50 total).
8. Agent verifies all 50 expected body-text tags appear in the registry.
9. Agent verifies none of the code-block or math-block tags appear in the registry.
10. Agent computes (indexed body-text tags / 50 expected) × 100; asserts 100%.
11. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of body-text `#tag` tokens indexed; 0 code-block or math-block tags in the index.
**Fail criterion:** Any body-text `#tag` token absent from VaultIndex.

---

### TC-VER-TAG-002 — Tag.Hierarchy.Awareness

**Planguage Tag:** `Tag.Hierarchy.Awareness`
**Gist:** The tag index must support hierarchical parent-tag queries such that querying `#project` also returns documents and positions tagged with `#project/active` and `#project/done`.
**Type:** Both
**BDD Reference:** [[bdd/features/tags]] — `Nested tag hierarchy is preserved`
**Phase:** Phase 1

**Setup:**

- A vault with at least 3 parent tags, each with at least 2 child tags:
  - `#project/active`, `#project/done` (parent: `#project`)
  - `#area/work`, `#area/personal` (parent: `#area`)
  - `#topic/science`, `#topic/history` (parent: `#topic`)
- Parent tags also appearing standalone in at least one document (e.g., `#project` without a slash).
- Documents spread across the vault so that each child tag appears in at least 2 documents.

**Scripted steps:**

```gherkin
Given the vault is fully indexed
And the vault contains documents with #project, #project/active, #project/done
And the vault contains documents with #area/work, #area/personal
And the vault contains documents with #topic/science, #topic/history

# Parent-tag references query
When a textDocument/references request is made on a "#project" occurrence
Then the references list includes all positions of "#project" across the vault
And the references list includes all positions of "#project/active" across the vault
And the references list includes all positions of "#project/done" across the vault

# Parent-tag completion query
When a textDocument/completion request is made after "#proj" in a scratch document
Then the completion list includes "project"
And the completion list includes "project/active"
And the completion list includes "project/done"

# Coverage metric
Then (parent-tag requests returning complete child set / 3 parent-tag requests) × 100 = 100
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 8 documents:
   - `notes/proj-overview.md`: contains `#project` and `#project/active`.
   - `notes/proj-done.md`: contains `#project/done` and `#project`.
   - `notes/work-notes.md`: contains `#area/work`.
   - `notes/personal.md`: contains `#area/personal` and `#area`.
   - `notes/science.md`: contains `#topic/science`.
   - `notes/history.md`: contains `#topic/history` and `#topic`.
   - `notes/mixed.md`: contains `#project/active` and `#area/work`.
   - `notes/scratch.md`: empty body (used for completion requests).
3. Agent spawns server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` + `initialized`.
5. Agent sends `textDocument/didOpen` for all documents.

**References query test (per parent tag):**
6. For each of the 3 parent tags (`#project`, `#area`, `#topic`), agent sends `textDocument/references` at a position on a parent-tag occurrence in the appropriate document.
7. Agent asserts the response includes all positions of the parent tag AND all positions of each child tag.
8. Agent computes (parent-tag requests returning complete child set / 3) × 100; asserts 100%.

**Completion query test:**
9. Agent sends `textDocument/completion` at position after `#proj` in `notes/scratch.md`.
10. Agent asserts completion list includes `project`, `project/active`, `project/done`.
11. Agent sends `textDocument/completion` at position after `#area` in `notes/scratch.md`.
12. Agent asserts completion list includes `area`, `area/work`, `area/personal`.
13. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of parent-tag queries return the complete descendant set in both references and completion.
**Fail criterion:** Any parent-tag query that omits a known child-tag result.

---

### TC-VER-TAG-003 — Tag.YAML.Equivalence

**Planguage Tag:** `Tag.YAML.Equivalence`
**Gist:** Tag values declared in `tags:` YAML frontmatter must be indexed identically to the same tag value appearing as inline `#tag` syntax in the document body, with no distinction between the two sources in the tag index.
**Type:** Both
**BDD Reference:** [[bdd/features/tags]] — `YAML frontmatter tags are equivalent to inline tags`
**Phase:** Phase 1

**Setup:**

- A vault with at least 5 documents. For each document:
  - At least 2 tags declared in `tags:` YAML frontmatter.
  - At least 2 of the same tag values appearing as inline `#tag` in the body.
- One additional document using only frontmatter tags (no inline tags) to test frontmatter-only indexing.
- One additional document using only inline tags (no frontmatter) to test inline-only indexing.

**Scripted steps:**

```gherkin
Given "notes/mixed-tags.md" contains:
  """
  ---
  tags:
    - project/active
    - research
  ---
  # Mixed Tags Note
  This doc has #project/active and #research inline too.
  """

When VaultIndex build runs (textDocument/didOpen for "notes/mixed-tags.md")

Then the tag index entry for "project/active" includes "notes/mixed-tags.md"
And the tag index entry for "research" includes "notes/mixed-tags.md"
And querying "project/active" returns both the frontmatter source location and the inline source location from "notes/mixed-tags.md"
And the index does NOT distinguish by source (both sources appear in the same result set)

And for a document with only frontmatter tags:
  When textDocument/references is issued on those tags
  Then the document appears in the results

And for a document with only inline tags:
  When textDocument/references is issued on those tags
  Then the document appears in the results

And (YAML tag values correctly indexed as equivalent / total YAML tag values tested) × 100 = 100
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 5 documents, each with the mixed frontmatter + inline pattern described in Setup.
3. Agent writes `notes/frontmatter-only.md` with `tags: [exclusive-fm-tag]` frontmatter and no inline tags.
4. Agent writes `notes/inline-only.md` with no frontmatter and `#exclusive-inline-tag` in body.
5. Agent spawns server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` + `initialized`.
7. Agent sends `textDocument/didOpen` for all documents.

**For each document with mixed sources:**
8. For each frontmatter tag value, agent sends `textDocument/references` on a known occurrence of that tag name anywhere in the vault.
9. Agent verifies the document appears in the result set.
10. Agent verifies the result set contains both the frontmatter position and the inline position for that document (i.e., at least 2 locations per document per tag that has both sources).
11. Agent verifies the index does not return different result sets for the same tag name based on source type.

**Frontmatter-only document:**
12. Agent sends `textDocument/references` on `#exclusive-fm-tag`.
13. Agent asserts `notes/frontmatter-only.md` appears in results.

**Inline-only document:**
14. Agent sends `textDocument/references` on `#exclusive-inline-tag`.
15. Agent asserts `notes/inline-only.md` appears in results.

1. Agent computes (YAML tag values correctly indexed as equivalent / total YAML tag values tested) × 100; asserts 100%.
2. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of YAML tag values appear in the index equivalent to inline tags; no source-based asymmetry in find-references results.
**Fail criterion:** Any YAML tag value absent from the vault tag index, or any tag index that returns different results for the same tag name depending on source.

---

### TC-VER-TAG-004 — Tag.Completion.Unicode

**Planguage Tag:** `Tag.Completion.Unicode`
**Gist:** Tag completion must successfully parse and return candidates for tag names containing Unicode letters (including non-Latin scripts) and emoji characters.
**Type:** Both
**BDD Reference:** [[bdd/features/tags]] — `Unicode tag with emoji is indexed`; Cyrillic, Arabic, CJK, and mixed-ASCII sub-cases: **BDD gap**
**Phase:** Phase 1

**Setup:**

- A vault with at least 8 documents, each containing at least one tag from the following Unicode categories:
  - CJK ideograph: `#漢字`
  - Cyrillic: `#привет`
  - Arabic: `#مرحبا`
  - Emoji: `#📚reading`
  - Mixed ASCII + Unicode: `#project日本`
  - Additional emoji variant: `#🚀launch`
  - Latin with diacritics: `#café`
  - Mixed emoji + ASCII: `#✅done`
- A scratch document `notes/unicode-scratch.md` used for completion queries.

**Scripted steps:**

```gherkin
Given a vault with documents containing Unicode tags:
  | tag name        | Unicode category              |
  | #漢字           | CJK ideograph                 |
  | #привет         | Cyrillic                      |
  | #مرحبا          | Arabic                        |
  | #📚reading      | Emoji + ASCII                 |
  | #project日本    | Mixed ASCII + CJK             |
  | #🚀launch       | Emoji + ASCII                 |
  | #café           | Latin with diacritics         |
  | #✅done         | Emoji + ASCII                 |

When VaultIndex build runs (textDocument/didOpen for all documents)
Then no parse errors appear in the server log for any Unicode tag
And each of the 8 Unicode tags appears in the VaultIndex tag registry with correct encoding

When a textDocument/completion request is made after "#漢" in "notes/unicode-scratch.md"
Then the completion list includes "漢字"

When a textDocument/completion request is made after "#при" in "notes/unicode-scratch.md"
Then the completion list includes "привет"

When a textDocument/completion request is made after "#مر" in "notes/unicode-scratch.md"
Then the completion list includes "مرحبا"

When a textDocument/completion request is made after "#📚" in "notes/unicode-scratch.md"
Then the completion list includes "📚reading"

When a textDocument/completion request is made after "#project日" in "notes/unicode-scratch.md"
Then the completion list includes "project日本"

And (Unicode tags parsing, indexing, and completing successfully / 8 total) × 100 = 100
```

**Agent-driven steps:**

1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 8 documents with Unicode tags:
   - `notes/cjk.md`: body contains `#漢字 annotation`.
   - `notes/cyrillic.md`: body contains `#привет note`.
   - `notes/arabic.md`: body contains `#مرحبا entry`.
   - `notes/emoji-books.md`: body contains `#📚reading list`.
   - `notes/mixed.md`: body contains `#project日本 update`.
   - `notes/emoji-rocket.md`: body contains `#🚀launch plan`.
   - `notes/latin-diacritic.md`: body contains `#café review`.
   - `notes/emoji-check.md`: body contains `#✅done item`.
3. Agent writes `notes/unicode-scratch.md` with empty body.
4. Agent spawns server: `bun run start 2>/dev/null &`
5. Agent sends `initialize` + `initialized`.
6. Agent sends `textDocument/didOpen` for all 9 documents.
7. Agent checks server stderr/log output for any parse error lines referencing Unicode tag names; asserts zero parse errors.
8. Agent verifies each of the 8 Unicode tags appears in the VaultIndex registry by querying via `textDocument/completion` at `#` in `notes/unicode-scratch.md` and scanning the returned items for each expected tag name.
9. For each of the 5 Unicode prefix completion tests listed in Scripted steps:
   - Agent sends `textDocument/completion` at the position immediately after the given Unicode prefix in `notes/unicode-scratch.md`.
   - Agent asserts the corresponding tag name appears in the completion list (matching the full tag text, including Unicode characters, with exact encoding).
10. Agent counts passing cases across (a) parse, (b) index, (c) completion for all 8 tags; asserts (passing / 8) × 100 = 100%.
11. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of Unicode tag test cases handle correctly: parse without error, appear in VaultIndex, and appear in completion candidates when prefix is typed.
**Fail criterion:** Any valid Unicode tag that fails to parse, fails to index, or fails to appear in completion candidates.

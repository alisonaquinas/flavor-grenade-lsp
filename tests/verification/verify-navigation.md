---
title: Verification — Navigation
tags: [test/verification, "requirements/navigation"]
aliases: [Verify Navigation]
---

# Verification — Navigation

## Purpose

This document defines the scripted and agent-driven verification test cases for the Navigation
Requirements of flavor-grenade-lsp. Each test case is derived directly from the Planguage
`Meter` field of its corresponding requirement and references the BDD scenarios in
[[bdd/features/navigation]] where coverage exists. These tests are the authoritative verification
record for the `textDocument/definition`, `textDocument/references`, and `textDocument/codeLens`
capabilities across all OFM link types.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Navigation.Definition.AllLinkTypes` | `textDocument/definition` returns a valid `Location` for all four OFM link types | Phase 1 |
| `Navigation.References.Completeness` | `textDocument/references` returns every vault reference to the target with no omissions | Phase 1 |
| `Navigation.CodeLens.Count` | Each heading displays a code lens with the exact vault-wide reference count | Phase 1 |

---

## Test Cases

### TC-VER-NAV-001 — Navigation.Definition.AllLinkTypes

**Planguage Tag:** `Navigation.Definition.AllLinkTypes`
**Gist:** The `textDocument/definition` handler must return a valid `Location` response for cursor positions on wiki-links, embed links, block references, and tag occurrences.
**Type:** Both
**BDD Reference:** [[bdd/features/navigation]] — `Go-to-definition on [[doc]] navigates to target document` (wiki-link sub-case), `Go-to-definition on [[doc#heading]] navigates to the heading line` (embed/heading sub-case), `Go-to-definition on [[doc#^blockid]] navigates to the block anchor line` (block-ref sub-case); tag sub-case: **BDD gap**
**Phase:** Phase 1

**Setup:**
- A vault with the following documents:
  - `notes/target.md` — contains headings `## Alpha Heading`, `## Beta Heading`, `## Gamma Heading`; block anchors `^block-a`, `^block-b`, `^block-c` on body lines; and inline tags `#topic-x`.
  - `notes/embed-source.md` — contains `![[target]]`, `![[target#Alpha Heading]]`, `![[target#Beta Heading]]`.
  - `notes/wiki-source.md` — contains `[[target]]`, `[[target#Alpha Heading]]`, `[[target#Gamma Heading]]`.
  - `notes/block-source.md` — contains `[[target#^block-a]]`, `[[target#^block-b]]`, `[[target#^block-c]]`.
  - `notes/tag-source.md` — contains `#topic-x` three times in body text.

The four sub-cases are tested in sequence. Each sub-case exercises exactly one OFM link type with at least 3 valid occurrences.

---

#### Sub-case A — Wiki-link (`[[doc]]` and `[[doc#heading]]`)

**Scripted steps:**

```gherkin
Given the cursor is on "[[target]]" in "notes/wiki-source.md"
When a textDocument/definition request is made
Then the response is a Location with uri "notes/target.md"
And the target range is at line 0, character 0

Given the cursor is on "[[target#Alpha Heading]]" in "notes/wiki-source.md"
When a textDocument/definition request is made
Then the response is a Location with uri "notes/target.md"
And the target range covers the "## Alpha Heading" heading line

Given the cursor is on "[[target#Gamma Heading]]" in "notes/wiki-source.md"
When a textDocument/definition request is made
Then the response is a Location with uri "notes/target.md"
And the target range covers the "## Gamma Heading" heading line
```

**Agent-driven steps:**
1. Agent creates vault with `.obsidian/` marker directory and writes all fixture documents listed in Setup.
2. Agent spawns server: `bun run start 2>/dev/null &`
3. Agent sends `initialize` + `initialized`.
4. Agent sends `textDocument/didOpen` for all fixture documents.
5. For each of the 3 wiki-link positions in `notes/wiki-source.md`, agent sends `textDocument/definition` with cursor on the link token.
6. Agent asserts each response is a non-null `Location` with `uri` pointing to `notes/target.md` and `range` covering the correct target line.

---

#### Sub-case B — Embed link (`![[doc]]` and `![[doc#heading]]`)

**Scripted steps:**

```gherkin
Given the cursor is on "![[target]]" in "notes/embed-source.md"
When a textDocument/definition request is made
Then the response is a Location with uri "notes/target.md"
And the target range is at line 0, character 0

Given the cursor is on "![[target#Alpha Heading]]" in "notes/embed-source.md"
When a textDocument/definition request is made
Then the response is a Location with uri "notes/target.md"
And the target range covers the "## Alpha Heading" heading line

Given the cursor is on "![[target#Beta Heading]]" in "notes/embed-source.md"
When a textDocument/definition request is made
Then the response is a Location with uri "notes/target.md"
And the target range covers the "## Beta Heading" heading line
```

**Agent-driven steps:**
1. (Vault from sub-case A is reused.)
2. For each of the 3 embed positions in `notes/embed-source.md`, agent sends `textDocument/definition` with cursor on the embed token.
3. Agent asserts each response is a non-null `Location` pointing to the correct target in `notes/target.md`.

---

#### Sub-case C — Block reference (`[[doc#^blockid]]`)

**Scripted steps:**

```gherkin
Given the cursor is on "[[target#^block-a]]" in "notes/block-source.md"
When a textDocument/definition request is made
Then the response is a Location with uri "notes/target.md"
And the target range covers the line containing "^block-a"

Given the cursor is on "[[target#^block-b]]" in "notes/block-source.md"
When a textDocument/definition request is made
Then the response is a Location with uri "notes/target.md"
And the target range covers the line containing "^block-b"

Given the cursor is on "[[target#^block-c]]" in "notes/block-source.md"
When a textDocument/definition request is made
Then the response is a Location with uri "notes/target.md"
And the target range covers the line containing "^block-c"
```

**Agent-driven steps:**
1. (Vault from sub-case A is reused.)
2. For each of the 3 block-reference positions in `notes/block-source.md`, agent sends `textDocument/definition` with cursor on the `^block-*` token.
3. Agent asserts each response is a non-null `Location` pointing to the correct anchor line in `notes/target.md`.

---

#### Sub-case D — Tag occurrence (`#tag`)

**Scripted steps:**

```gherkin
Given the cursor is on the first "#topic-x" in "notes/tag-source.md"
When a textDocument/definition request is made
Then the response is a Location pointing to the canonical definition site for "#topic-x"
And the response is non-null

Given the cursor is on the second "#topic-x" in "notes/tag-source.md"
When a textDocument/definition request is made
Then the response is a non-null Location

Given the cursor is on the third "#topic-x" in "notes/tag-source.md"
When a textDocument/definition request is made
Then the response is a non-null Location
```

**Agent-driven steps:**
1. (Vault from sub-case A is reused.)
2. For each of the 3 tag positions in `notes/tag-source.md`, agent sends `textDocument/definition` with cursor on the `#topic-x` token.
3. Agent asserts each response is a non-null `Location` (target may be the first occurrence or a canonical declaration site — must be non-null and point within the vault).

---

**Pass criterion:** 100% of link types supported (4/4); 100% of valid occurrences (at least 3 per type) return a correct, non-null `Location`.
**Fail criterion:** Any of the four link types returning null or an incorrect `Location` for a valid occurrence.

---

### TC-VER-NAV-002 — Navigation.References.Completeness

**Planguage Tag:** `Navigation.References.Completeness`
**Gist:** The `textDocument/references` handler must return every reference in the vault folder that resolves to the target document, heading, block anchor, or tag — with no omissions.
**Type:** Both
**BDD Reference:** [[bdd/features/navigation]] — `Find-references on a heading returns all wiki-links targeting that heading`, `Find-references with includeDeclaration=true includes the definition site`
**Phase:** Phase 1

**Setup:**
- A vault with at least 15 documents.
- A target document `notes/target.md` with heading `## Section Alpha`.
- At least 10 other documents containing references to `notes/target.md`, mixed across:
  - `[[target]]` (plain wiki-link)
  - `![[target]]` (embed link)
  - `[[target#Section Alpha]]` (heading reference)
- At least 5 documents containing no reference to the target (to test absence of false positives).

**Scripted steps:**

```gherkin
Given a vault with at least 15 documents
And at least 10 documents reference "notes/target.md" (mix of plain, embed, and heading links)

When a textDocument/references request is made at the document title position
  in "notes/target.md" with includeDeclaration=false

Then the returned Location[] contains every reference found by independent full-text scan
And (locations in LSP response / locations found by scan) × 100 = 100
And no reference found by independent scan is absent from the LSP response
```

**Agent-driven steps:**
1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes `notes/target.md` with heading `## Section Alpha`.
3. Agent writes 10 referencing documents: `ref-01.md` through `ref-10.md`, each containing at least one of `[[target]]`, `![[target]]`, or `[[target#Section Alpha]]`.
4. Agent writes 5 non-referencing documents with unrelated content.
5. Agent spawns server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` + `initialized`.
7. Agent sends `textDocument/didOpen` for all documents.
8. Agent sends `textDocument/references` at the document title position of `notes/target.md` with `context.includeDeclaration: false`.
9. Agent reads the returned `Location[]` from stdout.
10. Agent independently scans all document source text for `[[target]]`, `![[target]]`, `[[target#Section Alpha]]` (regex scan of fixture content) and builds the expected set.
11. Agent compares the two sets; asserts (LSP response count / expected count) × 100 = 100%.
12. Agent asserts no expected location is absent from the LSP response.
13. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of actual references returned; no reference found by independent scan absent from the LSP response.
**Fail criterion:** Any reference found by independent scan that is absent from the LSP response (i.e., < 100%).

---

### TC-VER-NAV-003 — Navigation.CodeLens.Count

**Planguage Tag:** `Navigation.CodeLens.Count`
**Gist:** Each heading in an indexed document must display a `textDocument/codeLens` entry showing the exact count of vault-wide references that resolve to that heading, and the count must be updated when the vault index changes.
**Type:** Both
**BDD Reference:** [[bdd/features/navigation]] — `Code lens on a heading with references shows correct count`, `Code lens on an orphaned heading shows 0 references`
**Phase:** Phase 1

**Setup:**
- A vault with at least 10 documents.
- At least 5 headings across the vault with a known, non-zero reference count.
- At least 3 headings with zero references (orphaned headings).
- A `notes/hub.md` document with `## Central Heading` referenced by at least 2 other documents.

**Scripted steps:**

```gherkin
Given the vault is fully indexed
And "notes/hub.md" contains "## Central Heading"
And "notes/ref-a.md" contains "[[hub#Central Heading]]"
And "notes/ref-b.md" contains "[[hub#Central Heading]]"

When a textDocument/codeLens request is made for "notes/hub.md"
Then the code lens on "## Central Heading" shows "2 references"

When a textDocument/codeLens request is made for a document with an orphaned heading
Then the code lens on that heading shows "0 references"

When "notes/ref-c.md" is written with "[[hub#Central Heading]]"
And the vault index is updated (textDocument/didOpen for ref-c.md)
And a textDocument/codeLens request is made for "notes/hub.md"
Then the code lens on "## Central Heading" shows "3 references"
```

**Agent-driven steps:**
1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 10 documents; `notes/hub.md` contains `## Central Heading` and `## Orphaned Heading`; `notes/ref-a.md` and `notes/ref-b.md` each contain `[[hub#Central Heading]]`; remaining documents have headings with 0, 1, and 2 references as planned.
3. Agent spawns server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` + `initialized`.
5. Agent sends `textDocument/didOpen` for all documents.
6. Agent sends `textDocument/codeLens` for each document; collects all code lens entries.
7. For each heading in each document, agent finds its code lens entry and reads the count from `command.title` (expected format: `"N references"`).
8. Agent independently computes the expected count for each heading by scanning all fixture document content for `[[hubName#Heading]]` and `![[hubName#Heading]]` patterns.
9. Agent compares reported count to expected count for each heading; asserts (headings with correct count / total headings) × 100 = 100%.
10. Agent writes a new document `notes/ref-c.md` containing `[[hub#Central Heading]]`.
11. Agent sends `textDocument/didOpen` for `notes/ref-c.md` (triggering index update).
12. Agent sends `textDocument/codeLens` for `notes/hub.md`.
13. Agent asserts the code lens on `## Central Heading` now shows `"3 references"`.
14. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of headings display correct reference counts; count updates correctly after index change.
**Fail criterion:** Any heading whose code lens count does not match the actual reference count.

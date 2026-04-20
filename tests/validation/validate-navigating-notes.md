---
title: Validation — Navigating Notes
tags: [test/validation, requirements/user]
aliases: [Validate Navigating Notes]
---

# Validation — Navigating Notes

## Purpose

This validation plan confirms that vault authors can move through their knowledge graph efficiently using the links they have already written. A vault author should be able to click or activate any link — a plain note reference, a link to a specific heading, or a link to a marked block — and land at the correct location without knowing file paths or folder layouts. They should also be able to discover every note that cites a given note or heading in a single action, and see at a glance how heavily cross-referenced each heading is. These capabilities reduce the friction of maintaining a well-connected vault and give authors confidence before renaming or restructuring content.

## User Requirements Covered

| User Req Tag | Goal | Mapped FRs | Verification Coverage |
|---|---|---|---|
| `User.Navigate.JumpToNote` | Navigate to a linked note | `Navigation.Definition.AllLinkTypes`, `Link.Wiki.StyleBinding`, `Link.Wiki.AliasResolution` | TC-VER-NAV-001, TC-VER-WIKI-001, TC-VER-WIKI-002 |
| `User.Navigate.FindAllReferences` | See everywhere a note or heading is referenced | `Navigation.References.Completeness` | TC-VER-NAV-002 |
| `User.Navigate.SeeReferenceCount` | See at a glance how many notes link to a heading | `Navigation.CodeLens.Count` | TC-VER-NAV-003 |

## Test Cases

### TC-VAL-NAV-001 — User.Navigate.JumpToNote

**User Req Tag:** `User.Navigate.JumpToNote`
**Goal:** Navigate to a linked note
**Type:** Both
**Mapped FRs:** `Navigation.Definition.AllLinkTypes`, `Link.Wiki.StyleBinding`, `Link.Wiki.AliasResolution` — see [[tests/verification/verify-navigation]], [[tests/verification/verify-wiki-links]]
**Verification coverage:** TC-VER-NAV-001, TC-VER-WIKI-001, TC-VER-WIKI-002

**Scenario (user perspective):**
As a vault author, I am reading a note that references other notes using `[[wiki-links]]`. I want to place my cursor anywhere on a link — whether it points to a whole note, a specific section within that note, or a specific labelled block — and immediately jump to the target location, without manually searching for the file.

**Scripted scenario:**

```gherkin
Feature: Jump to a linked note or section

  Scenario: Author jumps to a plain note link
    Given a vault with notes "project-overview.md" and "meeting-notes.md"
    And "project-overview.md" contains the text "See also [[meeting-notes]]"
    When I position the cursor on "[[meeting-notes]]" and activate go-to-definition
    Then the editor opens "meeting-notes.md"
    And the cursor is placed at the top of the file

  Scenario: Author jumps to a heading link
    Given "project-overview.md" contains "See [[meeting-notes#Action Items]]"
    And "meeting-notes.md" contains the heading "## Action Items"
    When I position the cursor on "[[meeting-notes#Action Items]]" and activate go-to-definition
    Then the editor opens "meeting-notes.md"
    And the cursor is placed on the "## Action Items" heading line

  Scenario: Author jumps to a block reference link
    Given "project-overview.md" contains "As noted in [[meeting-notes#^decision-one]]"
    And "meeting-notes.md" contains a block marked with "^decision-one"
    When I position the cursor on "[[meeting-notes#^decision-one]]" and activate go-to-definition
    Then the editor opens "meeting-notes.md"
    And the cursor is placed on the line containing "^decision-one"
```

**Agent-driven walkthrough:**

1. Agent creates a vault with three notes: `notes/target.md` (contains `## Section Alpha` and a block marked `^anchor-x`), `notes/referrer-a.md` (contains `[[target]]` and `[[target#Section Alpha]]`), and `notes/referrer-b.md` (contains `[[target#^anchor-x]]`).
2. Agent opens the vault in the LSP server and waits for indexing to complete.
3. Agent sends a `textDocument/definition` request with the cursor positioned on `[[target]]` in `referrer-a.md`.
4. Agent confirms the response Location points to `notes/target.md` at line 0, character 0.
5. Agent sends a `textDocument/definition` request with the cursor on `[[target#Section Alpha]]` in `referrer-a.md`.
6. Agent confirms the response Location points to the `## Section Alpha` heading line in `notes/target.md`.
7. Agent sends a `textDocument/definition` request with the cursor on `[[target#^anchor-x]]` in `referrer-b.md`.
8. Agent confirms the response Location points to the block anchor line in `notes/target.md`.

**Pass:** For every link style (plain, heading, block), the editor opens the correct target file and positions the cursor at the expected location.
**Fail:** Any link type fails to resolve, opens the wrong file, or places the cursor at an incorrect position.

---

### TC-VAL-NAV-002 — User.Navigate.FindAllReferences

**User Req Tag:** `User.Navigate.FindAllReferences`
**Goal:** See everywhere a note or heading is referenced
**Type:** Both
**Mapped FRs:** `Navigation.References.Completeness` — see [[tests/verification/verify-navigation]]
**Verification coverage:** TC-VER-NAV-002

**Scenario (user perspective):**
As a vault author, I am considering renaming a heading in one of my notes and want to know how many other notes will be affected. I place my cursor on the heading and ask the editor to show all references to it. I expect to see a complete list — one entry per vault note that links to that heading — so I can review each before deciding whether to proceed.

**Scripted scenario:**

```gherkin
Feature: Find all references to a note heading

  Scenario: Author finds all notes that link to a specific heading
    Given a vault where "methods.md" contains the heading "## Data Collection"
    And "report-2024.md" links to "[[methods#Data Collection]]"
    And "report-2023.md" links to "[[methods#Data Collection]]"
    And "index.md" does not link to that heading
    When I place the cursor on "## Data Collection" in "methods.md" and request all references
    Then a reference list appears containing an entry for "report-2024.md"
    And the list contains an entry for "report-2023.md"
    And the list contains exactly 2 entries

  Scenario: Author requests references with declaration included
    Given the same vault setup as above
    When I place the cursor on "## Data Collection" and request all references including the definition
    Then the list contains 3 entries: the heading definition and both referencing notes
```

**Agent-driven walkthrough:**

1. Agent creates a vault with `notes/target.md` (containing `## Section Alpha`), `notes/referrer-a.md` (containing `[[target#Section Alpha]]`), and `notes/referrer-b.md` (also containing `[[target#Section Alpha]]`), plus `notes/orphaned.md` with no links to `Section Alpha`.
2. Agent opens the vault in the LSP server and waits for full indexing.
3. Agent sends a `textDocument/references` request with the cursor on `## Section Alpha` in `notes/target.md` and `includeDeclaration=false`.
4. Agent confirms the references list contains two items: the occurrence in `referrer-a.md` and the occurrence in `referrer-b.md`.
5. Agent confirms `notes/orphaned.md` does not appear in the list.
6. Agent repeats with `includeDeclaration=true` and confirms the list grows to three items.

**Pass:** The references list is complete — it includes every vault note that links to the heading, no more, no less — and the `includeDeclaration` flag toggles whether the definition site itself appears.
**Fail:** Any referencing note is omitted, an unrelated note appears, or the reference count is wrong.

---

### TC-VAL-NAV-003 — User.Navigate.SeeReferenceCount

**User Req Tag:** `User.Navigate.SeeReferenceCount`
**Goal:** See at a glance how many notes link to a heading
**Type:** Both
**Mapped FRs:** `Navigation.CodeLens.Count` — see [[tests/verification/verify-navigation]]
**Verification coverage:** TC-VER-NAV-003

**Scenario (user perspective):**
As a vault author, I want to see a small reference count displayed above each heading in my notes while I am writing. This count updates as I add or remove links elsewhere in the vault, so I always have a live sense of which sections are heavily cited. I should be able to click the count to immediately open the same reference list I would get by asking for all references manually.

**Scripted scenario:**

```gherkin
Feature: Inline reference counts on headings

  Scenario: A well-referenced heading shows its count
    Given a vault where "concepts.md" contains "## Zettelkasten"
    And three other notes each link to "[[concepts#Zettelkasten]]"
    When I open "concepts.md" in the editor
    Then I see the annotation "3 references" displayed above the "## Zettelkasten" heading

  Scenario: An unreferenced heading shows zero
    Given "drafts.md" contains "## Scratch Area" with no links from other notes
    When I open "drafts.md" in the editor
    Then I see the annotation "0 references" displayed above the "## Scratch Area" heading

  Scenario: Clicking the reference count opens the reference list
    Given "concepts.md" has "## Zettelkasten" with 3 references shown
    When I activate the "3 references" annotation
    Then the editor opens the same reference list as using find-all-references on that heading
```

**Agent-driven walkthrough:**

1. Agent creates a vault with `notes/target.md` (containing `## Section Alpha` and `## Orphaned Heading`), `notes/referrer-a.md` (linking to `[[target#Section Alpha]]`), and `notes/referrer-b.md` (also linking to `[[target#Section Alpha]]`).
2. Agent opens the vault in the LSP server and waits for full indexing.
3. Agent sends a `textDocument/codeLens` request for `notes/target.md`.
4. Agent confirms the code lens on the `## Section Alpha` line displays `"2 references"` and that its command triggers `textDocument/references` for that heading.
5. Agent sends a `textDocument/codeLens` request for `notes/orphaned.md`.
6. Agent confirms the code lens on `## Orphaned Heading` displays `"0 references"`.

**Pass:** Every heading in every open note displays an accurate reference count that matches the actual number of vault links pointing to it, and the count is clickable to open the reference list.
**Fail:** Any heading shows no annotation, shows an incorrect count, or the annotation is not interactive.

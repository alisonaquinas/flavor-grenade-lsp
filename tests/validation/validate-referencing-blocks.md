---
title: Validation — Referencing Blocks
tags: [test/validation, requirements/user]
aliases: [Validate Referencing Blocks]
---

# Validation — Referencing Blocks

## Purpose

These test cases confirm that vault authors can create block-level anchors in their notes, reference those anchors from other notes, navigate directly to the referenced block, and receive a clear error when a referenced block no longer exists. The cases cover the full author workflow end-to-end and the completion experience when selecting a block anchor from a list.

## User Requirements Covered

| User Req Tag | Goal | Mapped FRs | Verification Coverage |
|---|---|---|---|
| User.Blocks.ReferenceSpecificText | Link to and jump to a specific block in another note | Block.Anchor.Indexing, Block.CrossRef.Diagnostic, Navigation.Definition.AllLinkTypes | TC-VER-BLOK-001, TC-VER-BLOK-002, TC-VER-NAV-001 |
| User.Blocks.CompleteBlockRef | Get block ID suggestions when referencing a block | Block.Completion.Offer, Block.Anchor.Lineend | TC-VER-BLOK-003, TC-VER-BLOK-004 |

## Test Cases

### TC-VAL-BLOK-001 — User.Blocks.ReferenceSpecificText

**User Req Tag:** `User.Blocks.ReferenceSpecificText`
**Goal:** Link to and jump to a specific block in another note
**Type:** Both
**Mapped FRs:** `Block.Anchor.Indexing` — see [[tests/verification/verify-blocks]], `Block.CrossRef.Diagnostic` — see [[tests/verification/verify-blocks]], `Navigation.Definition.AllLinkTypes` — see [[tests/verification/verify-navigation]]
**Verification coverage:** TC-VER-BLOK-001, TC-VER-BLOK-002, TC-VER-NAV-001

**Scenario (user perspective):**
As a vault author, I have a note called `Research Findings` that contains a key paragraph I want to cite from my `Project Summary` note. I mark the paragraph with a `^my-block` anchor at the end of the line in `Research Findings`. I then write a link `[[research-findings#^my-block]]` in `Project Summary`. I expect to be able to click that link and be taken directly to the anchored paragraph — and if I later delete the anchor from `Research Findings`, I expect the link in `Project Summary` to be flagged as broken so I can fix it.

**Scripted scenario:**

```gherkin
Feature: Full author flow for block anchors
  Scenario: Author creates anchor, references it, and navigates to it
    Given I have a note "research-findings.md" with a paragraph ending in "^key-insight"
    And I have a note "project-summary.md" containing "[[research-findings#^key-insight]]"
    When I navigate to the link "[[research-findings#^key-insight]]" in "project-summary.md"
    Then my editor moves to the paragraph marked "^key-insight" in "research-findings.md"

  Scenario: Anchor deleted — reference flagged as broken
    Given I have "project-summary.md" containing "[[research-findings#^key-insight]]"
    And the anchor "^key-insight" has been removed from "research-findings.md"
    When I open "project-summary.md"
    Then the link "[[research-findings#^key-insight]]" is shown as a broken reference
    And the error message names the missing anchor "key-insight"
```

**Agent-driven walkthrough:**

1. Agent creates a three-note vault:
   - `research-findings.md` — content:

     ```
     # Research Findings

     The survey showed a 40% improvement in completion rates. ^key-insight

     Further analysis is pending.
     ```

   - `literature-review.md` — content:

     ```
     # Literature Review

     Related work also found strong results. ^lit-finding
     ```

   - `project-summary.md` — content:

     ```
     # Project Summary

     See [[research-findings#^key-insight]] for the core data.
     Also see [[literature-review#^lit-finding]] for context.
     ```

2. Agent opens `project-summary.md` and verifies no diagnostics are published (both anchors exist)
3. Agent requests go-to-definition on the `[[research-findings#^key-insight]]` link and verifies the response points to the line containing `^key-insight` in `research-findings.md`
4. Agent requests go-to-definition on `[[literature-review#^lit-finding]]` and verifies it points to the correct line in `literature-review.md`
5. Agent simulates removing the `^key-insight` anchor from `research-findings.md` (edits the line to remove the trailing `^key-insight`)
6. Agent opens `project-summary.md` again and verifies a broken-reference error is now published naming `key-insight` as the missing anchor
7. Agent verifies the `[[literature-review#^lit-finding]]` link still produces no error (only the deleted anchor is affected)

**Pass:** Go-to-definition lands on the correct anchored paragraph in the target note. When an anchor is deleted, the referencing note immediately shows a broken-reference error naming the missing anchor. Unaffected links in the same note remain error-free.

**Fail:** Navigation lands on the wrong line or the top of the file, the broken-reference error is not shown after anchor deletion, or an unrelated valid link is incorrectly marked as broken.

---

### TC-VAL-BLOK-002 — User.Blocks.CompleteBlockRef

**User Req Tag:** `User.Blocks.CompleteBlockRef`
**Goal:** Get block ID suggestions when referencing a block
**Type:** Both
**Mapped FRs:** `Block.Completion.Offer` — see [[tests/verification/verify-blocks]], `Block.Anchor.Lineend` — see [[tests/verification/verify-blocks]]
**Verification coverage:** TC-VER-BLOK-003, TC-VER-BLOK-004

**Scenario (user perspective):**
As a vault author, I want to reference a specific block in my `Meeting Notes` note but I cannot remember the exact anchor IDs I used. I start typing `[[meeting-notes#^` and expect the editor to immediately offer me a list of all the anchors defined in `Meeting Notes` so I can pick the right one without having to open that note separately and search through it.

**Scripted scenario:**

```gherkin
Feature: Block anchor completion after [[note#^ trigger
  Scenario: Editor offers all known anchors from the target note
    Given "meeting-notes.md" defines anchors "^action-items", "^decisions", and "^next-steps"
    And "meeting-notes.md" has a line "Some prose ^not-at-end of sentence" where the caret is mid-line
    When I type "[[meeting-notes#^" in another note
    Then the editor suggests "action-items", "decisions", and "next-steps"
    And "not-at-end" does not appear as a suggestion
    And I can select one to complete the full reference "[[meeting-notes#^action-items]]"

  Scenario: Mid-sentence caret notation is not treated as a valid anchor
    Given "meeting-notes.md" contains "The cost was $5^2 dollars" (exponent notation)
    When I type "[[meeting-notes#^" in another note
    Then "2" does not appear as a suggested anchor
```

**Agent-driven walkthrough:**

1. Agent creates a three-note vault:
   - `meeting-notes.md` — content:

     ```
     # Meeting Notes — 2026-04-10

     The team agreed to proceed with the new approach. ^decisions

     Action items were assigned to each member. ^action-items

     We will reconvene in two weeks. ^next-steps

     The budget estimate is approximately $5^2 thousand (not an anchor).
     ```

   - `architecture-notes.md` — content:

     ```
     # Architecture Notes

     The layered design was preferred. ^arch-decision
     ```

   - `weekly-summary.md` — empty editing surface where completions are requested
2. Agent opens `weekly-summary.md` and requests completions immediately after `[[meeting-notes#^`
3. Agent verifies the completion list contains exactly `decisions`, `action-items`, and `next-steps`
4. Agent verifies that `2` (from the exponent notation `$5^2`) does not appear in the list
5. Agent selects the `action-items` completion and verifies the inserted text is `[[meeting-notes#^action-items]]`
6. Agent repeats the completion request with `[[architecture-notes#^` and verifies only `arch-decision` is offered — confirming completions are scoped to the specified target note

**Pass:** Completions after `[[note#^` offer all and only the valid line-end anchors from the named note. Mid-sentence caret notations are absent. Selecting a completion inserts the full, correct reference.

**Fail:** A known anchor is missing from the list, a mid-sentence caret notation appears as a candidate, completions from the wrong note are mixed in, or selecting a completion produces a malformed reference string.

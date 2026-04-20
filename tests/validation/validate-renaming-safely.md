---
title: Validation — Renaming Safely
tags: [test/validation, requirements/user]
aliases: [Validate Renaming Safely]
---

# Validation — Renaming Safely

## Purpose

This validation plan confirms that vault authors can rename notes and headings with complete confidence that every link across the vault is updated in a single operation. A vault author should never have to hunt down stale references manually after a rename: whether they are renaming a note file or a heading within a note, all links that pointed to the old name should automatically reflect the new name. Links that carry a custom display alias should have their target updated while their visible label is left untouched. The plan also verifies that the editor correctly refuses rename attempts in locations where a rename would produce an ambiguous or invalid result, giving the author a clear explanation rather than silently producing broken markup.

## User Requirements Covered

| User Req Tag | Goal | Mapped FRs | Verification Coverage |
|---|---|---|---|
| `User.Rename.RenameNoteEverywhere` | Rename a note and have all links updated automatically | `Rename.Refactoring.Completeness`, `Rename.StyleBinding.Consistency` | TC-VER-REN-001, TC-VER-REN-003 |
| `User.Rename.RenameHeadingEverywhere` | Rename a heading and have all links to it updated | `Rename.Refactoring.Completeness`, `Rename.Prepare.Rejection` | TC-VER-REN-001, TC-VER-REN-002 |

## Test Cases

### TC-VAL-REN-001 — User.Rename.RenameNoteEverywhere

**User Req Tag:** `User.Rename.RenameNoteEverywhere`
**Goal:** Rename a note and have all links updated automatically
**Type:** Both
**Mapped FRs:** `Rename.Refactoring.Completeness`, `Rename.StyleBinding.Consistency` — see [[tests/verification/verify-rename]]
**Verification coverage:** TC-VER-REN-001, TC-VER-REN-003

**Scenario (user perspective):**
As a vault author, I have been keeping a note called `Meeting Notes.md` where I record all team meetings. Over time I have accumulated many other notes that link to it using `[[Meeting Notes]]`. I decide the name no longer fits — what used to be ad hoc meetings is now a recurring ritual — so I want to rename the file to `Weekly Sync.md`. I expect every link across my entire vault to be updated to `[[Weekly Sync]]` the moment I confirm the rename. Links that include a custom display label, such as `[[Meeting Notes|see the meetings log]]`, should be updated to point to the new name while keeping the label `see the meetings log` exactly as I wrote it. I do not want to scan through twenty notes manually to find every reference.

**Scripted scenario:**

```gherkin
Feature: Rename a note and update all vault links

  Scenario: Author renames a note and all plain links are updated
    Given a vault containing:
      | note                    | content                                                     |
      | Meeting Notes.md        | # Meeting Notes\n## Action Items\nOur regular check-in.    |
      | Weekly Plan.md          | See [[Meeting Notes]] for last session's decisions.         |
      | Project Tracker.md      | Referenced in [[Meeting Notes]] and [[Meeting Notes]].      |
      | Team Directory.md       | No links to Meeting Notes here.                             |
    When I rename "Meeting Notes.md" to "Weekly Sync.md"
    Then "Weekly Plan.md" contains "[[Weekly Sync]]" instead of "[[Meeting Notes]]"
    And "Project Tracker.md" contains "[[Weekly Sync]]" in both places
    And "Team Directory.md" is unchanged
    And the file is now stored as "Weekly Sync.md"

  Scenario: Aliased links preserve their display label after rename
    Given a vault where "Research Hub.md" links to "[[Meeting Notes|our meeting log]]"
    When I rename "Meeting Notes.md" to "Weekly Sync.md"
    Then "Research Hub.md" contains "[[Weekly Sync|our meeting log]]"
    And the display label "our meeting log" is not altered

  Scenario: Heading-anchored links update their file-stem portion
    Given a vault where "Sprint Review.md" links to "[[Meeting Notes#Action Items]]"
    When I rename "Meeting Notes.md" to "Weekly Sync.md"
    Then "Sprint Review.md" contains "[[Weekly Sync#Action Items]]"
    And the heading fragment "#Action Items" is preserved unchanged
```

**Agent-driven walkthrough:**

1. Agent creates a vault with six notes: `Meeting Notes.md` (containing `# Meeting Notes` and `## Action Items`), `Weekly Plan.md` (containing `[[Meeting Notes]]`), `Project Tracker.md` (containing `[[Meeting Notes]]` twice), `Research Hub.md` (containing `[[Meeting Notes|our meeting log]]`), `Sprint Review.md` (containing `[[Meeting Notes#Action Items]]`), and `Team Directory.md` (containing no links to `Meeting Notes`).
2. Agent opens the vault in the server and waits for full indexing to complete.
3. Agent triggers a rename of `Meeting Notes.md` to `Weekly Sync.md` and captures the proposed workspace edit.
4. Agent applies the edit and verifies that `Weekly Plan.md` now contains `[[Weekly Sync]]`.
5. Agent verifies that both occurrences in `Project Tracker.md` have been updated to `[[Weekly Sync]]`.
6. Agent verifies that `Research Hub.md` now contains `[[Weekly Sync|our meeting log]]` — target updated, label unchanged.
7. Agent verifies that `Sprint Review.md` now contains `[[Weekly Sync#Action Items]]` — stem updated, fragment unchanged.
8. Agent verifies that `Team Directory.md` is byte-for-byte identical to its pre-rename state.
9. Agent confirms the file on disk is now named `Weekly Sync.md` and `Meeting Notes.md` no longer exists.

**Pass:** Every link across the vault is updated to reflect the new file name; aliased links keep their display labels; heading-fragment links keep their fragment; notes with no link to the renamed file are untouched.
**Fail:** Any link still contains `[[Meeting Notes]]` after the rename; any display label is altered; any unrelated note is modified; the renamed file cannot be found under its new name.

---

### TC-VAL-REN-002 — User.Rename.RenameHeadingEverywhere

**User Req Tag:** `User.Rename.RenameHeadingEverywhere`
**Goal:** Rename a heading and have all links to it updated
**Type:** Both
**Mapped FRs:** `Rename.Refactoring.Completeness`, `Rename.Prepare.Rejection` — see [[tests/verification/verify-rename]]
**Verification coverage:** TC-VER-REN-001, TC-VER-REN-002

**Scenario (user perspective):**
As a vault author, I have a note called `Sprint Planning.md` that contains a section titled `## Action Items`. Many other notes in my vault link directly to that section using `[[Sprint Planning#Action Items]]`. I want to rename the section to `## Next Steps` because the old label no longer reflects how the team talks about this content. I expect every `[[Sprint Planning#Action Items]]` link across my vault to be updated to `[[Sprint Planning#Next Steps]]` the moment I confirm. Links that point to the section with a custom label — such as `[[Sprint Planning#Action Items|things to do]]` — should have their target updated but their label left alone. I also expect the editor to stop me if I try to rename body prose or content inside a maths block, where a rename would not make sense, and to give me a clear message explaining why.

**Scripted scenario:**

```gherkin
Feature: Rename a heading and update all vault links

  Scenario: Author renames a heading and all heading-anchored links are updated
    Given a vault containing:
      | note                  | content                                                              |
      | Sprint Planning.md    | # Sprint Planning\n## Action Items\nTasks go here.\n## Retrospective |
      | Daily Standup.md      | See [[Sprint Planning#Action Items]] for what we need to finish.    |
      | Team Wiki.md          | Cross-referenced in [[Sprint Planning#Action Items]] again.         |
      | Release Notes.md      | No heading links to Sprint Planning here.                           |
    When I place my cursor on "## Action Items" in "Sprint Planning.md" and rename it to "Next Steps"
    Then "Sprint Planning.md" contains "## Next Steps" instead of "## Action Items"
    And "Daily Standup.md" contains "[[Sprint Planning#Next Steps]]"
    And "Team Wiki.md" contains "[[Sprint Planning#Next Steps]]"
    And "Release Notes.md" is unchanged

  Scenario: Aliased heading links preserve their display label after rename
    Given a vault where "Project Board.md" links to "[[Sprint Planning#Action Items|things to do]]"
    When I rename "## Action Items" to "## Next Steps" in "Sprint Planning.md"
    Then "Project Board.md" contains "[[Sprint Planning#Next Steps|things to do]]"
    And the display label "things to do" is not altered

  Scenario: Editor refuses rename when cursor is on body prose
    Given my cursor is on the line "Tasks go here." in "Sprint Planning.md"
    When I attempt to rename at that position
    Then the editor shows the message "Cannot rename at this location"
    And no changes are applied to any file in the vault

  Scenario: Editor refuses rename when cursor is inside a maths expression
    Given "Sprint Planning.md" contains the block "$$\nE = mc^2\n$$"
    And my cursor is placed inside that maths block
    When I attempt to rename at that position
    Then the editor shows the message "Cannot rename at this location"
    And no changes are applied to any file in the vault
```

**Agent-driven walkthrough:**

1. Agent creates a vault with five notes: `Sprint Planning.md` (containing `## Action Items` and `## Retrospective`), `Daily Standup.md` (containing `[[Sprint Planning#Action Items]]`), `Team Wiki.md` (containing `[[Sprint Planning#Action Items]]`), `Project Board.md` (containing `[[Sprint Planning#Action Items|things to do]]`), and `Release Notes.md` (containing no heading link to `Sprint Planning`).
2. Agent opens the vault in the server and waits for indexing to complete.
3. Agent sends a prepare-rename request with the cursor on `## Action Items` in `Sprint Planning.md` and confirms the server returns a valid editable range covering the text `Action Items`.
4. Agent sends a rename request for `Action Items` → `Next Steps` and captures the workspace edit.
5. Agent applies the edit and verifies `Sprint Planning.md` now contains `## Next Steps`.
6. Agent verifies `Daily Standup.md` now contains `[[Sprint Planning#Next Steps]]`.
7. Agent verifies `Team Wiki.md` now contains `[[Sprint Planning#Next Steps]]`.
8. Agent verifies `Project Board.md` now contains `[[Sprint Planning#Next Steps|things to do]]` — fragment updated, label unchanged.
9. Agent verifies `Release Notes.md` is unchanged.
10. Agent sends a prepare-rename request with the cursor on the body prose `Tasks go here.` in `Sprint Planning.md` and confirms the server returns an error — not a valid range.
11. Agent adds a `$$\nE = mc^2\n$$` block to `Sprint Planning.md`, positions the cursor inside it, sends a prepare-rename request, and confirms the server returns an error.

**Pass:** The heading is renamed in the source file; every `[[Sprint Planning#Action Items]]` link across the vault is updated to `[[Sprint Planning#Next Steps]]`; aliased links keep their label; the server rejects rename attempts on body prose and maths block content with an appropriate message.
**Fail:** Any heading-anchored link still contains `#Action Items` after the rename; any display label is altered; the server allows a rename on body prose or a maths block; any unrelated note is modified.

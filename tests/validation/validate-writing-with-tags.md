---
title: Validation — Writing With Tags
tags: [test/validation, requirements/user]
aliases: [Validate Writing With Tags]
---

# Validation — Writing With Tags

## Purpose

These test cases confirm that vault authors can use tags effectively across their vault — getting suggestions while typing, finding all notes that share a tag, and navigating hierarchical tag structures. Each case is written entirely from the vault author's perspective: what they type, what they expect to see, and what success looks like.

## User Requirements Covered

| User Req Tag | Goal | Mapped FRs | Verification Coverage |
|---|---|---|---|
| User.Tags.CompleteTag | Get tag suggestions while typing `#tag` | Tag.Index.Completeness, Tag.Completion.Unicode, Completion.Trigger.Coverage | TC-VER-TAG-001, TC-VER-TAG-004, TC-VER-COMP-002 |
| User.Tags.FindTaggedNotes | Find all notes sharing a tag across the vault | Tag.Hierarchy.Awareness, Tag.YAML.Equivalence | TC-VER-TAG-002, TC-VER-TAG-003 |
| User.Tags.UseHierarchicalTags | Use `#parent/child` tags and query by parent | Tag.Hierarchy.Awareness | TC-VER-TAG-002 |

## Test Cases

### TC-VAL-TAG-001 — User.Tags.CompleteTag

**User Req Tag:** `User.Tags.CompleteTag`
**Goal:** Get tag suggestions while typing `#tag`
**Type:** Both
**Mapped FRs:** `Tag.Index.Completeness` — see [[tests/verification/verify-tags]], `Tag.Completion.Unicode` — see [[tests/verification/verify-tags]], `Completion.Trigger.Coverage` — see [[tests/verification/verify-completions]]
**Verification coverage:** TC-VER-TAG-001, TC-VER-TAG-004, TC-VER-COMP-002

**Scenario (user perspective):**
As a vault author, I have been tagging my notes consistently with tags like `#project/active`, `#meeting`, and `#journal/daily`. When I open a new note and start typing a `#` to add a tag, I expect the editor to immediately offer me a list of the tags I have already used elsewhere in the vault — including tags that contain Unicode characters or emoji — so I stay consistent without having to remember exact tag names.

**Scripted scenario:**

```gherkin
Feature: Tag completion while typing
  Scenario: Suggestions appear when I type a hash in a new note
    Given my vault contains notes tagged with "#project/active", "#meeting", and "#journal/daily"
    And one note contains the tag "#café" and another contains "#🚀launch"
    When I open a new note and type the "#" character
    Then the editor suggests "project/active", "meeting", "journal/daily", "café", and "🚀launch"
    And each suggestion shows the tag as it would appear in a note
```

**Agent-driven walkthrough:**
1. Agent creates a five-note vault:
   - `weekly-review.md` — body contains `#project/active` and `#meeting`
   - `travel-log.md` — body contains `#journal/daily`
   - `coffee-notes.md` — body contains `#café`
   - `product-launch.md` — body contains `#🚀launch`
   - `new-note.md` — empty, to be edited
2. Agent simulates opening `new-note.md` and requesting completions at the position immediately after a `#` character
3. Agent verifies the completion list includes all five tags from the vault
4. Agent verifies that Unicode and emoji tags (`#café`, `#🚀launch`) are present in the list alongside plain ASCII tags
5. Agent verifies that no tag from inside a fenced code block in any vault note appears in the list

**Pass:** All tags used anywhere in the vault (body or YAML frontmatter, excluding code blocks) appear as suggestions, including those with Unicode characters and emoji.

**Fail:** Any previously used tag is absent from the suggestion list, or a `#something` string inside a code block appears as a suggestion.

---

### TC-VAL-TAG-002 — User.Tags.FindTaggedNotes

**User Req Tag:** `User.Tags.FindTaggedNotes`
**Goal:** Find all notes sharing a tag across the vault
**Type:** Both
**Mapped FRs:** `Tag.Hierarchy.Awareness` — see [[tests/verification/verify-tags]], `Tag.YAML.Equivalence` — see [[tests/verification/verify-tags]]
**Verification coverage:** TC-VER-TAG-002, TC-VER-TAG-003

**Scenario (user perspective):**
As a vault author, I tag some notes with inline `#meeting` in the note body and tag others by putting `meeting` in the YAML `tags:` property at the top of the file. When I look up which notes are tagged with `#meeting`, I expect to see all of them — regardless of whether the tag was written inline or in the frontmatter — because to me it is the same tag either way.

**Scripted scenario:**

```gherkin
Feature: Finding tagged notes regardless of tag syntax
  Scenario: Both inline and YAML-frontmatter tags are returned when searching
    Given my vault contains "monday-standup.md" with an inline "#meeting" tag in the body
    And my vault contains "quarterly-review.md" with "meeting" listed in its YAML frontmatter tags
    And my vault contains "personal-journal.md" with no meeting tag at all
    When I look up all notes tagged "#meeting"
    Then both "monday-standup.md" and "quarterly-review.md" appear in the results
    And "personal-journal.md" does not appear in the results
```

**Agent-driven walkthrough:**
1. Agent creates a four-note vault:
   - `monday-standup.md` — body contains `#meeting notes from this week`
   - `quarterly-review.md` — YAML frontmatter: `tags: [meeting, planning]`, no inline `#meeting`
   - `design-decisions.md` — YAML frontmatter: `tags: [architecture]`, no meeting tag
   - `personal-journal.md` — body contains `#journal/daily`, no meeting tag
2. Agent requests all references to the tag `#meeting` across the vault
3. Agent verifies both `monday-standup.md` (inline) and `quarterly-review.md` (YAML) are in the results
4. Agent verifies `design-decisions.md` and `personal-journal.md` are not in the results

**Pass:** The full-text search and tag reference lookup returns notes tagged via both inline syntax and YAML frontmatter with no omissions.

**Fail:** Either the inline-tagged note or the YAML-tagged note is missing from the results, suggesting one syntax is treated differently from the other.

---

### TC-VAL-TAG-003 — User.Tags.UseHierarchicalTags

**User Req Tag:** `User.Tags.UseHierarchicalTags`
**Goal:** Use `#parent/child` tags and query by parent
**Type:** Both
**Mapped FRs:** `Tag.Hierarchy.Awareness` — see [[tests/verification/verify-tags]]
**Verification coverage:** TC-VER-TAG-002

**Scenario (user perspective):**
As a vault author, I organise my work notes under a `#project` hierarchy. Some notes are tagged `#project` (a project overview), others are tagged `#project/active` (currently active work), and others are tagged `#project/backlog` (items waiting to be started). When I want to find everything related to my projects, I expect searching or filtering by `#project` to return all three groups — the notes tagged `#project` exactly and every note tagged with any `#project/...` variant — because the parent tag should cover its whole subtree.

**Scripted scenario:**

```gherkin
Feature: Hierarchical tag queries match parent and all children
  Scenario: Querying "#project" returns notes tagged "#project", "#project/active", and "#project/backlog"
    Given my vault contains "project-overview.md" tagged with "#project"
    And my vault contains "sprint-planning.md" tagged with "#project/active"
    And my vault contains "feature-ideas.md" tagged with "#project/backlog"
    And my vault contains "reading-list.md" tagged with "#book/fiction"
    When I query the vault for all notes under the "#project" tag
    Then "project-overview.md", "sprint-planning.md", and "feature-ideas.md" all appear
    And "reading-list.md" does not appear
```

**Agent-driven walkthrough:**
1. Agent creates a five-note vault:
   - `project-overview.md` — body contains `#project` (the parent tag exactly)
   - `sprint-planning.md` — body contains `#project/active`
   - `feature-ideas.md` — YAML frontmatter: `tags: [project/backlog]`
   - `reading-list.md` — body contains `#book/fiction`
   - `meeting-minutes.md` — body contains `#meeting`
2. Agent requests the tag hierarchy and verifies `#project/active` and `#project/backlog` are both listed as children of `#project`
3. Agent requests all references to `#project` and confirms the result set includes `project-overview.md`, `sprint-planning.md`, and `feature-ideas.md`
4. Agent confirms `reading-list.md` and `meeting-minutes.md` are absent from the results
5. Agent verifies `#book` is a separate parent tag with `#book/fiction` as its only child, confirming hierarchies do not bleed across unrelated parents

**Pass:** A query for `#project` surfaces notes tagged `#project`, `#project/active`, and `#project/backlog`. Notes from unrelated hierarchies such as `#book/fiction` are not included.

**Fail:** Notes tagged `#project/active` or `#project/backlog` are absent when querying `#project`, or notes from an unrelated hierarchy appear in the results.

---
title: Validation — Seeing Broken Links
tags: [test/validation, requirements/user]
aliases: [Validate Seeing Broken Links]
---

# Validation — Seeing Broken Links

## Purpose

These test cases confirm that vault authors are promptly and clearly informed about broken links, ambiguous links, and broken embeds in a realistic multi-note vault. Each case uses a vault fixture of three to five interconnected notes so the scenarios reflect genuine authoring situations rather than isolated single-file checks. The cases also confirm that errors are suppressed when a user is editing a standalone file outside a vault, and that broken embeds (FG004 Warning) are visually distinct from broken links (FG001 Error) in the editor.

## User Requirements Covered

| User Req Tag | Goal | Mapped FRs | Verification Coverage |
|---|---|---|---|
| User.Diagnose.SpotBrokenLinks | See immediately which links point to non-existent notes | Diagnostic.Severity.WikiLink, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency, Diagnostic.SingleFile.Suppression | TC-VER-DIAG-001, TC-VER-DIAG-003, TC-VER-DIAG-004, TC-VER-DIAG-006 |
| User.Diagnose.SpotAmbiguousLinks | Be warned when a link could resolve to more than one note | Diagnostic.Ambiguous.RelatedInfo | TC-VER-DIAG-005 |
| User.Diagnose.SpotBrokenEmbeds | Be warned when an embedded file is missing | Diagnostic.Severity.Embed, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency | TC-VER-DIAG-002, TC-VER-DIAG-003, TC-VER-DIAG-004 |

## Test Cases

### TC-VAL-DIAG-001 — User.Diagnose.SpotBrokenLinks

**User Req Tag:** `User.Diagnose.SpotBrokenLinks`
**Goal:** See immediately which links point to non-existent notes
**Type:** Both
**Mapped FRs:** `Diagnostic.Severity.WikiLink` — see [[tests/verification/verify-diagnostics]], `Diagnostic.Code.Assignment` — see [[tests/verification/verify-diagnostics]], `Diagnostic.Debounce.Latency` — see [[tests/verification/verify-diagnostics]], `Diagnostic.SingleFile.Suppression` — see [[tests/verification/verify-diagnostics]]
**Verification coverage:** TC-VER-DIAG-001, TC-VER-DIAG-003, TC-VER-DIAG-004, TC-VER-DIAG-006

**Scenario (user perspective):**
As a vault author maintaining a project wiki with several interconnected notes, I want broken links to stand out as errors the moment I open or edit a note. If I have a link `[[onboarding-checklist]]` in my `Team Handbook` note but I have not yet created that note, I expect to see the link underlined in red (or otherwise clearly marked as an error) as soon as I open `Team Handbook`. When I later create the missing note, the error should disappear on its own without me having to restart anything. When I am editing a single standalone file on my desktop with no vault around it, I expect no false alarms about links that simply have not been created yet.

**Vault fixture:**

```
project-wiki/
  team-handbook.md         — links to [[onboarding-checklist]] (does not exist yet)
                             and to [[coding-standards]] (exists)
  coding-standards.md      — links to [[style-guide]] (exists) and [[test-policy]] (does not exist)
  style-guide.md           — no outbound links
  readme.md                — links to [[team-handbook]] (exists) and [[roadmap]] (does not exist)
```

**Scripted scenario:**

```gherkin
Feature: Broken wiki-links shown as errors immediately on open
  Scenario: Opening a note with broken links shows errors for each broken link
    Given a vault containing "team-handbook.md", "coding-standards.md", "style-guide.md", and "readme.md"
    And "team-handbook.md" links to "[[onboarding-checklist]]" which does not exist
    And "team-handbook.md" also links to "[[coding-standards]]" which does exist
    When I open "team-handbook.md"
    Then "[[onboarding-checklist]]" is marked as a broken link error
    And "[[coding-standards]]" is not marked as an error

  Scenario: Broken link error clears after the missing note is created
    Given "team-handbook.md" shows a broken-link error for "[[onboarding-checklist]]"
    When I create "onboarding-checklist.md" in the vault
    And the vault index refreshes
    Then the broken-link error on "[[onboarding-checklist]]" disappears from "team-handbook.md"

  Scenario: No broken-link errors when editing a standalone file outside a vault
    Given I open a single Markdown file with no vault root around it
    And the file contains "[[some-other-note]]" which does not exist locally
    When the file is loaded in the editor
    Then no broken-link errors appear for "[[some-other-note]]"
```

**Agent-driven walkthrough:**

1. Agent creates the vault fixture above with four notes; `onboarding-checklist.md`, `test-policy.md`, and `roadmap.md` are intentionally absent
2. Agent opens `team-handbook.md` and verifies:
   - A broken-link error (FG001, severity Error) is published for `[[onboarding-checklist]]`
   - No error is published for `[[coding-standards]]`
3. Agent opens `coding-standards.md` and verifies:
   - A broken-link error (FG001) is published for `[[test-policy]]`
   - No error is published for `[[style-guide]]`
4. Agent opens `readme.md` and verifies a broken-link error for `[[roadmap]]` but no error for `[[team-handbook]]`
5. Agent simulates creating `onboarding-checklist.md` and updating the vault index, then re-checks `team-handbook.md` and verifies the FG001 error on `[[onboarding-checklist]]` is gone while `[[coding-standards]]` remains clean
6. Agent simulates single-file mode (no vault root) with a file containing `[[missing-note]]` and verifies no FG001 is published

**Pass:** Every link to a non-existent note is marked with a clearly visible error (FG001). Links to existing notes are clean. After a missing note is created, its previously broken link clears automatically. In single-file mode, no errors appear for any links.

**Fail:** A broken link is not flagged, a valid link is incorrectly flagged, a cleared error persists after the target note is created, or a false alarm appears in single-file mode.

---

### TC-VAL-DIAG-002 — User.Diagnose.SpotAmbiguousLinks

**User Req Tag:** `User.Diagnose.SpotAmbiguousLinks`
**Goal:** Be warned when a link could resolve to more than one note
**Type:** Both
**Mapped FRs:** `Diagnostic.Ambiguous.RelatedInfo` — see [[tests/verification/verify-diagnostics]]
**Verification coverage:** TC-VER-DIAG-005

**Scenario (user perspective):**
As a vault author whose vault spans several project folders, I have accidentally created two notes both named `Meeting.md` — one in `projects/alpha/` and one in `projects/beta/`. When my `Weekly Roundup` note contains `[[Meeting]]`, I expect the editor to warn me that this link is ambiguous, and to tell me exactly which two files the link could be pointing to so I know what to fix. I should be able to see both candidate paths and then decide whether to rename one of the files or make the link more specific (e.g., `[[projects/alpha/Meeting]]`).

**Vault fixture:**

```
knowledge-base/
  projects/
    alpha/
      Meeting.md           — "# Alpha Team Meeting" (project Alpha meeting notes)
      sprint-plan.md       — links to [[Meeting]] (ambiguous)
    beta/
      Meeting.md           — "# Beta Team Meeting" (project Beta meeting notes)
      release-notes.md     — links to [[Meeting]] (ambiguous)
  weekly-roundup.md        — links to [[Meeting]] (ambiguous) and [[sprint-plan]] (unambiguous)
```

**Scripted scenario:**

```gherkin
Feature: Ambiguous wiki-links warn with both candidate paths shown
  Scenario: Link with two matching notes shows both candidates in the warning
    Given a vault containing "projects/alpha/Meeting.md" and "projects/beta/Meeting.md"
    And "weekly-roundup.md" contains the link "[[Meeting]]"
    When I open "weekly-roundup.md"
    Then "[[Meeting]]" is marked as an ambiguous link warning
    And the warning lists "projects/alpha/Meeting.md" as one candidate
    And the warning lists "projects/beta/Meeting.md" as the other candidate
    And "[[sprint-plan]]" in the same note is not flagged (it resolves uniquely)

  Scenario: Making the link specific resolves the ambiguity
    Given "weekly-roundup.md" shows an ambiguity warning on "[[Meeting]]"
    When I update the link to "[[projects/alpha/Meeting]]"
    Then the ambiguity warning disappears
    And the link resolves cleanly to "projects/alpha/Meeting.md"
```

**Agent-driven walkthrough:**

1. Agent creates the vault fixture above with five notes
2. Agent opens `weekly-roundup.md` and verifies:
   - An ambiguous-link diagnostic (FG002, severity Error) is published for `[[Meeting]]`
   - The diagnostic's related-information section lists both `projects/alpha/Meeting.md` and `projects/beta/Meeting.md` as candidates, each with a "Candidate:" label
   - No diagnostic is published for `[[sprint-plan]]` (unique resolution)
3. Agent opens `sprint-plan.md` and verifies FG002 is also published for its `[[Meeting]]` link with both candidates listed
4. Agent opens `release-notes.md` and verifies FG002 is also published there
5. Agent simulates editing `weekly-roundup.md` to change `[[Meeting]]` to `[[projects/alpha/Meeting]]`
6. Agent verifies the FG002 diagnostic on that link is cleared and no new diagnostic is introduced
7. Agent verifies the other occurrences of `[[Meeting]]` in `sprint-plan.md` and `release-notes.md` still show FG002 (they were not changed)

**Pass:** Every `[[Meeting]]` link in the vault is flagged as ambiguous (FG002) with both candidate paths listed in the warning. Unique links in the same files are clean. Qualifying the link to a specific path clears the warning for that link without affecting others.

**Fail:** The ambiguity warning is not shown for any of the `[[Meeting]]` links, only one candidate is listed instead of both, a unique link in the same file is incorrectly flagged, or qualifying the link does not clear the warning.

---

### TC-VAL-DIAG-003 — User.Diagnose.SpotBrokenEmbeds

**User Req Tag:** `User.Diagnose.SpotBrokenEmbeds`
**Goal:** Be warned when an embedded file is missing
**Type:** Both
**Mapped FRs:** `Diagnostic.Severity.Embed` — see [[tests/verification/verify-diagnostics]], `Diagnostic.Code.Assignment` — see [[tests/verification/verify-diagnostics]], `Diagnostic.Debounce.Latency` — see [[tests/verification/verify-diagnostics]]
**Verification coverage:** TC-VER-DIAG-002, TC-VER-DIAG-003, TC-VER-DIAG-004

**Scenario (user perspective):**
As a vault author, I distinguish between two kinds of problems in my notes. A `[[broken-link]]` to a note that does not exist is an error — it means I am trying to reference something I have not written yet, and I want it underlined in red so I notice it right away. A `![[missing-diagram.png]]` embed that cannot be found is a different kind of problem — perhaps the image file is just not in the vault folder yet, or the filename changed — and I want it shown as a warning (a gentler highlight) rather than a hard error. I need to be able to tell these two cases apart at a glance so I can prioritise which ones to fix.

**Vault fixture:**

```
documentation/
  overview.md              — contains ![[architecture-diagram.png]] (file missing from vault)
                             and [[getting-started]] (note exists)
  getting-started.md       — contains ![[setup-screenshot.png]] (file missing)
                             and [[overview]] (note exists, valid link)
  troubleshooting.md       — contains [[known-issues]] (note does not exist, broken link)
                             and ![[error-log-sample.txt]] (file missing)
  known-issues.md          — does not exist (referenced by troubleshooting.md)
```

**Scripted scenario:**

```gherkin
Feature: Broken embeds show as warnings, broken links show as errors — visually distinct
  Scenario: Missing embed is a Warning; missing linked note is an Error
    Given "overview.md" contains "![[architecture-diagram.png]]" where the image file does not exist
    And "troubleshooting.md" contains "[[known-issues]]" where "known-issues.md" does not exist
    When I open "overview.md"
    Then "![[architecture-diagram.png]]" is marked with a Warning indicator (FG004)
    And the warning does not use the same visual style as an Error
    When I open "troubleshooting.md"
    Then "[[known-issues]]" is marked with an Error indicator (FG001)
    And "![[error-log-sample.txt]]" is marked with a Warning indicator (FG004)
    And the Error and Warning on "troubleshooting.md" are visually distinguishable

  Scenario: Multiple broken embeds in one file each receive their own warning
    Given "getting-started.md" contains "![[setup-screenshot.png]]" (missing)
    When I open "getting-started.md"
    Then a Warning is shown for "![[setup-screenshot.png]]"
    And "[[overview]]" shows no error (the note exists)
```

**Agent-driven walkthrough:**

1. Agent creates the vault fixture above; `architecture-diagram.png`, `setup-screenshot.png`, `error-log-sample.txt`, and `known-issues.md` are all absent from the vault
2. Agent opens `overview.md` and verifies:
   - A broken-embed diagnostic (FG004, severity Warning) is published for `![[architecture-diagram.png]]`
   - No diagnostic is published for `[[getting-started]]` (note exists)
   - The diagnostic source is `flavor-grenade`
3. Agent opens `getting-started.md` and verifies:
   - FG004 Warning is published for `![[setup-screenshot.png]]`
   - No diagnostic is published for `[[overview]]`
4. Agent opens `troubleshooting.md` and verifies:
   - FG001 Error is published for `[[known-issues]]` (the missing note)
   - FG004 Warning is published for `![[error-log-sample.txt]]` (the missing embedded file)
   - The two diagnostics have different severity levels: FG001 is `Error`, FG004 is `Warning`
   - Exactly two diagnostics are published for `troubleshooting.md`
5. Agent confirms that FG004 is never published with severity `Error` and that FG001 is never published with severity `Warning`, establishing the clear visual distinction
6. Agent simulates adding `architecture-diagram.png` to the vault and updating the index, then reopens `overview.md` and verifies the FG004 warning is cleared

**Pass:** Every missing embed is flagged as FG004 with severity Warning. Every missing linked note is flagged as FG001 with severity Error. The two codes never swap severities. When a missing file is added to the vault, its warning clears automatically.

**Fail:** A missing embed receives Error severity (same as a broken link), a broken link receives Warning severity (same as a broken embed), the two diagnostic types are indistinguishable, or a warning persists after the embedded file is added to the vault.

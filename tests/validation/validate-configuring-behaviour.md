---
title: Validation — Configuring Behaviour
tags: [test/validation, requirements/user]
aliases: [Validate Configuring Behaviour]
---

# Validation — Configuring Behaviour

## Purpose

This validation plan confirms that vault authors can tune the server's behaviour to match their personal workflow by editing a single configuration file at the vault root. Two capabilities are covered: choosing how link text is written (stem only, full title, or vault-relative path), and setting a ceiling on how many completion suggestions the editor offers at once. In both cases the plan verifies not only the happy path — the configured value is respected — but also the graceful-degradation path: if the author makes a typo or sets a nonsensical value, the server silently falls back to its built-in default without crashing, emitting errors, or requiring an editor restart.

## User Requirements Covered

| User Req Tag | Goal | Mapped FRs | Verification Coverage |
|---|---|---|---|
| `User.Config.CustomiseLinkStyle` | Configure how links are written (stem, title, path) | `Config.Precedence.Layering`, `Link.Wiki.StyleBinding` | TC-VER-CFG-001, TC-VER-WIKI-001 |
| `User.Config.TuneCompletions` | Control how many completion candidates are offered | `Config.Validation.Candidates`, `Completion.Candidates.Cap` | TC-VER-CFG-002, TC-VER-COMP-001 |

## Test Cases

### TC-VAL-CFG-001 — User.Config.CustomiseLinkStyle

**User Req Tag:** `User.Config.CustomiseLinkStyle`
**Goal:** Configure how links are written (stem, title, path)
**Type:** Both
**Mapped FRs:** `Config.Precedence.Layering`, `Link.Wiki.StyleBinding` — see [[tests/verification/verify-config]], [[tests/verification/verify-wiki-link-resolution]]
**Verification coverage:** TC-VER-CFG-001, TC-VER-WIKI-001

**Scenario (user perspective):**
As a vault author, I want to control how the server writes link text when I accept a completion or when a rename updates links across my vault. My preference is to use the note's title from its frontmatter rather than just the bare file stem — I find `[[My Weekly Review]]` more readable than `[[my-weekly-review]]`. I set `wiki_style = "title"` in my `.flavor-grenade.toml` and expect every completion insertion and every rename-generated edit to use the title format from that point on, without restarting anything. I also want to know that if I accidentally mistype the setting value, the server carries on working using its default behaviour rather than going silent or refusing to start.

**Sub-scenario A — valid `wiki_style = "title"` setting:**

```gherkin
Feature: Server respects the author's configured link style

  Scenario: Completion inserts title-formatted link when wiki_style is "title"
    Given a vault with ".flavor-grenade.toml" containing:
      """
      [wiki]
      wiki_style = "title"
      """
    And "notes/my-weekly-review.md" has frontmatter:
      """
      ---
      title: My Weekly Review
      ---
      """
    And a scratch note "notes/daily-log.md" is open with the cursor after "[["
    When I accept the completion candidate for "my-weekly-review"
    Then the inserted text is "[[My Weekly Review]]"
    And the inserted text is NOT "[[my-weekly-review]]"

  Scenario: Rename-generated edits use title style when wiki_style is "title"
    Given the same vault with wiki_style = "title"
    And "notes/team-meeting.md" has frontmatter title "Team Meeting"
    And "notes/project-notes.md" contains "[[team-meeting]]"
    When I rename "notes/team-meeting.md" to "notes/team-sync.md" with frontmatter title "Team Sync"
    Then "notes/project-notes.md" is updated to "[[Team Sync]]"
    And the inserted link text uses the new frontmatter title, not the bare stem
```

**Sub-scenario B — invalid `wiki_style` value falls back silently:**

```gherkin
Feature: Server falls back gracefully when link style is misconfigured

  Scenario: Invalid wiki_style value produces default behaviour with no error
    Given a vault with ".flavor-grenade.toml" containing:
      """
      [wiki]
      wiki_style = "invented-style"
      """
    And "notes/architecture-decisions.md" exists with no frontmatter title
    And a scratch note "notes/scratch.md" is open with the cursor after "[["
    When I accept the completion candidate for "architecture-decisions"
    Then the inserted text uses the default link style (file stem: "[[architecture-decisions]]")
    And no error message or notification is shown to me
    And the server continues operating normally
```

**Agent-driven walkthrough:**

1. Agent creates a vault with `.obsidian/`, `.flavor-grenade.toml` (initially empty), `notes/my-weekly-review.md` (frontmatter `title: My Weekly Review`), `notes/architecture-decisions.md` (no frontmatter), and `notes/scratch.md` (empty).
2. Agent writes `[wiki]\nwiki_style = "title"` to `.flavor-grenade.toml` and starts the server. Waits for indexing.
3. Agent opens `notes/scratch.md` and triggers a completion request after `[[`. Agent confirms the completion item for `my-weekly-review` has `insertText` equal to `My Weekly Review`.
4. Agent creates `notes/team-meeting.md` with frontmatter `title: Team Meeting` and a note `notes/project-notes.md` containing `[[team-meeting]]`. Agent triggers a rename of `team-meeting.md` to `team-sync.md` (with frontmatter title `Team Sync`) and confirms the edit to `project-notes.md` inserts `[[Team Sync]]`.
5. Agent updates `.flavor-grenade.toml` to contain `wiki_style = "invented-style"` and reloads the configuration (or restarts the server). Agent waits for the configuration to take effect.
6. Agent opens `notes/scratch.md` and triggers a completion request after `[[`. Agent confirms the completion item for `architecture-decisions` has `insertText` equal to `architecture-decisions` (the default stem style).
7. Agent inspects the server's notification log and confirms no error or warning notification was sent to the editor during steps 5–6.
8. Agent sends several further completion requests to confirm the server is still fully operational after receiving the invalid configuration value.

**Pass:** Sub-scenario A — completion inserts the frontmatter title and rename edits use title style. Sub-scenario B — an invalid `wiki_style` value causes the server to use the default stem style with no visible error or degraded functionality.
**Fail:** Sub-scenario A — completion inserts a file stem instead of the title; rename edits use the wrong style. Sub-scenario B — the server shows an error, becomes unresponsive, or silently produces broken link text.

---

### TC-VAL-CFG-002 — User.Config.TuneCompletions

**User Req Tag:** `User.Config.TuneCompletions`
**Goal:** Control how many completion candidates are offered
**Type:** Both
**Mapped FRs:** `Config.Validation.Candidates`, `Completion.Candidates.Cap` — see [[tests/verification/verify-config]], [[tests/verification/verify-completions]]
**Verification coverage:** TC-VER-CFG-002, TC-VER-COMP-001

**Scenario (user perspective):**
As a vault author with a large vault — over three hundred notes — I find that the default completion list is too long to scan quickly. I want to limit it to the ten best matches so the suggestion popup stays manageable. I open `.flavor-grenade.toml`, add `candidates = 10` under `[completion]`, save the file, and expect the next time I type `[[` the list to contain at most ten items. If there are more matching notes than the limit, I want to know the list is not exhaustive — so I can keep typing to narrow it down — but I do not want an error message. I also want to be sure that if I accidentally type a negative number the server does not break: it should revert to its own default silently.

**Sub-scenario A — valid `completion.candidates = 10` setting:**

```gherkin
Feature: Completion list is capped at the author's configured limit

  Scenario: Candidate list is capped at 10 and author is told the list is partial
    Given a vault with 25 notes whose names all begin with "research-"
    And ".flavor-grenade.toml" contains:
      """
      [completion]
      candidates = 10
      """
    And a note "index.md" is open with the cursor after "[["
    When I request completions at that position
    Then the completion list contains exactly 10 items
    And I am shown an indicator that more matches exist (the list is marked as incomplete)
    And no error or warning is displayed

  Scenario: Candidate list is not marked incomplete when results fit within the cap
    Given the same vault and the cursor is after "[[research-note-0"
    And only 4 notes match that prefix
    When I request completions at that position
    Then the completion list contains exactly 4 items
    And the list is NOT marked as incomplete
```

**Sub-scenario B — invalid `completion.candidates = -1` falls back silently:**

```gherkin
Feature: Server falls back gracefully when candidate limit is misconfigured

  Scenario: Negative candidate value produces default behaviour with no error
    Given a vault with 25 notes whose names all begin with "research-"
    And ".flavor-grenade.toml" contains:
      """
      [completion]
      candidates = -1
      """
    And a note "index.md" is open with the cursor after "[["
    When I request completions at that position
    Then the completion list contains the built-in default number of candidates
    And no error message or notification is shown to me
    And the server continues operating normally

  Scenario: Zero candidate value also produces default behaviour
    Given ".flavor-grenade.toml" contains "candidates = 0"
    When I request completions after "[["
    Then the completion list contains the built-in default number of candidates
    And no error is shown
```

**Agent-driven walkthrough:**

1. Agent creates a vault with `.obsidian/`, `.flavor-grenade.toml` (initially empty), and 25 notes with names `research-note-01.md` through `research-note-25.md`, plus a scratch note `index.md`.
2. Agent writes `[completion]\ncandidates = 10` to `.flavor-grenade.toml` and starts the server. Waits for indexing.
3. Agent opens `index.md` and triggers a completion request after `[[`. Agent asserts that `CompletionList.items` contains exactly 10 items and that `CompletionList.isIncomplete` is `true`.
4. Agent triggers a second completion request after `[[research-note-0` (a prefix that matches exactly 4 notes). Agent asserts the list contains exactly 4 items and `isIncomplete` is `false`.
5. Agent updates `.flavor-grenade.toml` to contain `candidates = -1` and reloads configuration. Agent waits for the configuration to take effect.
6. Agent triggers a completion request after `[[`. Agent asserts the list length matches the server's built-in default (not 0 and not -1 interpreted as a count). Agent does not assert an exact built-in default number — only that it is a positive integer and completions are returned.
7. Agent inspects the server's notification log and confirms no error or warning notification was sent to the editor during steps 5–6.
8. Agent updates `.flavor-grenade.toml` to contain `candidates = 0` and reloads. Agent repeats step 6 and step 7 for the zero case.
9. Agent confirms the server remains responsive to all subsequent requests.

**Pass:** Sub-scenario A — with `candidates = 10` the list is capped at exactly 10 items and `isIncomplete` is `true` when the vault has more matches; the flag is `false` when results fit under the cap. Sub-scenario B — a value of `-1` or `0` causes the server to apply its built-in default silently, with no errors shown and no degraded functionality.
**Fail:** Sub-scenario A — the list exceeds the configured cap; `isIncomplete` is wrong for either branch. Sub-scenario B — the server crashes, returns an empty list, shows an error notification, or treats the invalid value as a literal count.

---
title: Validation — Authoring Links
tags: [test/validation, requirements/user]
aliases: [Validate Authoring Links]
---

# Validation — Authoring Links

## Purpose

This validation plan confirms that vault authors receive useful, accurate suggestions from the editor whenever they are writing links, headings references, or callout blocks. A vault author should not need to memorise note filenames, section names, or callout type spellings — the editor should offer filtered candidate lists as soon as the author begins a link or callout. Additionally, any links the editor inserts should automatically follow the link-writing convention the author has configured for their vault, so the vault stays internally consistent over time without manual correction.

## User Requirements Covered

| User Req Tag | Goal | Mapped FRs | Verification Coverage |
|---|---|---|---|
| `User.Author.CompleteWikiLink` | Get suggestions when starting a `[[link` | `Completion.Trigger.Coverage`, `Completion.WikiStyle.Binding`, `Completion.Candidates.Cap`, `Link.Resolution.IgnoreGlob` | TC-VER-COMP-002, TC-VER-COMP-004, TC-VER-COMP-001, TC-VER-WIKI-005 |
| `User.Author.CompleteHeading` | Get heading suggestions after `[[note#` | `Completion.Trigger.Coverage` | TC-VER-COMP-002 |
| `User.Author.CompleteCallout` | Get callout type suggestions when starting `> [!` | `Completion.CalloutType.Coverage`, `Completion.Trigger.Coverage` | TC-VER-COMP-003, TC-VER-COMP-002 |
| `User.Author.FollowLinkStyle` | Have the server respect the vault's link style convention | `Link.Wiki.StyleBinding`, `Completion.WikiStyle.Binding`, `Rename.StyleBinding.Consistency` | TC-VER-WIKI-001, TC-VER-COMP-004, TC-VER-REN-003 |

## Test Cases

### TC-VAL-AUTH-001 — User.Author.CompleteWikiLink

**User Req Tag:** `User.Author.CompleteWikiLink`
**Goal:** Get suggestions when starting a `[[link`
**Type:** Both
**Mapped FRs:** `Completion.Trigger.Coverage`, `Completion.WikiStyle.Binding`, `Completion.Candidates.Cap`, `Link.Resolution.IgnoreGlob` — see [[tests/verification/verify-completions]], [[tests/verification/verify-wiki-links]]
**Verification coverage:** TC-VER-COMP-002, TC-VER-COMP-004, TC-VER-COMP-001, TC-VER-WIKI-005

**Scenario (user perspective):**
As a vault author, I am writing a new note and want to link to another note I know exists in my vault. I type `[[` and immediately expect a list of note suggestions to appear. I want to narrow the list by typing part of the note name. I expect every suggestion to produce a correctly formatted link when I accept it — one that matches the link style my vault uses — and I expect the editor to keep the list manageable rather than flooding it with hundreds of candidates at once.

**Scripted scenario:**

```gherkin
Feature: Note name completion when starting a wiki-link

  Scenario: Typing [[ triggers a list of note candidates
    Given a vault containing notes "project-alpha.md", "project-beta.md", and "daily-log.md"
    When I type "[[" in a new note
    Then a suggestion list appears immediately
    And the list includes "project-alpha", "project-beta", and "daily-log"
    And each suggestion shows as a note/file candidate

  Scenario: Typing partial text narrows the list
    Given the same vault
    When I type "[[project"
    Then the suggestion list includes "project-alpha" and "project-beta"
    And "daily-log" does not appear in the list

  Scenario: The candidate list is capped when the vault is very large
    Given a vault configured with a maximum of 5 completion candidates
    And the vault contains more than 5 notes
    When I type "[[" to trigger completion
    Then the list shows at most 5 candidates
    And the editor indicates that more results exist beyond what is shown
```

**Agent-driven walkthrough:**

1. Agent creates a vault with 10 notes: `notes/alpha.md` through `notes/kappa.md`.
2. Agent opens the vault in the LSP server.
3. Agent sends a `textDocument/completion` request triggered by `[[` in a new file `notes/new.md`.
4. Agent confirms the completion list includes all 10 document names and that `isIncomplete` is `false`.
5. Agent reconfigures the server with `completion.candidates = 5` and repeats the request.
6. Agent confirms the list contains at most 5 items and `isIncomplete` is `true`.
7. Agent sends a further completion request with the partial text `[[alp` and confirms only `alpha` appears, not `beta` or any other note.

**Pass:** Completion fires immediately on `[[`, the list narrows as text is typed, accepted suggestions produce well-formed links, the candidate cap is respected, and the "more results" indicator appears when the list is truncated.
**Fail:** No list appears on `[[`, the list does not narrow, accepted text is malformed, the list ignores the configured cap, or no truncation indicator appears.

---

### TC-VAL-AUTH-002 — User.Author.CompleteHeading

**User Req Tag:** `User.Author.CompleteHeading`
**Goal:** Get heading suggestions after `[[note#`
**Type:** Both
**Mapped FRs:** `Completion.Trigger.Coverage` — see [[tests/verification/verify-completions]]
**Verification coverage:** TC-VER-COMP-002

**Scenario (user perspective):**
As a vault author, I want to link directly to a section within another note. After typing the note name and a `#`, I expect the editor to show me all headings in that note as suggestions, saving me from opening the target note to find the exact heading text. Only headings from the note I named should appear — not headings from other notes.

**Scripted scenario:**

```gherkin
Feature: Heading completion within a specific note

  Scenario: Typing [[note# shows headings from that note only
    Given "research.md" contains headings "## Background", "## Methods", and "## Results"
    And "other.md" contains the heading "## Conclusion"
    When I type "[[research#" in a new note
    Then the suggestion list includes "Background", "Methods", and "Results"
    And "Conclusion" does not appear in the list
    And each suggestion is identified as a section reference

  Scenario: Accepted heading suggestion completes the link correctly
    Given the same vault
    When I type "[[research#" and accept the "Methods" suggestion
    Then the inserted text is "[[research#Methods]]"
```

**Agent-driven walkthrough:**

1. Agent creates a vault with `notes/alpha.md` (headings: `Introduction`, `Methods`, `Results`) and `notes/beta.md` (headings: `Overview`, `Details`).
2. Agent opens the vault in the LSP server.
3. Agent sends a `textDocument/completion` request triggered after `[[alpha#` in `notes/new.md`.
4. Agent confirms the list includes `Introduction`, `Methods`, and `Results` with kind `Reference`.
5. Agent confirms no headings from `beta.md` appear in the list.

**Pass:** Heading completion fires after `[[notename#`, the list contains only headings from the named note, and selecting a heading produces a correctly formed link.
**Fail:** No suggestions appear, headings from other notes are mixed in, or the resulting link text is malformed.

---

### TC-VAL-AUTH-003 — User.Author.CompleteCallout

**User Req Tag:** `User.Author.CompleteCallout`
**Goal:** Get callout type suggestions when starting `> [!`
**Type:** Both
**Mapped FRs:** `Completion.CalloutType.Coverage`, `Completion.Trigger.Coverage` — see [[tests/verification/verify-completions]]
**Verification coverage:** TC-VER-COMP-003, TC-VER-COMP-002

**Scenario (user perspective):**
As a vault author, I am writing a callout block and have typed `> [!`. I want the editor to suggest all the recognised callout types — such as NOTE, WARNING, TIP, and others — so I can choose the right one without consulting documentation. I expect the full set of standard types to be available and each to be identifiable as a callout type rather than a note name or heading.

**Scripted scenario:**

```gherkin
Feature: Callout type completion

  Scenario: Typing "> [!" triggers callout type suggestions
    When I type "> [!" in any note
    Then the suggestion list appears immediately
    And the list includes "NOTE", "WARNING", "TIP", "INFO", and "DANGER"
    And the list includes "SUCCESS", "QUESTION", "FAILURE", "BUG", "EXAMPLE", "QUOTE", "ABSTRACT", and "TODO"
    And each suggestion is identified as a callout type

  Scenario: Accepted callout suggestion inserts the correct block syntax
    When I type "> [!" and select "WARNING"
    Then the inserted text forms a valid callout opening line
```

**Agent-driven walkthrough:**

1. Agent opens any note file in a vault in the LSP server.
2. Agent sends a `textDocument/completion` request triggered after `> [!` in `notes/new.md`.
3. Agent confirms the list contains at minimum 13 items including `NOTE`, `WARNING`, `TIP`, `INFO`, `SUCCESS`, `QUESTION`, `DANGER`, `FAILURE`, `BUG`, `EXAMPLE`, `QUOTE`, `ABSTRACT`, and `TODO`.
4. Agent confirms each item in the list carries the `EnumMember` kind.

**Pass:** All 13 standard callout types appear in the list when `> [!` is typed, each is distinguishable as a callout type, and selecting one inserts a valid callout block opener.
**Fail:** Fewer than 13 types appear, any standard type is missing, or the suggestion kind is wrong.

---

### TC-VAL-AUTH-004 — User.Author.FollowLinkStyle

**User Req Tag:** `User.Author.FollowLinkStyle`
**Goal:** Have the server respect the vault's link style convention
**Type:** Both
**Mapped FRs:** `Link.Wiki.StyleBinding`, `Completion.WikiStyle.Binding`, `Rename.StyleBinding.Consistency` — see [[tests/verification/verify-wiki-links]], [[tests/verification/verify-completions]], [[tests/verification/verify-rename]]
**Verification coverage:** TC-VER-WIKI-001, TC-VER-COMP-004, TC-VER-REN-003

**Scenario (user perspective):**
As a vault author, I have set my vault to use a specific link style — for example, always writing the file stem without any folder path. I expect every link the editor inserts or rewrites — whether through auto-completion, a rename operation, or any other automated action — to follow that same convention. If I later change the convention, every future insertion should use the new style. I should never have to manually rewrite a link the editor produced.

**Scripted scenario:**

```gherkin
Feature: Vault-wide link style consistency

  Scenario: Completion inserts stem-style links when configured
    Given my vault is configured to write links as file stems (no folder prefix)
    And "research/methods.md" exists in the vault
    When I type "[[" and accept the "methods" suggestion
    Then the inserted link text is "[[methods]]" not "[[research/methods]]"

  Scenario: Completion inserts title-style links when configured
    Given my vault is configured to write links using the note's title
    And "research/methods.md" has the frontmatter title "Research Methods"
    When I type "[[" and accept the suggestion for that note
    Then the inserted link text is "[[Research Methods]]"

  Scenario: Rename preserves the configured link style
    Given my vault is configured to use stem-style links
    And "methods.md" is renamed to "methodology.md"
    Then every link in the vault that previously read "[[methods]]" now reads "[[methodology]]"
    And no link was rewritten using a path-style or title-style form
```

**Agent-driven walkthrough:**

1. Agent creates a vault with `notes/alpha.md` (frontmatter title: `Alpha Document`) and configures the server with `linkStyle = "file-stem"`.
2. Agent sends a `textDocument/completion` request triggered after `[[` in `notes/new.md`.
3. Agent confirms the insert text for `alpha.md` is `alpha` (no path prefix).
4. Agent reconfigures the server with `linkStyle = "title-slug"` and repeats.
5. Agent confirms the insert text for `alpha.md` is `Alpha Document`.
6. Agent verifies that a rename operation on `notes/alpha.md` produces updated links matching the configured style.

**Pass:** Every link inserted or updated by the editor — through completion, rename, or any other automated path — uses the configured link style without exception.
**Fail:** Any inserted link uses a different style than configured, or a rename operation produces links in a mixed or incorrect style.

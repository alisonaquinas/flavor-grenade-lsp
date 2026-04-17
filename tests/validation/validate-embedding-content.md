---
title: Validation — Embedding Content
tags: [test/validation, requirements/user]
aliases: [Validate Embedding Content]
---

# Validation — Embedding Content

## Purpose

This validation plan confirms that vault authors receive immediate, accurate feedback when they embed files in their notes using `![[embed]]` syntax. A vault author should be told right away — without publishing or previewing the vault — if any embedded file has been moved or deleted. They should also be able to hover over an embed and see enough of the target content to confirm they are embedding the right resource, so they can stay in their writing flow without switching files. Together, these capabilities prevent silent breakage in rendered vaults and reduce the cost of maintaining embed-heavy documents.

## User Requirements Covered

| User Req Tag | Goal | Mapped FRs | Verification Coverage |
|---|---|---|---|
| `User.Embed.DetectBrokenEmbed` | Be told immediately when an embedded file is missing | `Embed.Resolution.MarkdownTarget`, `Embed.Resolution.ImageTarget`, `Embed.HeadingEmbed.Resolution`, `Embed.BlockEmbed.Resolution` | TC-VER-EMBD-001, TC-VER-EMBD-002, TC-VER-EMBD-003, TC-VER-EMBD-004 |
| `User.Embed.PreviewLinkedContent` | Hover over an embed to preview the target | `Embed.Resolution.MarkdownTarget`, `Embed.HeadingEmbed.Resolution` | TC-VER-EMBD-001, TC-VER-EMBD-003 |

## Test Cases

### TC-VAL-EMBD-001 — User.Embed.DetectBrokenEmbed

**User Req Tag:** `User.Embed.DetectBrokenEmbed`
**Goal:** Be told immediately when an embedded file is missing
**Type:** Both
**Mapped FRs:** `Embed.Resolution.MarkdownTarget`, `Embed.Resolution.ImageTarget`, `Embed.HeadingEmbed.Resolution`, `Embed.BlockEmbed.Resolution` — see [[tests/verification/verify-embeds]]
**Verification coverage:** TC-VER-EMBD-001, TC-VER-EMBD-002, TC-VER-EMBD-003, TC-VER-EMBD-004

**Scenario (user perspective):**
As a vault author, I have several notes that embed other notes, images, and specific sections or blocks. When I open a note, I want the editor to immediately highlight any embed that cannot be found — whether the whole file is missing, the image was deleted, the heading I named no longer exists, or the block anchor was removed. I should be told about each broken embed with a visible warning directly in the editor, so I can fix it before the problem shows up in a published or shared version of my vault.

**Scripted scenario:**

```gherkin
Feature: Broken embed detection

  Scenario: A valid note embed produces no warning
    Given "index.md" contains "![[meeting-notes]]"
    And "meeting-notes.md" exists in the vault
    When I open "index.md"
    Then no warning appears for "![[meeting-notes]]"

  Scenario: An embed pointing to a deleted note shows a warning
    Given "index.md" contains "![[archived-project]]"
    And no file named "archived-project.md" exists in the vault
    When I open "index.md"
    Then a visible warning appears on the "![[archived-project]]" line
    And the warning message indicates the embedded file cannot be found

  Scenario: An embed pointing to a missing image shows a warning
    Given "index.md" contains "![[screenshot.png]]"
    And no file named "screenshot.png" exists in the assets folder
    When I open "index.md"
    Then a visible warning appears on the "![[screenshot.png]]" line
    And the warning is specific to the missing image, not mistaken for a broken note link

  Scenario: An embed pointing to a heading that no longer exists shows a warning
    Given "index.md" contains "![[methods#Old Heading]]"
    And "methods.md" exists but does not contain a heading "Old Heading"
    When I open "index.md"
    Then a visible warning appears on the "![[methods#Old Heading]]" line
    And the warning message references "Old Heading"

  Scenario: An embed pointing to a missing block anchor shows a warning
    Given "index.md" contains "![[methods#^removed-anchor]]"
    And "methods.md" exists but does not contain a block marked "^removed-anchor"
    When I open "index.md"
    Then a visible warning appears on the "![[methods#^removed-anchor]]" line
    And the warning message references "removed-anchor"

  Scenario: A valid heading embed produces no warning
    Given "index.md" contains "![[methods#Data Collection]]"
    And "methods.md" contains the heading "## Data Collection"
    When I open "index.md"
    Then no warning appears for "![[methods#Data Collection]]"

  Scenario: A valid block embed produces no warning
    Given "index.md" contains "![[methods#^key-finding]]"
    And "methods.md" contains a block marked "^key-finding"
    When I open "index.md"
    Then no warning appears for "![[methods#^key-finding]]"
```

**Agent-driven walkthrough:**

1. Agent creates a vault with `notes/doc.md` (contains `## Section One` and a block `^block-anchor-one`) and `assets/image.png`.
2. Agent opens the vault in the LSP server.
3. Agent creates `notes/index.md` containing `![[missing-document]]` and triggers a file-open event.
4. Agent confirms a warning diagnostic with a message containing "Cannot resolve embed" is published for `notes/index.md`, covering the `![[missing-document]]` range.
5. Agent updates `notes/index.md` to contain `![[missing-image.png]]` and triggers a file-open event.
6. Agent confirms a warning is published for the image embed specifically, and that it is not categorised as a broken note link.
7. Agent updates `notes/index.md` to contain `![[doc#Nonexistent Section]]` and triggers a file-open event.
8. Agent confirms a warning is published mentioning `Nonexistent Section`.
9. Agent updates `notes/index.md` to contain `![[doc#^missing-anchor]]` and triggers a file-open event.
10. Agent confirms a warning is published mentioning `missing-anchor`.
11. Agent updates `notes/index.md` to contain `![[doc]]` and confirms no warning is published.
12. Agent updates `notes/index.md` to contain `![[doc#Section One]]` and confirms no warning is published.
13. Agent updates `notes/index.md` to contain `![[doc#^block-anchor-one]]` and confirms no warning is published.

**Pass:** Every broken embed — whether a missing whole file, missing image, missing heading, or missing block anchor — produces a warning in the editor immediately on file open, and every valid embed produces no warning.
**Fail:** Any broken embed is silently accepted, any valid embed produces a spurious warning, or the warning message does not identify what could not be found.

---

### TC-VAL-EMBD-002 — User.Embed.PreviewLinkedContent

**User Req Tag:** `User.Embed.PreviewLinkedContent`
**Goal:** Hover over an embed to preview the target
**Type:** Both
**Mapped FRs:** `Embed.Resolution.MarkdownTarget`, `Embed.HeadingEmbed.Resolution` — see [[tests/verification/verify-embeds]]
**Verification coverage:** TC-VER-EMBD-001, TC-VER-EMBD-003

**Scenario (user perspective):**
As a vault author, I am reviewing a note that embeds several other notes and sections. I want to hover the cursor over an embed link and see a preview of the content it refers to — enough to confirm it is the right note or section — without navigating away from the note I am currently writing. For a whole-note embed, I expect to see the opening lines of the embedded note. For a heading embed, I expect to see the content under that heading.

**Scripted scenario:**

```gherkin
Feature: Hover preview for embedded content

  Scenario: Hovering over a note embed shows a preview of the note's content
    Given "index.md" contains "![[meeting-notes]]"
    And "meeting-notes.md" starts with "## Action Items\nFollow up with the team."
    When I hover over "![[meeting-notes]]" in "index.md"
    Then a preview popup appears showing content from "meeting-notes.md"
    And the preview contains text from the opening of the note

  Scenario: Hovering over a heading embed shows content under that heading
    Given "index.md" contains "![[methods#Data Collection]]"
    And "methods.md" contains "## Data Collection\nWe used surveys and interviews."
    When I hover over "![[methods#Data Collection]]" in "index.md"
    Then a preview popup appears
    And the preview contains "Data Collection" and the text beneath it

  Scenario: Hovering over a broken embed does not show a preview
    Given "index.md" contains "![[nonexistent-note]]"
    When I hover over "![[nonexistent-note]]" in "index.md"
    Then no preview content is shown
    And the warning that the embed cannot be resolved remains visible
```

**Agent-driven walkthrough:**

1. Agent creates a vault with `notes/doc.md` (content: `# Document\n## Section One\nBody text`) and `notes/another.md` (content: `# Another\nSome text here`).
2. Agent opens the vault in the LSP server.
3. Agent creates `notes/index.md` containing `![[doc]]` and sends a hover request positioned over the embed link.
4. Agent confirms the hover response contains a non-empty text preview drawn from the content of `notes/doc.md`.
5. Agent updates `notes/index.md` to contain `![[doc#Section One]]` and sends a hover request over that embed.
6. Agent confirms the hover response includes content from the `## Section One` section of `notes/doc.md`.
7. Agent updates `notes/index.md` to contain `![[nonexistent]]` and sends a hover request.
8. Agent confirms the hover response is empty or absent (no preview content for a broken embed).

**Pass:** Hovering over a valid note embed or heading embed produces a readable preview of the target content. Hovering over a broken embed produces no preview.
**Fail:** No hover preview appears for valid embeds, the preview shows content from the wrong note, the preview is empty for a valid embed, or a preview appears for a broken embed.

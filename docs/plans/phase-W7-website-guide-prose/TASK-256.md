---
id: "TASK-256"
title: "Concept Article: Completions"
type: task
status: in-review
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-256"]
---

# Concept Article: Completions

> [!INFO] `TASK-256` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `in-review`

## Text Scope

- Explain vault-aware completions for wiki-links, headings, tags, embeds, and
  attachments.
- Describe how indexed candidates differ from generic word completion.
- Include practical triggers such as `[[`, `#`, and attachment/embed contexts.

## Asset Scope

- Reuse `website/public/assets/wiki-link-completion.png` where appropriate.
- Include a completion trigger table and a sample note snippet.

## Draft Article Copy

### What makes completion vault-aware?

Vault-aware completion does not guess from nearby words. It reads indexed vault data and offers candidates that make sense for the syntax under the cursor. After `[[`, indexed notes and the configured link style matter. After `#` inside a wiki-link, headings matter. After `#^`, block anchors matter. Inside an embed or Markdown image target, attachments matter.

Compact definition: completions are LSP suggestions built from the vault index, reference graph inputs, tag registry, callout parser, and attachment index, then routed by the current OFM context.

Sample note:

```markdown
# Daily

Link to [[Pro
Heading link: [[Project Plan#Open
Block link: [[Project Plan#^dec
Embed: ![[arch
Markdown image: ![diagram](assets/arch
Tag: #project/fl
Callout:
> [!NO
```

Completion trigger map:

| Context | Example trigger | Candidate source | Expected candidates |
| --- | --- | --- | --- |
| Wiki-link note | `[[Pro` | VaultIndex documents plus configured link style | `[[Project Plan]]` |
| Wiki-link heading | `[[Project Plan#Op` | Target document headings | `Open Questions` |
| Wiki-link block | `[[Project Plan#^dec` | Target document block anchors | `decision-1` |
| Same-document heading | `[[#Op` | Current document headings | `Open Questions` |
| Embed | `![[arch` | Documents plus attachments | `assets/architecture.png` |
| Markdown link target | `[plan](notes/Pro` | Local documents | `notes/Project Plan.md` style targets |
| Markdown image target | `![diagram](assets/ar` | Attachment index | `assets/architecture.png` |
| Tag | `#project/fl` | TagRegistry | `#project/flavor-grenade` |
| Callout | `> [!NO` | Callout provider | `NOTE` |

Use the screenshot asset `website/public/assets/wiki-link-completion.png` for the wiki-link completion example when this copy moves into website content.

Completions also respect configured candidate limits and link style. If the vault has many matching notes, the server truncates the list and marks the result incomplete instead of flooding the editor. If the current syntax is a Markdown link target, the server offers Markdown-compatible targets rather than blindly inserting wiki-link syntax.

For maintainers: completion should be context-routed, not global. Add a provider only after defining the trigger context, replacement range, candidate source, and quiet behavior outside that context. Keep candidates derived from indexed vault state so they agree with diagnostics and navigation.

Related-link intent: link this page from Quickstart, Obsidian Flavored Markdown, Vault Index, Wiki-link Resolution, Tags, Embeds, and attachment docs. It should explain why suggestions improve after the vault is indexed.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Article explains indexed completion behavior.
- [ ] Completion screenshot, table, or snippet is present.
- [ ] Route metadata, sitemap, and tests include the article.

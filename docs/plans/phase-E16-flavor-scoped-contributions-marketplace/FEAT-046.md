---
id: "FEAT-046"
title: "Flavor-Scoped Contributions And Marketplace"
type: feature
status: draft
priority: high
phase: E16
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-045"]
tags: [tickets/feature, "phase/E16", markdown-flavor, marketplace]
aliases: ["FEAT-046"]
---

# Flavor-Scoped Contributions And Marketplace

> [!INFO] `FEAT-046` - Feature - Phase E16 - Status: `draft`

## Goal

Move extension contributions and Marketplace proof from the old `ofmarkdown`
language-mode story to the current Markdown flavor selector model.

## Scope

- Update activation for selector interaction.
- Rewrite snippets, keybindings, and language configuration scoping.
- Update README, troubleshooting, visual proof, and exact Marketplace tests
  `extension/test/marketplace/readme-assets.test.ts` and
  `extension/test/marketplace/vsix-assets.test.ts`.
- Preserve generic Markdown isolation.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-305]] | Update activation for flavor selector and Markdown-only startup | `open` |
| [[TASK-306]] | Rewrite editor contributions around flavor context | `open` |
| [[TASK-307]] | Update Marketplace README and selector visual proof | `open` |
| [[TASK-308]] | Update troubleshooting and activation docs for flavor selection | `open` |
| [[TASK-309]] | Update contribution and Marketplace verification tests | `open` |
| [[CHORE-111]] | Phase E16 documentation trace sweep | `open` |
| [[CHORE-112]] | Phase E16 verification and closeout sweep | `open` |

## Definition of Done

- [ ] Contribution tests no longer require `editorLangId == ofmarkdown`.
- [ ] Generic CommonMark Markdown is not affected by Obsidian-only affordances.
- [ ] Marketplace proof shows the Markdown flavor selector.
- [ ] Packaged asset verification passes through
      `extension/test/marketplace/readme-assets.test.ts` and
      `extension/test/marketplace/vsix-assets.test.ts`.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from contribution and Marketplace gaps.

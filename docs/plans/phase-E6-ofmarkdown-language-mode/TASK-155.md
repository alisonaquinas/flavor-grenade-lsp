---
id: "TASK-155"
title: "Update release docs and Marketplace notes"
type: task
status: open
priority: "medium"
phase: "E6"
parent: "FEAT-020"
created: "2026-05-03"
updated: "2026-05-03"
dependencies: ["TASK-154"]
tags: [tickets/task, "phase/E6"]
aliases: ["TASK-155"]
---

# Update release docs and Marketplace notes

> [!INFO] `TASK-155` · Task · Phase E6 · Parent: [[FEAT-020]] · Status: `open`

## Description

Update user-facing extension docs so OFMarkdown language mode is discoverable and its non-hijacking behavior is clear.

---

## Implementation Notes

- Document that generic Markdown remains Markdown.

- Document that Obsidian vault notes become OFMarkdown automatically.

- Document language-specific VS Code settings with `[ofmarkdown]`.

- Mention the feature in extension README and changelog.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| Extension.LanguageMode.Contribution | Contribute `ofmarkdown` without globally claiming `.md` files | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.NonVaultIsolation | Preserve generic Markdown mode | [[requirements/ofmarkdown-language-mode]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `Generic markdown remains Markdown` |

---

## Definition of Done

- [ ] README describes OFMarkdown mode

- [ ] Changelog entry added

- [ ] `[ofmarkdown]` settings example documented

- [ ] No implementation behavior changes in this task

---

## Workflow Log

> [!INFO] Opened — 2026-05-03
> Ticket created. Status: `open`. Parent: [[FEAT-020]].

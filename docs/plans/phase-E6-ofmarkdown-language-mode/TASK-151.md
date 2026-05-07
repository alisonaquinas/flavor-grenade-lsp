---
id: "TASK-151"
title: "Contribute OFMarkdown language metadata"
type: task
status: done
priority: "high"
phase: "E6"
parent: "FEAT-020"
created: "2026-05-03"
updated: "2026-05-07"
dependencies: []
tags: [tickets/task, "phase/E6"]
aliases: ["TASK-151"]
---

# Contribute OFMarkdown language metadata

> [!INFO] `TASK-151` · Task · Phase E6 · Parent: [[FEAT-020]] · Status: `done`

## Description

Add the VS Code manifest and asset metadata needed for the `ofmarkdown` language id without globally associating `.md` files to it.

---

## Implementation Notes

- Add `contributes.languages` entry for `ofmarkdown`.

- Add `onLanguage:ofmarkdown` activation event.

- Add Markdown-compatible `language-configuration.json`.

- Add TextMate grammar bridge under `extension/syntaxes/`.

- Do not add `.md` to the `ofmarkdown` language contribution.

- See also: [[features/ofmarkdown-language-mode]], [[adr/ADR016-ofmarkdown-language-mode]].

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| Extension.LanguageMode.Contribution | Contribute `ofmarkdown` without globally claiming `.md` files | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.MarkdownParity | Preserve baseline Markdown editing behavior | [[requirements/ofmarkdown-language-mode]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `OFMarkdown keeps Markdown editing behavior` |

---

## Definition of Done

- [x] Manifest contributes `ofmarkdown`

- [x] No global `.md` association exists for `ofmarkdown`

- [x] Markdown-compatible grammar/configuration is present

- [x] Extension build passes; PR #38 CI passed before merge

---

## Workflow Log

> [!INFO] Opened — 2026-05-03
> Ticket created. Status: `open`. Parent: [[FEAT-020]].

> [!INFO] Review sync — 2026-05-07
> Manifest, grammar, language configuration, and extension build evidence are present; status moved to `in-review`.

> [!INFO] Done — 2026-05-07
> PR #38 CI passed. Status moved to `done`.

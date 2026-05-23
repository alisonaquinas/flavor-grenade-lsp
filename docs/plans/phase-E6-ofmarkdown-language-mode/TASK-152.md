---
id: "TASK-152"
title: "Implement LanguageModeController"
type: task
status: done
priority: "high"
phase: "E6"
parent: "FEAT-020"
created: "2026-05-03"
updated: "2026-05-07"
dependencies: ["TASK-151"]
tags: [tickets/task, "phase/E6"]
aliases: ["TASK-152"]
---

# Implement LanguageModeController

> [!INFO] `TASK-152` · Task · Phase E6 · Parent: [[FEAT-020]] · Status: `done`

## Description

Create the extension-side component that promotes qualifying `markdown` documents to `ofmarkdown` and preserves non-qualifying or manually overridden documents.

---

## Implementation Notes

- Watch opened documents, visible editor changes, workspace folder changes, and server readiness.

- Promote when `.obsidian/` ancestor detection succeeds or server membership returns positive.

- Preserve language ids other than `markdown` and `ofmarkdown`.

- Track in-flight assignments per URI to avoid close/open loops.

- Keep LanguageClient selector registered for both `markdown` and `ofmarkdown`.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| Extension.LanguageMode.DynamicAssignment | Promote qualifying vault/index documents | [[docs/requirements/functional/ofmarkdown-language-mode]] |
| Extension.LanguageMode.NonVaultIsolation | Preserve generic Markdown mode | [[docs/requirements/functional/ofmarkdown-language-mode]] |
| Extension.LanguageMode.UserOverrideSafety | Preserve manual non-Markdown selections | [[docs/requirements/functional/ofmarkdown-language-mode]] |
| Extension.LanguageMode.LoopSafety | Avoid assignment and restart loops | [[docs/requirements/functional/ofmarkdown-language-mode]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `Obsidian vault markdown is promoted to OFMarkdown` |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `Generic markdown remains Markdown` |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `Manual language mode selection is preserved` |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `Language mode promotion does not restart the language client` |

---

## Definition of Done

- [x] Client-side `.obsidian/` detection promotes qualifying Markdown

- [x] Non-vault Markdown remains Markdown

- [x] Manual language selections are preserved

- [x] Loop guard covered by tests

---

## Workflow Log

> [!INFO] Opened — 2026-05-03
> Ticket created. Status: `open`. Parent: [[FEAT-020]].

> [!INFO] Review sync — 2026-05-07
> `LanguageModeController` behavior is implemented and covered by `extension/src/language-mode.test.ts`; status moved to `in-review`.

> [!INFO] Done — 2026-05-07
> PR #38 CI passed. Status moved to `done`.

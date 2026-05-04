---
id: "TASK-154"
title: "Add OFMarkdown tests and smoke coverage"
type: task
status: open
priority: "high"
phase: "E6"
parent: "FEAT-020"
created: "2026-05-03"
updated: "2026-05-03"
dependencies: ["TASK-151", "TASK-152", "TASK-153"]
tags: [tickets/task, "phase/E6"]
aliases: ["TASK-154"]
---

# Add OFMarkdown tests and smoke coverage

> [!INFO] `TASK-154` · Task · Phase E6 · Parent: [[FEAT-020]] · Status: `open`

## Description

Add automated tests and a documented manual smoke test covering the OFMarkdown language mode acceptance surface.

---

## Implementation Notes

- Unit-test manifest/server selector helpers where practical.

- Unit-test `LanguageModeController` promotion, preservation, and loop guard behavior.

- Test `flavorGrenade/documentMembership` server request.

- Add manual smoke steps to extension docs.

- Update [[test/matrix]] and [[test/index]] for new test files.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| Extension.LanguageMode.Contribution | Contribute `ofmarkdown` without globally claiming `.md` files | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.DynamicAssignment | Promote qualifying vault/index documents | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.LoopSafety | Avoid assignment and restart loops | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.MarkdownParity | Preserve baseline Markdown editing behavior | [[requirements/ofmarkdown-language-mode]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | All scenarios |

---

## Definition of Done

- [ ] Extension tests pass

- [ ] Server tests pass

- [ ] Manual smoke procedure documented

- [ ] Test index and matrix updated

---

## Workflow Log

> [!INFO] Opened — 2026-05-03
> Ticket created. Status: `open`. Parent: [[FEAT-020]].

---
id: "TASK-294"
title: "Rewrite BDD harness around effective flavor state"
type: task
status: done
priority: high
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-044", "FEAT-045"]
tags: [tickets/task, "phase/21", bdd, markdown-flavor]
aliases: ["TASK-294"]
---

# Rewrite BDD Harness Around Effective Flavor State

## Description

Change the BDD extension harness so it tracks `effectiveFlavor` separately from
VS Code `languageId`.

## Work Scope

- Remove simulated vault-to-`ofmarkdown` assignment.
- Add state for selector label, configured flavor, effective flavor,
  `.fgattributes` target, and `.fgignore` inactive state.
- Record simulated `.fgattributes` writes and resource-specific propagation
  payloads so server propagation assertions are observable.
- Preserve manual non-Markdown language behavior.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownLanguage.PreserveDefault` | `GAP-S-006` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | Language remains `markdown` while flavor changes. |

## Definition of Done

- [ ] Harness state has `effectiveFlavor`.
- [ ] Existing language-mode assertions no longer expect `ofmarkdown`.
- [ ] Manual non-Markdown language scenarios assert no `.fgattributes` write and no
      server propagation.
- [ ] BDD tests fail honestly when flavor steps are missing.

## Implementation Notes

- Primary file: `src/test/bdd/step-definitions/extension-harness.steps.ts`.
- State shape: keep `languageId`, `configuredFlavor`, `effectiveFlavor`,
  `.fgattributes` target writes, `.fgignore` inactive state, and
  resource-specific payloads as separate `ExtensionState` fields.
- RED check: run `bun run bdd -- docs/bdd/features/ofmarkdown-language-mode.feature docs/bdd/features/markdown-flavor-dialects.feature`.
- GREEN check: the same BDD command passes with `.md` documents remaining in
  `markdown`.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!SUCCESS] Done - 2026-05-13
> `bun run bdd -- docs/bdd/features/ofmarkdown-language-mode.feature docs/bdd/features/markdown-flavor-dialects.feature`
> passed with 178 scenarios and 1074 steps. Existing harness state tracks
> `languageId`, `configuredFlavor`, `effectiveFlavor`, `.fgattributes` writes,
> `.fgignore` inactive state, and server notifications separately.

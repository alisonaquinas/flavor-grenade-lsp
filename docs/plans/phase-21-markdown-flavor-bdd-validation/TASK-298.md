---
id: "TASK-298"
title: "Add flavor validation review evidence"
type: task
status: done
priority: medium
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-296"]
tags: [tickets/task, "phase/21", validation, markdown-flavor]
aliases: ["TASK-298"]
---

# Add Flavor Validation Review Evidence

## Description

Create validation evidence showing the flavor list and dialect profiles match
product intent and research sources.

## Work Scope

- Add a product review checklist or validation note.
- Trace every displayed flavor to research or `ofm-spec`.
- Add a validation run artifact with date, reviewer or generating command,
  commit SHA, commands, outputs, and pass/fail status for MF-VA-001 through
  MF-VA-004.
- Validate that BDD fixture constants match the intended product list only as
  temporary executable contracts.
- Require follow-up validation against the actual extension schema, product
  registry, and server configuration behavior after Phase 19/E15.
- Confirm `mdx` as a flavor does not authorize language-mode changes.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-011` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `docs/test/markdown-flavor-validation-spec.md` | MF-VA-001 through MF-VA-004 evidence. |

## Definition of Done

- [ ] Research trace, product review, and validation run artifacts exist under
      `docs/test/evidence/`.
- [ ] Every flavor has source evidence.
- [ ] Evidence records date, reviewer or generating command, commit SHA,
      commands run, linked output, and pass/fail status for MF-VA-001 through
      MF-VA-004.
- [ ] Validation distinguishes temporary harness fixtures from implemented
      product registry/server behavior.
- [ ] Platform flavor safety is explicitly reviewed.

## Implementation Notes

- Primary files:
  `docs/test/evidence/markdown-flavor-product-review.md`,
  `docs/test/evidence/markdown-flavor-validation-run.md`,
  `docs/test/evidence/markdown-flavor-research-trace.md`, and
  `docs/test/evidence/markdown-flavor-host-boundary-review.md`.
- Artifacts must use repository-relative paths and must not include local user
  paths, note content, `.fgignore`/`.fgattributes` contents, environment
  variables, API-like tokens, or raw server output containing document content.
- Product review must distinguish `auto` as a detection state from explicit
  dialect profiles and confirm `mdx` flavor does not authorize VS Code language
  mode changes.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!SUCCESS] Done - 2026-05-13
> Added sanitized product-review and validation-run artifacts, then updated the
> research trace and host-boundary review with Phase 21 review metadata and
> validation-row results.

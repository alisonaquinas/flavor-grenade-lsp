---
id: "TASK-329"
title: "Add GLFM tests and validation evidence"
type: task
status: open
priority: high
phase: 26
parent: "FEAT-052"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-052"]
tags: [tickets/task, "phase/26", markdown-flavor, "glfm"]
aliases: ["TASK-329"]
---

# Add GLFM tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the glfm flavor using [[research/gitlab-flavored-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying glfm behavior through flavor state.
- Record GitLab Flavored Markdown signature behavior: GitLab-specific references, media syntax, heading ids, and platform extensions.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-014 - GLFM Parser And Analysis|MF-U-014]] | Profile and parser behavior for glfm. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor glfm. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |
| Test | `src/test/bdd/step-definitions/extension-harness.steps.ts` |
| Evidence | `docs/test/evidence/markdown-flavor-research-trace.md` |
| Evidence | `docs/test/evidence/markdown-flavor-validation-run.md` |

## Definition of Done

- [ ] glfm behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

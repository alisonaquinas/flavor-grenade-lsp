---
id: "TASK-161"
title: "Navigate Markdown links and labels"
type: task
status: open
priority: high
phase: 14
parent: "FEAT-021"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-158", "TASK-159"]
tags: [tickets/task, "phase/14"]
aliases: ["TASK-161"]
---

# Navigate Markdown links and labels

> [!INFO] `TASK-161` · Task · Phase 14 · Parent: [[FEAT-021]] · Status: `open`

## Description

Extend definition and references handlers so Markdown local links, same-document
anchors, and reference labels navigate through the existing vault graph.
Definition on a reference label should jump to its link definition; references
on a label definition should include all same-document label uses.

---

## Implementation Notes

- Definition on `alpha.md` in `[Alpha](alpha.md)` returns `notes/alpha.md`.
- Definition on `#Links` in `[Links](#Links)` returns the heading location.
- Definition on `alpha-ref` in `[Alpha][alpha-ref]` returns
  `[alpha-ref]: alpha.md`.
- References on a heading include matching Markdown anchors.
- References on a label definition include same-document label uses.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.NavigationAndReferences` | Markdown link and label forms participate in definition and references | [[requirements/functional/ofmarkdown-parity]] |
| `Navigation.Definition.AllLinkTypes` | Definition works for Markdown local links and labels | [[requirements/navigation]] |
| `Navigation.References.Completeness` | References include Markdown local links and label uses | [[requirements/navigation]] |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Same-document anchors participate in definition and references | [[requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Local Markdown inline links resolve like wiki-links` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Reference-style links resolve through their link definitions` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Same-document Markdown anchors behave like heading references` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/handlers/markdown-link-navigation.test.ts` | Unit | `Navigation.Definition.AllLinkTypes` | 🔴 failing |
| `src/handlers/markdown-link-references.test.ts` | Unit | `Navigation.References.Completeness` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Markdown links use existing navigation surfaces |

---

## Parent Feature

[[FEAT-021]] - Markdown Link Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-158]] - references require graph indexing.
- [[TASK-159]] - definition requires Oracle resolution.

**Unblocks:**

- [[TASK-162]] - rename depends on complete reference discovery.
- [[CHORE-045]] - test matrix sweep needs navigation evidence rows.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Definition works for inline Markdown file links.
- [ ] Definition works for same-document and file-plus-heading anchors.
- [ ] Definition works from label uses to label definitions.
- [ ] References include Markdown anchors and same-document label uses.
- [ ] Existing wiki-link, embed, block-reference, and tag navigation remains
  green.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenarios pass locally.
- [ ] [[test/matrix]] and [[test/index]] are updated for new tests.
- [ ] Parent feature [[FEAT-021]] child task row updated to `in-review`.

---

## Notes

Navigation is downstream of parser, classifier, graph, and Oracle work. Do not
duplicate resolution logic in handlers.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ ->
`in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit
> must precede the implementation commit in git history with no exceptions. See
> See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order.
> Do not edit previous entries. Update the `status` frontmatter field to match
> the current state whenever adding an entry.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-021]].

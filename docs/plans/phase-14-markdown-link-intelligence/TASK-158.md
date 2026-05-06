---
id: "TASK-158"
title: "Index Markdown link references in RefGraph"
type: task
status: red
priority: high
phase: 14
parent: "FEAT-021"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-156", "TASK-157"]
tags: [tickets/task, "phase/14"]
aliases: ["TASK-158"]
---

# Index Markdown link references in RefGraph

> [!INFO] `TASK-158` · Task · Phase 14 · Parent: [[FEAT-021]] · Status: `red`

## Description

Teach the reference graph to index local Markdown link references and
document-local label definitions without creating a second document cache.
Reference-style uses must bind only to link definitions in the same document.

---

## Implementation Notes

- Add graph entries for `MarkdownLinkRef`, `MarkdownImageRef`, `LinkLabelRef`,
  and `LinkLabelDef`.
- Index local inline link and image targets after classifier filtering.
- Bind `[text][label]`, `[label][]`, and `[label]` to same-document
  definitions case-insensitively.
- Keep DocIds vault-relative and extension-free.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.ReferenceGraph` | Markdown document refs, image refs, label refs, and label definitions are indexed in RefGraph | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.LocalResolution` | Markdown link and label references are represented in the vault graph | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.Attachments.Intelligence` | Markdown image references are available to later attachment intelligence | [[requirements/functional/ofmarkdown-parity]] |
| `Navigation.References.Completeness` | Markdown references are available to reference queries | [[requirements/navigation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Reference-style links resolve through their link definitions` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Same-document Markdown anchors behave like heading references` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/ref-graph-markdown-links.test.ts` | Unit | `Navigation.References.Completeness` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Markdown link refs join the existing reference graph model |

---

## Parent Feature

[[FEAT-021]] - Markdown Link Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-156]] - parsed link and label nodes must exist.
- [[TASK-157]] - target classification must identify local targets.

**Unblocks:**

- [[TASK-159]] - Oracle resolution reads graph entries.
- [[TASK-161]] - references behavior depends on graph completeness.
- [[TASK-162]] - rename needs graph locations for edit generation.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] RefGraph indexes inline Markdown links and reference definitions.
- [ ] RefGraph indexes local Markdown image links as `MarkdownImageRef`
  entries instead of generic document links.
- [ ] Reference labels do not leak across documents.
- [ ] External URL targets are absent from vault reference graph entries.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenarios pass or are ready for Oracle/navigation work.
- [ ] [[test/matrix]] and [[test/index]] are updated for new tests.
- [ ] Parent feature [[FEAT-021]] child task row updated to `in-review`.

---

## Notes

Do not maintain a second parsed document store. All parsed `OFMDoc` data remains
owned by `VaultIndex`.

## Implementation Details

- Extend `src/resolution/ref-graph.ts` in place; do not add another document
  cache.
- Add `MarkdownLinkGraphRef`, `MarkdownImageGraphRef`, and label lookup support
  keyed by `sourceDocId` plus normalized label.
- Rebuild Markdown graph state inside `RefGraph.rebuild()` from
  `doc.index.markdownLinks`, `doc.index.markdownImages`, `doc.index.linkLabelRefs`,
  and `doc.index.linkLabelDefs`.
- Consume `classifyMarkdownTarget()` from [[TASK-157]] before registering vault
  references.
- Add tests in `src/resolution/__tests__/ref-graph-markdown-links.test.ts`.

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

> [!INFO] Detailed - 2026-05-06
> Step C implementation details added. Graph write scope is
> `src/resolution/ref-graph.ts` and Markdown RefGraph tests. Status: `open`.

> [!WARNING] Red - 2026-05-06
> RED tests added for Markdown link RefGraph indexing before implementation.
> Status: `red`.

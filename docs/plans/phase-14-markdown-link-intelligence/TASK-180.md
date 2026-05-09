---
id: "TASK-180"
title: "Complete Markdown link URL targets"
type: task
status: done
priority: high
phase: 14
parent: "FEAT-021"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-156", "TASK-157"]
tags: [tickets/task, "phase/14"]
aliases: ["TASK-180"]
---

# Complete Markdown link URL targets

> [!INFO] `TASK-180` · Task · Phase 14 · Parent: [[FEAT-021]] · Status: `done`

## Description

Extend completion routing so standard Markdown link URL contexts return
vault-aware document and heading candidates. The provider must cover
`[text](`, file-plus-fragment targets, and same-document fragment targets
without changing wiki-link, tag, embed, block-reference, or callout completion
behavior.

---

## Implementation Notes

- Detect Markdown link URL completion contexts from parser target ranges.
- Offer vault document candidates for `[text](...)` local target positions.
- Offer heading candidates after `#` in `[text](#...)` and
  `[text](note#...)` contexts.
- Suppress completion inside external URL and unknown-scheme targets.
- Reuse existing completion candidate caps, sorting, and style-binding helpers
  where they apply.
- See also: [[plans/phase-14-markdown-link-intelligence]].

## Implementation Details

- Extend `src/completion/context-analyzer.ts` with Markdown link URL, file
  fragment, and same-document fragment completion contexts.
- Extend `src/completion/completion-router.ts` to route those contexts to
  existing document and heading providers where possible.
- Add a small Markdown-target completion adapter only if existing providers
  cannot preserve Markdown URL replacement ranges.
- Add tests in `src/completion/__tests__/markdown-link-completion.test.ts` and
  extend BDD only after unit behavior is green.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.Completion` | Markdown link URL contexts return document and heading candidates | [[requirements/functional/ofmarkdown-parity]] |
| `Completion.Trigger.Coverage` | Markdown link URL contexts return completion candidates | [[requirements/completions]] |
| `Parity.MarkdownLinks.LocalResolution` | Completion candidates target locally resolvable documents and headings | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Same-document anchor completion offers headings from the current document | [[requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/completions.feature` | Markdown link URL trigger returns document candidates |
| `docs/bdd/features/completions.feature` | Markdown link fragment trigger returns heading candidates |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Same-document Markdown anchors behave like heading references` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/completion/markdown-link-completion.test.ts` | Unit | `Completion.Trigger.Coverage` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Standard Markdown link URL contexts become first-class completion sites |

---

## Parent Feature

[[FEAT-021]] - Markdown Link Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-156]] - parsed Markdown link target ranges must exist.
- [[TASK-157]] - target classification must distinguish local and external URL
  contexts.

**Unblocks:**

- Phase 14 completion acceptance for `Completion.Trigger.Coverage`.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log).
- [ ] Implementation written to make test(s) pass (GREEN commit follows).
- [ ] `[text](` contexts offer local document candidates.
- [ ] `[text](#` contexts offer headings from the current document.
- [ ] `[text](note#` contexts offer headings from the resolved target
  document.
- [ ] External URL contexts do not produce vault completion candidates.
- [ ] Existing completion scenarios for wiki-links, tags, embeds, block
  references, and callouts remain green.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] [[test/matrix]] and [[test/index]] are updated for new tests.
- [ ] Parent feature [[FEAT-021]] child task row updated to `in-review`.

---

## Notes

This task completes the Phase 14 trace to
[[requirements/completions#Completion.Trigger.Coverage]]. Attachment path
completion inside Markdown image targets belongs to [[TASK-164]] in Phase 15.

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
> the current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-021]].

> [!INFO] Detailed - 2026-05-06
> Step C implementation details added. Completion write scope is
> `src/completion/context-analyzer.ts`, `src/completion/completion-router.ts`,
> optional provider adapter, and Markdown completion tests. Status: `open`.

> [!WARNING] Red - 2026-05-06
> RED tests added for Markdown link target and heading completion before
> implementation. Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Added Markdown link target and heading completion contexts, Markdown URL
> insert-text provider, and `(` trigger-character registration. `bun test
> src/completion/__tests__/context-analyzer.test.ts
> src/completion/__tests__/completion-router.test.ts`, `bun run typecheck`,
> and `bun run lint -- --max-warnings 0` pass. Status: `green`.

> [!SUCCESS] Review Ready - 2026-05-06
> Local phase gates pass after implementation and sweep fixes. Status: `in-review`.

> [!SUCCESS] Done - 2026-05-06
> PR #30 passed CI and the Phase 14 gate is ready to merge. Status: `done`.

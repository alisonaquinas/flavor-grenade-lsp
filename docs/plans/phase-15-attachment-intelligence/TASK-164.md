---
id: "TASK-164"
title: "Complete attachment references"
type: task
status: done
priority: high
phase: 15
parent: "FEAT-022"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-163"]
tags: [tickets/task, "phase/15"]
aliases: ["TASK-164"]
---

# Complete attachment references

> [!INFO] `TASK-164` · Task · Phase 15 · Parent: [[FEAT-022]] · Status: `done`

## Description

Provide attachment path completions in embed targets and Markdown image link
targets. Completion must use the attachment index from [[TASK-163]] and remain
separate from note completion so binary assets do not pollute document-oriented
candidate lists.

---

## Implementation Notes

- Offer attachment candidates inside `![[...]]` attachment contexts.
- Offer attachment candidates inside local `![alt](...)` target contexts.
- Extend `src/completion/context-analyzer.ts` to distinguish Markdown image
  target contexts from document Markdown link target contexts.
- Route Markdown image target completions through
  `src/completion/embed-completion-provider.ts` or a narrow attachment
  completion method backed by `VaultIndex` attachments.
- Prefer configured attachment-folder hints once [[TASK-168]] lands, but do not
  block base completion on config polish.
- Preserve existing Markdown document completions for document link contexts.
- See also: [[docs/plans/phase-15-attachment-intelligence]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.Attachments.Completion` | Embed and Markdown image contexts complete indexed attachment paths | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.Attachments.Intelligence` | Attachment references support completion | [[docs/requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Attachment references support completion, definition, and hover` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/completion/__tests__/context-analyzer.test.ts` | Unit | `Parity.Attachments.Intelligence` | 🔴 failing |
| `src/completion/__tests__/completion-router.test.ts` | Unit | `Parity.Attachments.Intelligence` | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in
> Update [[docs/test/matrix]] and [[docs/test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[docs/adr/ADR017-standard-markdown-link-intelligence]] | Markdown image links are attachment references |

---

## Parent Feature

[[FEAT-022]] — Attachment Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-163]] — attachment candidates must come from the vault attachment index.

**Unblocks:**

- [[TASK-168]] — config polish can tune completion ordering and folder hints.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log).
- [ ] Implementation written to make test(s) pass (GREEN commit follows).
- [ ] Completion includes existing `assets/diagram.png` in the linked BDD scenario.
- [ ] Attachment completions do not appear in unrelated note completion contexts.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenario passes locally.
- [ ] [[docs/test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[docs/test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-022]] child task row updated to `in-review`.

---

## Notes

Completion can ship before config polish. [[TASK-168]] should only refine folder
preference behavior, not introduce the provider from scratch.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ ->
`in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit
> must precede the implementation commit in git history with no exceptions. See
> See [[docs/requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[docs/templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened — 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-022]].

> [!INFO] Red - 2026-05-06
> Added failing completion coverage for Markdown image target contexts,
> attachment-only provider completions, and router dispatch to attachment
> completions without document candidates.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Added a Markdown image completion context, routed it to attachment-only
> completions, and backed attachment candidates with `VaultIndex.attachments()`.
> Focused completion tests, `bun run typecheck`, and `bun run lint --
> --max-warnings 0` pass.
> Status: `green`.

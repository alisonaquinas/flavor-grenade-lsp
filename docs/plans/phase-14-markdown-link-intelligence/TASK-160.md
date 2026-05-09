---
id: "TASK-160"
title: "Diagnose Markdown heading anchors"
type: task
status: done
priority: high
phase: 14
parent: "FEAT-021"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-157", "TASK-159"]
tags: [tickets/task, "phase/14"]
aliases: ["TASK-160"]
---

# Diagnose Markdown heading anchors

> [!INFO] `TASK-160` · Task · Phase 14 · Parent: [[FEAT-021]] · Status: `done`

## Description

Emit diagnostics for Markdown links whose local heading fragments are missing
or ambiguous, while suppressing vault broken-link diagnostics for external URLs
and unknown schemes. Ambiguous heading diagnostics must include related
information for every candidate heading.

---

## Implementation Notes

- Diagnose `[Missing](#Missing)` and `[Missing](doc.md#Missing)` as missing
  heading anchors.
- Diagnose duplicate normalized headings for Markdown and existing wiki heading
  links consistently.
- Preserve external URL suppression for `[External](https://example.com/page)`.
- Reuse existing diagnostic code conventions where possible.

## Implementation Details

- Extend `src/resolution/diagnostic-service.ts` to inspect parsed Markdown link
  entries and classifier results.
- Reuse Oracle Markdown resolution results from [[TASK-159]] for missing and
  ambiguous heading diagnostics.
- Prefer parser target or fragment ranges for diagnostic locations; fall back
  to the full link range only when no finer range exists.
- Keep external URL and unsupported scheme targets diagnostic-free.
- Add tests in `src/resolution/__tests__/markdown-link-diagnostics.test.ts`.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.SameDocumentAnchor` | Missing same-document anchors produce diagnostics | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.HeadingAmbiguity.Diagnostics` | Duplicate heading anchors produce related information | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.TargetClassification` | External URL targets are suppressed before vault diagnostics | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.LocalResolution` | External URLs produce no vault diagnostics | [[requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `External Markdown links do not produce vault diagnostics` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Same-document Markdown anchors diagnose missing headings` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Duplicate heading anchors produce related information` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/markdown-link-diagnostics.test.ts` | Unit | `Parity.HeadingAmbiguity.Diagnostics` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Markdown heading anchors must diagnose like OFM heading links |

---

## Parent Feature

[[FEAT-021]] - Markdown Link Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-157]] - external URLs must be classified before diagnostics.
- [[TASK-159]] - diagnostics need missing and ambiguous Oracle states.

**Unblocks:**

- [[CHORE-045]] - test matrix sweep needs diagnostic evidence rows.
- [[CHORE-046]] - documentation trace sweep needs final diagnostic mappings.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Missing Markdown heading anchors produce the intended diagnostic range.
- [ ] Ambiguous heading anchors include all candidate heading locations.
- [ ] Existing wiki-link duplicate heading diagnostics remain green.
- [ ] External URL links produce no FG001 or vault broken-link diagnostics.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenarios pass locally.
- [ ] [[test/matrix]] and [[test/index]] are updated for new tests.
- [ ] Parent feature [[FEAT-021]] child task row updated to `in-review`.

---

## Notes

Run this after Oracle resolution is available. Avoid string-search diagnostics
that bypass parsed link ranges.

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
> Step C implementation details added. Diagnostic write scope is
> `src/resolution/diagnostic-service.ts` and Markdown diagnostic tests. Status:
> `open`.

> [!WARNING] Red - 2026-05-06
> RED tests added for Markdown heading diagnostics and external URL suppression
> before implementation. Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Markdown link diagnostics now suppress non-vault URL targets, diagnose missing
> heading anchors, and report ambiguous heading anchors with candidate heading
> ranges. `bun test
> src/resolution/__tests__/markdown-link-diagnostics.test.ts`,
> `bun run typecheck`, and `bun run lint -- --max-warnings 0` pass. Status:
> `green`.

> [!SUCCESS] Review Ready - 2026-05-06
> Local phase gates pass after implementation and sweep fixes. Status: `in-review`.

> [!SUCCESS] Done - 2026-05-06
> PR #30 passed CI and the Phase 14 gate is ready to merge. Status: `done`.

---
id: "TASK-157"
title: "Classify Markdown link targets"
type: task
status: open
priority: high
phase: 14
parent: "FEAT-021"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-156"]
tags: [tickets/task, "phase/14"]
aliases: ["TASK-157"]
---

# Classify Markdown link targets

> [!INFO] `TASK-157` · Task · Phase 14 · Parent: [[FEAT-021]] · Status: `open`

## Description

Add a Markdown target classifier that separates local vault targets from
external URLs and unknown schemes before graph construction or diagnostics run.
The classifier must preserve file fragments and same-document fragments for
Oracle resolution.

---

## Implementation Notes

- Classify relative paths, vault-root-relative paths, `path#heading`, and
  `#heading` as local targets.
- Classify `http:`, `https:`, `mailto:`, `tel:`, and unrecognized schemes as
  non-vault targets.
- Preserve enough structured data for file target, fragment, image-vs-link
  syntax, and original text range.
- Follow [[ofm-spec/markdown-links]] `OFM-MDLINK-004`.

## Implementation Details

- Create `src/resolution/markdown-target-classifier.ts` with a pure
  `classifyMarkdownTarget(target: string)` API and exported discriminated union
  for local file, same-document fragment, external URL, and unsupported-scheme
  targets.
- Add tests in
  `src/resolution/__tests__/markdown-target-classifier.test.ts`.
- Keep classification independent from `VaultIndex`; path-to-DocId resolution
  remains in [[TASK-159]].
- Do not emit diagnostics from this module.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.TargetClassification` | Classify Markdown targets as local documents, attachments, fragments, URLs, or unsupported schemes | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.LocalResolution` | Local links participate in vault resolution and external links do not | [[requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Local Markdown inline links resolve like wiki-links` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `External Markdown links do not produce vault diagnostics` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Same-document Markdown anchors behave like heading references` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/markdown-target-classifier.test.ts` | Unit | `Parity.MarkdownLinks.LocalResolution` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | External URL suppression must happen before vault diagnostics |

---

## Parent Feature

[[FEAT-021]] - Markdown Link Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-156]] - parsed Markdown target ranges must exist.

**Unblocks:**

- [[TASK-158]] - RefGraph needs classified local targets only.
- [[TASK-159]] - Oracle needs structured target and fragment data.
- [[TASK-160]] - diagnostics must suppress external URL false positives.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Classifier tests cover local paths, file fragments, same-document
  fragments, external URLs, and unknown schemes.
- [ ] External URLs and unknown schemes are marked opaque to vault diagnostics.
- [ ] Local classification never stores absolute paths as DocIds.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenarios pass or are ready for downstream resolver work.
- [ ] [[test/matrix]] and [[test/index]] are updated for new tests.
- [ ] Parent feature [[FEAT-021]] child task row updated to `in-review`.

---

## Notes

Keep this classifier small and deterministic. Resolution belongs in
[[TASK-159]], not here.

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
> Step C implementation details added. Classifier write scope is
> `src/resolution/markdown-target-classifier.ts` and classifier tests. Status:
> `open`.

---
id: "TASK-163"
title: "Index vault attachments"
type: task
status: red
priority: high
phase: 15
parent: "FEAT-022"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: []
tags: [tickets/task, "phase/15"]
aliases: ["TASK-163"]
---

# Index vault attachments

> [!INFO] `TASK-163` · Task · Phase 15 · Parent: [[FEAT-022]] · Status: `red`

## Description

Add vault-wide attachment entries for non-Markdown files under each VaultFolder.
The index must expose enough cheap metadata for downstream completion,
diagnostics, navigation, and hover while keeping parsed `OFMDoc` storage limited
to Markdown documents.

---

## Implementation Notes

- Keep `VaultIndex` as the single source of truth for document and attachment
  lookup.
- Add `AttachmentEntry` metadata and attachment map APIs to
  `src/vault/vault-index.ts`.
- Populate attachment metadata from `src/vault/vault-scanner.ts` while keeping
  `VaultScanner.getAssetIndex()` and `VaultScanner.hasAsset()` as compatibility
  facades.
- Store attachment identity as vault-relative paths with extensions.
- Do not parse non-Markdown files into `OFMDoc`.
- Record cheap metadata only: URI, extension or detected kind, byte size, and
  optional image dimensions when available without blocking.
- Add red/green coverage in `src/vault/__tests__/vault-scanner.test.ts` and
  `src/vault/__tests__/vault-index.test.ts`.
- See also: [[plans/phase-15-attachment-intelligence]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.Attachments.IndexCoverage` | Non-Markdown vault files are indexed as attachment targets | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.Attachments.Intelligence` | Attachments are addressable vault assets | [[requirements/functional/ofmarkdown-parity]] |
| `Embed.Resolution.ImageTarget` | Image embed targets resolve as vault assets | [[requirements/embed-resolution]] |
| `Embed.Resolution.MarkdownTarget` | Markdown docs stay distinct from attachments | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Attachment references support completion, definition, and hover` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/vault/__tests__/vault-scanner.test.ts` | Unit | `Parity.Attachments.Intelligence` | 🔴 failing |
| `src/vault/__tests__/vault-index.test.ts` | Unit | `Parity.Attachments.Intelligence` | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in
> Update [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| — | None |

---

## Parent Feature

[[FEAT-022]] — Attachment Intelligence

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-164]] — completion needs indexed attachment candidates.
- [[TASK-165]] — diagnostics need attachment existence lookup.
- [[TASK-166]] — definition needs attachment target URI lookup.
- [[TASK-167]] — hover needs attachment metadata lookup.
- [[TASK-168]] — config polish needs the final attachment indexing contract.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log).
- [ ] Implementation written to make test(s) pass (GREEN commit follows).
- [ ] Attachment entries are available for non-Markdown vault files.
- [ ] Non-Markdown files are not stored as parsed `OFMDoc` entries.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenario passes locally or is unblocked for provider tasks.
- [ ] [[test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-022]] child task row updated to `in-review`.

---

## Notes

This is the foundation task. Keep the API narrow enough that note completion
cannot accidentally consume attachment candidates as document candidates.

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

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened — 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-022]].

> [!INFO] Red - 2026-05-06
> Added failing attachment metadata tests for `VaultIndex` and `VaultScanner`.
> Status: `red`.

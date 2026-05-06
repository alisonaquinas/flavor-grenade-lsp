---
id: "TASK-166"
title: "Navigate to attachment targets"
type: task
status: open
priority: medium
phase: 15
parent: "FEAT-022"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-163"]
tags: [tickets/task, "phase/15"]
aliases: ["TASK-166"]
---

# Navigate to attachment targets

> [!INFO] `TASK-166` · Task · Phase 15 · Parent: [[FEAT-022]] · Status: `open`

## Description

Extend go-to-definition so attachment references in embeds and Markdown image
links return a `Location` for the resolved asset URI. Navigation must target the
attachment file itself and must not confuse attachment paths with Markdown
document `DocId` values.

---

## Implementation Notes

- Resolve definition requests on `![[attachment.ext]]` targets.
- Resolve definition requests on local `![alt](attachment.ext)` targets.
- Return file URIs for attachment targets with stable ranges.
- Preserve existing definition behavior for Markdown links, wiki-links, embeds,
  headings, blocks, and tags.
- See also: [[plans/phase-15-attachment-intelligence]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.Attachments.NavigationHover` | Existing attachment references support definition to attachment file URIs | [[requirements/ofmarkdown-parity]] |
| `Parity.Attachments.Intelligence` | Attachment refs support definition | [[requirements/ofmarkdown-parity]] |
| `Navigation.Definition.AllLinkTypes` | Definition returns target locations | [[requirements/navigation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Attachment references support completion, definition, and hover` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/handlers/**/*.spec.ts` | Unit | `Navigation.Definition.AllLinkTypes` | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in
> Update [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR017-standard-markdown-link-intelligence]] | Markdown image link targets participate in navigation |

---

## Parent Feature

[[FEAT-022]] — Attachment Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-163]] — definition needs resolved attachment target URIs.

**Unblocks:**

- [[TASK-168]] — config polish can validate definition against preferred folders.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log).
- [ ] Implementation written to make test(s) pass (GREEN commit follows).
- [ ] Definition on `assets/diagram.png` returns the attachment target URI.
- [ ] Definition for Markdown document targets remains unchanged.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenario passes locally.
- [ ] [[test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-022]] child task row updated to `in-review`.

---

## Notes

If LSP clients cannot open a binary file at a text range, return the most stable
zero-length range available for the file URI.

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

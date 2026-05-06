---
id: "TASK-165"
title: "Diagnose broken attachment references"
type: task
status: green
priority: high
phase: 15
parent: "FEAT-022"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-163"]
tags: [tickets/task, "phase/15"]
aliases: ["TASK-165"]
---

# Diagnose broken attachment references

> [!INFO] `TASK-165` · Task · Phase 15 · Parent: [[FEAT-022]] · Status: `green`

## Description

Emit diagnostics for broken attachment references in embeds and local Markdown
image links. Existing attachment references must remain clean, and missing
attachment references must use the documented embed diagnostic code and warning
severity.

---

## Implementation Notes

- Resolve attachment refs through the [[TASK-163]] attachment index.
- Apply diagnostics to `![[...]]` attachment embeds and local `![alt](...)`
  image targets.
- Extend `src/resolution/diagnostic-service.ts` to inspect
  `doc.index.markdownImages`.
- Preserve existing document embed diagnostics for Markdown targets.
- Keep external or remote URLs out of vault attachment diagnostics.
- See also: [[plans/phase-15-attachment-intelligence]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.Attachments.Diagnostics` | Broken attachment references produce diagnostics while existing attachments remain clean | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.Attachments.Intelligence` | Attachment refs support diagnostics | [[requirements/functional/ofmarkdown-parity]] |
| `Diagnostic.Severity.Embed` | Broken embed diagnostics use warning severity | [[requirements/diagnostics]] |
| `Embed.Resolution.ImageTarget` | Broken image embeds use embed diagnostics | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Attachment references support completion, definition, and hover` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/__tests__/attachment-diagnostics.test.ts` | Unit | `Parity.Attachments.Intelligence` | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in
> Update [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR017-standard-markdown-link-intelligence]] | Markdown image links are local attachment references |

---

## Parent Feature

[[FEAT-022]] — Attachment Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-163]] — diagnostics require attachment existence lookup.

**Unblocks:**

- [[TASK-168]] — config polish can adjust attachment-folder expectations after
  base diagnostics exist.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log).
- [ ] Implementation written to make test(s) pass (GREEN commit follows).
- [ ] Existing attachment refs do not produce missing-reference diagnostics.
- [ ] Missing attachment refs produce FG004 warning diagnostics.
- [ ] External Markdown image URLs do not produce vault diagnostics.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenario passes locally or remains covered with added cases.
- [ ] [[test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-022]] child task row updated to `in-review`.

---

## Notes

This task should not create a new diagnostic family unless existing FG004 embed
semantics cannot represent attachment failures.

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
> Added failing attachment diagnostic coverage for missing Markdown image
> targets and indexed non-image attachment embeds, plus clean cases for indexed
> images and external image URLs.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Added Markdown image attachment diagnostics and taught embed resolution to
> prefer indexed attachments before Markdown fallback. Focused diagnostics and
> embed resolver tests, `bun run typecheck`, and `bun run lint --
> --max-warnings 0` pass.
> Status: `green`.

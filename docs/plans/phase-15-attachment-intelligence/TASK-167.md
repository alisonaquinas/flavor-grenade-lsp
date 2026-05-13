---
id: "TASK-167"
title: "Show attachment hover metadata"
type: task
status: done
priority: medium
phase: 15
parent: "FEAT-022"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-163"]
tags: [tickets/task, "phase/15"]
aliases: ["TASK-167"]
---

# Show attachment hover metadata

> [!INFO] `TASK-167` · Task · Phase 15 · Parent: [[FEAT-022]] · Status: `done`

## Description

Return lightweight hover content for attachment references. Hovers must include
the resolved vault-relative path and detected file type, plus file size and image
dimensions when the metadata is available without blocking editor response.

---

## Implementation Notes

- Support hover on `![[attachment.ext]]` targets.
- Support hover on local `![alt](attachment.ext)` targets.
- Extend `src/handlers/hover.handler.ts` to use `entityAtPosition()` so
  Markdown image entities can share attachment hover rendering with embeds.
- Use type labels aligned with [[docs/requirements/hover]] `HV-002`: Image, Audio,
  Video, PDF, or File.
- Do not render previews or perform heavyweight binary parsing.
- Preserve existing Markdown embed and wiki-link hover behavior.
- See also: [[docs/plans/phase-15-attachment-intelligence]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.Attachments.NavigationHover` | Existing attachment references support lightweight metadata hover | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.Attachments.Intelligence` | Attachment refs support hover metadata | [[docs/requirements/functional/ofmarkdown-parity]] |
| `HV-002` | Embed hover includes resolved path and detected file type | [[docs/requirements/hover]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Attachment references support completion, definition, and hover` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/handlers/__tests__/attachment-hover.test.ts` | Unit | `HV-002` | 🔴 failing |

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

- [[TASK-163]] — hover needs attachment metadata from the index.

**Unblocks:**

- [[TASK-168]] — config polish can refine folder-aware metadata presentation.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log).
- [ ] Implementation written to make test(s) pass (GREEN commit follows).
- [ ] Hover on `assets/diagram.png` includes the file type `png` or Image.
- [ ] Hover includes resolved vault-relative path for attachment targets.
- [ ] Hover does not block on heavyweight metadata extraction.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenario passes locally.
- [ ] [[docs/test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[docs/test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-022]] child task row updated to `in-review`.

---

## Notes

Image dimensions are desirable metadata, not a reason to block hover response.
Return path and type whenever size or dimensions cannot be read cheaply.

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
> Added failing hover coverage for Markdown image and embed attachments,
> requiring resolved path, type label, size, and dimensions when available.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Refactored hover dispatch through cursor entity detection and added
> lightweight attachment metadata hovers for Markdown images and embeds.
> Focused hover tests, `bun run typecheck`, and `bun run lint --
> --max-warnings 0` pass.
> Status: `green`.

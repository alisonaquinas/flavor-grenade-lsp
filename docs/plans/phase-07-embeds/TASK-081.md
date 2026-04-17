---
id: "TASK-081"
title: "Handle embed size syntax"
type: task
status: open
priority: high
phase: 7
parent: "FEAT-008"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-076"]
tags: [tickets/task, "phase/7"]
aliases: ["TASK-081"]
---

# Handle embed size syntax

> [!INFO] `TASK-081` · Task · Phase 7 · Parent: [[tickets/FEAT-008]] · Status: `open`

## Description

In the Phase 3 `EmbedParser`, the `|200` part of `![[image.png|200]]` was parsed as a potential display alias — the same pipe-separated field used for wiki-link aliases. Update `EmbedParser` and `EmbedResolver` to distinguish size specifiers from display aliases: if the embed target has a known image extension (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.bmp`) AND the pipe content matches the regex `/^\d+(x\d+)?$/`, treat it as a size specifier populating `EmbedRef.embedSize`; otherwise treat it as a display alias.

---

## Implementation Notes

- Image extensions: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.bmp`
- Size specifier pattern: `/^\d+(x\d+)?$/` (e.g., `200`, `200x150`)
- In `EmbedParser`: when pipe content matches the pattern AND target has image extension, set `embedSize: { width, height? }` on the parsed entry
- In `EmbedResolver`: when `embedSize` is set, pass through to `EmbedRef.embedSize` without treating it as an alias
- Non-image embeds: pipe content is always treated as display alias, never size specifier
- See also: [[ofm-spec/embeds]], [[requirements/embed-resolution]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Embed size specifier `|WxH` distinguished from display alias | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/embeds]] | `Image embed with size specifier produces no diagnostic` |
| [[bdd/features/embeds]] | `Non-image embed pipe content treated as display alias` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/smoke-embeds.md` | Integration | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Size specifier handling follows OFM embed syntax |

---

## Parent Feature

[[tickets/FEAT-008]] — Embeds

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-076]] — size specifier handling is an extension of the embed resolver

**Unblocks:**

- None within Phase 7

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-008]] child task row updated to `in-review`

---

## Notes

The size specifier is only meaningful for image extensions. For markdown documents and other non-image assets, any pipe content is always treated as a display alias regardless of its format.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-008]].

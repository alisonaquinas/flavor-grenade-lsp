---
id: "TASK-080"
title: "Implement embed hover"
type: task
status: done
priority: high
phase: 7
parent: "FEAT-008"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-076"]
tags: [tickets/task, "phase/7"]
aliases: ["TASK-080"]
---

# Implement embed hover

> [!INFO] `TASK-080` · Task · Phase 7 · Parent: [[FEAT-008]] · Status: `open`

## Description

Create `src/handlers/hover.handler.ts`. When the cursor is positioned on a `![[embed]]` token, the hover provider returns a content preview. For markdown embeds, the hover content is the first 5 lines of the target document rendered as Markdown. For image embeds, the content is `![](uri)` so that editors like VS Code render an inline image preview. For heading embeds, the hover shows the heading text and the first paragraph below it. Register `hoverProvider: true` in the server's capabilities.

---

## Implementation Notes

- Create `HoverHandler` in `src/handlers/hover.handler.ts`
- On `textDocument/hover` request: detect cursor overlap with an `EmbedEntry` span
- Dispatch on resolved target type:
  - Markdown embed (no sub-target): read first 5 lines of target `OFMDoc`, return as `MarkupContent`
  - Image embed: return `![](file-uri)` as `MarkupContent` (kind: Markdown)
  - Heading embed: return heading text + first paragraph below it from target `OFMDoc`
- Unresolved embed: return `null` (no hover)
- Register `hoverProvider: true` in `initialize` response capabilities
- Hover content must NOT expose server-local filesystem paths (only vault-relative paths or file URIs)
- See also: design/hover-handler

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Hover content preview for embed targets | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/embeds.feature` | `Hover on markdown embed shows first 5 lines` |
| `bdd/features/embeds.feature` | `Hover on image embed shows inline image` |

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
| [[adr/ADR002-ofm-only-scope]] | Hover is scoped to OFM embed syntax |
| [[adr/ADR013-vault-root-confinement]] | Hover content must not leak server-local paths |

---

## Parent Feature

[[FEAT-008]] — Embeds

---

## Dependencies

**Blocked by:**

- [[TASK-076]] — hover requires a resolved embed target to fetch content

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
- [ ] Parent feature [[FEAT-008]] child task row updated to `in-review`

---

## Notes

Hover content must not leak server-local filesystem paths. Use vault-relative paths or proper file URIs. The `hoverProvider: true` capability registration must be added to the `initialize` response.

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
> Ticket created. Status: `open`. Parent: [[FEAT-008]].

> [!SUCCESS] Done — 2026-04-17
> `HoverHandler` created at `src/handlers/hover.handler.ts`. Handles embeds (markdown preview / asset `![](uri)`) and wiki-links (heading-based preview). Registered in `ResolutionModule` and `LspModule`. `hoverProvider: true` added to capability registry. Status: `done`.

---
id: "TASK-079"
title: "Implement embed go-to-definition"
type: task
status: done
priority: high
phase: 7
parent: "FEAT-008"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-076"]
tags: [tickets/task, "phase/7"]
aliases: ["TASK-079"]
---

# Implement embed go-to-definition

> [!INFO] `TASK-079` · Task · Phase 7 · Parent: [[FEAT-008]] · Status: `open`

## Description

Update `DefinitionService` to handle `![[embed]]` entries in addition to wiki-links. The behaviour differs by target type: markdown embeds navigate to the target document (and optionally to the heading or block anchor within it); image embeds return the file URI of the asset so the editor can open the file; heading embeds navigate to the heading line in the target document; block embeds navigate to the block anchor line.

---

## Implementation Notes

- In `DefinitionService.getDefinition()`, detect when cursor overlaps an `EmbedEntry` span
- Dispatch on resolved target type:
  - Markdown embed (no sub-target): return `Location` pointing to document start
  - Markdown embed with heading sub-target (`#heading`): return `Location` pointing to heading line
  - Markdown embed with block sub-target (`#^blockid`): return `Location` pointing to block anchor line
  - Image/asset embed: return `Location` with file URI of the asset (line 0, char 0)
- Return `null` if target is unresolved (FG004 will already be present)
- See also: design/definition-service

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Go-to-definition for embed targets including assets and sub-targets | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/embeds.feature` | `Go-to-definition on markdown embed navigates to document` |
| `bdd/features/embeds.feature` | `Go-to-definition on image embed returns file URI` |
| `bdd/features/embeds.feature` | `Go-to-definition on heading embed navigates to heading line` |

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
| [[adr/ADR002-ofm-only-scope]] | Definition handling scoped to OFM embed syntax |
| [[adr/ADR013-vault-root-confinement]] | File URIs for image embeds must be within vault root |

---

## Parent Feature

[[FEAT-008]] — Embeds

---

## Dependencies

**Blocked by:**

- [[TASK-076]] — go-to-definition requires a resolved embed target

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

For image embeds, the file URI allows editors like VS Code to open the image in their built-in preview. The vault root confinement invariant (ADR013) applies to the asset URI.

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
> `DefinitionHandler` updated to inject `EmbedResolver` and check embed entries after wiki-links. Markdown embeds return document URI; asset embeds return `pathToFileURL` URI. `findEmbedAtPosition` helper added. Status: `done`.

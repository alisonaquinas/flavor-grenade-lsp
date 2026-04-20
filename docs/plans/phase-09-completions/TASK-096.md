---
id: "TASK-096"
title: "Implement embed CompletionProvider"
type: task
status: done
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/9"]
aliases: ["TASK-096"]
---

# Implement embed CompletionProvider

> [!INFO] `TASK-096` · Task · Phase 9 · Parent: [[FEAT-010]] · Status: `open`

## Description

Create `src/completion/embed-completion-provider.ts`. Triggered after `![[`, this provider combines all document stems from `FolderLookup` with all asset paths from `AssetIndex` to produce a unified candidate list for embed targets. Document stems use `CompletionItemKind.File`; asset paths also use `CompletionItemKind.File` with the vault-relative path as the `detail` field. The `completion.candidates` cap is applied to the combined list.

---

## Implementation Notes

- Document stems: enumerate via `FolderLookup.allStems()` → `CompletionItemKind.File`
- Asset paths: enumerate via `AssetIndex.allPaths()` → `CompletionItemKind.File`, `detail: vaultRelativePath`
- Merge the two lists; dedup by label if a document and asset share the same stem
- Apply `completion.candidates` cap (see TASK-097) — set `isIncomplete: true` if sliced
- See also: [[plans/phase-09-completions]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Embed completion combining documents and assets | [[requirements/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/completions.feature` | `Embed completion includes document stems` |
| `bdd/features/completions.feature` | `Embed completion includes asset paths` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/completion/embed-completion-provider.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | linkStyle configuration and completion insert text formatting |

---

## Parent Feature

[[FEAT-010]] — Completions

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None within Phase 9

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
- [ ] Parent feature [[FEAT-010]] child task row updated to `in-review`

---

## Notes

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
> Ticket created. Status: `open`. Parent: [[FEAT-010]].

> [!SUCCESS] Done — 2026-04-17
> Implementation complete and tested. All acceptance criteria met. Lint clean, tsc clean, 321 tests pass. Status: `done`.

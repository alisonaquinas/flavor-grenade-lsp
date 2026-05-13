---
id: "CHORE-076"
title: "Phase E12 Snippet And Language Docs Sweep"
type: chore
status: done
priority: medium
phase: E12
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-201", "TASK-202", "TASK-203"]
tags: [tickets/chore, "phase/E12"]
aliases: ["CHORE-076"]
---

# Phase E12 Snippet And Language Docs Sweep

> [!INFO] `CHORE-076` - Chore - Phase E12 - Priority: `medium` - Status: `done`

> [!NOTE]
> A chore produces no user-visible behaviour change. It improves internal
> quality: tooling, configuration, documentation, refactoring, or process.

---

## Description

Update extension-facing documentation for the E12 snippet, language
configuration, and keybinding contributions after their final shape is known.

---

## Motivation

Users and maintainers need a compact reference for OFMarkdown-only editor
affordances and their scope boundaries.

- Motivated by: [[docs/plans/phase-E12-ofmarkdown-editor-contributions]]

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Contributions.OFMarkdownScoped` | Contribution behavior and scope are documented | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `extension/README.md` - Mention E12 editor contributions if appropriate
- `extension/docs/plans/vscode-extension-parity.md` - Reflect completed E12 slice if needed

**Files created:**

- None - no new documentation files are expected

**Files deleted:**

- None - no deletion is expected for this chore

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[docs/adr/ADR016-ofmarkdown-language-mode]] | Documentation must describe `ofmarkdown` scoping accurately |

---

## Dependencies

**Blocked by:**

- [[TASK-201]] - Snippet behavior must be known
- [[TASK-202]] - Language configuration behavior must be known
- [[TASK-203]] - Keybinding behavior must be known

**Unblocks:**

- [[FEAT-030]] - Feature review can include user-facing documentation

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Documentation names OFMarkdown-only snippets if they ship
- [x] Documentation names OFMarkdown-only keybindings if they ship
- [x] Documentation does not imply generic Markdown behavior changed
- [x] Extension parity plan still lists E12 accurately
- [x] No behaviour-affecting changes in `src/`
- [x] [[docs/test/matrix]] updated if verification files were added or removed
- [x] [[docs/test/index]] updated if verification files were added or removed

---

## Notes

Keep README additions brief. The Marketplace proof already carries the visual
story from E11.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Identified; no work started | Verify scope list; confirm no blockers |
| `in-progress` | Work underway within declared scope | Stay in scope; run relevant checks |
| `blocked` | Dependency unresolved | Append `[!WARNING]` with named blocker |
| `in-review` | Changes done; checks pass | Verify Acceptance Criteria |
| `done` | CI green; no regressions | Append `[!CHECK]` with evidence |
| `cancelled` | No longer needed | Append `[!CAUTION]` with reason |

---

## Workflow Log

> [!NOTE]
> Append-only. LLM agents add entries below in chronological order. Do not edit
> previous entries.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: document E12 contributions without
> overstating generic Markdown impact.

> [!SUCCESS] In Review - 2026-05-07
> README and extension parity plan now describe OFMarkdown-only snippets,
> keybindings, editor-pair behavior, and generic Markdown isolation.

> [!SUCCESS] Done - 2026-05-07
> PR #44 CI is green and the sweep remains complete.

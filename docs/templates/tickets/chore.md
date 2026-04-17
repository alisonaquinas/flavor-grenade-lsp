---
id: "{{TICKET-ID}}"
title: "{{TICKET-TITLE}}"
type: chore
# status: open | in-progress | blocked | in-review | done | cancelled
status: open
priority: "{{PRIORITY}}"
phase: "{{PHASE-NUMBER}}"
created: "{{DATE}}"
updated: "{{DATE}}"
tags: [tickets/chore, "phase/{{PHASE-NUMBER}}"]
aliases: ["{{TICKET-ID}}"]
---

# {{TICKET-TITLE}}

> [!INFO] `{{TICKET-ID}}` · Chore · Phase {{PHASE-NUMBER}} · Priority: `{{PRIORITY}}` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

> One paragraph describing what is being cleaned up, fixed, or improved, and why it matters now. Reference the quality gate, requirement, or process rule that motivates the work.

{{DESCRIPTION}}

---

## Motivation

> Why this chore is being done at this time. Link to the requirement, ADR, CI failure, or process gap that raised it.

{{MOTIVATION}}

- Motivated by: {{REQUIREMENT-TAG-OR-ADR-OR-CI-JOB}}

---

## Linked Requirements

> Quality, process, CI/CD, or security requirements this chore addresses. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| `{{FR-TAG}}` | {{FR-GIST}} | [[requirements/{{FEATURE-FILE}}]] |

---

## Scope of Change

> List every file or directory that will be modified, created, or deleted. Keep this section honest — if the scope grows during execution, update this list and note the expansion in the Workflow Log.

**Files modified:**

- `{{FILE-PATH}}` — {{REASON}}

**Files created:**

- `{{FILE-PATH}}` — {{REASON}}

**Files deleted:**

- `{{FILE-PATH}}` — {{REASON}}

---

## Affected ADRs

> ADRs whose implementation constraints apply to this chore.

| ADR | Constraint |
|---|---|
| [[adr/ADR{{NNN}}-{{SLUG}}]] | {{CONSTRAINT-SUMMARY}} |

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed
- [ ] {{ADDITIONAL-CRITERION}}

---

## Notes

{{NOTES}}

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Identified; no work started | Verify scope list; confirm no behaviour-affecting files; confirm no blockers |
| `in-progress` | Work underway within declared scope | Stay in scope; run `bun test` periodically; if scope grows, update list and log |
| `blocked` | Dependency unresolved | Append `[!WARNING]` with named blocker |
| `in-review` | Changes done; lint+type+test pass | Verify Acceptance Criteria; confirm no `src/` behaviour changes; update matrix/index if needed |
| `done` | CI green; no regressions | Append `[!CHECK]` with evidence |
| `cancelled` | No longer needed | Append `[!CAUTION]`; revert uncommitted partial changes if needed |

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

<!-- TEMPLATE USAGE: Replace the entry below with a real date when creating the ticket. -->

> [!INFO] Opened — {{DATE}}
> Chore created. Status: `open`. Motivation: {{MOTIVATION-SUMMARY}}.

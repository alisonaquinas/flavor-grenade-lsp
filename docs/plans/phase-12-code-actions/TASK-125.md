---
id: "TASK-125"
title: "Implement semantic token provider"
type: task
status: open
priority: medium
phase: 12
parent: "FEAT-013"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/12"]
aliases: ["TASK-125"]
---

# Implement semantic token provider

> [!INFO] `TASK-125` · Task · Phase 12 · Parent: [[tickets/FEAT-013]] · Status: `open`

## Description

Create `src/handlers/semantic-tokens.handler.ts` providing semantic token types for OFM-specific syntax elements: wiki-links and embeds as `string/declaration`, tags as `keyword`, block anchors as `label`, callout types as `enumMember`, and frontmatter keys as `property/declaration`. Register a full-document `semanticTokensProvider` (with `full: true`, `range: false`) in server capabilities.

---

## Implementation Notes

- Semantic token type mapping:

  | OFM element | Semantic type | Modifier |
  |---|---|---|
  | `[[wiki-link]]` | `string` | `declaration` |
  | `![[embed]]` | `string` | `declaration` |
  | `#tag` | `keyword` | — |
  | `^anchor-id` | `label` | — |
  | `> [!NOTE]` callout type | `enumMember` | — |
  | Frontmatter key | `property` | `declaration` |

- Register in `ServerCapabilities`:
  ```typescript
  semanticTokensProvider: {
    legend: { tokenTypes: [...], tokenModifiers: [...] },
    full: true,
    range: false,
  }
  ```
- Tokens must be encoded in the LSP delta-encoded integer array format
- Linked test: `tests/unit/unit-lsp-module.md`
- See also: [[requirements/diagnostics]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Semantic token highlighting for OFM-specific syntax elements | [[requirements/diagnostics]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | `Semantic tokens returned for wiki-links and tags` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/unit-lsp-module.md` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Semantic tokens cover only OFM syntax elements, not standard Markdown |

---

## Parent Feature

[[tickets/FEAT-013]] — Code Actions

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

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
- [ ] Parent feature [[tickets/FEAT-013]] child task row updated to `in-review`

---

## Notes

The LSP semantic token delta-encoding format requires tokens to be sorted by line and character position, with positions expressed as deltas relative to the previous token. CHORE-035 will verify delta encoding correctness.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-013]].

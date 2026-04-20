---
title: Ticket Templates Index — flavor-grenade-lsp
tags: [tickets/meta, meta]
aliases: [Ticket Templates, Work Item Templates]
---

# Ticket Templates

This directory contains OFM-formatted templates for work item tickets used in the `flavor-grenade-lsp` project. Tickets cross-reference the requirements layer, BDD scenarios, the test matrix, ADRs, and phase plans. They also carry a **Workflow Log** section that LLM agents append to as work progresses through states.

> [!NOTE]
> Workflows (state transitions and agent obligations at each state) are defined separately. The templates below are workflow-agnostic: they provide the structure and cross-reference surface that any workflow can act on.

---

## Available Templates

| Template | Type Code | Use When |
|---|---|---|
| [[templates/tickets/feature]] | `FEAT` | Delivering a phase-aligned capability area spanning multiple tasks |
| [[templates/tickets/task]] | `TASK` | Implementing a single atomic work item within a feature |
| [[templates/tickets/bug]] | `BUG` | Reporting a defect in implemented behaviour |
| [[templates/tickets/spike]] | `SPIKE` | Investigating an open question before committing to an approach |
| [[templates/tickets/chore]] | `CHORE` | Maintenance, tooling, refactoring, or documentation housekeeping |

---

## Ticket ID Convention

Ticket IDs use the schema `<TYPE>-<NNN>` with three-digit zero-padded numbers, assigned sequentially per type:

| Type Code | Template | Example IDs |
|---|---|---|
| `FEAT` | [[templates/tickets/feature]] | `FEAT-001`, `FEAT-002` |
| `TASK` | [[templates/tickets/task]] | `TASK-001`, `TASK-042` |
| `BUG` | [[templates/tickets/bug]] | `BUG-001`, `BUG-003` |
| `SPIKE` | [[templates/tickets/spike]] | `SPIKE-001`, `SPIKE-007` |
| `CHORE` | [[templates/tickets/chore]] | `CHORE-001`, `CHORE-012` |

Counters are independent per type. Do not reuse or retire numbers.

---

## Creating a Ticket

1. Copy the appropriate template from this directory.
2. Name the file `<TICKET-ID>.md` (e.g., `TASK-042.md`).
3. Place it in `docs/tickets/` (the instance directory — not this templates directory).
4. Replace every `{{PLACEHOLDER}}` with real values.
5. Add wikilinks to all relevant requirements, BDD features, test files, ADRs, and phase plans.
6. Leave the **Workflow Log** section initialised with a single `open` entry — the LLM agent writes subsequent entries.

---

## Lifecycle Documents

Each ticket type has a dedicated lifecycle document defining its state machine, entry/exit criteria per state, transition table, and agent obligations:

| Ticket Type | Lifecycle Doc | Initial State |
|---|---|---|
| Feature | [[templates/tickets/lifecycle/feature-lifecycle]] | `draft` |
| Task | [[templates/tickets/lifecycle/task-lifecycle]] | `open` |
| Bug | [[templates/tickets/lifecycle/bug-lifecycle]] | `open` |
| Spike | [[templates/tickets/lifecycle/spike-lifecycle]] | `open` |
| Chore | [[templates/tickets/lifecycle/chore-lifecycle]] | `open` |

---

## Ticket Status Values by Type

Status values are **type-specific**. Each template's frontmatter carries a YAML comment listing its valid values.

| Type | Allowed Status Values |
|---|---|
| Feature | `draft` · `ready` · `in-progress` · `blocked` · `in-review` · `done` · `cancelled` |
| Task | `open` · `red` · `green` · `refactor` · `in-review` · `done` · `blocked` · `cancelled` |
| Bug | `open` · `triaged` · `in-progress` · `blocked` · `in-review` · `verified` · `done` · `wont-fix` · `duplicate` |
| Spike | `open` · `in-progress` · `blocked` · `concluded` · `output-delivered` · `done` · `inconclusive` · `cancelled` |
| Chore | `open` · `in-progress` · `blocked` · `in-review` · `done` · `cancelled` |

The `status` field in each ticket's YAML frontmatter must reflect the current state. LLM agents update it when appending to the Workflow Log.

---

## Workflow Log Convention

Every template contains a `## Workflow Log` section at the bottom. This section is **append-only**: agents add new callout entries and never edit previous ones.

**Entry format:**

```markdown
> [!INFO] Opened — YYYY-MM-DD
> Status set to `open`. Ticket created.

> [!NOTE] Agent — YYYY-MM-DD — `open` → `in-progress`
> Brief note: what work is starting and why.

> [!WARNING] Agent — YYYY-MM-DD — `in-progress` → `blocked`
> Blocked on [[tickets/TASK-NNN]] — reason.

> [!CHECK] Agent — YYYY-MM-DD — `in-review` → `done`
> All acceptance criteria met. CI green. Evidence: <PR/commit reference>.
```

**Callout type conventions:**

| Callout | Use for |
|---|---|
| `> [!INFO]` | Status transitions (open, in-review) |
| `> [!NOTE]` | Agent observations, mid-work notes |
| `> [!WARNING]` | Blockers, risks, decisions requiring attention |
| `> [!CHECK]` | Completion and CI confirmation |
| `> [!CAUTION]` | Rollback or cancellation with reason |

---

## Cross-Reference Targets

When filling in ticket link sections, use these canonical link targets:

| Entity Type | Wikilink Pattern | Example |
|---|---|---|
| Planguage requirement file | `[[requirements/{{feature}}]]` | `[[requirements/diagnostics]]` |
| Planguage tag (inline) | backtick code span | `` `Diagnostic.Severity.WikiLink` `` |
| User requirement file | `[[requirements/user/{{theme}}]]` | `[[requirements/user/seeing-broken-links]]` |
| User req tag (inline) | backtick code span | `` `User.Diagnose.SpotBrokenLinks` `` |
| BDD feature file | `[[bdd/features/{{name}}]]` | `[[bdd/features/diagnostics]]` |
| Test matrix | `[[test/matrix]]` | — |
| Test index | `[[test/index]]` | — |
| ADR | `[[adr/ADR{{NNN}}-{{slug}}]]` | `[[adr/ADR006-block-ref-indexing]]` |
| Phase plan | `[[plans/phase-{{NN}}-{{slug}}]]` | `[[plans/phase-05-wiki-links]]` |
| Execution ledger | `[[plans/execution-ledger]]` | — |
| Another ticket | `[[tickets/{{ID}}]]` | `[[tickets/TASK-042]]` |

---

## Related Documents

- [[requirements/index]] — Master Planguage tag index
- [[requirements/user/index]] — User requirement tag index
- [[test/matrix]] — Requirements × tests traceability matrix
- [[test/index]] — Test file inventory
- [[plans/execution-ledger]] — Phase completion status
- [[AGENTS]] — Agent guidance for this repository

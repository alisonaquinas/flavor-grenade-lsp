---
id: "FEAT-004"
title: "OFM Parser"
type: feature
status: in-progress
priority: high
phase: 3
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-003"]
tags: [tickets/feature, "phase/3"]
aliases: ["FEAT-004"]
---

# OFM Parser

> [!INFO] `FEAT-004` · Feature · Phase 3 · Priority: `high` · Status: `draft`

## Goal

Vault authors gain an LSP server that understands the full vocabulary of Obsidian Flavored Markdown. The server can parse any OFM document and produce a structured index of all its constructs — wiki-links, embeds, tags, callouts, block anchors, and frontmatter — enabling every subsequent LSP feature (diagnostics, completions, navigation) to query a rich, always-current model of the vault's content.

---

## Scope

**In scope:**

- `OFMIndex` and `OFMDoc` type definitions
- `FrontmatterParser` (YAML extraction)
- `CommentParser`, `MathParser`, `CodeParser` (opaque region marking)
- `WikiLinkParser`, `EmbedParser`, `BlockAnchorParser`, `TagParser`, `CalloutParser` (OFM token extraction)
- `OpaqueRegionMarker` orchestrator for opaque regions
- `OFMParser` 8-stage orchestrator
- NestJS `ParserModule` DI registration
- Unit tests for all parser sub-components
- Wiring `OFMParser` into `textDocument/didOpen` and `textDocument/didChange` via `ParseCache`

**Out of scope (explicitly excluded):**

- Vault-level indexing across multiple files (Phase 4)
- Diagnostics based on parse results (Phase 5)
- Completion or navigation features (Phase 5+)
- CommonMark AST integration (deferred to a later phase)

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Parser provides the data model for all user-facing OFM features | — |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | See phase plan for gate criteria | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/wiki-links]] | Wiki-link extraction and validation scenarios |
| [[bdd/features/tags]] | Tag extraction scenarios |
| [[bdd/features/callouts]] | Callout detection scenarios |
| [[bdd/features/frontmatter]] | Frontmatter parsing scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-03-ofm-parser]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun test src/parser/` passes with all tests green
- [ ] BDD `@smoke` scenarios for wiki-links, tags, callouts, and frontmatter pass in CI
- [ ] All scenarios in linked BDD feature files pass in CI
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] Phase gate command `bun run gate:3` passes in CI
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[tickets/TASK-030]] | Define OFMIndex and OFMDoc types | `open` |
| [[tickets/TASK-031]] | Implement FrontmatterParser | `open` |
| [[tickets/TASK-032]] | Implement CommentParser | `open` |
| [[tickets/TASK-033]] | Implement MathParser | `open` |
| [[tickets/TASK-034]] | Implement CodeParser | `open` |
| [[tickets/TASK-035]] | Implement WikiLinkParser | `open` |
| [[tickets/TASK-036]] | Implement EmbedParser | `open` |
| [[tickets/TASK-037]] | Implement BlockAnchorParser | `open` |
| [[tickets/TASK-038]] | Implement TagParser | `open` |
| [[tickets/TASK-039]] | Implement CalloutParser | `open` |
| [[tickets/TASK-040]] | Implement OpaqueRegionMarker | `open` |
| [[tickets/TASK-041]] | Implement OFMParser orchestrator | `open` |
| [[tickets/TASK-042]] | Register OFMParser in NestJS DI | `open` |
| [[tickets/TASK-043]] | Write unit tests for parser sub-components | `open` |
| [[tickets/TASK-044]] | Wire parser into didOpen/didChange | `open` |
| [[tickets/CHORE-007]] | Phase 3 Lint Sweep | `open` |
| [[tickets/CHORE-008]] | Phase 3 Code Quality Sweep | `open` |
| [[tickets/CHORE-009]] | Phase 3 Security Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-003]] — Phase 2 LSP Transport must be complete; the parser wires into the document lifecycle handlers established in Phase 2

**Unblocks:**

- [[tickets/FEAT-005]] — Phase 4 Vault Index requires a working per-document parser

---

## Notes

ADR reference: [[adr/ADR012-parser-safety-policy]] constrains all parser implementations to avoid ReDoS patterns, use bounded input processing, and perform no file I/O.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` → `ready` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | — |
| `blocked` | All active tasks blocked | Blocker resolved → back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI + review | CI green + human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

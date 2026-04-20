---
id: "TASK-030"
title: "Define OFMIndex and OFMDoc types"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/3"]
aliases: ["TASK-030"]
---

# Define OFMIndex and OFMDoc types

> [!INFO] `TASK-030` · Task · Phase 3 · Parent: [[FEAT-004]] · Status: `open`

## Description

Create `src/parser/types.ts` defining all shared TypeScript types for the OFM parser pipeline. This includes `OFMIndex` (the flat projection of all OFM constructs found in a document), `OFMDoc` (the complete parsed document including frontmatter, opaque regions, and the index), and the entry types for each construct: `WikiLinkEntry`, `EmbedEntry`, `BlockAnchorEntry`, `TagEntry`, `CalloutEntry`, `HeadingEntry`, and `OpaqueRegion`. These types form the contract that all parser sub-components and all LSP feature handlers depend on.

---

## Implementation Notes

- All types in `src/parser/types.ts`; exported for use across the codebase
- `Range` type comes from `vscode-languageserver-types`; do not redefine it
- TypeScript correctness verified by `tsc --noEmit` — no runtime test file needed for type-only module
- See also: [[adr/ADR012-parser-safety-policy]]

```typescript
// src/parser/types.ts (key shapes)
export interface OFMIndex {
  headings: HeadingEntry[];
  wikiLinks: WikiLinkEntry[];
  embeds: EmbedEntry[];
  blockAnchors: BlockAnchorEntry[];
  tags: TagEntry[];
  callouts: CalloutEntry[];
}

export interface OFMDoc {
  uri: string;
  version: number;
  frontmatter: Record<string, unknown> | null;
  opaqueRegions: OpaqueRegion[];
  index: OFMIndex;
}

export interface OpaqueRegion {
  kind: 'code' | 'math' | 'comment';
  start: number;  // byte offset
  end: number;    // byte offset
}
```

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Type contract for OFM parser pipeline | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | Type definitions have no direct BDD scenario; correctness verified by tsc |

---

## Linked Tests

TypeScript types verified by `tsc --noEmit`. No separate test file needed for this task.

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | Parser types must be immutable-friendly; no mutable shared state |

---

## Parent Feature

[[FEAT-004]] — OFM Parser

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- All other Phase 3 TASK tickets depend on these types

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `tsc --noEmit` exits 0 with all types in place
- [ ] All parser sub-component tickets (TASK-031 through TASK-044) can import from `src/parser/types.ts` without errors
- [ ] `bun run lint --max-warnings 0` passes
- [ ] Parent feature [[FEAT-004]] child task row updated to `in-review`

---

## Notes

`WikiLinkEntry.range` must use the LSP `Range` type (zero-based line/character) rather than byte offsets, since LSP handlers consume this data directly.

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
> Ticket created. Status: `open`. Parent: [[FEAT-004]].

> [!SUCCESS] Done — 2026-04-17
> Implemented and tested. All acceptance criteria met. Status: `done`.

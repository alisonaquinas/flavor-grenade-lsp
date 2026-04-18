---
id: "TASK-041"
title: "Implement OFMParser orchestrator"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-031", "TASK-032", "TASK-033", "TASK-034", "TASK-035", "TASK-036", "TASK-037", "TASK-038", "TASK-039", "TASK-040"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-041"]
---

# Implement OFMParser orchestrator

> [!INFO] `TASK-041` · Task · Phase 3 · Parent: [[FEAT-004]] · Status: `open`

## Description

Create `src/parser/ofm-parser.ts` implementing the `OFMParser` class, which orchestrates all 8 stages of the OFM parse pipeline and returns a complete `OFMDoc`. The class is a pure function object: it performs no I/O, no side effects, and no NestJS DI concerns — it simply takes a URI, raw text string, and version number, runs each stage in order, and returns the assembled `OFMDoc`. This purity makes it straightforward to test in isolation.

---

## Implementation Notes

- Stage 1: `FrontmatterParser.parse(text)` → `{ frontmatter, bodyOffset }`
- Stage 2: `OpaqueRegionMarker(body)` → `OpaqueRegion[]`
- Stage 3: run `WikiLinkParser`, `EmbedParser`, `TagParser`, `CalloutParser`, `BlockAnchorParser` in parallel (all are pure, no ordering dependency within stage 3)
- Stages 4–6: CommonMark AST integration deferred to a later phase; emit empty AST placeholder
- Stage 7: assemble `OFMIndex` from stage 3 results
- Stage 8: assemble `OFMDoc`
- See also: [[adr/ADR012-parser-safety-policy]]

```typescript
// src/parser/ofm-parser.ts
export class OFMParser {
  parse(uri: string, text: string, version: number): OFMDoc;
}
```

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Full OFM parse pipeline for a single document | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/wiki-links.feature` | `Server indexes wiki-links in opened document` |
| `bdd/features/tags.feature` | `Server indexes tags in opened document` |
| `bdd/features/callouts.feature` | `Server indexes callouts in opened document` |
| `bdd/features/frontmatter.feature` | `Server parses frontmatter from opened document` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/ofm-parser.integration.test.ts` | Integration | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | No I/O in parser; no ReDoS; bounded input; pure function |

---

## Parent Feature

[[FEAT-004]] — OFM Parser

---

## Dependencies

**Blocked by:**

- All individual parser sub-components (TASK-031 through TASK-040) must be implemented

**Unblocks:**

- [[TASK-042]] — NestJS DI registration wraps `OFMParser`
- [[TASK-044]] — Wiring into `didOpen`/`didChange` calls `OFMParser.parse()`

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] Integration test using sample vault fixture passes
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-004]] child task row updated to `in-review`

---

## Notes

The integration test in `ofm-parser.integration.test.ts` uses a sample vault fixture directory at `src/test/fixtures/sample-vault/` containing representative `.md` files with all OFM construct types.

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

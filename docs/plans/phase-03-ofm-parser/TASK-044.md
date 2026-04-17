---
id: "TASK-044"
title: "Wire parser into textDocument/didOpen and textDocument/didChange"
type: task
status: open
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-042"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-044"]
---

# Wire parser into textDocument/didOpen and textDocument/didChange

> [!INFO] `TASK-044` · Task · Phase 3 · Parent: [[tickets/FEAT-004]] · Status: `open`

## Description

Update the `textDocument/didOpen` and `textDocument/didChange` handlers (created in Phase 2 as TASK-024 and TASK-025) to call `OFMParser.parse()` after updating the `DocumentStore`, and store the resulting `OFMDoc` in the `ParseCache` service. After this task, every document open or change event produces a freshly parsed `OFMDoc` that Phase 4 and later phases can query from `ParseCache` without re-parsing.

---

## Implementation Notes

- Inject `OFMParser` and `ParseCache` into the handler classes (or into the `LspModule` handler registration logic)
- In `textDocument/didOpen` handler: after `DocumentStore.open(...)`, call `OFMParser.parse(uri, text, version)` and `ParseCache.set(uri, result)`
- In `textDocument/didChange` handler: after `DocumentStore.update(...)`, retrieve updated text, call `OFMParser.parse(uri, newText, version)` and `ParseCache.set(uri, result)`
- In `textDocument/didClose` handler: call `ParseCache.delete(uri)` (fulfils the Phase 2 comment placeholder)
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Parser results available after every document change | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `Server indexes wiki-links in opened document` |
| [[bdd/features/tags]] | `Server indexes tags in opened document` |
| [[bdd/features/callouts]] | `Server indexes callouts in opened document` |
| [[bdd/features/frontmatter]] | `Server parses frontmatter from opened document` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/parser-wiring.integration.test.ts` | Integration | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | No I/O in parser; pure function called from handler layer |

---

## Parent Feature

[[tickets/FEAT-004]] — OFM Parser

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-042]] — `OFMParser` and `ParseCache` must be available via NestJS DI

**Unblocks:**

- Phase 4 (Vault Index) — vault indexer reads from `ParseCache`
- Phase 3 gate: `bun run gate:3` exercises the full BDD scenarios which require this wiring

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD `@smoke` scenarios pass locally
- [ ] `ParseCache.get(uri)` returns a non-null `OFMDoc` after a `textDocument/didOpen` event
- [ ] `ParseCache.get(uri)` returns `undefined` after a `textDocument/didClose` event
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-004]] child task row updated to `in-review`

---

## Notes

The Phase 2 comment `// Phase 3: trigger OFMParser` in `textDocument/didOpen` and `// Phase 3: clear ParseCache entry for uri` in `textDocument/didClose` should be replaced with real implementation in this task.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-004]].

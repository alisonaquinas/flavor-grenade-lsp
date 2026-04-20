---
id: "TASK-042"
title: "Register OFMParser in NestJS DI"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-041"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-042"]
---

# Register OFMParser in NestJS DI

> [!INFO] `TASK-042` · Task · Phase 3 · Parent: [[FEAT-004]] · Status: `open`

## Description

Create `src/parser/parser.module.ts` as a NestJS `@Module` that registers `OFMParser` as an `@Injectable()` singleton provider and exports it for consumption by other modules. A new `ParseCache` service must also be defined and registered here; it maps document URIs to their most recently parsed `OFMDoc`. Both `OFMParser` and `ParseCache` must be exported so that the `LspModule` (Phase 2) can import them and the document lifecycle handlers can call `OFMParser.parse()` and read from `ParseCache`.

---

## Implementation Notes

- `ParserModule` exports `OFMParser` and `ParseCache`
- `ParseCache` is a `Map<string, OFMDoc>` wrapped in an injectable service with `set`, `get`, and `delete` methods
- `LspModule` imports `ParserModule` to access both exports
- Apply `@Injectable()` to both `OFMParser` and `ParseCache` classes
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | NestJS DI wiring for OFM parser | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/wiki-links.feature` | `Server indexes wiki-links in opened document` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/parser.module.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | No I/O in parser; pure function wrapped in DI provider |

---

## Parent Feature

[[FEAT-004]] — OFM Parser

---

## Dependencies

**Blocked by:**

- [[TASK-041]] — `OFMParser` must be implemented before it can be registered

**Unblocks:**

- [[TASK-044]] — Handler wiring requires `OFMParser` and `ParseCache` to be available via DI

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
- [ ] Parent feature [[FEAT-004]] child task row updated to `in-review`

---

## Notes

`ParseCache` must be singleton-scoped (not request-scoped) since it must persist parsed results across multiple incoming LSP notifications.

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

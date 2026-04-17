---
id: "CHORE-009"
title: "Phase 3 Security Sweep"
type: chore
status: open
priority: high
phase: 3
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-031", "TASK-032", "TASK-033", "TASK-034", "TASK-035", "TASK-036", "TASK-037", "TASK-038", "TASK-039", "TASK-040", "TASK-041", "TASK-042", "TASK-043", "TASK-044"]
tags: [tickets/chore, "phase/3"]
aliases: ["CHORE-009"]
---

# Phase 3 Security Sweep

> [!INFO] `CHORE-009` · Chore · Phase 3 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review all Phase 3 parser implementation files for security issues as defined by ADR012 parser safety policy. The two primary concerns are: (1) ReDoS vulnerability — no parser may use a regex with exponential backtracking characteristics on attacker-controlled input; and (2) file I/O prohibition — no parser sub-component may read from or write to the file system, even indirectly through library calls. All parsers must operate on the in-memory string passed to them and return pure data.

---

## Motivation

The OFM parsers operate on untrusted content from vault files opened by the LSP client. A maliciously crafted document could trigger catastrophic backtracking in a vulnerable regex, causing the language server to hang and blocking the editor. Additionally, any file I/O in a parser could expose the server to path traversal attacks or unexpected side effects. ADR012 mandates both constraints explicitly.

- Motivated by: [[adr/ADR012-parser-safety-policy]] (no ReDoS patterns, bounded input, no file I/O in parsers)

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Parser safety: no ReDoS, no file I/O | [[requirements/security]] |

---

## Scope of Change

**Files modified:**

- `src/parser/tag-parser.ts` — audit Unicode regex for ReDoS risk
- `src/parser/wiki-link-parser.ts` — audit FSM for pathological input handling
- `src/parser/embed-parser.ts` — audit FSM for pathological input handling
- `src/parser/frontmatter-parser.ts` — audit `js-yaml` call for I/O or unsafe load mode
- All parser files — confirm no `fs`, `path`, or `os` imports

**Files created:**

- None expected

**Files deleted:**

- None expected

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | No ReDoS patterns; bounded input; no file I/O in any parser sub-component |

---

## Dependencies

**Blocked by:**

- All Phase 3 TASK tickets (TASK-030 through TASK-044) must be `done`

**Unblocks:**

- Phase 3 feature ticket [[tickets/FEAT-004]] can transition to `in-review` once all three Phase 3 chores are `done`

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] No parser file imports `fs`, `path`, `os`, or any other Node.js I/O module
- [ ] `js-yaml` is called with `yaml.load(str, { schema: FAILSAFE_SCHEMA })` or equivalent safe mode — not `yaml.loadAll` or `yaml.safeLoadAll`
- [ ] The Unicode tag regex `#[\p{L}\p{N}_/-]+` is verified to not exhibit catastrophic backtracking on adversarial input (test with a 10,000-character string of `#` followed by a non-matching character)
- [ ] No parser function contains a regex of the form `(a+)+`, `(a|a)*`, or similar nested quantifier pattern
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/`
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

For `js-yaml`, use `yaml.load` with an explicit schema that does not execute JavaScript (`FAILSAFE_SCHEMA`, `JSON_SCHEMA`, or `CORE_SCHEMA`) rather than the default schema, which can instantiate arbitrary JavaScript types via `!!js/...` YAML tags.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: parser safety per ADR012 (no ReDoS patterns, bounded input), no file I/O in parsers.

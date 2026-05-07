---
id: "TASK-202"
title: "Tune OFMarkdown language configuration"
type: task
status: green
priority: medium
phase: E12
parent: "FEAT-030"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-029"]
tags: [tickets/task, "phase/E12"]
aliases: ["TASK-202"]
---

# Tune OFMarkdown language configuration

> [!INFO] `TASK-202` - Task - Phase E12 - Parent: [[FEAT-030]] - Status: `green`

## Description

Tune the `ofmarkdown` language configuration for comments, brackets,
surrounding pairs, folding markers, and word patterns without altering generic
Markdown configuration.

---

## Implementation Notes

- Scope language configuration through the OFMarkdown language contribution.
- Include wiki-link and tag-friendly word pattern behavior where appropriate.
- See also: [[features/ofmarkdown-language-mode]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Contributions.OFMarkdownScoped` | Language configuration changes are scoped to `ofmarkdown` | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | `Extension stays idle for generic Markdown workspaces` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/test/contributions/language-configuration.test.ts` | Extension | `Extension.Contributions.OFMarkdownScoped` | ✅ passing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR016-ofmarkdown-language-mode]] | OFMarkdown-specific editor behavior belongs under the OFMarkdown language id |

---

## Parent Feature

[[FEAT-030]] - OFMarkdown Editor Contributions

---

## Dependencies

**Blocked by:**

- [[FEAT-029]] - E11 Marketplace proof should remain stable first

**Unblocks:**

- [[TASK-204]] - Isolation tests need language configuration to verify

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] OFMarkdown language configuration covers comments and surrounding pairs
- [x] Folding markers and word patterns are tuned for OFMarkdown constructs
- [x] Generic Markdown language configuration is unchanged
- [x] `cd extension && npm test` passes
- [ ] [[test/matrix]] row updated for `Extension.Contributions.OFMarkdownScoped`
- [ ] [[test/index]] updated if a new test file is added
- [ ] Parent feature [[FEAT-030]] child task row updated to `in-review`

---

## Notes

Do not move parsing or completion intelligence into the extension. This task is
editor contribution configuration only.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements and BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint, type, and test clean; awaiting CI | Verify Definition of Done |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING]
> `red` before `green` is non-negotiable. See [[requirements/code-quality]]
> `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE]
> Append-only. LLM agents add entries below in chronological order. Do not edit
> previous entries.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-030]].

> [!WARNING] Red - 2026-05-07
> Added failing language-configuration tests requiring OFMarkdown auto-pairs,
> surrounding pairs, and word-pattern coverage.

> [!SUCCESS] Green - 2026-05-07
> Tuned `extension/language-configuration.json` for wiki-link, embed, comment,
> tag, and block-anchor editing behavior; `cd extension && npm test` passes.

---
id: "TASK-201"
title: "Add OFMarkdown snippets"
type: task
status: done
priority: medium
phase: E12
parent: "FEAT-030"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-029"]
tags: [tickets/task, "phase/E12"]
aliases: ["TASK-201"]
---

# Add OFMarkdown snippets

> [!INFO] `TASK-201` - Task - Phase E12 - Parent: [[FEAT-030]] - Status: `done`

## Description

Add snippets scoped to the `ofmarkdown` language for callouts, embeds,
wiki-links, aliases frontmatter, tags frontmatter, and block anchors.

---

## Implementation Notes

- Add snippets through the extension contribution manifest.
- Keep snippet bodies OFMarkdown-specific and avoid generic Markdown triggers.
- See also: [[plans/phase-E12-ofmarkdown-editor-contributions]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Contributions.OFMarkdownScoped` | OFMarkdown snippets are scoped to `ofmarkdown` | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | `Extension stays idle for generic Markdown workspaces` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/test/contributions/snippets.test.ts` | Extension | `Extension.Contributions.OFMarkdownScoped` | ✅ passing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR016-ofmarkdown-language-mode]] | OFMarkdown has a separate VS Code language id for scoped contributions |

---

## Parent Feature

[[FEAT-030]] - OFMarkdown Editor Contributions

---

## Dependencies

**Blocked by:**

- [[FEAT-029]] - E11 Marketplace proof should remain stable first

**Unblocks:**

- [[TASK-204]] - Isolation tests need snippets to verify

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Required snippet categories exist for `ofmarkdown`
- [x] Snippets do not appear for generic `markdown`
- [x] Linked verification test starts RED before implementation
- [x] `cd extension && npm test` passes after implementation
- [x] [[test/matrix]] row updated for `Extension.Contributions.OFMarkdownScoped`
- [x] [[test/index]] updated if a new test file is added
- [x] Parent feature [[FEAT-030]] child task row updated to `in-review`

---

## Notes

Snippet labels should make the OFMarkdown construct obvious without duplicating
server completion behavior.

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
> Added failing manifest and snippet-file tests requiring OFMarkdown-scoped
> snippets for callouts, embeds, wiki-links, aliases, tags, and block anchors.

> [!SUCCESS] Green - 2026-05-07
> Added `extension/snippets/ofmarkdown.json` and an `ofmarkdown`-scoped snippet
> contribution in `extension/package.json`; `cd extension && npm test` passes.

> [!SUCCESS] In Review - 2026-05-07
> Definition of Done is satisfied locally; awaiting PR CI and review.

> [!SUCCESS] Done - 2026-05-07
> PR #44 CI is green and the parent feature row is updated to `done`.

---
id: "TASK-120"
title: "Implement \"Generate Table of Contents\" code action"
type: task
status: open
priority: medium
phase: 12
parent: "FEAT-013"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-118"]
tags: [tickets/task, "phase/12"]
aliases: ["TASK-120"]
---

# Implement "Generate Table of Contents" code action

> [!INFO] `TASK-120` · Task · Phase 12 · Parent: [[tickets/FEAT-013]] · Status: `open`

## Description

Create `src/code-actions/toc-generator.action.ts`. When the cursor is anywhere in a document, this provider collects all `HeadingEntry[]` from the document's `OFMIndex`, generates a nested `[[#Heading]]` markdown TOC, and produces a `CodeAction` with a `WorkspaceEdit` that inserts the TOC after the first heading. If a `## Table of Contents` heading already exists in the document, the action offers "Replace TOC" instead.

---

## Implementation Notes

- Collect all `HeadingEntry[]` from the document's `OFMIndex`
- Generate nested TOC using `[[#Heading]]` wiki-link syntax:

  ```markdown
  ## Table of Contents
  - [[#Heading 1]]
    - [[#Sub Heading]]
  - [[#Heading 2]]
  ```

- Detect existing TOC by presence of `## Table of Contents` heading
  - Existing TOC → `WorkspaceEdit` replacing the existing TOC block
  - No existing TOC → `WorkspaceEdit` inserting after the first heading
- See also: [[requirements/wiki-link-resolution]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Generate table of contents from document headings | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | `Generate Table of Contents inserts TOC after first heading` |
| [[bdd/features/code-actions]] | `Generate Table of Contents replaces existing TOC` |

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
| [[adr/ADR002-ofm-only-scope]] | TOC uses OFM `[[#heading]]` link syntax, not standard Markdown anchor links |

---

## Parent Feature

[[tickets/FEAT-013]] — Code Actions

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-118]] — dispatcher must exist before sub-action providers can be wired in

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

Heading nesting level determines indentation depth in the TOC list. H1 is not included in the TOC body (it is the document title); TOC starts from H2. Ensure heading text used in `[[#heading]]` links is not escaped in a way that breaks Obsidian resolution.

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

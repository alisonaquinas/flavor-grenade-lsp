---
id: "FEAT-024"
title: "Structural LSP Capabilities"
type: feature
status: in-progress
priority: medium
phase: 17
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["FEAT-023"]
tags: [tickets/feature, "phase/17"]
aliases: ["FEAT-024"]
---

# Structural LSP Capabilities

> [!INFO] `FEAT-024` - Feature - Phase 17 - Priority: `medium` - Status: `in-progress`

## Goal

Editors can use standard LSP document links, folding ranges, and selection ranges to navigate OFMarkdown structure. Vault authors get clickable local references, reliable folding for OFM constructs, and stable selection expansion without editor-specific extensions.

---

## Scope

**In scope:**

- Advertise `documentLinkProvider`, `foldingRangeProvider`, and `selectionRangeProvider`
- Implement `textDocument/documentLink` for unambiguous wiki-links, embeds, Markdown links, reference definitions, and attachment references
- Implement `textDocument/foldingRange` for frontmatter, headings, callouts, code fences, math blocks, Obsidian comments, and Templater regions
- Implement `textDocument/selectionRange` expanding from token to construct, paragraph, section, and document
- Add unit and BDD coverage for representative OFMarkdown structures

**Out of scope (explicitly excluded):**

- VS Code-specific command bridges
- Custom graph panels or tree views
- Formatting provider
- Semantic token theme contributions

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Navigate.UseEditorStructure` | Use editor-native structure features for OFMarkdown documents | [[requirements/user/ofmarkdown-parity]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.Coverage` | Document links, folding ranges, and selection ranges must reflect OFMarkdown structure | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.CapabilityRegistration` | Structural providers are advertised only when handlers exist | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.DocumentLinks` | Document links target unambiguous local OFMarkdown links | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.FoldingRanges` | Folding ranges expose OFMarkdown structures without crossing opaque regions | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.SelectionRanges` | Selection ranges expand through OFMarkdown construct boundaries | [[requirements/functional/ofmarkdown-parity]] |
| `Navigation.Definition.AllLinkTypes` | Reuse resolution targets for local links where unambiguous | [[requirements/navigation]] |
| `ST-002` | Respect opaque regions when deriving structural ranges | [[requirements/semantic-tokens]] |
| `Security.Input.PositionValidation` | Validate positions and ranges before structural queries | [[requirements/security/input-validation]] |
| `Diagnostic.Ambiguous.RelatedInfo` | Leave ambiguous links unresolved and rely on diagnostics/related information | [[requirements/diagnostics]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Parity scenarios for local Markdown links and the Phase 17 structural capability meter |
| `docs/bdd/features/navigation.feature` | Existing resolution scenarios reused by document links |
| `docs/bdd/features/frontmatter.feature` | Frontmatter structure used by folding and selection ranges |
| `docs/bdd/features/callouts.feature` | Callout structure used by folding and selection ranges |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-17-structural-lsp-capabilities]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `Parity.StructuralLSP.Coverage` meter passes
- [ ] `textDocument/documentLink` returns targets only for unambiguous local references
- [ ] `textDocument/foldingRange` returns bounded ranges for all in-scope OFM constructs
- [ ] `textDocument/selectionRange` expands through token, construct, paragraph, section, and document
- [ ] Folding and selection ranges never cross fenced code, math, comment, or Templater opaque region boundaries
- [ ] Existing navigation and semantic token tests remain green
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-175]] | Register structural LSP capabilities | `green` |
| [[TASK-176]] | Implement document links | `green` |
| [[TASK-177]] | Implement folding ranges | `open` |
| [[TASK-178]] | Implement selection ranges | `open` |
| [[TASK-179]] | Add structural LSP tests | `open` |
| [[CHORE-053]] | Phase 17 Lint Sweep | `open` |
| [[CHORE-054]] | Phase 17 Test Matrix Sweep | `open` |
| [[CHORE-055]] | Phase 17 Documentation Trace Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[FEAT-023]] - Phase 16 must be complete before structural LSP capability work starts

**Unblocks:**

- Later editor integration phases that depend on standard structural LSP responses

---

## Notes

Implementation sequence: [[TASK-175]] first, then [[TASK-176]], [[TASK-177]], and [[TASK-178]], followed by [[TASK-179]] and the Phase 17 sweep chores. Document links should reuse resolver output and must not duplicate definition logic.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | - |
| `blocked` | All active tasks blocked | Blocker resolved -> back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI + review | CI green + human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started - 2026-05-07
> Phase 16 PR #32 and status-finalization PR #34 passed CI and merged to
> `develop`. Phase 17 is now the active implementation phase. Status:
> `in-progress`.

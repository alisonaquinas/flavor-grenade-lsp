---
id: "FEAT-010"
title: "Completions"
type: feature
status: done
priority: "high"
phase: "9"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-007", "FEAT-008", "FEAT-009"]
tags: [tickets/feature, "phase/9"]
aliases: ["FEAT-010"]
---

# Completions

> [!INFO] `FEAT-010` · Feature · Phase 9 · Priority: `high` · Status: `draft`

## Goal

Vault authors gain a comprehensive, context-aware completion experience across every OFM construct. After typing `[[`, `![[`, `#`, or `> [!`, the editor offers accurate, ranked suggestions for wiki-links, headings, block anchors, embeds, tags, and callout types respectively. A unified router dispatches to the appropriate sub-provider based on cursor context, link insertion respects the configured link style, and the candidate list is capped to prevent overwhelming the editor on large vaults.

---

## Scope

**In scope:**

- Unified `CompletionRouter` as the single entry point for `textDocument/completion`
- `ContextAnalyzer` scanning backwards from cursor to identify completion kind
- Heading completion provider (after `[[doc#`)
- Callout type completion provider (after `> [!`) with 13 standard types plus vault custom types
- Embed completion provider (after `![[`) combining document stems and asset paths
- `completion.candidates` cap with `isIncomplete` signalling
- `linkStyle` formatting (`file-stem`, `title-slug`, `file-path-stem`) applied to all insert texts
- Intra-document heading completion after `[[#`
- Intra-document block ref completion after `[[#^`
- Updated `InitializeResult.capabilities.completionProvider` with all trigger characters

**Out of scope (explicitly excluded):**

- Rename symbol (Phase 11)
- Code actions (Phase 12)
- Tag completion (already partial from Phase 6; this phase consolidates it into the router)

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Comprehensive completion across all OFM construct types | [[requirements/user/index]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Completion provider requirements | [[requirements/completions]] |
| — | Configuration requirements for linkStyle and candidates cap | [[requirements/configuration]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/completions]] | All completion trigger and provider scenarios including callout types, headings, embeds, and intra-doc refs |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-09-completions]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] All scenarios in `completions.feature` pass in CI
- [ ] All linked Planguage requirement tags have `✅ passing` rows in [[test/matrix]]
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] Phase gate command passes in CI (see [[plans/execution-ledger]])
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[tickets/TASK-092]] | Implement unified CompletionRouter | `open` |
| [[tickets/TASK-093]] | Implement ContextAnalyzer | `open` |
| [[tickets/TASK-094]] | Implement heading CompletionProvider | `open` |
| [[tickets/TASK-095]] | Implement callout type CompletionProvider | `open` |
| [[tickets/TASK-096]] | Implement embed CompletionProvider | `open` |
| [[tickets/TASK-097]] | Implement completion.candidates cap with isIncomplete | `open` |
| [[tickets/TASK-098]] | Implement linkStyle formatting in completion insert texts | `open` |
| [[tickets/TASK-099]] | Implement intra-document heading completion after [[# | `open` |
| [[tickets/TASK-100]] | Implement intra-document block ref completion after [[#^ | `open` |
| [[tickets/TASK-101]] | Register updated completion capabilities | `open` |
| [[tickets/CHORE-025]] | Phase 9 Lint Sweep | `open` |
| [[tickets/CHORE-026]] | Phase 9 Code Quality Sweep | `open` |
| [[tickets/CHORE-027]] | Phase 9 Security Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-007]] — Phase 6 (Tags) must be complete; tag completion sub-provider depends on tag indexing
- [[tickets/FEAT-008]] — Phase 7 (Embeds) must be complete; embed completion depends on `AssetIndex`
- [[tickets/FEAT-009]] — Phase 8 (Block Refs) must be complete; block ref completion and intra-doc `[[#^` completion depend on block anchor indexing

**Unblocks:**

- [[tickets/FEAT-011]] — Phase 10 (Navigation) can begin once the completion router and context analyzer exist

---

## Notes

ADR references:
- [[adr/ADR005-wiki-style-binding]] — `linkStyle` configuration and insert text formatting rules

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

> [!SUCCESS] In-Review — 2026-04-17
> All 10 child tasks (TASK-092 through TASK-101) and all 3 chores (CHORE-025 through CHORE-027) are `done`. 58 new unit tests added across 5 test files (context-analyzer, completion-router, heading-completion-provider, callout-completion-provider, embed-completion-provider). Total test count: 321 (was 263). `bun run lint --max-warnings 0` passes. `tsc --noEmit` exits 0. Integration test updated to use correct cursor position for context-aware routing. Status: `in-review`.

## Phase 9 Retrospective

### What was built

Phase 9 delivered a complete, context-aware completion system replacing the naive trigger-character switch in `LspModule`. Key deliverables:

- `ContextAnalyzer` — backward-scanning regex engine detecting all 7 context kinds from raw cursor position. Uses ordered regex patterns (most-specific first) with 100-char lookback limit.
- `CompletionRouter` — single dispatch table routing completions to the correct sub-provider. Holds a `rawTextStore` map populated by `LspModule` on didOpen/didChange/didClose events.
- `HeadingCompletionProvider` — handles both intra-doc (`[[#`) and cross-doc (`[[stem#`) heading completion via Oracle resolution.
- `CalloutCompletionProvider` — standard 13-type list plus custom types from vault index. Hardcoded constant, security-clean.
- `EmbedCompletionProvider` — combines document stems with asset paths from VaultScanner.assetIndex.
- `CompletionModule` — NestJS module wiring all Phase 9 providers; imports ResolutionModule, VaultModule, ParserModule.
- TASK-097: 50-item candidate cap with `isIncomplete: true` signalling.
- TASK-098: `file-stem` linkStyle (default); `title-slug` and `file-path-stem` stubs for future phases.
- TASK-101: Updated capabilities: `triggerCharacters: ['[', '!', '#', '^', '>']`, `commitCharacters: [']']`.

### Key design decisions

- `CompletionRouter.rawTextStore` — chosen over injecting `DocumentStore` into `CompletionModule` to avoid circular dependency (`lsp` → `completion` → `lsp`). LspModule writes text on each didOpen/didChange.
- `ContextAnalyzer` regex order — callout before embed before block before heading before wiki-link before tag. Each pattern is anchored to end of prefix with `$`.
- Integration test position fix — corrected from (0, 2) to (0, 25) to match a real `[[` position in alpha.md.

### Technical debt carried forward

- `title-slug` and `file-path-stem` link styles are stubs (Phase 10 ADR-005 work).
- No `CompletionItemKind` import in `callout-completion-provider.ts` or `embed-completion-provider.ts` — numeric literals work because both files use `as const` equivalent via comment documentation. If TypeScript strictness increases, switch to enum imports.

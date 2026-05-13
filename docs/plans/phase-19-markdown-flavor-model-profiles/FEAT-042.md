---
id: "FEAT-042"
title: "Markdown Flavor Model And Profiles"
type: feature
status: in-review
priority: high
phase: 19
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-033"]
tags: [tickets/feature, "phase/19", markdown-flavor]
aliases: ["FEAT-042"]
---

# Markdown Flavor Model And Profiles

> [!INFO] `FEAT-042` - Feature - Phase 19 - Status: `in-review`

## Goal

Make Markdown flavors executable shared server/client product state by adding the canonical flavor contract and source-backed profile registry.

## Scope

- Define required flavor ids, labels, and order as a shared Config/flavor contract, not parser-owned UI state.
- Add dialect profiles for every explicit researched flavor.
- Unit-test coverage, source traces, and profile shape.
- Keep `auto` as detection state, not as a dialect profile.
- Ensure BC2 consumes profile capabilities through `ParseContext`; BC4 owns effective flavor resolution.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-283]] | Define canonical Markdown flavor contract | `in-review` |
| [[TASK-284]] | Add source-backed dialect profile registry | `in-review` |
| [[TASK-285]] | Cover Original, CommonMark, and Obsidian profiles | `in-review` |
| [[TASK-286]] | Cover remaining researched flavor profiles | `in-review` |
| [[TASK-287]] | Document research-to-profile validation trace | `in-review` |
| [[CHORE-103]] | Phase 19 execution setup and trace sweep | `in-review` |
| [[CHORE-104]] | Phase 19 verification and closeout sweep | `in-review` |

## Definition of Done

- [x] All explicit ADR020 flavors have profiles.
- [x] Unit tests fail when a flavor id, label, source, or profile section is missing.
- [x] [[docs/test/matrix]] and [[docs/test/index]] are updated with implemented evidence.
- [x] Phase verification commands pass locally.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from Markdown flavor gap analysis.

> [!INFO] Ready - 2026-05-13
> Step A-C sweep confirmed Phase 18 is complete, Phase 19 is next in the execution ledger, and implementation will add `src/markdown-flavor/markdown-flavor-contract.ts`, `src/markdown-flavor/markdown-flavor-profiles.ts`, `src/markdown-flavor/index.ts`, `src/parser/__tests__/markdown-flavor-profiles.test.ts`, and `docs/test/evidence/markdown-flavor-research-trace.md`.

> [!NOTE] RED - 2026-05-13
> Added failing profile registry contract coverage in `src/parser/__tests__/markdown-flavor-profiles.test.ts` before implementation.

> [!NOTE] GREEN - 2026-05-13
> Added `src/markdown-flavor/` contract/profile registry and `docs/test/evidence/markdown-flavor-research-trace.md`; focused profile test now passes.

> [!INFO] In Review - 2026-05-13
> Local Step E-L gates passed: `bun run lint --max-warnings 0`, `bun run typecheck`, `bun audit`, `bun test src/parser/__tests__/markdown-flavor-profiles.test.ts`, `bun test src/`, `bun test src/test/integration/`, `bun run bdd`, `bun run lint:docs`, `bun run format:check`, and `bun run build`. Verification and validation test directories are N/A because they do not exist.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

The phase stayed inside the intended model/profile scope. A single RED test file covered the shared flavor contract, explicit-only profile registry, profile security metadata, and research-trace evidence before implementation.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| None | N/A | No Step E-L findings required new tickets. | 0 h |

### Process observations

The A-M checklist fit this phase cleanly, though the available phase tickets group lint, quality, security, and verification closeout under CHORE-103 and CHORE-104 rather than separate sweep chores.

### Carry-forward actions

- [ ] Phase 20 should consume `src/markdown-flavor` from server configuration propagation instead of duplicating enum or label data.
- [ ] Phase 22-34 tickets must replace each `planned` profile surface with implemented, deferred, or not-applicable evidence linked to their parser fixtures.

### Rule / template amendments

- [ ] None.

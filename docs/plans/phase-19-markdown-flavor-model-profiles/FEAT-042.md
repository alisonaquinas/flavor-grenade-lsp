---
id: "FEAT-042"
title: "Markdown Flavor Model And Profiles"
type: feature
status: in-progress
priority: high
phase: 19
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-033"]
tags: [tickets/feature, "phase/19", markdown-flavor]
aliases: ["FEAT-042"]
---

# Markdown Flavor Model And Profiles

> [!INFO] `FEAT-042` - Feature - Phase 19 - Status: `in-progress`

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
| [[TASK-283]] | Define canonical Markdown flavor contract | `red` |
| [[TASK-284]] | Add source-backed dialect profile registry | `red` |
| [[TASK-285]] | Cover Original, CommonMark, and Obsidian profiles | `red` |
| [[TASK-286]] | Cover remaining researched flavor profiles | `red` |
| [[TASK-287]] | Document research-to-profile validation trace | `red` |
| [[CHORE-103]] | Phase 19 execution setup and trace sweep | `open` |
| [[CHORE-104]] | Phase 19 verification and closeout sweep | `open` |

## Definition of Done

- [ ] All explicit ADR020 flavors have profiles.
- [ ] Unit tests fail when a flavor id, label, source, or profile section is missing.
- [ ] [[docs/test/matrix]] and [[docs/test/index]] are updated with implemented evidence.
- [ ] Phase verification commands pass locally.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from Markdown flavor gap analysis.

> [!INFO] Ready - 2026-05-13
> Step A-C sweep confirmed Phase 18 is complete, Phase 19 is next in the execution ledger, and implementation will add `src/markdown-flavor/markdown-flavor-contract.ts`, `src/markdown-flavor/markdown-flavor-profiles.ts`, `src/markdown-flavor/index.ts`, `src/parser/__tests__/markdown-flavor-profiles.test.ts`, and `docs/test/evidence/markdown-flavor-research-trace.md`.

> [!NOTE] RED - 2026-05-13
> Added failing profile registry contract coverage in `src/parser/__tests__/markdown-flavor-profiles.test.ts` before implementation.

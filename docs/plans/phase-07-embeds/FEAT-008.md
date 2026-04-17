---
id: "FEAT-008"
title: "Embeds"
type: feature
status: draft
priority: high
phase: 7
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-006"]
tags: [tickets/feature, "phase/7"]
aliases: ["FEAT-008"]
---

# Embeds

> [!INFO] `FEAT-008` · Feature · Phase 7 · Priority: `high` · Status: `draft`

## Goal

Vault authors gain first-class editor support for `![[embed]]` syntax. Broken embeds are flagged with the FG004 diagnostic so authors immediately see when an embedded note, image, or asset cannot be found. Go-to-definition navigates to the embedded document, image file, or specific heading and block anchor within a target document. Hover shows a live content preview — the first lines of an embedded note or an inline image preview — giving authors context without leaving their current file. Size specifiers (`|200` or `|200x150`) on image embeds are distinguished from display aliases and handled correctly.

---

## Scope

**In scope:**

- `EmbedRef` tracking in `RefGraph` (separate from wiki-link refs), with `embedSize` field
- `EmbedResolver` for markdown docs (via Oracle), non-markdown assets (via AssetIndex), and heading/block sub-targets
- `AssetIndex` in `VaultScanner` for non-markdown files indexed by vault-relative path
- FG004 `BrokenEmbed` diagnostic (severity Warning) for unresolvable embed targets
- Embed go-to-definition: markdown → doc; image → file URI; heading/block → target line
- Embed hover: first 5 lines of target markdown; `![](uri)` for images
- Embed size syntax (`|200`, `|200x150`) distinguished from display alias in `EmbedParser`/`EmbedResolver`
- Unit tests for embed resolution

**Out of scope (explicitly excluded):**

- Embed completion (Phase 9)
- Embed rename (Phase 11)
- Recursive embed resolution (embed of embed)

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Embed resolution and navigation across vault | [[requirements/embed-resolution]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | FG004 diagnostic, go-to-definition, hover for embeds | [[requirements/embed-resolution]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/embeds]] | Embed resolution, FG004, go-to-definition, hover, and size syntax scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-07-embeds]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] All scenarios in `bdd/features/embeds.feature` pass in CI
- [ ] Embed resolution tests pass (`bun test src/resolution/__tests__/embed-resolver.test.ts`)
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
| [[tickets/TASK-075]] | Add EmbedRef to RefGraph | `open` |
| [[tickets/TASK-076]] | Implement EmbedDest resolution | `open` |
| [[tickets/TASK-077]] | Add asset tracking to VaultScanner | `open` |
| [[tickets/TASK-078]] | Implement FG004 diagnostic | `open` |
| [[tickets/TASK-079]] | Implement embed go-to-definition | `open` |
| [[tickets/TASK-080]] | Implement embed hover | `open` |
| [[tickets/TASK-081]] | Handle embed size syntax | `open` |
| [[tickets/TASK-082]] | Write unit tests for embed resolution | `open` |
| [[tickets/CHORE-019]] | Phase 7 Lint Sweep | `open` |
| [[tickets/CHORE-020]] | Phase 7 Code Quality Sweep | `open` |
| [[tickets/CHORE-021]] | Phase 7 Security Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-006]] — Phase 5 (Wiki-Link Resolution) must be complete; embed resolution builds on the same Oracle and RefGraph infrastructure

**Unblocks:**

- [[tickets/FEAT-010]] — Phase 9 (Completions) requires Phases 6, 7, and 8 to all be done

---

## Notes

ADR references: [[adr/ADR002-ofm-only-scope]] constrains embed handling to OFM syntax. [[adr/ADR013-vault-root-confinement]] governs asset path resolution — all asset paths must be confined to the vault root.

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

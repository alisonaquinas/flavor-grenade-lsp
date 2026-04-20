---
id: "TASK-076"
title: "Implement EmbedDest resolution"
type: task
status: done
priority: high
phase: 7
parent: "FEAT-008"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-075", "TASK-077"]
tags: [tickets/task, "phase/7"]
aliases: ["TASK-076"]
---

# Implement EmbedDest resolution

> [!INFO] `TASK-076` · Task · Phase 7 · Parent: [[FEAT-008]] · Status: `open`

## Description

Create `src/resolution/embed-resolver.ts` containing the `EmbedResolver` class. An embed destination can be a markdown document (resolved via `Oracle`, same as wiki-links), a non-markdown asset file (resolved via `AssetIndex`), or a sub-target within a document specified by a heading (`![[doc#heading]]`) or block anchor (`![[doc#^blockid]]`). For non-markdown files the `AssetIndex` from `VaultScanner` is consulted. Heading and block sub-target resolution first resolves the document, then locates the heading or block anchor within it.

---

## Implementation Notes

- `EmbedResolver.resolve(entry: EmbedEntry): ResolvedEmbed | null`
- Dispatch on target extension:
  - `.md` or no extension: resolve via `Oracle` (same path as wiki-link resolution)
  - Image/PDF/audio/video extensions: look up in `AssetIndex`
  - No extension: try Oracle first, then AssetIndex
- Sub-target resolution:
  - `#heading`: resolve doc, then find heading in `OFMDoc`
  - `#^blockid`: resolve doc, then find block anchor in `OFMDoc`
- Return `null` if target cannot be resolved (triggers FG004 in DiagnosticService)
- See also: [[requirements/embed-resolution]], [[adr/ADR013-vault-root-confinement]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Embed target resolution for markdown docs, assets, and sub-targets | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/embeds.feature` | `Markdown embed resolves to document` |
| `bdd/features/embeds.feature` | `Image embed resolves to asset path` |
| `bdd/features/embeds.feature` | `Heading embed resolves to heading line` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/smoke-embeds.md` | Integration | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Embed resolution follows OFM `![[embed]]` syntax |
| [[adr/ADR013-vault-root-confinement]] | Asset paths must be confined to vault root |

---

## Parent Feature

[[FEAT-008]] — Embeds

---

## Dependencies

**Blocked by:**

- [[TASK-075]] — EmbedRef must exist in RefGraph before resolver can populate it
- [[TASK-077]] — AssetIndex must exist before non-markdown resolution can work

**Unblocks:**

- [[TASK-078]] — FG004 diagnostic depends on resolver returning null
- [[TASK-079]] — embed go-to-definition depends on resolved target
- [[TASK-080]] — embed hover depends on resolved target
- [[TASK-081]] — size syntax handling extends the resolver
- [[TASK-082]] — unit tests test the resolver directly

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
- [ ] Parent feature [[FEAT-008]] child task row updated to `in-review`

---

## Notes

The resolver returns `null` for unresolvable targets, which is the signal used by `DiagnosticService` to emit FG004. All asset paths returned must be verified to be within the vault root (ADR013).

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
> Ticket created. Status: `open`. Parent: [[FEAT-008]].

> [!SUCCESS] Done — 2026-04-17
> `EmbedResolver` created at `src/resolution/embed-resolver.ts`. Resolves image extensions via `VaultScanner.hasAsset()`, markdown docs via `Oracle.resolve()`. Returns `EmbedResolution` union type (`markdown | asset | broken`). Added to `ResolutionModule`. Status: `done`.

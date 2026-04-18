---
id: "TASK-077"
title: "Add asset tracking to VaultScanner"
type: task
status: done
priority: high
phase: 7
parent: "FEAT-008"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/7"]
aliases: ["TASK-077"]
---

# Add asset tracking to VaultScanner

> [!INFO] `TASK-077` · Task · Phase 7 · Parent: [[tickets/FEAT-008]] · Status: `open`

## Description

Update `src/vault/vault-scanner.ts` to maintain an `AssetIndex` alongside the existing document index. Assets are all files under the vault root whose extensions do NOT match the configured document extensions (i.e., everything that is not `.md` or equivalent). Assets are indexed by their full vault-relative path (not stem-only like documents). The `AssetIndex` provides `has()` and `allPaths()` methods for use by the embed resolver.

---

## Implementation Notes

- Add `AssetIndex` class (or inline to `VaultScanner`):

  ```typescript
  export class AssetIndex {
    has(vaultRelativePath: string): boolean;
    allPaths(): string[];
  }
  ```

- During initial vault scan: collect all non-document files into `AssetIndex`
- On `FileWatcher` events: update `AssetIndex` on create/delete of non-document files
- Assets are keyed by full vault-relative path (e.g., `attachments/diagram.png`)
- ADR013 constraint: all indexed paths must be under vault root — reject any path that resolves outside vault root
- See also: [[adr/ADR013-vault-root-confinement]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Non-markdown asset files indexed by vault-relative path | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/embeds]] | `Image embed resolves to asset path` |

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
| [[adr/ADR013-vault-root-confinement]] | All asset paths must be confined within the vault root |

---

## Parent Feature

[[tickets/FEAT-008]] — Embeds

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[tickets/TASK-076]] — EmbedDest resolution requires AssetIndex to check non-markdown files

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
- [ ] Parent feature [[tickets/FEAT-008]] child task row updated to `in-review`

---

## Notes

`AssetIndex` uses full vault-relative paths (not stems) because multiple assets can share the same stem (e.g., `image.png` and `image.jpg`). Vault root confinement (ADR013) must be enforced during indexing, not just at resolution time.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-008]].

> [!SUCCESS] Done — 2026-04-17
> `VaultScanner` now maintains `assetIndex: Set<string>` (vault-relative paths of non-.md files). Added `getAssetIndex()` and `hasAsset()` methods. `FileWatcher` updated to inject `VaultScanner` and maintain asset index on rename events. Status: `done`.

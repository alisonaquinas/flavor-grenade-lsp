---
id: "FEAT-045"
title: "Markdown Flavor Selector And Settings"
type: feature
status: in-progress
priority: high
phase: E15
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-030", "FEAT-042", "FEAT-043"]
tags: [tickets/feature, "phase/E15", markdown-flavor, vscode]
aliases: ["FEAT-045"]
---

# Markdown Flavor Selector And Settings

> [!INFO] `FEAT-045` - Feature - Phase E15 - Status: `in-progress`

## Goal

Keep `.md` documents in VS Code's built-in Markdown language mode while a
separate selector and setting control effective Markdown flavor.

## Scope

- Add extension flavor constants and `flavorGrenade.markdownFlavor`.
- Replace language promotion with a flavor controller.
- Add selector UI, quick-pick choices, and override persistence.
- Propagate effective flavor to the server using
  `workspace/didChangeConfiguration` with `flavorGrenade.markdownFlavor` and
  resource-specific selected/effective flavor state, matching the Phase 20
  contract.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-299]] | Add extension flavor constants and setting schema | `green` |
| [[TASK-300]] | Replace language promotion with Markdown flavor controller | `green` |
| [[TASK-301]] | Add Markdown flavor selector UI and quick pick | `green` |
| [[TASK-302]] | Persist flavor overrides at the correct settings scope | `green` |
| [[TASK-303]] | Resolve Auto Detect from workspace and membership signals | `green` |
| [[TASK-304]] | Propagate effective flavor from extension to server | `green` |
| [[CHORE-109]] | Phase E15 extension trace and docs sweep | `green` |
| [[CHORE-110]] | Phase E15 verification and closeout sweep | `green` |
| [[CHORE-141]] | Refactor E15 markdown flavor helpers under function-size guideline | `done` |
| [[BUG-047]] | Update stale host test after E15 language preservation | `triaged` |

## Definition of Done

- [ ] Vault Markdown remains `markdown`.
- [ ] Selector contains every required flavor id and label.
- [ ] Selector constants, package schema, quick-pick ids, and shared dialect
      profile ids stay compatible.
- [ ] Overrides persist to the correct settings target.
- [ ] Server refresh receives `workspace/didChangeConfiguration` changes for
      `flavorGrenade.markdownFlavor` plus resource-specific selected/effective
      flavor state for every required explicit flavor id, including standalone
      `original`.
- [ ] Server propagation and reanalysis are skipped for open documents whose
      language id is `plaintext`, `mdx`, or any non-`markdown` value.
- [ ] Extension unit tests pass for selector, detection, persistence, and propagation.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from extension selector and settings gaps.

> [!INFO] Started - 2026-05-13
> Phase E15 started after Phase 23 because Phase 24 depends on the
> selector/settings contract. Execution order updated in
> [[docs/plans/execution-ledger]] so Obsidian flavor language support resumes
> after E15 is CI-green.

> [!WARNING] Step F finding - 2026-05-13
> CHORE-141 opened before refactoring new `extension/src/markdown-flavor.ts`
> helpers that exceeded the checklist's function-size guideline.

> [!SUCCESS] Local gate - 2026-05-13
> E15 selector/settings implementation passed `npm test`, `npm run compile`,
> root docs lint, root lint/typecheck, `bun audit`, `bun test src/`,
> `bun test src/test/integration/`, and `bun run bdd`. No
> `src/test/verification` or `src/test/validation` directories exist.

> [!WARNING] CI finding - 2026-05-13
> BUG-047 opened from PR #74 CI run `25823078553`: the extension host suite
> still waited for retired `ofmarkdown` promotion.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

The selector/settings surface fit cleanly into pure extension unit tests:
constants, package schema, quick-pick rows, settings target choice, auto
resolution, language preservation, and configuration payloads are all covered
without requiring Extension Development Host proof in E15.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| CHORE-141 | Chore | Step F found two new helper functions above the checklist size guideline after the green implementation. | +0.2 h |

### Process observations

Phase E15 intentionally leaves some historical `ofmarkdown` contribution and
host expectations in place because the phase plan assigns those to E16 and E17.
The useful boundary was: remove `ofmarkdown` from the LanguageClient document
selector now, but do not rewrite snippets, grammar contribution proof, or host
screenshots in this phase.

### Carry-forward actions

- [ ] In Phase 24, reuse the E15 selector/settings contract and do not create
      another flavor-selection path.
- [ ] In Phase E16, remove or retarget retired `ofmarkdown` contribution
      activation and Marketplace proof.
- [ ] In Phase E17, add host proof for visible selector behavior and
      server-unavailable replay.

### Rule / template amendments

- [ ] none

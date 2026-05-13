---
id: "FEAT-045"
title: "Markdown Flavor Selector And Settings"
type: feature
status: draft
priority: high
phase: E15
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-030", "FEAT-042", "FEAT-043"]
tags: [tickets/feature, "phase/E15", markdown-flavor, vscode]
aliases: ["FEAT-045"]
---

# Markdown Flavor Selector And Settings

> [!INFO] `FEAT-045` - Feature - Phase E15 - Status: `draft`

## Goal

Keep `.md` documents in VS Code's built-in Markdown language mode while a
separate selector and setting control effective Markdown flavor.

## Scope

- Add extension flavor constants and `flavorGrenade.markdownFlavor`.
- Replace language promotion with a flavor controller.
- Add selector UI, quick-pick choices, and override persistence.
- Propagate effective flavor to the server using
  `workspace/didChangeConfiguration` with `flavorGrenade.markdownFlavor` and
  the resolved effective flavor, matching the Phase 20 contract.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-299]] | Add extension flavor constants and setting schema | `open` |
| [[TASK-300]] | Replace language promotion with Markdown flavor controller | `open` |
| [[TASK-301]] | Add Markdown flavor selector UI and quick pick | `open` |
| [[TASK-302]] | Persist flavor overrides at the correct settings scope | `open` |
| [[TASK-303]] | Resolve Auto Detect from workspace and membership signals | `open` |
| [[TASK-304]] | Propagate effective flavor from extension to server | `open` |
| [[CHORE-109]] | Phase E15 extension trace and docs sweep | `open` |
| [[CHORE-110]] | Phase E15 verification and closeout sweep | `open` |

## Definition of Done

- [ ] Vault Markdown remains `markdown`.
- [ ] Selector contains every required flavor id and label.
- [ ] Overrides persist to the correct settings target.
- [ ] Server refresh receives `workspace/didChangeConfiguration` changes for
      `flavorGrenade.markdownFlavor` plus the resolved effective flavor for
      every required explicit flavor id, including standalone `original`.
- [ ] Server propagation and reanalysis are skipped for open documents whose
      language id is `plaintext`, `mdx`, or any non-`markdown` value.
- [ ] Extension unit tests pass for selector, detection, persistence, and propagation.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from extension selector and settings gaps.

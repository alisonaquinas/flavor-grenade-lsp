---
id: "FEAT-047"
title: "Extension Flavor Host Verification"
type: feature
status: draft
priority: high
phase: E17
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-046", "FEAT-043"]
tags: [tickets/feature, "phase/E17", markdown-flavor, vscode, tests]
aliases: ["FEAT-047"]
---

# Extension Flavor Host Verification

> [!INFO] `FEAT-047` - Feature - Phase E17 - Status: `draft`

## Goal

Prove Markdown flavor behavior in the VS Code Extension Development Host and
wire the new test layers into verification and validation evidence.

## Scope

- Add `markdown-flavor.test.js` host suite.
- Retire obsolete language-mode host expectations.
- Wire local and CI extension flavor gates.
- Add validation evidence and traceability updates.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-310]] | Add VS Code host Markdown flavor suite | `open` |
| [[TASK-311]] | Wire extension flavor tests into local and CI gates | `open` |
| [[TASK-312]] | Add extension validation evidence for selector behavior | `open` |
| [[TASK-313]] | Retire obsolete language-mode host tests | `open` |
| [[TASK-314]] | Close extension flavor traceability matrices | `open` |
| [[CHORE-113]] | Phase E17 host evidence sweep | `open` |
| [[CHORE-114]] | Phase E17 verification and closeout sweep | `open` |

## Definition of Done

- [ ] `npm run test:host` covers selector, persistence, auto, manual language, and reset flows.
- [ ] CI/local gates fail when flavor host coverage is removed.
- [ ] Validation evidence shows no `.md` transition to `ofmarkdown`.
- [ ] Root and extension matrices show implemented evidence.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from extension host and validation gaps.

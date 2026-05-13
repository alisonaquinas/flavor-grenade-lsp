---
id: "CHORE-111"
title: "Phase E16 documentation trace sweep"
type: chore
status: open
priority: medium
phase: E16
parent: "FEAT-046"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-046"]
tags: [tickets/chore, "phase/E16", docs]
aliases: ["CHORE-111"]
---

# Phase E16 Documentation Trace Sweep

## Description

Keep extension and root documentation aligned during contribution and
Marketplace migration.

## Work Scope

- Update root and extension test matrices for contribution and Marketplace tests,
  including `EXT-MF-I-005` for `extension/test/marketplace/readme-assets.test.ts`
  and `EXT-MF-I-006` for `extension/test/marketplace/vsix-assets.test.ts`.
- Add or update trace rows for `EXT-MF-I-007` as the activation/client-selector
  guard, leaving `EXT-MF-I-006` reserved for VSIX asset proof.
- Confirm README, troubleshooting, and activation docs share the same story.
- Produce a stale `ofmarkdown` reference ledger for current user-facing docs and
  tests, classifying remaining mentions as historical, legacy compatibility, or
  current bug. E16 owns activation/contribution/Marketplace references; E17 owns
  host-test waits and host evidence.
- Record any remaining compatibility debt.

## Definition of Done

- [ ] Trace docs link implemented E16 test files.
- [ ] No current user-facing doc presents language promotion as required behavior.
- [ ] Stale `ofmarkdown` ledger exists and assigns remaining current-test
      cleanup to E16 or E17.
- [ ] Residual compatibility debt is documented.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

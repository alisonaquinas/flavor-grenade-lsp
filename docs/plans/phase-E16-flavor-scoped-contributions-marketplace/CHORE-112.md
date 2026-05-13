---
id: "CHORE-112"
title: "Phase E16 verification and closeout sweep"
type: chore
status: open
priority: medium
phase: E16
parent: "FEAT-046"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-305", "TASK-306", "TASK-307", "TASK-308", "TASK-309"]
tags: [tickets/chore, "phase/E16", verification]
aliases: ["CHORE-112"]
---

# Phase E16 Verification And Closeout Sweep

## Description

Run extension unit, host, marketplace, package-target, compile, and docs
verification for E16.

## Work Scope

- Run `npm run compile`, `npm test`, `npm run test:host`,
  `npm run verify:marketplace-assets`, and `npm run verify:package-targets`.
  `npm run verify:marketplace-assets` must cover
  `extension/test/marketplace/readme-assets.test.ts` (`EXT-MF-I-005`) and
  `extension/test/marketplace/vsix-assets.test.ts` (`EXT-MF-I-006`).
- Run docs lint.
- Run or record the stale `ofmarkdown` scan for E16-owned docs/tests:
  activation, contribution, README, troubleshooting, and Marketplace assets.
- Record Marketplace selector proof evidence in
  `extension/docs/tests/evidence/markdown-flavor-selector-smoke.md` or the
  packaged asset evidence referenced from the extension validation spec, with
  package proof tied to `extension/test/marketplace/vsix-assets.test.ts`.
- Link contribution-scope evidence showing Obsidian-only affordances do not
  appear for generic CommonMark Markdown.
- Update feature status and workflow logs.

## Definition of Done

- [ ] E16 verification commands pass: `npm run compile`, `npm test`,
      `npm run test:host`, `npm run verify:marketplace-assets`, and
      `npm run verify:package-targets`.
- [ ] Marketplace evidence is current and covered by exact proof files
      `extension/test/marketplace/readme-assets.test.ts` and
      `extension/test/marketplace/vsix-assets.test.ts`.
- [ ] E16 validation evidence paths are linked from the extension test index or
      Phase E17 validation ticket.
- [ ] Stale `ofmarkdown` scan results are attached to the E16 closeout notes or
      handed off to E17 for host-only cleanup.
- [ ] Phase is ready for review.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

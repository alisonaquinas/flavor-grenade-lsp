---
id: "TASK-307"
title: "Update Marketplace README and selector visual proof"
type: task
status: open
priority: high
phase: E16
parent: "FEAT-046"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-045"]
tags: [tickets/task, "phase/E16", marketplace, markdown-flavor]
aliases: ["TASK-307"]
---

# Update Marketplace README And Selector Visual Proof

## Description

Update Marketplace proof from OFMarkdown language-mode promotion to Markdown
flavor selector behavior.

## Work Scope

- Replace README prose that says VS Code switches to OFMarkdown.
- Add selector visual proof asset.
- Keep existing OFM feature visuals where still accurate.
- Update Marketplace asset inventory if needed.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Marketplace.OFMProof` | `GAP-E-012` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-I-005` | `extension/test/marketplace/readme-assets.test.ts` | Selector visual is required and referenced. |
| `EXT-MF-I-006` | `extension/test/marketplace/vsix-assets.test.ts` | Selector proof asset and referenced README assets are present in packaged VSIX output. |

## Definition of Done

- [ ] README describes flavor selector, not language promotion.
- [ ] Selector visual is referenced and exists, covered by
      `extension/test/marketplace/readme-assets.test.ts`.
- [ ] Asset inventory remains package-safe, covered by
      `extension/test/marketplace/readme-assets.test.ts` and
      `extension/test/marketplace/vsix-assets.test.ts`.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

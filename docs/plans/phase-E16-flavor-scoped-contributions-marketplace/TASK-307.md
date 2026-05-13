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

| Test file | Expected coverage |
|---|---|
| `extension/test/marketplace/readme-assets.test.ts` | Selector visual is required and referenced. |

## Definition of Done

- [ ] README describes flavor selector, not language promotion.
- [ ] Selector visual is referenced and exists.
- [ ] Asset inventory remains package-safe.

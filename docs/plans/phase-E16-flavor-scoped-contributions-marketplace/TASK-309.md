---
id: "TASK-309"
title: "Update contribution and Marketplace verification tests"
type: task
status: open
priority: high
phase: E16
parent: "FEAT-046"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-306", "TASK-307"]
tags: [tickets/task, "phase/E16", verification]
aliases: ["TASK-309"]
---

# Update Contribution And Marketplace Verification Tests

## Description

Rewrite automated checks so extension contribution and Marketplace evidence
verify current Markdown flavor behavior.

## Work Scope

- Update contribution tests for flavor/context scoping.
- Update README and VSIX asset tests for selector proof.
- Keep package-target and existing asset packaging checks passing.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Contributions.FlavorScoped` | `GAP-E-010` |
| `Extension.Marketplace.AssetPackaging` | `GAP-E-012` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-C-001` through `EXT-MF-C-004` | `extension/test/contributions/*.test.ts` | Contribution scoping. |
| `EXT-MF-I-005` | `extension/test/marketplace/readme-assets.test.ts` | README selector proof. |
| `EXT-MF-I-006` | `extension/test/marketplace/vsix-assets.test.ts` | Packaged selector proof and referenced Marketplace assets. |

## Definition of Done

- [ ] `npm test` covers rewritten contribution tests.
- [ ] `npm run verify:marketplace-assets` covers selector proof through
      `extension/test/marketplace/readme-assets.test.ts` and package proof
      through `extension/test/marketplace/vsix-assets.test.ts`.
- [ ] Obsolete OFMarkdown-mode asset requirement is removed or reclassified.

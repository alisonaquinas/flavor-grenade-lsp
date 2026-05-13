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

| Test file | Expected coverage |
|---|---|
| `extension/test/contributions/*.test.ts` | Contribution scoping. |
| `extension/test/marketplace/*.test.ts` | Selector proof and packaged assets. |

## Definition of Done

- [ ] `npm test` covers rewritten contribution tests.
- [ ] `npm run verify:marketplace-assets` covers selector proof.
- [ ] Obsolete OFMarkdown-mode asset requirement is removed or reclassified.

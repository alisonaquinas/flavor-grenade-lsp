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

- Update contribution tests for flavor/context scoping, including snippets,
  keybindings, language configuration, isolation, command preconditions, and
  optional theme/example dispositions.
- Update README and VSIX asset tests for selector proof.
- Keep package-target and existing asset packaging checks passing.
- Keep `EXT-MF-I-006` reserved only for VSIX asset proof. Activation and client
  document-selector coverage uses `EXT-MF-I-007`.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Contributions.FlavorScoped` | `GAP-E-010` |
| `Extension.Marketplace.AssetPackaging` | `GAP-E-012` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-C-001` through `EXT-MF-C-006` | `extension/test/contributions/*.test.ts` | Contribution scoping, command preconditions, and optional theme/example dispositions. |
| `EXT-MF-I-005` | `extension/test/marketplace/readme-assets.test.ts` | README selector proof. |
| `EXT-MF-I-006` | `extension/test/marketplace/vsix-assets.test.ts` | Packaged selector proof and referenced Marketplace assets. |
| `EXT-MF-I-007` | `extension/src/activation-gate.test.ts` or `extension/src/client-options.test.ts` | Activation/client-selector guard proof is distinct from VSIX asset proof. |

## Definition of Done

- [ ] `npm test` covers rewritten contribution tests.
- [ ] Contribution tests cover `EXT-MF-C-001` through `EXT-MF-C-006`, or
      optional theme/example contributions are explicitly marked not
      applicable with validation evidence.
- [ ] `npm run verify:marketplace-assets` covers selector proof through
      `extension/test/marketplace/readme-assets.test.ts` and package proof
      through `extension/test/marketplace/vsix-assets.test.ts`.
- [ ] Obsolete OFMarkdown-mode asset requirement is removed or reclassified.
- [ ] Spec ID collision is resolved: `EXT-MF-I-006` is VSIX asset proof only,
      and activation/client selector proof is tracked as `EXT-MF-I-007`.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

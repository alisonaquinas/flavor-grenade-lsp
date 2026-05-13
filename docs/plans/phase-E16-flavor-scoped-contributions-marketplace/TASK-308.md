---
id: "TASK-308"
title: "Update troubleshooting and activation docs for flavor selection"
type: task
status: open
priority: medium
phase: E16
parent: "FEAT-046"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-305", "TASK-307"]
tags: [tickets/task, "phase/E16", docs, markdown-flavor]
aliases: ["TASK-308"]
---

# Update Troubleshooting And Activation Docs For Flavor Selection

## Description

Update extension-facing docs that still describe `ofmarkdown` language-mode
promotion or old activation assumptions.

## Work Scope

- Update troubleshooting language-mode guidance.
- Update activation docs for selector command and built-in Markdown.
- Link to ADR020 and current requirements.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownLanguage.PreserveDefault` | `GAP-E-001` |
| `Extension.Activation.MarkerEvents` | `GAP-E-009` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-I-003` | `extension/src/activation-gate.test.ts` | Selector command activation remains documented and covered. |
| `EXT-MF-VA-001`, `EXT-MF-VA-003` | `extension/docs/tests/markdown-flavor-validation-spec.md` | Docs align with user-visible selector behavior and do not describe language promotion as current behavior. |

## Definition of Done

- [ ] User docs no longer instruct users to expect OFMarkdown language picker state.
- [ ] Activation docs mention selector command behavior.
- [ ] Docs lint passes.

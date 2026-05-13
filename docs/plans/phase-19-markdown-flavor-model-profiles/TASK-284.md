---
id: "TASK-284"
title: "Add source-backed dialect profile registry"
type: task
status: open
priority: high
phase: 19
parent: "FEAT-042"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-283"]
tags: [tickets/task, "phase/19", markdown-flavor]
aliases: ["TASK-284"]
---

# Add Source-Backed Dialect Profile Registry

## Description

Create a registry for explicit Markdown flavor profiles with source traces and
structured syntax capability sections.

## Work Scope

- Define profile fields for core syntax, extension syntax, host behavior,
  unsupported constructs, and research source.
- Add a profile for every explicit flavor id.
- Keep profile data deterministic and testable.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-002` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | Every explicit flavor has exactly one complete profile. |

## Definition of Done

- [ ] All explicit flavors have profile entries.
- [ ] Every profile has a research source or `ofm-spec` source.
- [ ] Registry excludes `auto`.

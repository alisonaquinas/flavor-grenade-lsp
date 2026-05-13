---
title: "Phase 33: Reddit Markdown Language Support"
phase: 33
status: planned
tags: [plans, markdown-flavor, reddit, language-support]
aliases: [Phase 33, Reddit Markdown Support]
updated: 2026-05-13
---

# Phase 33: Reddit Markdown Language Support

| Field | Value |
|---|---|
| Phase | 33 |
| Title | Reddit Markdown Language Support |
| Status | planned |
| Gate | Reddit Markdown host-specific syntax awareness is implemented and tested |
| Depends on | Phase 23 |

## Objective

Implement practical local language support for the `reddit` flavor with clear
boundaries between Markdown syntax and Reddit host rendering.

## Scope

Support Reddit-specific portability diagnostics, escaping behavior, spoiler and
host-specific constructs where documented, line-break behavior, syntax warnings,
semantic tokens, folding, and completion or quick-fix guidance where useful.

## Acceptance

- Selecting `reddit` enables Reddit platform-awareness diagnostics.
- Host-only behavior is documented and not overclaimed.
- Integration and BDD coverage prove Reddit behavior.

## Tickets

Ticket index: [[plans/phase-33-reddit-markdown-language-support/index]]

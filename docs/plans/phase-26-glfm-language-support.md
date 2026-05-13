---
title: "Phase 26: GitLab Flavored Markdown Language Support"
phase: 26
status: planned
tags: [plans, markdown-flavor, glfm, language-support]
aliases: [Phase 26, GLFM Support]
updated: 2026-05-13
---

# Phase 26: GitLab Flavored Markdown Language Support

| Field | Value |
|---|---|
| Phase | 26 |
| Title | GitLab Flavored Markdown Language Support |
| Status | planned |
| Gate | GLFM signature constructs are implemented and tested |
| Depends on | Phase 25 |

## Objective

Implement actual language support for the `glfm` flavor, including the local
syntax portions of GitLab Flavored Markdown that can be modeled without GitLab
service access.

## Scope

Support the GLFM/CommonMark/GFM baseline, GitLab references, media and heading
conventions, local diagnostics, completions, semantic tokens, document links,
and navigation where the behavior is offline-testable.

## Acceptance

- Selecting `glfm` enables GitLab-specific syntax awareness.
- Host-only GitLab behavior is separated from local LSP behavior.
- Integration and BDD coverage prove GLFM behavior.

## Tickets

Ticket index: [[plans/phase-26-glfm-language-support/index]]

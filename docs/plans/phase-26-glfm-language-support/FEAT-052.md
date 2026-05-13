---
id: "FEAT-052"
title: "GitLab Flavored Markdown Language Support"
type: feature
status: draft
priority: high
phase: 26
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043"]
tags: [tickets/feature, "phase/26", markdown-flavor, "glfm"]
aliases: ["FEAT-052"]
---

# GitLab Flavored Markdown Language Support

> [!INFO] FEAT-052 - Feature - Phase 26 - Status: draft

## Description

Implement first-class glfm language support for GitLab Flavored Markdown, using [[research/gitlab-flavored-markdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for GitLab Flavored Markdown.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior according to [[plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[test/markdown-flavor-unit-spec#MF-U-014 - GLFM Parser And Analysis|MF-U-014]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-327]] | Implement GLFM parser semantics | Task | open |
| [[TASK-328]] | Add GLFM diagnostics and LSP features | Task | open |
| [[TASK-329]] | Add GLFM tests and validation evidence | Task | open |
| [[CHORE-123]] | Phase 26 trace and documentation sweep | Chore | open |
| [[CHORE-124]] | Phase 26 verification and closeout sweep | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] glfm has source-backed parser/profile behavior.
- [ ] glfm satisfies every required surface in [[plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] glfm behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

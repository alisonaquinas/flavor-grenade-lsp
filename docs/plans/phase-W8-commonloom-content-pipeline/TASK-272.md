---
id: "TASK-272"
title: "Add website adapter and typed manifests"
type: task
status: open
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-268", "TASK-271"]
tags: [tickets/task, "phase/W8", website, manifests]
aliases: ["TASK-272"]
---

# Add Website Adapter And Typed Manifests

> [!INFO] `TASK-272` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `open`

## Description

Implement the website-specific adapter that maps page-group manifests to
Commonloom inputs.

## Work Scope

- Define one typed manifest per page group.
- Validate manifest route ids, page groups, copy paths, expected frontmatter,
  and generated output names.
- Keep page-group and route-id authority in the website adapter.
- Add sample manifests for the first migrated content group.

## Definition of Done

- [ ] Manifest authors write TypeScript data, not generated output.
- [ ] Duplicate ids and copy paths fail validation.
- [ ] Invalid route ids fail before Svelte typecheck.
- [ ] Commonloom remains reusable because website-specific route concepts stay
  outside the core.

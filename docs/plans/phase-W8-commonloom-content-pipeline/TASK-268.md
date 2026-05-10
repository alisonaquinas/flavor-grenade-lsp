---
id: "TASK-268"
title: "Define Commonloom core contracts"
type: task
status: planned
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-267"]
tags: [tickets/task, "phase/W8", website, commonloom, types]
aliases: ["TASK-268"]
---

# Define Commonloom Core Contracts

> [!INFO] `TASK-268` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `planned`

## Description

Define the reusable data contracts that separate Commonloom from the website
adapter.

## Work Scope

- Define compiler input types for copy roots, media roots, manifest entries,
  HTML policy, link policy, and output mode.
- Define output types for compiled documents, rendered HTML, headings,
  frontmatter, content hashes, diagnostics, links, images, and source traces.
- Define diagnostic severity and stable diagnostic codes.
- Keep route ids and page-group enums in the website adapter, not in Commonloom.

## Definition of Done

- [ ] Contract tests prove Commonloom accepts only adapter-supplied data.
- [ ] Type names and fields match the ADR and architecture terminology.
- [ ] Diagnostics carry enough source information for actionable author errors.
- [ ] Core contracts do not import from website route or Svelte modules.

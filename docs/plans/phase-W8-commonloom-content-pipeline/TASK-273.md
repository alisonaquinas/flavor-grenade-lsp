---
id: "TASK-273"
title: "Generate TypeScript content records"
type: task
status: planned
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-272"]
tags: [tickets/task, "phase/W8", website, generated-typescript]
aliases: ["TASK-273"]
---

# Generate TypeScript Content Records

> [!INFO] `TASK-273` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `planned`

## Description

Emit deterministic generated TypeScript modules for the website renderer.

## Work Scope

- Write `website/src/content/generated/*.generated.ts` from manifest groups.
- Export typed records compatible with existing page contracts.
- Include sanitized `bodyHtml`, metadata, headings, links, images, and source
  trace data.
- Preserve generated JSON only as optional diagnostics or audit output, not as
  the renderer input.

## Definition of Done

- [ ] Generated TypeScript imports cleanly from existing page code.
- [ ] Output is stable across repeated generation.
- [ ] Generated modules include a "do not edit" banner.
- [ ] Generated files are reproducible from Markdown and manifests alone.

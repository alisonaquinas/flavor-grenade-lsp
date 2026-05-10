---
id: "TASK-267"
title: "Add Commonloom tooling scaffold"
type: task
status: open
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["FEAT-041"]
tags: [tickets/task, "phase/W8", website, tooling]
aliases: ["TASK-267"]
---

# Add Commonloom Tooling Scaffold

> [!INFO] `TASK-267` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `open`

## Description

Add the directory and command scaffold for the internal Commonloom compiler
without wiring page rendering yet.

## Work Scope

- Create the internal Commonloom source location under the website workspace.
- Add dependency choices from the W8 research: `unified`, `remark-parse`,
  `remark-gfm`, `remark-rehype`, `rehype-raw`, `rehype-sanitize`,
  `rehype-stringify`, `gray-matter`, and `zod`.
- Add initial command entry points for `content:generate` and `content:check`.
- Keep the Commonloom core isolated from Svelte, route files, and product data.

## Definition of Done

- [ ] Website package scripts include `content:generate` and `content:check`.
- [ ] Commonloom source files compile under website TypeScript settings.
- [ ] The scaffold can run and report "no manifests found" or equivalent
  non-destructive diagnostics.
- [ ] No generated files are committed.

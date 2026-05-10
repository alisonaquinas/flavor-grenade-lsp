---
id: "TASK-275"
title: "Wire scripts, gitignore, tests, and build gates"
type: task
status: open
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-273", "TASK-274"]
tags: [tickets/task, "phase/W8", website, tests, build]
aliases: ["TASK-275"]
---

# Wire Scripts, Gitignore, Tests, And Build Gates

> [!INFO] `TASK-275` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `open`

## Description

Make content generation part of normal website development and CI.

## Work Scope

- Add `website/src/content/generated/` to git ignore rules.
- Ensure build, typecheck, and tests generate or validate content before use.
- Add unit tests for core compiler behavior and adapter validation.
- Add stale-output checks for `content:check`.
- Update website CI docs or scripts as needed.

## Definition of Done

- [ ] Fresh clone plus install can build without committed generated content.
- [ ] `content:check` fails when generated TypeScript is stale.
- [ ] Website tests fail on broken content references.
- [ ] Normal `npm run build` works without manual preconditions.

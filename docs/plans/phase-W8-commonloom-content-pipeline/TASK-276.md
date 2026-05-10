---
id: "TASK-276"
title: "Verify website parity and authoring docs"
type: task
status: planned
priority: medium
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-274", "TASK-275"]
tags: [tickets/task, "phase/W8", website, docs, verification]
aliases: ["TASK-276"]
---

# Verify Website Parity And Authoring Docs

> [!INFO] `TASK-276` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `planned`

## Description

Prove the migrated website renders the same public surface and document the new
authoring workflow.

## Work Scope

- Add or update authoring documentation for Markdown copy, frontmatter, images,
  inline HTML, manifests, generation, and diagnostics.
- Verify page rendering parity for migrated routes.
- Verify generated source traces help authors locate bad Markdown or media.
- Record known follow-up work for eventual Commonloom extraction.

## Definition of Done

- [ ] Authoring docs explain how to add a page, update copy, add images, use
  inline HTML, and run generation checks.
- [ ] Browser or rendered-output checks confirm migrated routes are present.
- [ ] Follow-up extraction criteria are documented without blocking W8.
- [ ] Phase W8 can be handed to implementation without unresolved pipeline
  decisions.

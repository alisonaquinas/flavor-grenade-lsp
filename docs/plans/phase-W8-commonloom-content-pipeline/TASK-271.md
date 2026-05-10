---
id: "TASK-271"
title: "Validate links, wiki-links, and media references"
type: task
status: planned
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-269", "TASK-270"]
tags: [tickets/task, "phase/W8", website, links, media]
aliases: ["TASK-271"]
---

# Validate Links, Wiki-links, And Media References

> [!INFO] `TASK-271` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `planned`

## Description

Validate local Markdown links, images, and allowed wiki-link references before
the generated TypeScript is written.

## Work Scope

- Classify external URLs, same-document anchors, root-relative links,
  copy-relative links, media references, and wiki-links.
- Resolve local images through `website/src/content/media`.
- Let the website adapter resolve wiki-links only when they map to public routes.
- Fail diagnostics for missing images, unsafe paths, unsupported URI schemes,
  unresolved local links, and unresolvable public wiki-links.

## Definition of Done

- [ ] Valid Markdown image syntax generates a tracked image reference.
- [ ] Missing image files fail `content:check`.
- [ ] External HTTP and HTTPS links are preserved without local filesystem
  resolution.
- [ ] Unsafe or unsupported link targets fail with actionable diagnostics.
- [ ] Wiki-links do not become a hidden dependency on the LSP vault resolver.

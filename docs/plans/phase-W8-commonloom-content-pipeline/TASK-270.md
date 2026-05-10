---
id: "TASK-270"
title: "Sanitize HTML and source trace content"
type: task
status: planned
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-269"]
tags: [tickets/task, "phase/W8", website, html, diagnostics]
aliases: ["TASK-270"]
---

# Sanitize HTML And Source Trace Content

> [!INFO] `TASK-270` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `planned`

## Description

Allow useful inline HTML in Markdown while enforcing the documented sanitized
allowlist and preserving source trace data for generated records.

## Work Scope

- Enable inline HTML parsing through the unified/rehype pipeline.
- Apply the approved `rehype-sanitize` schema.
- Reject or strip disallowed tags and attributes with diagnostics.
- Record source Markdown path, manifest path, content hash, headings, links,
  image references, and line numbers where available.

## Definition of Done

- [ ] Allowed inline HTML renders in generated `bodyHtml`.
- [ ] Unsafe HTML cannot reach generated renderer input.
- [ ] Diagnostics identify the file and element that caused sanitization failure.
- [ ] Generated records include source trace metadata needed for audits and
  content debugging.

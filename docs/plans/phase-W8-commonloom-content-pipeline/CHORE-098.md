---
id: "CHORE-098"
title: "Phase W8 security sweep"
type: chore
status: done
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["CHORE-097"]
tags: [tickets/chore, "phase/W8", website, security]
aliases: ["CHORE-098"]
---

# Phase W8 Security Sweep

> [!INFO] `CHORE-098` · Chore · Phase W8 · Parent: [[FEAT-041]] · Status: `done`

## Description

Run the Step G security sweep for W8 after the code quality sweep passes.

## Scope of Change

- Markdown, manifest, and media path handling under
  `website/src/content/pipeline/**`
- command entry points under `website/scripts/content/**`
- dependency additions in `website/package.json` and `website/package-lock.json`
- sanitization, link validation, and generated output handling

## Acceptance Criteria

- [x] Copy, manifest, media, and generated paths are confined to approved roots.
- [x] Inline HTML sanitization cannot emit unsafe scriptable markup.
- [x] Unsupported URI schemes and traversal attempts fail validation.
- [x] New dependencies are pinned and have W8 rationale.
- [x] Any security finding is ticketed before it is fixed.

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Chore added for required Phase Execution Step G.

> [!SUCCESS] Security sweep complete · 2026-05-10
> `npm test -- --run content-pipeline-html content-pipeline-links-media
> content-pipeline-manifest content-pipeline-scripts`, `npm run lint`, and
> `npm audit --audit-level=moderate` passed from `website/`. Path confinement,
> unsafe HTML, unsupported link/media schemes, and generated-output checks have
> regression coverage. Status: `done`.

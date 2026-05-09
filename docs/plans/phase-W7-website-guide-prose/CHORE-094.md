---
id: "CHORE-094"
title: "Phase W7 guide prose verification"
type: chore
status: in-review
priority: high
phase: W7
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/chore, "phase/W7", website, verification]
aliases: ["CHORE-094"]
---

# Phase W7 Guide Prose Verification

> [!INFO] `CHORE-094` · Chore · Phase W7 · Status: `in-review`

## Description

Verify the complete Phase W7 article set after implementation.

## Acceptance Criteria

- [x] Website lint passes.
- [x] Website typecheck passes.
- [x] Website tests pass.
- [x] Website build passes.
- [x] Docs lint passes for `docs/` and `website/docs/`.
- [x] Dropdown navigation is verified on desktop.
- [x] Hubs are verified on mobile and desktop.
- [x] Every article route has prose, examples, links, and specified assets.
- [x] Every article route is included in sitemap output and route metadata.
- [x] No public article exposes internal ticket or phase language.

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Chore created for Phase W7 verification. Status: `in-review`.

> [!SUCCESS] Local gate passed · 2026-05-09
> `npm run lint`, `npm run typecheck`, `npm test -- --run`,
> `npm run build`, and `bun run lint:docs` passed locally. Status:
> `in-review` until PR CI confirms.

---
id: "CHORE-099"
title: "Phase W8 final closeout"
type: chore
status: in-progress
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-11"
dependencies: ["TASK-277", "TASK-278", "CHORE-095", "CHORE-100"]
tags: [tickets/chore, "phase/W8", website, closeout]
aliases: ["CHORE-099"]
---

# Phase W8 Final Closeout

> [!INFO] `CHORE-099` · Chore · Phase W8 · Parent: [[FEAT-041]] · Status: `in-progress`

## Description

Close Phase W8 only after generated records are the renderer input and the PR is
merged with green CI evidence.

## Scope of Change

- Re-run final local website gates.
- Confirm PR CI is green after the renderer switch.
- Confirm PR merge into `develop`.
- Update FEAT-041 acceptance criteria.
- Update W8 phase status, roadmap, and execution ledger.
- Leave Step M retrospective work to [[CHORE-101]] after final closeout
  evidence exists.
- Keep actual release publishing out of scope.

## Gate Commands

```bash
cd website
npm run content:generate
npm run content:check
npm run lint
npm run typecheck
npm test
npm run build
```

```bash
bun run lint:docs
```

## Definition of Done

- [x] FEAT-041 has no unchecked acceptance criteria.
- [ ] W8 phase status is `complete` only after merge evidence exists.
- [ ] Execution ledger and roadmap cite the final PR and CI evidence.
- [x] No generated files under `website/src/content/generated/` are committed.
- [x] No actual release tag or release publication is pushed.
- [ ] [[CHORE-100]] phase execution compliance audit is complete or has no
  blocking findings.

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket added for the remaining W8 closeout sequence after PR #63 exposed the
> generated-renderer switch as a follow-up needed before marking the phase
> complete.

> [!SUCCESS] Local closeout gates · 2026-05-10
> Re-ran the final local W8 gates after TASK-277 and TASK-278:
> `npm run content:generate`, `npm run content:check`, `npm run lint`,
> `npm run typecheck`, `npm test`, `npm run build`, and `bun run lint:docs`.
> Generated output remains ignored, and no release tag or publication was
> pushed. CHORE-099 stays `open` until PR CI and merge evidence exist.

> [!SUCCESS] PR CI green · 2026-05-10
> PR #63 CI run `25639122802` passed Build, dependency policy, format, ESLint,
> TypeScript typecheck, tests, both Markdown lint jobs, and website checks.
> The npm publish job was skipped. CHORE-099 remains `open` because the PR has
> not been merged into `develop`.

> [!INFO] Operational closeout dependency · 2026-05-11
> Added CHORE-100 as a blocker so final closeout cannot mark W8 complete before
> the phase execution rules are audited. Step M retrospective work is tracked
> separately in CHORE-101.

> [!INFO] Started closeout · 2026-05-11
> CHORE-100 is `done`, PR #64 is merged, and local W8 gates passed on the
> current branch. Status: `in-progress`.

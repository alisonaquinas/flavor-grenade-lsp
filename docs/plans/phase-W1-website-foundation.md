---
title: "Phase W1: Website Foundation And Toolchain"
phase: W1
status: complete
tags: [plans, website, scaffold, toolchain]
aliases: [Phase W1, Website Foundation]
updated: 2026-05-09
---

# Phase W1: Website Foundation And Toolchain

| Field | Value |
|---|---|
| Phase | W1 |
| Title | Website Foundation And Toolchain |
| Status | complete |
| Gate | Website dev, typecheck, lint, test, and build scripts pass from `website/` |
| Depends on | Phase E14 |

## Objective

Bootstrap the website application as a static Vite and Svelte project with
strict TypeScript, SCSS, source code under `website/src`, and tests under
`website/tests`.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [requirements/technical/index](../../website/docs/requirements/technical/index.md) | Establish Vite, Svelte, TypeScript, SCSS, and GitHub Pages compatible output |
| [requirements/technical/source-layout-and-documentation](../../website/docs/requirements/technical/source-layout-and-documentation.md) | Enforce `website/src`, `website/tests`, and documentation maturity expectations |
| [architecture/static-site-runtime](../../website/docs/architecture/static-site-runtime.md) | Implement the initial runtime source layout |
| [adr/0001-use-vite-svelte-typescript-scss-and-github-pages-for-the-website](../../website/docs/adr/0001-use-vite-svelte-typescript-scss-and-github-pages-for-the-website.md) | Apply the accepted website stack decision |

## Scope

### In Scope

- Create `website/package.json` with required scripts.
- Create Vite and Svelte configuration.
- Create strict TypeScript configuration.
- Create lint and test configuration for website source.
- Create initial SCSS token and layout entry points.
- Add a minimal static build that produces `website/dist`.

### Out of Scope

- Final homepage design.
- Full content pipeline.
- GitHub Pages production deployment.

## Workstreams

| Workstream | Deliverable |
|---|---|
| App scaffold | Vite/Svelte app in `website/src` |
| Quality gates | `lint`, `typecheck`, `test`, `build`, and `preview` scripts |
| Styling foundation | SCSS entry point and design-token placeholders |
| Test foundation | Website test runner with one smoke test |

## Acceptance

- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass
  from `website/`.
- The production build writes static output to `website/dist`.
- No website implementation source exists outside `website/src`.
- No website tests exist outside `website/tests`.
- Website docs lint remains green.

## Gate Verification

```bash
cd website
npm run lint
npm run typecheck
npm test
npm run build
```

```bash
bun run lint:docs
```

## Tickets

- [[docs/plans/phase-W1-website-foundation/FEAT-034]]
- [[docs/plans/phase-W1-website-foundation/TASK-214]]
- [[docs/plans/phase-W1-website-foundation/TASK-215]]
- [[docs/plans/phase-W1-website-foundation/TASK-216]]
- [[docs/plans/phase-W1-website-foundation/CHORE-087]]

## Related

- [requirements/technical/index](../../website/docs/requirements/technical/index.md)
- [architecture/index](../../website/docs/architecture/index.md)

## Workflow Log

> [!INFO] Started · 2026-05-09
> Phase W1 began on `feature/phase-w1-website-foundation`. During Step A, the
> Phase 18 dependency was removed because this website scaffold does not modify
> LSP security behavior and Phase 18 remains an independent server-track audit.

> [!SUCCESS] Local gate evidence · 2026-05-09
> `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass from
> `website/`. Repository docs lint, root lint/typecheck/unit tests, audits, and
> BDD `@smoke` also pass locally. Phase remains `in-progress` in the execution
> ledger until PR CI confirms the gate.

> [!CHECK] Complete · 2026-05-09
> PR #51 CI passed. Phase W1 is marked complete in the execution ledger.

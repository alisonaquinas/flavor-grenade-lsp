---
id: "CHORE-091"
title: "Phase W5 release readiness sweep"
type: chore
status: in-review
priority: high
phase: W5
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-226", "TASK-227", "TASK-228"]
tags: [tickets/chore, "phase/W5", website, verification]
aliases: ["CHORE-091"]
---

# Phase W5 Release Readiness Sweep

> [!INFO] `CHORE-091` · Chore · Phase W5 · Status: `in-review`

## Description

Run the final website release readiness pass, update the ledger, and collect
CI and deployment evidence before Phase W5 is marked complete.

## Acceptance Criteria

- [x] Website CI checks pass on the release PR.
- [ ] Release tag workflow passes.
- [ ] Pages deployment succeeds.
- [ ] Production smoke checks pass.
- [x] Changelog and release docs are current.
- [ ] `FEAT-038` acceptance checklist is updated.
- [ ] Execution ledger is updated only after CI and deploy evidence are green.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/chore-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Chore created for the Phase W5 release readiness sweep. Status: `open`.

> [!INFO] Started · 2026-05-09
> Started the readiness sweep after TASK-226, TASK-227, and TASK-228 reached
> `in-review`. Status: `in-progress`.

> [!WARNING] Finding · 2026-05-09
> Found BUG-028: the website Pages tag trigger used a regex-shaped pattern
> inside a GitHub Actions glob filter. Opened and triaged the bug before fixing.

> [!INFO] BUG-028 in review · 2026-05-09
> BUG-028 replaced the tag trigger with a GitHub glob-safe pattern and added
> semantic-version validation. Regression checks pass locally.

> [!INFO] In Review · 2026-05-09
> Local readiness gate passed: website lint, typecheck, tests, and build; root
> lint, typecheck, build, tests, dependency policy, format check, docs lint, and
> non-docs Markdown lint. Remaining evidence requires PR CI, release tag
> workflow, and Pages deployment. Status: `in-review`.

> [!CHECK] PR CI · 2026-05-09
> PR #55 CI passed. Release tag workflow and Pages deployment remain pending
> until the website release is promoted through `main` and tagged.

> [!WARNING] Finding · 2026-05-09
> Found BUG-029 while planning the release tag: `v*` tags also wake root npm
> publish automation, so website-only release tags need the `site-v*` family.

> [!INFO] BUG-029 in review · 2026-05-09
> BUG-029 added independent `site-v*` website release tags and local regression
> tests pass.

> [!CHECK] BUG-029 PR CI · 2026-05-09
> PR #56 CI passed. The website release can now use `site-v*` tags without
> waking root npm publish automation.

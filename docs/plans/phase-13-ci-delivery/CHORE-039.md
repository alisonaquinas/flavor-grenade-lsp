---
id: "CHORE-039"
title: "Phase 13 Security Sweep"
type: chore
status: open
priority: medium
phase: 13
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/13"]
aliases: ["CHORE-039"]
---

# Phase 13 Security Sweep

> [!INFO] `CHORE-039` · Chore · Phase 13 · Priority: `medium` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 13 CI and delivery configuration for security vulnerabilities. Three specific concerns must be verified per ADR008: OIDC publishing is correctly configured so no long-lived npm tokens appear in workflow YAML; `CODECOV_TOKEN` is stored as a GitHub Secret and not exposed as a plain environment variable in the workflow file; and `npm publish` uses `NODE_AUTH_TOKEN` sourced from `${{ secrets.NPM_TOKEN }}` only.

---

## Motivation

CI workflows that inadvertently expose secrets or use long-lived tokens in plain text are a common source of supply-chain security vulnerabilities.

- Motivated by: `Security.OIDC.Publishing` (ADR008), `Security.CI.NoLongLivedTokens`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | OIDC-aligned token management in CI/CD workflows | [[requirements/ci-cd]] |

---

## Scope of Change

**Files modified:**

- `.github/workflows/ci.yml` — verify CODECOV_TOKEN is read from `secrets.CODECOV_TOKEN`, not plain env
- `.github/workflows/release.yml` — verify NODE_AUTH_TOKEN is read from `secrets.NPM_TOKEN`, no hardcoded tokens

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR008-oidc-publishing]] | No long-lived npm tokens in CI; CODECOV_TOKEN as secret; NODE_AUTH_TOKEN from secrets only |

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed
- [ ] No long-lived npm tokens present in any workflow YAML file
- [ ] `CODECOV_TOKEN` referenced only as `${{ secrets.CODECOV_TOKEN }}` in workflow YAML
- [ ] `NODE_AUTH_TOKEN` referenced only as `${{ secrets.NPM_TOKEN }}` in workflow YAML
- [ ] No secret values appear in `env:` blocks at the workflow level (only at step level where needed)

---

## Notes

Scan all workflow YAML files for any literal token strings, `env:` blocks containing secret values, or `echo` steps that might expose secret values in logs. GitHub Actions automatically masks `${{ secrets.* }}` values, but only if they are referenced via the `secrets` context.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: security audit of Phase 13 CI/CD — OIDC publishing compliance, no long-lived npm tokens, CODECOV_TOKEN and NODE_AUTH_TOKEN stored as secrets only.

---
adr: "007"
title: git-flow branching strategy — main is releases only
status: accepted
date: 2026-04-16
---

# ADR 007 — git-flow branching strategy — main is releases only

## Context

The project needs a branching strategy that balances release stability, feature isolation, and CI gate placement.

Three strategies were evaluated:

**Option 1 — Trunk-based development.** All developers commit directly to `main` (or to short-lived feature branches that merge to `main` within a day). Releases are tagged commits on `main`. CI runs on every push to `main`. This model optimises for integration speed but requires very disciplined feature flagging to keep `main` releasable at all times. For a team without pre-existing feature-flag infrastructure it risks polluting `main` with incomplete work.

**Option 2 — GitHub Flow.** A single long-lived branch (`main`) plus short-lived feature branches. No dedicated release or hotfix branch convention. Pull requests merge directly to `main`, which is always deployable. Releases are tagged from `main`. Simpler than git-flow but provides no structured path for emergency hotfixes without disturbing feature work in progress.

**Option 3 — git-flow.** Formalised by Vincent Driessen. Two permanent branches: `main` (production-ready, tagged releases only) and `develop` (integration branch). Supporting branch types: `feature/*` (branched from `develop`, merged back to `develop`), `release/*` (branched from `develop` when preparing a release, merged to both `main` and `develop`), `hotfix/*` (branched from `main`, merged to both `main` and `develop`). No direct pushes to `main` or `develop` — all merges go through pull requests.

The project requires:
- `main` always reflects a tagged, production-ready release — never a work-in-progress commit.
- A `develop` integration branch that accumulates completed features before each release cycle.
- Feature branches that isolate individual features from each other.
- A controlled release-prep path (`release/*`) that allows last-minute fixes without blocking ongoing feature work on `develop`.
- An emergency hotfix path (`hotfix/*`) that can patch `main` without waiting for a full release cycle.
- GitHub Actions CI that runs on pull requests targeting both `main` and `develop`, and a publish workflow that triggers on push to `main` (tagged releases via OIDC).

## Decision

Adopt **git-flow** as the branching strategy for flavor-grenade-lsp.

Branch semantics:

- **`main`** — Tagged releases only. Never pushed to directly. Every commit on `main` corresponds to a semver tag (e.g., `v1.2.0`). The OIDC publish workflow triggers on `push` to `main` (see [[adr/ADR008-oidc-publishing]]).
- **`develop`** — Integration branch. All feature branches merge here via pull request. The CI suite runs on every PR targeting `develop`. `develop` is not published; it is the staging area before a `release/*` branch is cut.
- **`feature/*`** — One branch per feature, branched from `develop`. Named `feature/<short-description>` (e.g., `feature/block-ref-completion`). Merged back to `develop` via PR; the branch is deleted after merge.
- **`release/*`** — Cut from `develop` when the team decides to prepare a release. Named `release/<version>` (e.g., `release/1.2.0`). Only bug fixes, version bumps, and changelog entries are committed here. When ready, merged to `main` (tagged) and back-merged to `develop`. Branch deleted after merge.
- **`hotfix/*`** — Cut from `main` to patch a production defect. Named `hotfix/<short-description>`. Merged to `main` (tagged with a patch version bump) and back-merged to `develop`. Branch deleted after merge.

Pull request rules:
- No direct pushes to `main` or `develop`. Branch protection enforces this.
- All merges go through PRs. PRs require CI to pass before merging.

GitHub Actions CI configuration:
- `pull_request` trigger targets `[main, develop]` — runs the full test, lint, and typecheck suite on every PR.
- `push` trigger targets `[main]` — runs the OIDC publish workflow after the merge commit is tagged.

## Consequences

**Positive:**
- `main` has a clean, linear release history. Every commit is a tagged production release. Consumers of the package can trust that any commit on `main` is stable.
- Feature isolation: each `feature/*` branch is self-contained. A broken feature branch cannot affect other features in progress on `develop`.
- PRs are the mandatory gate for all merges. CI must pass before any branch reaches `main` or `develop`.
- The `release/*` branch provides a controlled staging area for release-prep work without blocking ongoing feature development on `develop`.
- The `hotfix/*` path allows emergency patches to reach production immediately without cherry-picking through an unfinished `develop` state.

**Negative:**
- More ceremony than trunk-based or GitHub Flow. Contributors must understand the five branch types and their lifecycle.
- Back-merging `release/*` and `hotfix/*` to `develop` is a required step that can be forgotten. This should be automated or enforced by a checklist in the PR template.
- Long-lived feature branches risk merge conflicts when `develop` moves significantly while the branch is open. Feature branches should be kept short-lived (days, not weeks) to mitigate this.

**Neutral:**
- The GitHub Actions workflow files must enumerate all relevant branch triggers explicitly. A CI configuration that only triggers on `main` would silently skip PR checks on `develop`.

## Related

- [[adr/ADR008-oidc-publishing]]
- [[plans/phase-13-ci-delivery]]
- [[requirements/development-process]]

---
adr: "009"
title: Pre-commit hooks enforce zero linting warnings and passing tests
status: accepted
date: 2026-04-16
---

# ADR 009 — Pre-commit hooks enforce zero linting warnings and passing tests

## Context

Linting warnings that are permitted to accumulate become permanent technical debt. Once a codebase contains hundreds of suppressed warnings, enforcing any new lint rule produces noise rather than signal, and developers learn to ignore the output entirely. The project requires "aggressive strict linting, warnings treated as errors" (see [[requirements/code-quality]]).

Two enforcement points were evaluated:

**Enforcement Point 1 — CI-only gates.** Lint, typecheck, format, and test checks run in GitHub Actions on every PR. If a PR introduces warnings, CI fails and the PR cannot be merged. Local development is unrestricted — developers may commit and push code that would fail CI, discovering the failure only after the push. This approach tolerates a feedback loop of minutes to hours. It also allows local branches to accumulate failing commits, which must be fixed before the PR can merge (often via a fixup commit, which obscures intent in the history).

**Enforcement Point 2 — Pre-commit hooks.** Git hooks run the same checks locally before `git commit` completes. If any check fails, the commit is rejected. Developers see failures immediately, in the same terminal session where they made the change, with zero round-trip time. Bad code never enters the repository, not even on a feature branch. CI remains the canonical gate, but it rarely fails because the pre-commit hook catches issues first.

Three pre-commit hook tools were evaluated:

- **husky** — the most widely used Node.js git hook manager. Requires Node.js to install and run. Config lives in `package.json` or `.husky/` directory. Works well in npm/yarn/pnpm projects. Adds a Node.js startup cost on every commit.
- **lefthook** — written in Go; distributed as a single binary. YAML configuration in `lefthook.yml`. Supports parallel execution of multiple checks within a single hook stage. Works with any language runtime including Bun. No Node.js dependency for the hook runner itself.
- **simple-git-hooks** — minimal npm package that writes raw shell commands into `.git/hooks/`. Requires npm to install. No parallel execution support. Suitable for simple projects; lacks lefthook's per-hook granularity.

## Decision

Use **lefthook** as the pre-commit hook manager.

Rationale: lefthook's Go binary imposes no Node.js startup overhead, its YAML config is explicit and reviewable in code review, and its parallel runner executes all checks concurrently (reducing hook wall-clock time). It integrates cleanly with Bun and does not require a separate Node.js installation on the developer's machine.

The pre-commit hook runs the following checks, **all of which must pass for the commit to succeed**:

1. `bun run typecheck` — runs `tsc --noEmit`. Zero TypeScript compiler errors permitted.
2. `bun run lint -- --max-warnings 0` — runs ESLint with `--max-warnings 0`. Zero warnings permitted; any warning is a commit-blocking error.
3. `bun run format:check` — runs Prettier in check mode. Any file that does not conform to Prettier's output fails the hook.
4. `bun test` — runs the full Bun test suite. All tests must pass.

If any step fails, lefthook prints the failing step's output and exits non-zero. The commit is aborted. The developer fixes the issue and re-runs `git commit`.

Configuration is committed to the repository as `lefthook.yml` at the repository root. Developers run `lefthook install` once after cloning the repository. This registers the hooks in `.git/hooks/`. The `lefthook install` step is documented in the project README and is included in the Phase 1 scaffold checklist (see [[plans/phase-01-scaffold]]).

`--no-verify` bypass: developers may use `git commit --no-verify` only in explicitly documented emergency scenarios (e.g., a time-sensitive hotfix where CI will be the gate). Its use must be noted in the PR description. `--no-verify` is never permitted in CI-driven commits.

CI mirrors the exact same four checks. The CI job is the authoritative gate for merges to `main` and `develop` (see [[adr/ADR007-git-flow-branching]]). The pre-commit hook is a developer ergonomics layer, not a replacement for CI.

## Consequences

**Positive:**
- No warnings, type errors, formatting violations, or failing tests can enter the repository on any branch, including feature branches. The codebase remains clean at every commit.
- Developers receive immediate, local feedback. The round-trip time from writing a warning-producing line to discovering the violation is measured in seconds, not minutes.
- CI failures become rare rather than routine. When CI does fail (e.g., due to an environment difference), it is a genuinely interesting signal rather than background noise.
- The `lefthook.yml` file is committed and version-controlled. Any change to the hook configuration goes through code review like any other change.

**Negative:**
- Commits are slower. Running `bun test` on every commit adds wall-clock time proportional to the test suite size. As the test suite grows, this cost will increase. A pre-push hook (running tests only on `git push`) is a future mitigation option, but the pre-commit hook for lint/typecheck/format is non-negotiable.
- Developers who habitually use `git commit --no-verify` will bypass all protections. Team discipline and PR review are the backstop.
- `lefthook install` is a manual one-time step after cloning. If forgotten, the developer silently has no pre-commit hooks. A postinstall script in `package.json` can automate this but requires care to not break CI environments where lefthook is not installed.

**Neutral:**
- lefthook supports a `skip` property per command (e.g., skip in CI). The `lefthook.yml` should set `skip: [ci]` on checks that are redundant when CI is already running them separately, to avoid double-running in automated environments.

## Related

- [[adr/ADR002-ofm-only-scope]]
- [[requirements/code-quality]]
- [[requirements/ci-cd]]
- [[plans/phase-01-scaffold]]

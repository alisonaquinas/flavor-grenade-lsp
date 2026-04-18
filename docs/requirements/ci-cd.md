---
title: Requirements — CI/CD
tags:
  - requirements/ci-cd
aliases:
  - CI/CD Requirements
  - Continuous Integration Requirements
---

# CI/CD Requirements

> [!NOTE] Scope
> These requirements govern GitHub Actions workflows, markdown linting policies, OIDC publishing, pre-commit gates, and branching strategy enforcement. They apply to the `.github/workflows/` pipeline and the `lefthook.yml` pre-commit configuration. Implementation obligations are carried by [[plans/phase-13-ci-delivery]] for full CI build-out, and by [[plans/phase-01-scaffold]] for the pre-commit gate bootstrapped in Phase 1.

---

**Tag:** CICD.Workflow.PRGate
**Gist:** Every pull request targeting `main` or `develop` must pass all CI checks — typecheck, lint, test, build — before merge is permitted.
**Ambition:** A PR gate without mandatory pass enforcement degrades to an advisory system: contributors learn to merge with red CI and fix it later, which is the exact failure mode the gate is designed to prevent. GitHub branch protection rules (required status checks) enforce the gate at the platform level so that no reviewer can bypass it by approving a PR with failing checks. The gate must cover all four quality dimensions: type safety, lint correctness, test coverage, and artifact buildability.
**Scale:** Percentage of pull requests merged into `main` or `develop` that did not pass all required status checks at the time of merge.
**Meter:**

1. Enable branch protection on `main` and `develop` in GitHub repository settings.
2. Set required status checks to: `typecheck`, `lint`, `format`, `test`, `build`.
3. For a sample of 10 merged PRs, verify that all required checks were green at the merge commit.
4. Compute: (PRs merged with all checks green / total PRs merged) × 100.
**Fail:** Any PR merged while at least one required status check was failing or pending.
**Goal:** 0% of merges bypass the gate — 100% of merged PRs have all required checks green.
**Stakeholders:** All contributors, CI pipeline maintainers, release engineers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR007-git-flow-branching]], [[.github/workflows/ci.yml]], GitHub Actions documentation §Branch Protection.

---

**Tag:** CICD.Markdown.DocsFolderLinting
**Gist:** All Markdown files under `docs/` must be linted by `markdownlint-obsidian` (the obsidian-linter CLI package) in CI; lint failures cause CI to fail.
**Ambition:** The `docs/` tree is written in Obsidian Flavored Markdown — it uses wiki-links, callout syntax, and frontmatter patterns that standard Markdown linters reject as invalid. Using a standard linter on `docs/` would produce false positives on every OFM construct. `markdownlint-obsidian` understands OFM syntax and validates the docs/ tree with rules appropriate to the content. Failing CI on lint violations ensures that documentation debt is caught in review, not discovered later during a docs audit.
**Scale:** Percentage of CI runs where the `markdown-lint-docs` job exits 0 when `docs/` contains at least one lint violation.
**Meter:**

1. Introduce a deliberate lint violation in a `docs/` file (e.g., a heading followed by two blank lines where one is required).
2. Push to a branch and trigger CI.
3. Verify that the `markdown-lint-docs` CI job exits non-zero.
4. Compute: (CI runs that correctly fail on docs/ violations / total CI runs with violations) × 100.
**Fail:** Any `markdownlint-obsidian` violation in `docs/` that does not cause CI failure.
**Goal:** 0% silent failures — every `docs/` Markdown violation fails CI.
**Stakeholders:** Documentation maintainers, contributors, Obsidian vault users of this project.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[.github/workflows/ci.yml#markdown-lint-docs]], [[requirements/development-process]], markdownlint-obsidian documentation.

---

**Tag:** CICD.Markdown.SourceLinting
**Gist:** All Markdown files NOT in `docs/` and NOT in `.github/` must be linted by `markdownlint-cli2` in CI; violations cause CI failure.
**Ambition:** The root `README.md`, `scripts/*.md`, and any other Markdown outside the OFM-specific `docs/` tree must conform to standard Markdown conventions enforced by `markdownlint-cli2`. These files target GitHub rendering, not Obsidian, so OFM syntax linting would be incorrect. Separating the linting strategies prevents false positives in both directions: OFM content in `docs/` is not rejected by a standard linter, and non-OFM content outside `docs/` is not given a pass on standard Markdown violations.
**Scale:** Percentage of non-docs, non-.github Markdown files that have at least one `markdownlint-cli2` violation which fails to surface in CI.
**Meter:**

1. Introduce a deliberate violation in `README.md` (e.g., trailing spaces, inconsistent heading levels).
2. Push to a branch and trigger CI.
3. Verify the `markdown-lint-other` CI job exits non-zero.
4. Compute: (CI runs that correctly detect violations / total CI runs with violations) × 100.
**Fail:** Any `markdownlint-cli2` violation in a non-docs, non-.github Markdown file that does not cause CI failure.
**Goal:** 0% silent failures.
**Stakeholders:** All contributors, GitHub profile visitors, documentation reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[.github/workflows/ci.yml#markdown-lint-other]], `.markdownlint-cli2.jsonc`, markdownlint-cli2 documentation.

---

**Tag:** CICD.Publish.OIDC
**Gist:** npm and Bun registry publishing must use OIDC keyless authentication with provenance attestation; `npm publish --provenance` is required for every release.
**Ambition:** Long-lived npm tokens stored as repository secrets are a high-value attack target: if the secret is compromised, an attacker can publish malicious package versions indefinitely. OIDC trusted publishing eliminates the static token: the GitHub Actions runner requests a short-lived OIDC token from GitHub's identity provider, which the npm registry accepts as proof of identity. Combined with `--provenance`, every published version carries a cryptographically verifiable link back to the specific GitHub Actions run that produced it — consumers can verify not just who published but exactly what source commit and workflow produced the artifact.
**Scale:** Percentage of published package versions that carry a valid OIDC provenance attestation visible on npmjs.com.
**Meter:**

1. Publish a test release using the `publish.yml` workflow.
2. Navigate to the package's page on npmjs.com.
3. Verify the provenance section shows the GitHub Actions workflow run URL and commit SHA.
4. Verify the `sigstore` attestation bundle is present (`npm audit signatures`).
5. Compute: (published versions with valid provenance / total published versions) × 100.
**Fail:** Any published version without a valid OIDC provenance attestation.
**Goal:** 100% of published versions carry provenance — `npm audit signatures` exits 0.
**Stakeholders:** Package consumers, security auditors, supply-chain integrity reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR008-oidc-publishing]], [[.github/workflows/publish.yml]], npm documentation §Provenance.

---

**Tag:** CICD.Publish.Trigger
**Gist:** Publishing must only be triggered by a push of a semver tag (`v*.*.*`) to `main`; no manual publish from developer machines.
**Ambition:** Manual publishes from developer machines bypass the CI gate, the provenance chain, and the release review process. A tag-triggered workflow ensures that every published version corresponds to a specific commit on `main` that has passed all CI checks and is identified in git history by the semver tag. It also creates a permanent audit trail: the published version, the git tag, the CI run, and the source commit are all linked.
**Scale:** Percentage of published versions triggered by a push event other than a semver tag on `main` (e.g., manual `npm publish` or a workflow_dispatch trigger without tag validation).
**Meter:**

1. Attempt a publish by running the publish workflow with a non-tag trigger (e.g., `workflow_dispatch`).
2. Verify the workflow is configured to only run on `on: push: tags: ['v*.*.*']`.
3. Verify that `main` branch protection prevents direct pushes without a release branch merge.
4. Compute: (published versions triggered by semver tag push / total published versions) × 100.
**Fail:** Any version published by means other than a semver tag push to `main`.
**Goal:** 0% non-tag publishes — 100% of published versions have a corresponding `v*.*.*` git tag on `main`.
**Stakeholders:** Release engineers, consumers, security auditors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR007-git-flow-branching]], [[adr/ADR008-oidc-publishing]], [[.github/workflows/publish.yml]].

---

**Tag:** CICD.PreCommit.Gate
**Gist:** The `lefthook` pre-commit hook must run typecheck, lint (`--max-warnings 0`), format check, and tests before each commit; `--no-verify` bypass must not be used on `develop` or `main`.
**Ambition:** CI feedback loops run in minutes; local feedback loops run in seconds. A pre-commit gate that mirrors the CI checks catches the majority of regressions before they are pushed, reducing the round-trip cost of a failed CI run. `lefthook` (not husky) is used because it is a Go binary with no Node dependency — it works correctly in the Bun environment where `postinstall` scripts may not behave identically to npm. The `--no-verify` bypass policy exists to enforce that the gate is not silently circumvented in production branches.
**Scale:** Percentage of commits on `develop` and `main` branches where the pre-commit hook ran and exited 0 before the commit was accepted. Commits made with `--no-verify` that are not covered by a documented emergency exception are counted as violations.
**Meter:**

1. After `lefthook install`, make a commit on a feature branch with a deliberate lint violation.
2. Verify the commit is rejected with a non-zero exit from the `lint` command.
3. Fix the violation, re-attempt the commit, verify it succeeds.
4. Compute: (commits where pre-commit ran successfully / total commits on develop and main) × 100.
**Fail:** Any commit on `develop` or `main` where the pre-commit hook was bypassed without a documented exception.
**Goal:** 0% bypasses on `develop` and `main` — pre-commit hook runs successfully on every commit.
**Stakeholders:** All contributors, CI pipeline.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR009-precommit-hooks-zero-warnings]], `lefthook.yml`, [[requirements/code-quality#Quality.Lint.ZeroWarnings]].

---
title: Requirements — Development Process
tags:
  - requirements/development-process
aliases:
  - Development Process Requirements
  - Process Requirements
---

# Development Process Requirements

> [!NOTE] Scope
> These requirements govern the development workflow: branching strategy, test directory structure, test index maintenance, script automation, and binary file handling. They apply to all contributors and to the CI/CD pipeline. Branching rules are enforced by branch protection; test structure and index rules are enforced by convention and by the `scripts/update-test-index.sh` automation stub (implemented in Phase 3).

---

## Process.Branching.MainReleasesOnly

**Tag:** Process.Branching.MainReleasesOnly
**Gist:** The `main` branch receives only tagged release merges from `release/*` or `hotfix/*` branches; direct pushes to `main` are prohibited.
**Ambition:** `main` represents the production-released state of the package. Every commit on `main` must correspond to a published npm version with a semver tag. Allowing direct pushes, squash merges from arbitrary branches, or merge commits from `feature/*` branches breaks this invariant: `main` would contain commits not associated with a release, the git tag history would be inconsistent, and OIDC provenance would link publishes to non-release commits. git-flow discipline enforces a clean separation between integration work (on `develop`) and released work (on `main`).
**Scale:** Percentage of commits on `main` that do not originate from a `release/*` or `hotfix/*` branch merge, as determined by the git commit graph.
**Meter:**

1. Enable branch protection on `main`: require PRs, disable force pushes, require linear history.
2. Set required reviewers: at least one approver.
3. After each merge to `main`, verify the merge commit's parents trace back to a `release/*` or `hotfix/*` branch.
4. Compute: (commits on main originating from release/ or hotfix/ / total commits on main) × 100.
**Fail:** Any direct push to `main`; any merge from a `feature/*` or `develop` branch directly to `main`.
**Goal:** 0% non-release commits on `main` — every commit on `main` is a release merge.
**Stakeholders:** Release engineers, package consumers, OIDC provenance reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR007-git-flow-branching]], [[requirements/ci-cd#CICD.Publish.Trigger]], git-flow branching model documentation.

---

## Process.Testing.DirectoryStructure

**Tag:** Process.Testing.DirectoryStructure
**Gist:** Tests follow the repository's current split layout: focused unit tests may live beside the source module, shared integration and BDD harness code lives under `src/test/`, website tests live under `website/tests/`, extension tests live under `extension/`, and Gherkin feature specs live under `docs/bdd/features/`.
**Ambition:** The project has multiple execution environments: Bun server tests, spawned LSP integration tests, Cucumber BDD scenarios, website npm/Vitest checks, and VS Code extension host tests. A single top-level `tests/` tree no longer matches reality. The required invariant is ownership clarity: executable harness code must sit with the package that runs it, while `docs/bdd/features/` remains the requirements-facing location for executable Gherkin specs.
**Scale:** Count of test or harness files located outside their owned tree.
**Meter:**

1. Verify server unit tests are under `src/**/__tests__/` or use a clear `*.test.ts` file near the module they exercise.
2. Verify shared server integration and BDD harness files are under `src/test/`.
3. Verify website tests are under `website/tests/`.
4. Verify extension tests are under `extension/src/` or `extension/test/` according to the extension package runner.
5. Verify Gherkin feature specs are under `docs/bdd/features/`, while BDD step definitions and source-owned step maps are under `src/test/bdd/`.
**Fail:** Any new test or harness file placed outside its owned tree without updating this requirement and [[test/index]]; any raw BDD step implementation material restored under `docs/bdd/steps/`.
**Goal:** 100% of test files live in the package-appropriate test tree, with `docs/bdd/features/` reserved for Gherkin feature specs.
**Stakeholders:** All contributors, CI pipeline, build tooling.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR010-tests-directory-structure]], `bunfig.toml`, `cucumber.yaml`, [[test/index]], [[plans/phase-18-security-hardening-audit/TASK-280]], [[plans/phase-18-security-hardening-audit/TASK-281]].

---

## Process.TestIndex.Matrix

**Tag:** Process.TestIndex.Matrix
**Gist:** `docs/test/matrix.md` is maintained as a live matrix relating test files to Planguage requirement tags and to the phase and commit in which they were written; it must be updated whenever a new test file is added.
**Ambition:** Without a traceability matrix, it is impossible to answer the question "which requirements have test coverage?" without reading every test file. The matrix provides at-a-glance requirement coverage: a reviewer can verify that every Planguage tag in the requirements layer has at least one corresponding test, identify untested requirements before shipping a phase, and understand which phases introduced coverage for which requirements. The `scripts/update-test-index.sh` automation stub exists to support automated matrix maintenance starting in Phase 3.
**Scale:** Percentage of test files in the owned test trees that have a corresponding entry in `docs/test/matrix.md` with at least one Planguage tag in the Requirements Tags column.
**Meter:**

1. List all `.spec.ts`, `.test.ts`, extension host test, website test, and BDD step-definition files under the owned test trees described by `Process.Testing.DirectoryStructure`.
2. For each file, check whether an entry exists in `docs/test/matrix.md`.
3. Verify the entry has at least one valid Planguage tag (a tag that appears in `docs/requirements/index.md`).
4. Compute: (test files with matrix entries / total test files) × 100.
**Fail:** Any test file without a corresponding matrix entry; any matrix entry without at least one valid Planguage tag.
**Goal:** 100% of test files have matrix entries — `docs/test/matrix.md` is always current.
**Stakeholders:** Phase reviewers, requirements auditors, CI maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[test/matrix]], [[test/index]], [[requirements/index]], `scripts/update-test-index.sh`.

---

## Process.Scripts.Automation

**Tag:** Process.Scripts.Automation
**Gist:** Repetitive scriptable actions — version bumping, running all linters, generating docs, updating the test matrix — are automated in `scripts/` shell scripts that act on the repository only and are not linked into `src/`.
**Ambition:** Undocumented manual procedures create knowledge silos and introduce inconsistency: two contributors performing the same operation may produce different results. Automating them in `scripts/` with `#!/usr/bin/env bash` scripts makes procedures reproducible, reviewable, and auditable. The constraint that scripts act on the repository only — not called from `src/` — enforces a clean separation between build-time tooling and runtime application code.
**Scale:** Percentage of common repetitive procedures documented in `docs/plans/` or `docs/requirements/` that have a corresponding automation script in `scripts/`. This is an advisory metric — no hard fail threshold is set in Phase 1, but the goal is to automate all identified repetitive procedures by Phase 13.
**Meter:**

1. List all procedures mentioned in plan documents that are described as "run this command each time".
2. For each, check whether a script in `scripts/` automates it.
3. Compute: (automated procedures / total identified repetitive procedures) × 100.
**Fail:** No hard fail in Phase 1; advisory metric. A procedure that is described in documentation as manual when an automation script exists for it is a documentation violation.
**Goal:** All commonly repeated procedures automated in `scripts/` by Phase 13.
**Stakeholders:** All contributors, CI maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** `scripts/README.md`, `scripts/lint-all.sh`, `scripts/set-version.sh`, `scripts/validate-docs.sh`, `scripts/update-test-index.sh`.

---

## Process.BinaryFiles.LFS

**Tag:** Process.BinaryFiles.LFS
**Gist:** All binary files — images, PDFs, archives, compiled artifacts — must be tracked via Git LFS; binary blobs must not be committed directly to the repository object store.
**Ambition:** Binary files committed directly to a git repository inflate the pack size permanently: even if the binary is later deleted, its history remains in the object store. For a project that may include test fixture images, documentation screenshots, or release tarballs, this creates an ever-growing repository clone cost. Git LFS stores the binary content on the LFS server and replaces it in the repository with a small text pointer, keeping the git object store lean. The `.gitattributes` LFS filter rules ensure this is enforced at commit time.
**Scale:** Percentage of binary files larger than 1 KB tracked in the repository object store (not via LFS pointers). A file is classified as binary if it has an extension listed in `.gitattributes` as `filter=lfs` or if `git check-attr` reports `filter=lfs` for it.
**Meter:**

1. Run `git lfs ls-files` to list all LFS-tracked files.
2. Run `git ls-files` and filter to files with binary extensions (`.png`, `.jpg`, `.pdf`, `.zip`, etc.).
3. Cross-reference: any binary-extension file in `git ls-files` that is not in `git lfs ls-files` and is larger than 1 KB is a violation.
4. Compute: (binary files tracked by LFS / total binary files) × 100.
**Fail:** Any binary file larger than 1 KB committed to the git object store without LFS tracking.
**Goal:** 0% untracked binaries — all binary files use LFS pointers in the git object store.
**Stakeholders:** All contributors, clone-performance-sensitive CI environments.
**Owner:** flavor-grenade-lsp contributors.
**Source:** `.gitattributes`, `git lfs` documentation, [[plans/phase-01-scaffold#Task-1]].

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

**Tag:** Process.Testing.DirectoryStructure
**Gist:** All test files must reside under `tests/` (not co-located in `src/`); unit tests mirror the `src/` structure under `tests/unit/`; integration tests go in `tests/integration/`; BDD step definitions go in `tests/bdd/steps/`.
**Ambition:** Co-located test files (`src/lsp/lsp.server.spec.ts` next to `src/lsp/lsp.server.ts`) create friction during refactoring — moving a source file requires moving its test, and `src/` directory listings intermix implementation and test files. A separate `tests/` root with a mirrored structure provides a clean separation: `src/` contains only implementation, `tests/` contains only test artifacts. The `tsconfig.test.json` that includes both `src/` and `tests/` makes the separation explicit at the TypeScript compiler level.
**Scale:** Percentage of test files in the repository (`*.spec.ts`, `*.test.ts`, `*.feature` step definitions) that reside outside the `tests/` directory tree.
**Meter:**
1. Run `find src/ -name '*.spec.ts' -o -name '*.test.ts'` from the repo root.
2. Any output from this command is a violation — all spec files must be under `tests/`.
3. Compute: (test files under tests/ / total test files) × 100.
**Fail:** Any `.spec.ts` or `.test.ts` file found under `src/`.
**Goal:** 0% violations — `find src/ -name '*.spec.ts'` returns no output.
**Stakeholders:** All contributors, CI pipeline, build tooling.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR010-tests-directory-structure]], `tsconfig.test.json`, `bunfig.toml`.

---

**Tag:** Process.TestIndex.Matrix
**Gist:** `docs/test/matrix.md` is maintained as a live matrix relating test files to Planguage requirement tags and to the phase and commit in which they were written; it must be updated whenever a new test file is added.
**Ambition:** Without a traceability matrix, it is impossible to answer the question "which requirements have test coverage?" without reading every test file. The matrix provides at-a-glance requirement coverage: a reviewer can verify that every Planguage tag in the requirements layer has at least one corresponding test, identify untested requirements before shipping a phase, and understand which phases introduced coverage for which requirements. The `scripts/update-test-index.sh` automation stub exists to support automated matrix maintenance starting in Phase 3.
**Scale:** Percentage of test files in `tests/` that have a corresponding entry in `docs/test/matrix.md` with at least one Planguage tag in the Requirements Tags column.
**Meter:**
1. List all `.spec.ts` and `.test.ts` files under `tests/`.
2. For each file, check whether an entry exists in `docs/test/matrix.md`.
3. Verify the entry has at least one valid Planguage tag (a tag that appears in `docs/requirements/index.md`).
4. Compute: (test files with matrix entries / total test files) × 100.
**Fail:** Any test file without a corresponding matrix entry; any matrix entry without at least one valid Planguage tag.
**Goal:** 100% of test files have matrix entries — `docs/test/matrix.md` is always current.
**Stakeholders:** Phase reviewers, requirements auditors, CI maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/test/matrix]], [[docs/test/index]], [[requirements/index]], `scripts/update-test-index.sh`.

---

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

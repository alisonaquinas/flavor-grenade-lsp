---
title: Verification — Development Process
tags: [test/verification, "requirements/development-process"]
aliases: [Verify Development Process]
---

# Verification — Development Process

## Purpose

This document defines scripted verification test cases for the development process requirements of `flavor-grenade-lsp`. Each test case validates that branching discipline, test directory structure, test index maintenance, script automation, and binary file handling conform to the Planguage requirements in [[requirements/development-process]]. These are repository-level static checks that can be executed at any point against the current working tree and git history. All test cases are of type Scripted and use Bash blocks.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Process.Branching.MainReleasesOnly` | `main` receives only tagged release merges from `release/*` or `hotfix/*` branches | Phase 1 (ongoing) |
| `Process.Testing.DirectoryStructure` | All test files reside under `tests/`; unit tests mirror `src/` under `tests/unit/` | Phase 1 |
| `Process.TestIndex.Matrix` | `docs/test/matrix.md` is maintained as a live matrix; updated whenever a test file is added | Phase 3 |
| `Process.Scripts.Automation` | Repetitive actions are automated in `scripts/` shell scripts; scripts are not linked into `src/` | Phase 13 |
| `Process.BinaryFiles.LFS` | All binary files tracked via Git LFS; binary blobs not committed directly to the object store | Phase 1 |

---

## Test Cases

### TC-VER-PROC-001 — Process.Branching.MainReleasesOnly

**Planguage Tag:** `Process.Branching.MainReleasesOnly`
**Gist:** The `main` branch receives only tagged release merges from `release/*` or `hotfix/*` branches; direct pushes to `main` are prohibited.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1 (ongoing)

**Setup:** Git repository with at least one commit on `main`. GitHub branch protection rules configured.

**Scripted steps:**

```bash
# 1. Verify branch protection is enabled: no force pushes, PRs required
gh api repos/{owner}/{repo}/branches/main/protection \
  --jq '{
    allow_force_pushes: .allow_force_pushes.enabled,
    required_pr_reviews: (.required_pull_request_reviews.required_approving_review_count // 0),
    linear_history: .required_linear_history.enabled
  }'
# Expected: allow_force_pushes: false, required_pr_reviews >= 1

# 2. Inspect git log on main to verify every merge commit's second parent
# comes from a release/* or hotfix/* branch (via reflog or commit message)
git log main --merges --oneline | while read sha msg; do
  echo "$msg" | grep -qE 'release/|hotfix/' || \
    echo "WARNING: merge commit $sha may not originate from release/ or hotfix/: $msg"
done

# 3. Verify no commit on main has a parent from develop or feature/* branches
git log main --oneline --first-parent | head -20

# 4. Attempt a direct push to main (should fail due to branch protection)
git push origin HEAD:main 2>&1 | grep -i 'protected\|rejected\|denied' && \
  echo "PASS: direct push to main rejected" || \
  echo "SKIP: not testing direct push (requires push permissions)"

# 5. Compute: count merges on main and verify each has a release/ or hotfix/ parent
total_merges=$(git log main --merges --oneline | wc -l)
release_merges=$(git log main --merges --oneline | grep -cE 'release/|hotfix/' || true)
echo "Total merges on main: $total_merges"
echo "Merges from release/ or hotfix/: $release_merges"
[ "$total_merges" -eq 0 ] || [ "$total_merges" -eq "$release_merges" ] && \
  echo "PASS: all merges on main originate from release/ or hotfix/" || \
  echo "FAIL: some merges on main do not originate from release/ or hotfix/"
```

**Agent-driven steps:**

1. Agent reads `docs/adr/ADR007-git-flow-branching.md` and confirms it defines the `release/*` and `hotfix/*` merge-to-main rule.
2. Agent verifies the GitHub branch protection settings for `main` include "Require a pull request before merging" and "Require approvals" >= 1.
3. Agent checks that no `feature/*` branch appears as a direct parent of any commit on `main` in the git log.

**Pass criterion:** 0% non-release commits on `main`; every merge commit on `main` traces back to a `release/*` or `hotfix/*` branch; direct push to `main` is rejected by branch protection.
**Fail criterion:** Any direct push to `main`; any merge from a `feature/*` or `develop` branch directly to `main`.

---

### TC-VER-PROC-002 — Process.Testing.DirectoryStructure

**Planguage Tag:** `Process.Testing.DirectoryStructure`
**Gist:** All test files must reside under `tests/`; unit tests mirror the `src/` structure under `tests/unit/`; integration tests go in `tests/integration/`; BDD step definitions go in `tests/bdd/steps/`.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1

**Setup:** Any state of the repository where test files exist.

**Scripted steps:**

```bash
# 1. Check for any .spec.ts or .test.ts files under src/ (must return empty)
result=$(find src/ -name '*.spec.ts' -o -name '*.test.ts' 2>/dev/null)
if [ -z "$result" ]; then
  echo "PASS: no test files found under src/"
else
  echo "FAIL: test files found under src/:"
  echo "$result"
  exit 1
fi

# 2. Verify tests/ directory structure exists as expected
for dir in tests/unit tests/integration tests/bdd/steps tests/verification; do
  [ -d "$dir" ] && echo "OK: $dir exists" || echo "MISSING: $dir"
done

# 3. Verify unit test files mirror src/ structure
# (for each .spec.ts under tests/unit/, the corresponding src/ path should exist)
find tests/unit/ -name '*.spec.ts' 2>/dev/null | while read f; do
  src_path=$(echo "$f" | sed 's|tests/unit/||' | sed 's|\.spec\.ts$|.ts|')
  [ -f "src/$src_path" ] && echo "OK: src/$src_path" || \
    echo "ADVISORY: src/$src_path does not yet exist (may be planned)"
done

# 4. Count total test files and verify 100% are under tests/
total=$(find . -name '*.spec.ts' -o -name '*.test.ts' 2>/dev/null | grep -v node_modules | wc -l)
under_tests=$(find tests/ -name '*.spec.ts' -o -name '*.test.ts' 2>/dev/null | wc -l)
echo "Total test files: $total"
echo "Under tests/: $under_tests"
[ "$total" -eq "$under_tests" ] && \
  echo "PASS: 100% of test files are under tests/" || \
  echo "FAIL: $((total - under_tests)) test file(s) are outside tests/"
```

**Agent-driven steps:**

1. Agent reads `docs/adr/ADR010-tests-directory-structure.md` and confirms the canonical directory layout defined there matches the actual `tests/` directory structure.
2. Agent reads `tsconfig.test.json` and verifies it includes both `src/` and `tests/` paths, enforcing the separation at the TypeScript compiler level.
3. Agent reads `bunfig.toml` and confirms test discovery is configured to search `tests/` only, not `src/`.

**Pass criterion:** 0% violations — `find src/ -name '*.spec.ts'` returns no output; `tests/unit/`, `tests/integration/`, and `tests/bdd/steps/` directories exist.
**Fail criterion:** Any `.spec.ts` or `.test.ts` file found under `src/`; absence of required `tests/` subdirectory structure.

---

### TC-VER-PROC-003 — Process.TestIndex.Matrix

**Planguage Tag:** `Process.TestIndex.Matrix`
**Gist:** `docs/test/matrix.md` is maintained as a live matrix relating test files to Planguage requirement tags and to the phase and commit in which they were written; it must be updated whenever a new test file is added.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 3

**Setup:** At least one `.spec.ts` or `.test.ts` file exists under `tests/`. `docs/test/matrix.md` exists.

**Scripted steps:**

```bash
# 1. Verify docs/test/matrix.md exists
[ -f "docs/test/matrix.md" ] && echo "OK: matrix.md exists" || \
  echo "FAIL: docs/test/matrix.md does not exist"

# 2. List all test files under tests/
find tests/ -name '*.spec.ts' -o -name '*.test.ts' 2>/dev/null | sort > /tmp/test-files.txt
echo "Test files found:"
cat /tmp/test-files.txt

# 3. For each test file, check for a corresponding entry in matrix.md
while read test_file; do
  basename=$(basename "$test_file")
  if grep -q "$basename" docs/test/matrix.md; then
    echo "OK: $basename has matrix entry"
  else
    echo "FAIL: $basename has no entry in docs/test/matrix.md"
  fi
done < /tmp/test-files.txt

# 4. Verify each matrix entry has at least one valid Planguage tag
# (Planguage tags follow patterns like CICD.*, Process.*, Security.*, etc.)
grep -oE '[A-Z][a-zA-Z]+\.[A-Z][a-zA-Z.]+' docs/test/matrix.md | sort -u

# 5. Compute coverage percentage
total_tests=$(wc -l < /tmp/test-files.txt)
covered=0
while read f; do
  b=$(basename "$f")
  grep -q "$b" docs/test/matrix.md && covered=$((covered + 1))
done < /tmp/test-files.txt
echo "Test files: $total_tests | With matrix entries: $covered"
[ "$total_tests" -eq 0 ] || [ "$total_tests" -eq "$covered" ] && \
  echo "PASS: 100% of test files have matrix entries" || \
  echo "FAIL: $((total_tests - covered)) test file(s) have no matrix entry"

# 6. Verify scripts/update-test-index.sh exists (automation stub)
[ -f "scripts/update-test-index.sh" ] && echo "OK: update-test-index.sh exists" || \
  echo "ADVISORY: scripts/update-test-index.sh not yet present (required by Phase 3)"
```

**Agent-driven steps:**

1. Agent reads `docs/test/matrix.md` and verifies the table schema includes columns for: test file path, Planguage requirement tags, phase, and commit.
2. Agent cross-references every Planguage tag in the matrix against `docs/requirements/index.md` to confirm each tag refers to a real requirement.
3. Agent verifies no matrix entry exists for a test file that no longer exists in `tests/` (stale entries are also violations).

**Pass criterion:** 100% of test files have matrix entries; every matrix entry contains at least one valid Planguage tag; no stale entries in the matrix.
**Fail criterion:** Any test file without a corresponding matrix entry; any matrix entry without at least one valid Planguage tag; any matrix entry referencing a non-existent test file.

---

### TC-VER-PROC-004 — Process.Scripts.Automation

**Planguage Tag:** `Process.Scripts.Automation`
**Gist:** Repetitive scriptable actions are automated in `scripts/` shell scripts that act on the repository only and are not linked into `src/`.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 13

**Setup:** `scripts/` directory exists. Plan documents in `docs/plans/` exist.

**Scripted steps:**

```bash
# 1. Verify expected automation scripts exist in scripts/
for script in \
  scripts/lint-all.sh \
  scripts/set-version.sh \
  scripts/validate-docs.sh \
  scripts/update-test-index.sh; do
  [ -f "$script" ] && echo "OK: $script" || echo "MISSING: $script"
done

# 2. Verify each script has a bash shebang and is executable
for script in scripts/*.sh; do
  [ -f "$script" ] || continue
  head -1 "$script" | grep -q '#!/usr/bin/env bash\|#!/bin/bash' && \
    echo "OK shebang: $script" || echo "FAIL shebang: $script"
  [ -x "$script" ] && echo "OK executable: $script" || \
    echo "NOT EXECUTABLE: $script (run chmod +x $script)"
done

# 3. Verify no script in scripts/ is statically imported from src/
grep -rn 'from.*scripts/\|require.*scripts/' src/ 2>/dev/null && \
  echo "FAIL: scripts/ is referenced from src/" || \
  echo "PASS: no src/ file references scripts/"

# 4. Verify scripts/ is not in the TypeScript compilation paths
grep 'scripts' tsconfig.json && \
  echo "FAIL: scripts/ appears in tsconfig.json paths" || \
  echo "PASS: scripts/ not in tsconfig.json"

# 5. Run lint-all.sh if it exists (advisory — checks it runs without error)
[ -f "scripts/lint-all.sh" ] && bash scripts/lint-all.sh && \
  echo "PASS: lint-all.sh exits 0" || \
  echo "ADVISORY: lint-all.sh not yet present or returned non-zero"

# 6. List procedures in plan docs described as manual (advisory metric)
grep -rn '"run this command each time"\|"manually run"\|"each time you"' \
  docs/plans/ docs/requirements/ 2>/dev/null | \
  grep -v '\.sh' | head -20
```

**Agent-driven steps:**

1. Agent reads `scripts/README.md` (if it exists) and verifies it documents each script's purpose and usage.
2. Agent reads every `docs/plans/*.md` file and identifies every procedure described as a recurring manual step, then verifies a corresponding `scripts/*.sh` automation exists for each.
3. Agent scans `src/` for any process-spawning call that invokes a path containing `scripts/` — this would violate the constraint that scripts are not called from application code.

**Pass criterion:** All commonly repeated procedures from plan documents automated in `scripts/` by Phase 13; no `src/` file statically imports or references `scripts/`; all scripts have bash shebang and are executable.
**Fail criterion:** A procedure documented as a recurring manual step with no corresponding automation script in `scripts/`; any `scripts/` file imported or invoked from `src/` at import time.

---

### TC-VER-PROC-005 — Process.BinaryFiles.LFS

**Planguage Tag:** `Process.BinaryFiles.LFS`
**Gist:** All binary files — images, PDFs, archives, compiled artifacts — must be tracked via Git LFS; binary blobs must not be committed directly to the repository object store.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1

**Setup:** Git LFS installed and initialized in the repository. `.gitattributes` configured with LFS filters.

**Scripted steps:**

```bash
# 1. Verify git-lfs is installed
git lfs version
# Expected: git-lfs/x.y.z

# 2. Verify .gitattributes contains LFS filter rules for binary extensions
grep 'filter=lfs' .gitattributes | \
  grep -E '\.(png|jpg|jpeg|gif|pdf|zip|tar|gz|ico|woff|ttf|eot|svg)'
# Expected: lines like: *.png filter=lfs diff=lfs merge=lfs -text

# 3. List all LFS-tracked files currently in the repository
git lfs ls-files
# Shows files tracked by LFS (may be empty if no binaries exist yet — that is OK)

# 4. Find tracked files with binary extensions > 1 KB that are NOT LFS pointers
lfs_list=$(git lfs ls-files | awk '{print $NF}')
for ext in png jpg jpeg gif pdf zip tar gz ico woff ttf eot; do
  git ls-files "*.${ext}" 2>/dev/null | while read f; do
    size=$(git cat-file -s "HEAD:$f" 2>/dev/null || echo 0)
    if [ "$size" -gt 1024 ]; then
      echo "$lfs_list" | grep -qF "$f" || \
        echo "FAIL: $f (${size} bytes) is not tracked by LFS"
    fi
  done
done
echo "LFS audit complete"

# 5. Verify LFS pre-push hook is installed
[ -f ".git/hooks/pre-push" ] && grep -q 'lfs' .git/hooks/pre-push && \
  echo "OK: LFS pre-push hook installed" || \
  echo "ADVISORY: LFS pre-push hook may not be installed (run: git lfs install)"

# 6. Attempt to stage a small binary file and verify LFS intercepts it
dd if=/dev/urandom of=/tmp/lfs-check.png bs=1024 count=2 2>/dev/null
cp /tmp/lfs-check.png lfs-check.png
git add lfs-check.png 2>&1 | grep -i 'lfs\|pointer' && \
  echo "PASS: file staged as LFS pointer" || \
  echo "ADVISORY: verify .gitattributes LFS filter is active for .png"
git restore --staged lfs-check.png 2>/dev/null
rm -f lfs-check.png /tmp/lfs-check.png
```

**Agent-driven steps:**

1. Agent reads `.gitattributes` and verifies all expected binary file extensions are listed with `filter=lfs diff=lfs merge=lfs -text` attributes.
2. Agent checks the repository's git object store for any object larger than 1 KB that is a real binary content blob (not a 129-byte LFS pointer) at a path with a binary extension — this indicates LFS was bypassed.
3. Agent verifies `git lfs install` has been run, evidenced by the presence of LFS-related hooks in `.git/hooks/`.

**Pass criterion:** 0% untracked binaries — all binary files larger than 1 KB use LFS pointers in the git object store; `.gitattributes` covers all expected binary extensions.
**Fail criterion:** Any binary file larger than 1 KB committed to the git object store without LFS tracking; absence of LFS filter rules in `.gitattributes` for standard binary extensions.

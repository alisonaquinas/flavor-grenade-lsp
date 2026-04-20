---
title: Verification — CI/CD
tags: [test/verification, "requirements/ci-cd"]
aliases: [Verify CI/CD]
---

# Verification — CI/CD

## Purpose

This document defines scripted verification test cases for the CI/CD requirements of `flavor-grenade-lsp`. Each test case validates that the GitHub Actions pipeline, markdown linting policies, OIDC publishing configuration, and pre-commit gate behave according to the Planguage requirements in [[requirements/ci-cd]]. These are process-level and static checks; they do not exercise the LSP protocol. All test cases are of type Scripted and use Bash blocks to produce verifiable, reproducible evidence.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `CICD.Workflow.PRGate` | Every PR targeting `main` or `develop` must pass all CI checks before merge | Phase 13 |
| `CICD.Markdown.DocsFolderLinting` | `docs/` Markdown linted by `markdownlint-obsidian`; failures fail CI | Phase 1 |
| `CICD.Markdown.SourceLinting` | Non-docs, non-.github Markdown linted by `markdownlint-cli2`; failures fail CI | Phase 1 |
| `CICD.Publish.OIDC` | npm publishing uses OIDC keyless auth with `--provenance`; no static tokens | Phase 13 |
| `CICD.Publish.Trigger` | Publishing only triggered by semver tag push to `main` | Phase 13 |
| `CICD.PreCommit.Gate` | `lefthook` pre-commit hook runs typecheck, lint, format, test; `--no-verify` prohibited | Phase 1 |

---

## Test Cases

### TC-VER-CICD-001 — CICD.Workflow.PRGate

**Planguage Tag:** `CICD.Workflow.PRGate`
**Gist:** Every pull request targeting `main` or `develop` must pass all CI checks — typecheck, lint, test, build — before merge is permitted.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 13

**Setup:** Repository must have branch protection configured on `main` and `develop`. At least one merged PR must exist on each branch.

**Scripted steps:**

```bash
# 1. Verify branch protection is enabled with required status checks
gh api repos/{owner}/{repo}/branches/main/protection \
  --jq '.required_status_checks.contexts[]' | sort

# Expected output includes all of: typecheck, lint, format, test, build

# 2. Verify same protection on develop
gh api repos/{owner}/{repo}/branches/develop/protection \
  --jq '.required_status_checks.contexts[]' | sort

# 3. For the last 10 merged PRs on main, verify all required checks were green
gh pr list --base main --state merged --limit 10 --json number \
  --jq '.[].number' | while read pr; do
    echo "PR #$pr:"
    gh pr checks "$pr" --json name,state \
      --jq '.[] | select(.name | test("typecheck|lint|format|test|build")) | .name + ": " + .state'
  done

# 4. Confirm no PR was merged with a failing check (exit non-zero on any "FAILURE")
gh pr list --base main --state merged --limit 10 --json number \
  --jq '.[].number' | while read pr; do
    result=$(gh pr checks "$pr" --json name,state \
      --jq '.[] | select(.state == "FAILURE") | .name' 2>/dev/null)
    if [ -n "$result" ]; then
      echo "FAIL: PR #$pr was merged with failing check(s): $result"
      exit 1
    fi
  done
echo "PASS: All sampled PRs were merged with green required checks"
```

**Agent-driven steps:**

1. Agent opens `.github/workflows/ci.yml` and verifies it defines jobs named exactly `typecheck`, `lint`, `format`, `test`, and `build`.
2. Agent checks that no branch protection rule has `required_status_checks.enforcement_level` set to `off` for either `main` or `develop`.
3. Agent verifies no bypass actors are listed that would allow merging without checks.

**Pass criterion:** 100% of merged PRs have all required checks green at the merge commit; `required_status_checks` on both `main` and `develop` include all five check names.
**Fail criterion:** Any PR merged while at least one required status check was failing or pending; any missing check name in the required status checks list.

---

### TC-VER-CICD-002 — CICD.Markdown.DocsFolderLinting

**Planguage Tag:** `CICD.Markdown.DocsFolderLinting`
**Gist:** All Markdown files under `docs/` must be linted by `markdownlint-obsidian` in CI; lint failures cause CI to fail.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1

**Setup:** A clean working tree on a feature branch. The `markdownlint-obsidian` CLI package must be installed (`bun install`).

**Scripted steps:**

```bash
# 1. Introduce a deliberate lint violation in a docs/ file
# (trailing blank line where not permitted — standard OFM lint rule)
echo "" >> docs/index.md

# 2. Run the docs linting job locally to confirm violation is caught
bunx markdownlint-obsidian "docs/**/*.md"
# Expect non-zero exit code and a violation message

# 3. Revert the deliberate violation
git checkout -- docs/index.md

# 4. Verify the CI workflow file defines a job targeting docs/
grep -A 10 'markdown-lint-docs' .github/workflows/ci.yml

# 5. Verify the job uses markdownlint-obsidian (not markdownlint-cli2)
grep 'markdownlint-obsidian' .github/workflows/ci.yml

# 6. Verify the job glob pattern covers docs/ and only docs/
# (no spillover into src/, scripts/, etc.)
grep -A 5 'markdownlint-obsidian' .github/workflows/ci.yml | grep '"docs/'
```

**Agent-driven steps:**

1. Agent reads `.github/workflows/ci.yml` and confirms the `markdown-lint-docs` job specifies `markdownlint-obsidian` as the linting command, not `markdownlint-cli2`.
2. Agent confirms the glob argument in the job targets `docs/**/*.md` exclusively.
3. Agent confirms the job is listed as a required status check in the branch protection configuration.

**Pass criterion:** 0% silent failures — every `docs/` Markdown violation fails CI; `markdownlint-obsidian` exit code is non-zero when any violation exists.
**Fail criterion:** Any `markdownlint-obsidian` violation in `docs/` that does not cause the `markdown-lint-docs` CI job to exit non-zero.

---

### TC-VER-CICD-003 — CICD.Markdown.SourceLinting

**Planguage Tag:** `CICD.Markdown.SourceLinting`
**Gist:** All Markdown files NOT in `docs/` and NOT in `.github/` must be linted by `markdownlint-cli2` in CI; violations cause CI failure.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1

**Setup:** A clean working tree on a feature branch. `markdownlint-cli2` must be available.

**Scripted steps:**

```bash
# 1. Introduce a deliberate violation in README.md (trailing whitespace)
echo "trailing space   " >> README.md

# 2. Run markdownlint-cli2 locally to confirm violation is caught
bunx markdownlint-cli2 "*.md" "scripts/**/*.md"
# Expect non-zero exit and a trailing-spaces violation

# 3. Revert the violation
git checkout -- README.md

# 4. Verify CI workflow defines the markdown-lint-other job
grep -A 10 'markdown-lint-other' .github/workflows/ci.yml

# 5. Verify the job uses markdownlint-cli2 (not markdownlint-obsidian)
grep 'markdownlint-cli2' .github/workflows/ci.yml

# 6. Verify the job glob excludes docs/ and .github/
# The pattern must NOT include docs/**
grep -A 5 'markdownlint-cli2' .github/workflows/ci.yml | grep -v 'docs/'

# 7. Verify .markdownlint-cli2.jsonc exists and is valid JSON
node -e "require('./.markdownlint-cli2.jsonc')" 2>/dev/null || \
  node -e "JSON.parse(require('fs').readFileSync('.markdownlint-cli2.jsonc','utf8').replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,''))" \
  && echo "Config valid"
```

**Agent-driven steps:**

1. Agent reads `.github/workflows/ci.yml` and verifies the `markdown-lint-other` job's glob arguments do not include `docs/**` or `.github/**`.
2. Agent verifies the `markdown-lint-other` job uses `markdownlint-cli2`, not `markdownlint-obsidian`.
3. Agent verifies the `markdown-lint-other` job is a required status check.

**Pass criterion:** 0% silent failures — every `markdownlint-cli2` violation in a non-docs, non-.github Markdown file causes CI failure.
**Fail criterion:** Any `markdownlint-cli2` violation in a non-docs, non-.github Markdown file that does not cause CI failure; the job accidentally running on `docs/` files.

---

### TC-VER-CICD-004 — CICD.Publish.OIDC

**Planguage Tag:** `CICD.Publish.OIDC`
**Gist:** npm and Bun registry publishing must use OIDC keyless authentication with provenance attestation; `npm publish --provenance` is required for every release.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 13

**Setup:** A test release on the staging registry, or inspection of the publish workflow file. Access to `npm audit signatures` CLI.

**Scripted steps:**

```bash
# 1. Verify publish.yml uses OIDC permissions (no static NPM_TOKEN secret)
grep -n 'NPM_TOKEN\|npm_token' .github/workflows/publish.yml
# Expected: no output (OIDC means no static token)

# 2. Verify the publish workflow requests id-token write permission
grep -A 5 'permissions' .github/workflows/publish.yml | grep 'id-token'
# Expected: id-token: write

# 3. Verify --provenance flag is present in the publish command
grep 'provenance' .github/workflows/publish.yml
# Expected: at least one line containing --provenance

# 4. Verify the workflow uses actions/attest-build-provenance or npm's built-in provenance
grep 'attest-build-provenance\|--provenance' .github/workflows/publish.yml

# 5. After a real publish: verify npm audit signatures for the published package
# (run against a real published version)
npm audit signatures
# Expected: exit 0 with "audited N packages" — all signatures verified

# 6. Verify no repository secret named NPM_TOKEN exists
gh secret list | grep -i 'npm_token'
# Expected: no output
```

**Agent-driven steps:**

1. Agent reads `.github/workflows/publish.yml` in full and confirms: `permissions.id-token: write` is set, `contents: read` is set, and no `NPM_TOKEN` secret is referenced.
2. Agent confirms the publish step includes `--provenance` in the `npm publish` or `bun publish` invocation.
3. Agent confirms the workflow uses `npmjs` as the OIDC-enabled registry target (not a self-hosted registry that would not accept OIDC tokens).

**Pass criterion:** 100% of published versions carry a valid OIDC provenance attestation; `npm audit signatures` exits 0; no static `NPM_TOKEN` is used.
**Fail criterion:** Any published version without a valid OIDC provenance attestation; presence of a static `NPM_TOKEN` secret; absence of `--provenance` in the publish command.

---

### TC-VER-CICD-005 — CICD.Publish.Trigger

**Planguage Tag:** `CICD.Publish.Trigger`
**Gist:** Publishing must only be triggered by a push of a semver tag (`v*.*.*`) to `main`; no manual publish from developer machines.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 13

**Setup:** Access to `.github/workflows/publish.yml` and the repository's git tag history.

**Scripted steps:**

```bash
# 1. Verify publish.yml only triggers on semver tag pushes to main
grep -A 10 '^on:' .github/workflows/publish.yml
# Expected output must include:
#   push:
#     tags:
#       - 'v*.*.*'
# and must NOT include: workflow_dispatch, schedule, pull_request

# 2. Verify the trigger does NOT include workflow_dispatch
grep 'workflow_dispatch' .github/workflows/publish.yml
# Expected: no output (workflow_dispatch trigger must be absent)

# 3. Verify branch protection on main disallows direct pushes without PR
gh api repos/{owner}/{repo}/branches/main/protection \
  --jq '.enforce_admins.enabled, .required_pull_request_reviews'

# 4. Verify every published version on npm has a corresponding v*.*.* git tag on main
# (enumerate npm versions and cross-reference with git tags)
npm view flavor-grenade-lsp versions --json 2>/dev/null | \
  node -e "const v=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); \
           v.forEach(x => console.log('v'+x))" | while read tag; do
    git tag --list "$tag" | grep -q "$tag" && echo "OK: $tag" || echo "MISSING TAG: $tag"
  done

# 5. Attempt to manually run publish workflow without a tag (expect failure or non-existence)
gh workflow run publish.yml 2>&1 | grep -i 'error\|not found\|no workflow'
# Expected: error because workflow_dispatch is not configured
```

**Agent-driven steps:**

1. Agent reads `.github/workflows/publish.yml` and confirms the `on:` block contains only `push.tags` with pattern `v*.*.*` — no other triggers.
2. Agent verifies there is no `workflow_dispatch` trigger, no `schedule` trigger, and no `push.branches` trigger in the publish workflow.
3. Agent confirms the workflow has an `if: startsWith(github.ref, 'refs/tags/v')` guard or equivalent as a secondary check.

**Pass criterion:** 0% non-tag publishes; 100% of published versions have a corresponding `v*.*.*` git tag on `main`; `workflow_dispatch` trigger is absent from the publish workflow.
**Fail criterion:** Any version published by means other than a semver tag push to `main`; presence of a `workflow_dispatch` trigger in `publish.yml`.

---

### TC-VER-CICD-006 — CICD.PreCommit.Gate

**Planguage Tag:** `CICD.PreCommit.Gate`
**Gist:** The `lefthook` pre-commit hook must run typecheck, lint (`--max-warnings 0`), format check, and tests before each commit; `--no-verify` bypass must not be used on `develop` or `main`.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1

**Setup:** `lefthook` binary installed; `bun install` completed; working on a feature branch.

**Scripted steps:**

```bash
# 1. Install lefthook hooks
lefthook install
# Expected: exit 0, hooks installed to .git/hooks/pre-commit

# 2. Verify lefthook.yml defines the required pre-commit commands
grep -A 30 'pre-commit' lefthook.yml | grep -E 'typecheck|lint|format|test'
# Expected: all four command names present

# 3. Verify lint command uses --max-warnings 0
grep 'max-warnings' lefthook.yml
# Expected: --max-warnings 0

# 4. Introduce a deliberate lint violation (unused variable)
cat >> /tmp/test-lint-violation.ts << 'EOF'
const unused = 42;
EOF
cp /tmp/test-lint-violation.ts src/test-lint-violation.ts
git add src/test-lint-violation.ts

# 5. Attempt commit — expect pre-commit hook to reject it
git commit -m "test: deliberate violation" 2>&1 | grep -i 'error\|fail\|violation'
# Expected: commit is rejected, error message from lint step

# 6. Verify the file was not committed
git log --oneline -1 | grep -v 'deliberate violation' && echo "PASS: commit rejected" || echo "FAIL: commit was not rejected"

# 7. Clean up
git restore --staged src/test-lint-violation.ts
rm src/test-lint-violation.ts

# 8. Verify a clean commit succeeds
git commit --allow-empty -m "test: clean commit (pre-commit gate check)"
git log --oneline -1 | grep 'clean commit' && echo "PASS: clean commit accepted"
git reset HEAD~1

# 9. Check git log on develop and main for --no-verify commits
# (commits with no pre-commit hook evidence — indirect check via commit message convention)
git log develop --oneline | grep -i 'skip.*hook\|no.verify\|bypass' && \
  echo "WARNING: possible --no-verify usage found in develop history" || \
  echo "PASS: no --no-verify indicators found in develop history"
```

**Agent-driven steps:**

1. Agent reads `lefthook.yml` in full and verifies it defines a `pre-commit` group containing commands for `typecheck`, `lint`, `format`, and `test`.
2. Agent confirms the `lint` command includes `--max-warnings 0` or equivalent zero-warning enforcement.
3. Agent inspects `CLAUDE.md` or `docs/` for any documented policy on `--no-verify` emergency exceptions, verifying that no such exception has been invoked without documentation on `develop` or `main`.

**Pass criterion:** 0% bypasses on `develop` and `main`; pre-commit hook runs successfully on every commit; a deliberate lint violation causes commit rejection.
**Fail criterion:** Any commit on `develop` or `main` where the pre-commit hook was bypassed without a documented exception; `lefthook.yml` missing any of the four required commands; lint command not using `--max-warnings 0`.

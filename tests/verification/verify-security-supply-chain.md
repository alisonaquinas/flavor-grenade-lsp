---
title: Verification — Security — Supply Chain
tags: [test/verification, "requirements/security/supply-chain"]
aliases: [Verify Supply Chain Security]
---

# Verification — Security — Supply Chain

## Purpose

This document defines verification test cases for the supply chain security requirements of `flavor-grenade-lsp`. Each test case validates that dependency management, lockfile integrity, install-time script execution, advisory monitoring, and prohibited dependencies are controlled according to the Planguage requirements in [[requirements/security/supply-chain]]. The threat context — the Shai-Hulud 2.0 npm supply chain campaign (November 2025), the Bun `.npmrc` `ignore-scripts` bypass (CVSS 5.5), and NestJS CVEs — is documented in [[research/security-threat-model]]. Supply chain tests are predominantly Scripted with Bash, as they operate against configuration files rather than a live server.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Security.Supply.ExactPinning` | All `package.json` dependencies use exact version strings; range specifiers prohibited | Phase 1 (ongoing) |
| `Security.Supply.FrozenLockfile` | All CI `bun install` invocations use `--frozen-lockfile` | Phase 1 (ongoing) |
| `Security.Supply.IgnoreScripts` | All CI `bun install` invocations include `--ignore-scripts` CLI flag | Phase 1 (ongoing) |
| `Security.Supply.AdvisoryMonitoring` | Direct dependency upgrades reviewed against advisories; findings documented in audit log | Phase 1 (ongoing) |
| `Security.Supply.NoDevtoolsIntegration` | `@nestjs/devtools-integration` prohibited; ESLint `no-restricted-imports` rule enforces this | Phase 1 |

---

## Test Cases

### TC-VER-SECS-001 — Security.Supply.ExactPinning

**Planguage Tag:** `Security.Supply.ExactPinning`
**Gist:** All runtime and development dependencies in `package.json` must use exact version strings; range specifiers (`^`, `~`, `>=`, `*`) are prohibited and fail CI linting.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1 (ongoing)

> [!WARNING] Threat: Semver range specifiers (`^`, `~`) allow a package registry update to silently upgrade a dependency to a newer, potentially compromised version without a lockfile change appearing in a PR diff. The Shai-Hulud 2.0 campaign (November 2025) exploited this pattern by publishing malicious patch versions — any consumer using `"^1.2.3"` received the malicious `1.2.4` on their next install.

**Setup:** `package.json` exists in the repository root. Node.js or Bun available to parse JSON.

**Scripted steps:**

```bash
# 1. Parse package.json and check all dependency entries for range specifiers
node -e "
  const pkg = require('./package.json');
  const all = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
    ...pkg.optionalDependencies
  };
  const bad = Object.entries(all).filter(([k, v]) =>
    /^[\^~>*]|^>=/.test(String(v))
  );
  if (bad.length) {
    console.error('FAIL: range specifiers found:');
    bad.forEach(([k, v]) => console.error(' ' + k + ': ' + v));
    process.exit(1);
  }
  console.log('PASS: all dependencies use exact version strings (' + Object.keys(all).length + ' checked)');
"

# 2. Verify bunfig.toml has exact = true
grep 'exact\s*=\s*true' bunfig.toml && \
  echo "OK: bunfig.toml has exact = true" || \
  echo "FAIL: bunfig.toml missing exact = true"

# 3. Verify the CI lint step checks for range specifiers
grep -n 'range\|exact\|specifier' .github/workflows/ci.yml 2>/dev/null | head -10
# Advisory: the CI check should invoke the same node script above

# 4. Count violations for the metric
total=$(node -e "
  const p = require('./package.json');
  const all = {...p.dependencies,...p.devDependencies};
  console.log(Object.keys(all).length);
")
bad=$(node -e "
  const p = require('./package.json');
  const all = {...p.dependencies,...p.devDependencies};
  console.log(Object.values(all).filter(v => /^[\^~>*]/.test(String(v))).length);
")
echo "Total deps: $total | Range specifier violations: $bad"
```

**Agent-driven steps:**
1. Agent reads `package.json` and confirms every value in `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies` is a plain version string (e.g., `"1.2.3"`) with no leading `^`, `~`, `>`, `>=`, or `*`.
2. Agent reads `bunfig.toml` and confirms `exact = true` is set under the `[install]` section.
3. Agent verifies the CI workflow includes a step that runs the exact-pinning check (or confirms `bunfig.toml` enforces it at install time).

**Pass criterion:** 0% range specifiers — all dependency entries use exact version strings; `bunfig.toml` has `exact = true`; CI lint step exits non-zero on any range specifier.
**Fail criterion:** Any dependency entry using a range specifier; absence of `exact = true` in `bunfig.toml`.

---

### TC-VER-SECS-002 — Security.Supply.FrozenLockfile

**Planguage Tag:** `Security.Supply.FrozenLockfile`
**Gist:** All CI `bun install` invocations must use `--frozen-lockfile`; any discrepancy between `package.json` and `bun.lockb` must fail the build rather than update the lockfile.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1 (ongoing)

> [!WARNING] Threat: A CI `bun install` without `--frozen-lockfile` allows the lockfile to be silently updated during the build, meaning CI could be installing different versions than what was reviewed in the last lockfile commit. This creates a gap between the audited state and the running state — a Shai-Hulud 2.0 style attack could exploit this window.

**Setup:** `.github/workflows/ci.yml` and `.github/workflows/publish.yml` exist.

**Scripted steps:**

```bash
# 1. Find all bun install invocations in CI workflows
grep -n 'bun install' .github/workflows/*.yml

# 2. Verify every bun install call includes --frozen-lockfile
install_calls=$(grep -c 'bun install' .github/workflows/*.yml)
frozen_calls=$(grep -c 'bun install.*--frozen-lockfile\|--frozen-lockfile.*bun install' \
  .github/workflows/*.yml)
echo "Total 'bun install' calls: $install_calls"
echo "Calls with --frozen-lockfile: $frozen_calls"
[ "$install_calls" -eq "$frozen_calls" ] && \
  echo "PASS: all bun install calls use --frozen-lockfile" || \
  echo "FAIL: $((install_calls - frozen_calls)) call(s) missing --frozen-lockfile"

# 3. Simulate lockfile drift: temporarily add a non-existent package to package.json
# and verify bun install --frozen-lockfile fails
cp package.json package.json.bak
node -e "
  const fs = require('fs');
  const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  p.dependencies = p.dependencies || {};
  p.dependencies['nonexistent-pkg-zzz'] = '1.0.0';
  fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
"
bun install --frozen-lockfile 2>&1 | grep -i 'lockfile\|frozen\|mismatch\|error' && \
  echo "PASS: --frozen-lockfile correctly fails on lockfile drift" || \
  echo "FAIL: --frozen-lockfile did not detect drift"
# Restore
cp package.json.bak package.json && rm package.json.bak

# 4. Verify bun.lockb is committed to the repository
git ls-files bun.lockb | grep -q 'bun.lockb' && \
  echo "OK: bun.lockb is tracked in git" || \
  echo "FAIL: bun.lockb is not tracked in git"
```

**Agent-driven steps:**
1. Agent reads every `.yml` file under `.github/workflows/` and extracts every line containing `bun install`. Agent verifies each line includes `--frozen-lockfile`.
2. Agent verifies `bun.lockb` is tracked in the git repository and not listed in `.gitignore`.
3. Agent verifies no workflow step updates `bun.lockb` and commits it during the CI run (the lockfile must be a static artifact, not dynamically updated).

**Pass criterion:** 100% of CI `bun install` calls use `--frozen-lockfile`; lockfile drift causes CI failure; `bun.lockb` is committed to git.
**Fail criterion:** Any CI `bun install` invocation without `--frozen-lockfile`; any CI run that updates `bun.lockb` during the build.

---

### TC-VER-SECS-003 — Security.Supply.IgnoreScripts

**Planguage Tag:** `Security.Supply.IgnoreScripts`
**Gist:** All CI `bun install` invocations must include the `--ignore-scripts` CLI flag to prevent postinstall script execution; the `.npmrc` directive alone is insufficient due to Bun's known bypass.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1 (ongoing)

> [!WARNING] Threat: Bun's package manager ignores the `ignore-scripts=true` directive in `.npmrc` for packages on its internal allow-list (bunsecurity.dev, CVSS 5.5, CWE-183). The Shai-Hulud 2.0 campaign used `preinstall` scripts to execute malicious payloads during `bun install`. The `--ignore-scripts` CLI flag (which does work correctly) must be passed explicitly on every invocation.

**Setup:** `.github/workflows/ci.yml` and `.github/workflows/publish.yml` exist.

**Scripted steps:**

```bash
# 1. Find all bun install invocations in CI workflows
grep -n 'bun install' .github/workflows/*.yml

# 2. Verify every bun install call includes --ignore-scripts
install_calls=$(grep -c 'bun install' .github/workflows/*.yml)
noscript_calls=$(grep -c 'bun install.*--ignore-scripts\|--ignore-scripts.*bun install' \
  .github/workflows/*.yml)
echo "Total 'bun install' calls: $install_calls"
echo "Calls with --ignore-scripts: $noscript_calls"
[ "$install_calls" -eq "$noscript_calls" ] && \
  echo "PASS: all bun install calls use --ignore-scripts" || \
  echo "FAIL: $((install_calls - noscript_calls)) call(s) missing --ignore-scripts"

# 3. Verify .npmrc exists but does NOT rely on ignore-scripts=true as the sole mechanism
if [ -f ".npmrc" ]; then
  grep 'ignore-scripts' .npmrc && \
    echo "NOTE: .npmrc has ignore-scripts (advisory only — CLI flag is the enforced mechanism)" || \
    echo "OK: .npmrc does not rely on ignore-scripts directive"
fi

# 4. Simulate a postinstall script execution attempt:
# Create a temporary package dir with a postinstall script and attempt install
mkdir -p /tmp/test-postinstall/node_modules/.test-evil
cat > /tmp/test-evil-package.json << 'EOF'
{"name":"test-evil","version":"1.0.0","scripts":{"postinstall":"touch /tmp/evil-ran"}}
EOF
# This is a simulation — in real CI, bun install --ignore-scripts would skip the script
echo "Simulation: bun install --ignore-scripts would skip postinstall scripts"
echo "Verify by checking CI logs for any 'postinstall' script execution messages"

# 5. Check that both frozen-lockfile AND ignore-scripts are used together
grep 'bun install' .github/workflows/ci.yml | \
  grep --color=never 'frozen-lockfile' | grep 'ignore-scripts' && \
  echo "PASS: ci.yml uses both --frozen-lockfile and --ignore-scripts" || \
  echo "FAIL: ci.yml missing one or both of --frozen-lockfile, --ignore-scripts"
```

**Agent-driven steps:**
1. Agent reads every `.github/workflows/*.yml` file and extracts all `bun install` invocations. For each, agent verifies `--ignore-scripts` is present.
2. Agent checks that `.npmrc` (if present) does not rely on `ignore-scripts=true` as the primary enforcement mechanism, since this is known to be bypassed by Bun for allow-listed packages.
3. Agent verifies the CI workflow does not contain any `bun add` or `bun install <package>` commands that lack `--ignore-scripts` (these are distinct from `bun install` but carry the same risk).

**Pass criterion:** 100% of CI `bun install` calls use `--ignore-scripts`; zero postinstall scripts execute in CI.
**Fail criterion:** Any CI `bun install` invocation without `--ignore-scripts`; any evidence of postinstall script execution in CI logs.

---

### TC-VER-SECS-004 — Security.Supply.AdvisoryMonitoring

**Planguage Tag:** `Security.Supply.AdvisoryMonitoring`
**Gist:** Direct dependencies must be reviewed against published security advisories before each upgrade; findings must be documented in `docs/security/dependency-audit-log.md` with reviewer sign-off.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1 (ongoing)

> [!WARNING] Threat: Automated tools like Dependabot surface CVEs but cannot assess whether a vulnerability has a viable exploit path in this server's specific usage pattern. Without documented human review, teams either panic-upgrade unnecessary patches or silently ignore genuine vulnerabilities. CVE-2024-29409 (`@nestjs/common`) is an example where contextual review would have shown the server does not use `FileTypeValidator`, making the advisory informational rather than critical.

**Setup:** `docs/security/dependency-audit-log.md` exists. At least one dependency upgrade PR has been merged.

**Scripted steps:**

```bash
# 1. Verify docs/security/dependency-audit-log.md exists
[ -f "docs/security/dependency-audit-log.md" ] && \
  echo "OK: dependency-audit-log.md exists" || \
  echo "FAIL: docs/security/dependency-audit-log.md does not exist"

# 2. List direct dependencies from package.json
node -e "
  const p = require('./package.json');
  const direct = Object.keys({...p.dependencies, ...p.devDependencies});
  console.log('Direct dependencies (' + direct.length + '):', direct.join(', '));
"

# 3. For the last 10 dependency upgrade PRs, verify audit log entries
gh pr list --state merged --limit 20 --json number,title \
  --jq '.[] | select(.title | test("[Dd]epend|bump|upgrade|update.*version")) | "\(.number) \(.title)"' | \
  head -10 | while read pr_num pr_title; do
    echo "PR #$pr_num: $pr_title"
    # Check if the audit log has an entry for the package mentioned in the PR title
    pkg=$(echo "$pr_title" | grep -oE '@?[a-zA-Z0-9_/-]+' | head -1)
    grep -q "$pkg" docs/security/dependency-audit-log.md && \
      echo "  OK: audit log entry found for $pkg" || \
      echo "  FAIL: no audit log entry for $pkg in dependency-audit-log.md"
  done

# 4. Verify audit log entry format — each entry must have required fields
echo "Checking audit log entry format..."
grep -c 'package name\|Package\|advisory\|Advisory\|reviewer\|Reviewer' \
  docs/security/dependency-audit-log.md || true
# Advisory: each entry should have package name, old version, new version,
# advisory status, and reviewer name

# 5. Run npm audit to check current advisory status
bun audit 2>/dev/null || npm audit --audit-level=high 2>/dev/null || \
  echo "ADVISORY: run 'bun audit' or 'npm audit' to check for known vulnerabilities"
```

**Agent-driven steps:**
1. Agent reads `docs/security/dependency-audit-log.md` and verifies the schema: each entry must include package name, old version, new version, advisory check result (advisory found / no advisory / not applicable), and reviewer name.
2. Agent retrieves the last 10 merged dependency upgrade PRs via `gh pr list` and cross-references each against the audit log, verifying a corresponding entry exists.
3. Agent verifies no entry in the audit log is missing the reviewer name field (an incomplete entry without sign-off does not satisfy the requirement).

**Pass criterion:** 100% of direct dependency upgrades have documented advisory reviews in `docs/security/dependency-audit-log.md` with all required fields and reviewer sign-off.
**Fail criterion:** Any direct dependency upgrade merged without a documented advisory review entry; any audit log entry missing the package name, version fields, advisory status, or reviewer name.

---

### TC-VER-SECS-005 — Security.Supply.NoDevtoolsIntegration

**Planguage Tag:** `Security.Supply.NoDevtoolsIntegration`
**Gist:** `@nestjs/devtools-integration` must never be added as a dependency; an ESLint `no-restricted-imports` rule enforces this prohibition.
**Type:** Scripted
**BDD Reference:** **BDD gap**
**Phase:** Phase 1

> [!WARNING] Threat: CVE-2025-54782 in `@nestjs/devtools-integration` is an RCE vulnerability via `vm.runInNewContext()` escape in the `/inspector/graph/interact` endpoint. This server has no legitimate use for the devtools integration package — adding it would introduce a known RCE vulnerability for zero functional benefit.

**Setup:** `eslint.config.js` (or `eslint.config.mjs`) exists. `bun run lint` is available.

**Scripted steps:**

```bash
# 1. Verify @nestjs/devtools-integration is NOT in package.json
node -e "
  const p = require('./package.json');
  const all = {...p.dependencies, ...p.devDependencies, ...p.peerDependencies};
  if ('@nestjs/devtools-integration' in all) {
    console.error('FAIL: @nestjs/devtools-integration is present in package.json');
    process.exit(1);
  }
  console.log('PASS: @nestjs/devtools-integration is not in package.json');
"

# 2. Verify ESLint no-restricted-imports rule exists for the prohibited package
grep -rn 'devtools-integration\|no-restricted-imports' eslint.config.* 2>/dev/null | \
  grep -i 'devtools' && \
  echo "OK: no-restricted-imports rule for @nestjs/devtools-integration found" || \
  echo "FAIL: no-restricted-imports rule for @nestjs/devtools-integration not found"

# 3. Create a temporary test file that imports the prohibited package
# and verify lint catches it
cat > /tmp/test-devtools-import.ts << 'EOF'
import { DevtoolsModule } from '@nestjs/devtools-integration';
export { DevtoolsModule };
EOF
cp /tmp/test-devtools-import.ts src/test-devtools-import.ts
bun run lint src/test-devtools-import.ts 2>&1 | grep -i 'devtools\|restricted\|import' && \
  echo "PASS: ESLint caught the prohibited import" || \
  echo "FAIL: ESLint did not catch the @nestjs/devtools-integration import"
# Clean up immediately
rm -f src/test-devtools-import.ts /tmp/test-devtools-import.ts

# 4. Verify bun.lockb does not contain the prohibited package
# (lockb is binary, but its string content can be searched)
strings bun.lockb 2>/dev/null | grep -i 'devtools-integration' && \
  echo "FAIL: devtools-integration found in bun.lockb" || \
  echo "PASS: devtools-integration not in bun.lockb"

# 5. Confirm the ESLint rule is also enforced in CI (lint is a required check)
grep -A 5 '"lint"\|bun.*lint\|eslint' .github/workflows/ci.yml | head -20
```

**Agent-driven steps:**
1. Agent reads `eslint.config.js` (or `eslint.config.mjs`) and locates the `no-restricted-imports` rule. Agent verifies `@nestjs/devtools-integration` appears in the restricted paths list.
2. Agent verifies the `lint` CI job is a required status check on both `main` and `develop` (confirming the ESLint rule is enforced on every PR).
3. Agent reads `package.json` and `bun.lockb` (string content) to confirm `@nestjs/devtools-integration` appears in neither, ruling out accidental transitive inclusion as a direct dependency.

**Pass criterion:** The `no-restricted-imports` ESLint rule is present and enforced; `bun run lint` exits non-zero when a file imports `@nestjs/devtools-integration`; the package does not appear in `package.json` or `bun.lockb`.
**Fail criterion:** Absence of the `no-restricted-imports` rule; any file importing `@nestjs/devtools-integration` that passes lint; presence of `@nestjs/devtools-integration` in `package.json`.

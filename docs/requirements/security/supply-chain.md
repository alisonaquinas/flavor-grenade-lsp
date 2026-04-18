---
title: Requirements — Supply Chain Security
tags:
  - requirements/security
  - requirements/security/supply-chain
aliases:
  - Supply Chain Requirements
  - Dependency Security Requirements
---

# Supply Chain Security Requirements

> [!NOTE] Scope
> These are **operational security requirements** governing how dependencies are managed, audited, and published. They respond directly to the Shai-Hulud 2.0 npm supply chain campaign (November 2025), the Bun `.npmrc` `ignore-scripts` bypass (CVSS 5.5), and NestJS CVEs documented in [[research/security-threat-model#Threat-Category-3]]. Decisions are codified in [[adr/ADR014-dependency-security-policy]] and [[adr/ADR008-oidc-publishing]].

---

**Tag:** Security.Supply.ExactPinning
**Gist:** All runtime and development dependencies in `package.json` must use exact version strings; range specifiers (`^`, `~`, `>=`, `*`) are prohibited and fail CI linting.
**Ambition:** Semver range specifiers allow a package registry update to silently upgrade a dependency to a newer (potentially compromised) version without a lockfile change appearing in the PR. The Shai-Hulud 2.0 campaign exploited this by publishing malicious patch versions of popular packages — any consumer with `"^1.2.3"` received the malicious `1.2.4` on their next `npm install`. Exact pinning means the lockfile is the sole authoritative source of resolved versions; registry updates cannot introduce new versions without an explicit PR that modifies `package.json` and `bun.lockb`, which requires human review.
**Scale:** Percentage of dependency entries in `package.json` (both `dependencies` and `devDependencies`) that use a range specifier rather than an exact version string.
**Meter:**

1. Parse `package.json` dependencies and devDependencies.
2. For each entry, check whether the version string begins with `^`, `~`, `>`, `>=`, or `*`.
3. Count violations.
4. Compute: (entries with range specifiers / total entries) × 100.
**Fail:** Any dependency entry using a range specifier; CI lint step exits non-zero.
**Goal:** 0% range specifiers — all entries use exact version strings; enforced by `bunfig.toml` `exact = true` and a CI lint check.
**Stakeholders:** Supply chain security, dependency auditors, CI integrity.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Threat-Category-3]], [[adr/ADR014-dependency-security-policy#1-exact-version-pinning]], Shai-Hulud 2.0 analysis.

---

**Tag:** Security.Supply.FrozenLockfile
**Gist:** All CI `bun install` invocations must use `--frozen-lockfile`; any discrepancy between `package.json` and `bun.lockb` must fail the build rather than update the lockfile.
**Ambition:** A lockfile that is allowed to update during CI provides a false sense of security — the lockfile in the repository may represent a known-good state, but CI is actually resolving and installing a different set of versions. `--frozen-lockfile` ensures that CI installs exactly the versions encoded in `bun.lockb` at the time of the last reviewed lockfile commit. Any drift between `package.json` and `bun.lockb` (e.g., from a malformed manual edit or a compromised Dependabot PR) is surfaced as a build failure rather than silently resolved.
**Scale:** Percentage of CI workflow runs that use `bun install --frozen-lockfile` (not `bun install` without the flag). Measured by inspection of `.github/workflows/ci.yml` and `publish.yml`.
**Meter:**

1. Inspect all `bun install` invocations in `.github/workflows/ci.yml` and `.github/workflows/publish.yml`.
2. Verify each uses `--frozen-lockfile`.
3. In a test run: modify `package.json` to add a non-existent package version without updating `bun.lockb`; verify CI fails.
4. Compute: (bun install calls with --frozen-lockfile / total bun install calls) × 100.
**Fail:** Any CI `bun install` invocation without `--frozen-lockfile`; any CI run that updates `bun.lockb` during the build.
**Goal:** 100% of CI `bun install` calls use `--frozen-lockfile`.
**Stakeholders:** Supply chain security, CI integrity.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Threat-Category-3]], [[adr/ADR014-dependency-security-policy#2-frozen-lockfile-in-all-ci-runs]], [[.github/workflows/ci.yml]].

---

**Tag:** Security.Supply.IgnoreScripts
**Gist:** All CI `bun install` invocations must include the `--ignore-scripts` CLI flag to prevent postinstall script execution; the `.npmrc` directive alone is insufficient due to Bun's known bypass.
**Ambition:** The Bun package manager prioritizes its own internal package allow-list over the `ignore-scripts=true` directive in `.npmrc` (bunsecurity.dev, CVSS 5.5, CWE-183). This means a centrally-configured no-script policy through `.npmrc` provides no protection against postinstall scripts in packages on Bun's allow-list. The `--ignore-scripts` CLI flag does work correctly. The Shai-Hulud 2.0 campaign used `preinstall` scripts to execute payloads — this is the exact attack vector that `--ignore-scripts` prevents. Because the flag must be explicitly passed on every invocation rather than set once in configuration, each `bun install` call in the CI workflow must include it.
**Scale:** Percentage of CI `bun install` invocations that include the `--ignore-scripts` flag.
**Meter:**

1. Inspect all `bun install` calls in `.github/workflows/ci.yml` and `.github/workflows/publish.yml`.
2. Verify each includes `--ignore-scripts`.
3. In a test run: create a temporary dependency with a malicious `preinstall` script; verify CI does not execute the script.
4. Compute: (calls with --ignore-scripts / total calls) × 100.
**Fail:** Any CI `bun install` invocation without `--ignore-scripts`; any postinstall script executing in CI.
**Goal:** 100% of CI installs use `--ignore-scripts`; zero postinstall scripts execute in CI.
**Stakeholders:** Supply chain security, CI integrity.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Threat-Category-3]], [[adr/ADR014-dependency-security-policy#3-ignore-scripts-in-ci-installs]], bunsecurity.dev Bun security disclosure.

---

**Tag:** Security.Supply.AdvisoryMonitoring
**Gist:** Direct dependencies must be reviewed against published security advisories before each upgrade; findings must be documented in `docs/security/dependency-audit-log.md` with reviewer sign-off.
**Ambition:** Automated tools such as Dependabot surface known CVEs but cannot assess whether a newly published advisory for a core dependency (e.g., `@nestjs/common`, `typescript-eslint`, `vscode-languageserver-protocol`) has a viable exploit path in the specific usage pattern of this server. Human review adds the contextual judgment that automation cannot provide. CVE-2024-29409 (`@nestjs/common` arbitrary code injection via `FileTypeValidator`) is an example where review would have identified that the server does not use `FileTypeValidator`, making the upgrade advisory rather than critical — without review, teams either panic-upgrade or ignore the advisory entirely. The audit log creates an institutional record.
**Scale:** Percentage of direct dependency upgrades where a security advisory review was performed and documented in `docs/security/dependency-audit-log.md` before the upgrade PR was merged.
**Meter:**

1. For the last 10 dependency upgrade PRs, check whether each has a corresponding entry in `docs/security/dependency-audit-log.md`.
2. Each entry must include: package name, old version, new version, advisory check (advisory found / no advisory / advisory not applicable), and reviewer name.
3. Compute: (upgrades with documented review / total upgrades) × 100.
**Fail:** Any direct dependency upgrade merged without a documented advisory review entry.
**Goal:** 100% of direct dependency upgrades have documented advisory reviews.
**Stakeholders:** Security auditors, release managers, supply chain reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Threat-Category-3]], [[adr/ADR014-dependency-security-policy#4-security-advisory-monitoring]], CVE-2024-29409.

---

**Tag:** Security.Supply.NoDevtoolsIntegration
**Gist:** `@nestjs/devtools-integration` must never be added as a dependency; an ESLint `no-restricted-imports` rule enforces this prohibition.
**Ambition:** CVE-2025-54782 in `@nestjs/devtools-integration` is an RCE vulnerability via unsafe `vm.runInNewContext()` in the `/inspector/graph/interact` endpoint. flavor-grenade-lsp uses `NestFactory.createApplicationContext` with no HTTP server and has no legitimate use for the devtools integration package. Adding it would introduce a known RCE vulnerability for no functional benefit. The ESLint rule makes the prohibition machine-enforceable: any PR that adds an import of `@nestjs/devtools-integration` fails linting and cannot be merged. The rule is simpler and more reliable than a code review checklist item.
**Scale:** Boolean — either the `no-restricted-imports` ESLint rule for `@nestjs/devtools-integration` exists and is enforced, or it does not. Verified by checking `eslint.config.js` and running `bun run lint` on a test file that imports the package.
**Meter:**

1. Check `eslint.config.js` for a `no-restricted-imports` rule targeting `@nestjs/devtools-integration`.
2. Create a temporary test file with `import {} from '@nestjs/devtools-integration'`.
3. Run `bun run lint` on the test file.
4. Verify lint exits non-zero with a `no-restricted-imports` violation.
5. Delete the test file.
**Fail:** Absence of the `no-restricted-imports` rule; any file importing `@nestjs/devtools-integration` that passes lint.
**Goal:** The prohibition is enforced by ESLint; `bun run lint` catches any accidental import at lint time.
**Stakeholders:** Security auditors, NestJS dependency reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Threat-Category-3]], [[adr/ADR014-dependency-security-policy#7-no-nestjsdevtools-integration]], CVE-2025-54782.

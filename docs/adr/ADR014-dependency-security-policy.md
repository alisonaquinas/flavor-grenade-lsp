---
adr: "014"
title: Dependency Security Policy — Supply Chain Hardening
status: accepted
date: 2026-04-17
---

# ADR014 — Dependency Security Policy

## Context

The **Shai-Hulud 2.0** supply chain attack (November 2025, documented by Palo Alto Unit 42 and Endor Labs) targeted the npm ecosystem and specifically used the Bun runtime as an evasion mechanism — malicious `preinstall` scripts dynamically installed Bun to bypass Node.js-focused security monitoring tools. Over 25,000 repositories were affected.

flavor-grenade-lsp uses Bun as both its runtime and package manager. This creates a specific exposure:

1. **Bun's `.npmrc` `ignore-scripts` bypass** (bunsecurity.dev, CVSS 5.5, CWE-183): Bun respects `--ignore-scripts` as a CLI flag but ignores `ignore-scripts=true` in `.npmrc`. A centrally-configured no-script-execution policy cannot be enforced through `.npmrc` when using `bun install`.

2. **NestJS ecosystem CVEs**: `@nestjs/common` CVE-2024-29409 (arbitrary code injection via `FileTypeValidator`, patched in 10.4.16 / 11.0.16) and `@nestjs/devtools-integration` CVE-2025-54782 (RCE via `vm.runInNewContext()` escape) demonstrate that core NestJS packages have carried RCE-class vulnerabilities.

3. **Dependency confusion / typosquatting**: The npm registry is open to registration; a package with a name similar to a dependency can be installed via a typographical error and will execute its `postinstall` script automatically.

The threat is documented in [[research/security-threat-model#Threat-Category-3]].

## Decision

### 1. Exact Version Pinning

All dependencies — runtime and development — must be pinned to exact versions in `package.json` (`"^"` and `"~"` ranges are prohibited). This is enforced by:

- `exact = true` in `bunfig.toml` (already configured in Phase 1)
- A CI lint step that fails if any dependency in `package.json` contains a range specifier

Rationale: a locked version cannot be silently upgraded to a compromised version by a registry update.

### 2. Frozen Lockfile in All CI Runs

All CI workflows must use `bun install --frozen-lockfile`. This prevents the lockfile from being updated during CI, ensuring that the resolved package graph is exactly what was committed. Any discrepancy between `package.json` and `bun.lockb` fails the build.

This is already enforced in `.github/workflows/ci.yml`.

### 3. `--ignore-scripts` in CI Installs

Because Bun ignores `ignore-scripts=true` in `.npmrc`, all CI `bun install` invocations must explicitly pass `--ignore-scripts` as a CLI flag. This prevents `postinstall` scripts from running in CI, eliminating the primary supply chain execution vector.

Update `.github/workflows/ci.yml` to use:

```yaml
- run: bun install --frozen-lockfile --ignore-scripts
```

Exceptions (packages that genuinely require postinstall scripts to function, e.g., `esbuild`, native bindings) must be explicitly listed in a comment next to a second targeted install step.

### 4. Security Advisory Monitoring

The repository must subscribe to GitHub Dependabot security alerts for all direct and transitive dependencies. Additionally, contributors must manually review the security advisories for the following packages before each minor or major version upgrade:

- `@nestjs/core`
- `@nestjs/common`
- `typescript-eslint`
- `vscode-languageserver-protocol`
- `js-yaml`
- `bun` (runtime)

A `docs/security/dependency-audit-log.md` file (created in Phase 13) records each dependency upgrade, the advisory review performed, and the reviewer's sign-off.

### 5. OIDC Provenance on All Published Versions

Every version published to npm and the Bun registry must carry an OIDC provenance attestation (`npm publish --provenance`). This allows consumers to verify the full build chain: that the published artifact was produced by a specific GitHub Actions workflow run from a specific commit on `main`.

This is already planned in [[adr/ADR008-oidc-publishing]] and enforced in `.github/workflows/publish.yml`.

### 6. Lockfile Review on Dependency PRs

Any PR that modifies `package.json` or `bun.lockb` must:

1. Include a human-readable summary of what changed and why
2. Link to the release notes or changelog for any upgraded package
3. Be reviewed by at least one maintainer before merge

Automated Dependabot PRs are not exempt from this review requirement.

### 7. No `@nestjs/devtools-integration`

The `@nestjs/devtools-integration` package (CVE-2025-54782, RCE) must never be added to this project. flavor-grenade-lsp uses `NestFactory.createApplicationContext` (no HTTP server) and has no use for the devtools integration package. If a future phase requires NestJS devtools-style introspection, an alternative approach must be documented and approved in a new ADR.

This prohibition is enforced by an ESLint `no-restricted-imports` rule targeting `@nestjs/devtools-integration`.

## Consequences

### Positive

- The `--ignore-scripts` CI flag directly mitigates the Bun `.npmrc` bypass vulnerability and closes the primary postinstall script execution vector
- Exact pinning prevents silent version drift to compromised versions
- OIDC provenance allows consumers to verify the build chain
- Explicit lockfile review creates a human audit trail for every dependency change

### Negative

- `--ignore-scripts` breaks packages that legitimately require postinstall scripts (e.g., `esbuild` platform-specific binary installation); these must be handled with targeted install steps, adding CI complexity
- Manual advisory review before each upgrade adds friction to the dependency update workflow
- The `dependency-audit-log.md` requirement creates ongoing documentation overhead

### Neutral

- Dependabot alerts are advisory; the CI lockfile check is the enforcement mechanism
- The advisory review list covers direct dependencies; transitive dependency security relies primarily on Dependabot alerts and the frozen lockfile

## Related

- [[adr/ADR008-oidc-publishing]] — OIDC provenance publishing
- [[research/security-threat-model#Threat-Category-3]] — Shai-Hulud 2.0 and Bun security evidence
- [[requirements/security/supply-chain]] — Planguage requirements derived from this ADR
- [[plans/phase-01-scaffold]] — exact pinning and frozen lockfile already in place
- [[plans/phase-13-ci-delivery]] — dependency audit log and advisory monitoring setup

---
adr: "008"
title: OIDC trusted publishing to npm and Bun registry
status: accepted
date: 2026-04-16
---

# ADR 008 — OIDC trusted publishing to npm and Bun registry

## Context

Publishing `flavor-grenade-lsp` to a public package registry requires authenticating to the registry from a GitHub Actions workflow. Two authentication models were evaluated.

**Option 1 — Long-lived npm access token stored as a GitHub Secret.** The developer generates a Granular Access Token (or legacy automation token) on npmjs.com, stores it as the GitHub repository secret `NPM_TOKEN`, and the publish workflow injects it as `NODE_AUTH_TOKEN`. This approach works but has well-documented supply-chain risks: the token is valid until manually revoked, stored in plaintext in GitHub's secret store, and could be extracted or abused if the repository's action permissions are misconfigured, if a malicious dependency is introduced, or if GitHub's secret storage is ever compromised. Rotating a leaked token requires manual intervention.

**Option 2 — OIDC trusted publishing (keyless).** OpenID Connect (OIDC) allows GitHub Actions to obtain a short-lived, signed identity token from GitHub's OIDC provider. The npm registry (since npm 9.x) supports OIDC publishing: the workflow presents the identity token to npmjs.com, which verifies that the token was issued for a specific GitHub repository and workflow, and issues a scoped, single-use publish credential. No long-lived secret is stored anywhere. Each workflow run authenticates independently. Compromised workflow logs reveal nothing reusable.

npm's `--provenance` flag (available since npm 9.5 / npmjs.com infrastructure update 2023-04) attaches a signed Software Bill of Materials (SBOM) provenance attestation to the published package, linking it cryptographically to the specific GitHub Actions run and commit that produced it. Consumers of the package can verify provenance using `npm audit signatures`.

The Bun registry (`registry.bun.sh`) exposes an npm-compatible publish API. Packages published with standard `npm publish` mechanics are available to `bun add` consumers. A second publish step targeting `registry.bun.sh` with the same OIDC credentials makes the package available in the Bun ecosystem without any additional secret management.

## Decision

Use **OIDC trusted publishing** for all registry publish operations.

Implementation details:

1. **Workflow permission.** The publish job declares `id-token: write` and `contents: read` in its `permissions` block. No other job in the repository requires `id-token: write`.

2. **Trusted publisher registration.** The GitHub repository (`owner/flavor-grenade-lsp`) is registered on npmjs.com under the package `flavor-grenade-lsp` as a trusted publisher. The registration specifies the repository owner, repository name, and workflow file name. Only the designated workflow file can publish under OIDC — no other workflow or actor can obtain publish credentials for this package.

3. **Publish command.** The release job runs:
   ```
   npm publish --provenance --access public
   ```
   The `--provenance` flag generates and attaches a signed attestation. The `--access public` flag is required for scoped or first-time packages.

4. **Bun registry publish.** A second step in the same job publishes to `registry.bun.sh`:
   ```
   npm publish --registry https://registry.bun.sh --provenance --access public
   ```
   The same OIDC token is presented to both registries within the same workflow run.

5. **Workflow trigger.** The publish workflow triggers only on `push` to `main` (see [[adr/ADR007-git-flow-branching]]). The job is conditional on the push being a semver tag (e.g., `v*.*.*`). Merges that are not tagged do not trigger publishing.

6. **Environment gate.** The publish job runs in the GitHub Actions environment `npm-publish`. The environment requires a reviewer approval before the job proceeds (optional, configurable per team preference). This provides a manual gate even though OIDC itself is automated.

## Consequences

**Positive:**
- No long-lived npm token is stored in the repository secrets. The attack surface for token leakage is eliminated.
- Provenance attestation on every published version provides supply-chain transparency. The cryptographic link between the published `.tgz` and the GitHub Actions run is publicly verifiable.
- OIDC credentials are scoped to the exact repository and workflow file registered as a trusted publisher. A compromised fork or a different workflow file cannot publish to the `flavor-grenade-lsp` package.
- Publishing to both `registry.npmjs.org` and `registry.bun.sh` in a single workflow run ensures that npm and Bun consumers always receive the same version simultaneously.
- Token rotation is eliminated as a maintenance concern. There is nothing to rotate.

**Negative:**
- The trusted publisher registration on npmjs.com must be configured by a package owner with sufficient permissions. This is a one-time manual step that must be documented in the project onboarding guide.
- If the workflow file is renamed or the repository is transferred, the trusted publisher registration becomes invalid and must be re-registered. The failing workflow error message from npmjs.com is clear but unfamiliar to developers who have not encountered OIDC publishing before.
- `registry.bun.sh` OIDC support should be verified at the time the publish workflow is first activated. If Bun registry does not support the OIDC token format, a fallback to a Bun-specific token stored as a secret may be required for that registry only.

**Neutral:**
- The `id-token: write` permission is constrained to the publish job only. Other jobs (test, lint, build) do not receive this permission, keeping the principle of least privilege intact.

## Related

- [[adr/ADR007-git-flow-branching]]
- [[plans/phase-13-ci-delivery]]
- [[requirements/ci-cd]]

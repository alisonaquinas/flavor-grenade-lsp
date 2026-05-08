---
title: "Phase 18: Security Hardening Audit"
phase: 18
status: in-progress
tags: [plans, security, audit, hardening]
aliases: [Phase 18, Security Hardening Audit]
updated: 2026-05-08
---

# Phase 18: Security Hardening Audit

| Field | Value |
|---|---|
| Phase | 18 |
| Title | Security Hardening Audit |
| Status | in-progress |
| Gate | Security requirements with open audit findings have passing tests and CI checks |
| Depends on | Phase 17 |

## Objective

Close the remaining security-policy gaps found during the 2026-05-08 audit of
the head of `develop`, with one implementation PR and clean CI before the phase
is marked complete.

## Audit Results

| Area | Result |
|---|---|
| Dependency advisories | `bun audit` and `npm audit --prefix extension --omit=dev` found 0 vulnerabilities |
| LSP URI schemes | Server root/document URI handling has no central non-`file://` rejection path |
| Parser safety | Frontmatter YAML and parser execution lack the documented size, alias, timeout, and ReDoS guardrails |
| Vault indexing | Initial recursive scan lacks the documented file-count budget and realpath symlink proof |
| JSON-RPC payloads | Dispatcher parses arbitrary JSON into plain objects without schema/prototype-pollution rejection |
| Supply chain | Root and extension package manifests still contain range specifiers despite exact-pinning policy |

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/security/vault-confinement#Security.Vault.URISchemeAllowlist]] | Reject non-file LSP URIs before any path or resolver handling |
| [[requirements/security/parser-safety#Security.Parser.YAMLLimits]] | Enforce frontmatter YAML size and alias limits |
| [[requirements/security/parser-safety#Security.Parser.ParseTimeout]] | Bound single-file parser runtime |
| [[requirements/security/parser-safety#Security.Parser.ReDoS]] | Add parser regex audit and adversarial regression coverage |
| [[requirements/security/parser-safety#Security.Parser.VaultFileLimit]] | Stop vault indexing at a configurable file limit and notify the client |
| [[requirements/security/vault-confinement#Security.Vault.SymlinkConfinement]] | Treat out-of-vault symlink targets as missing based on realpath checks |
| [[requirements/security/input-validation#Security.Input.PrototypePollution]] | Reject dangerous JSON-RPC object keys before handlers receive payloads |
| [[requirements/security/supply-chain#Security.Supply.ExactPinning]] | Remove dependency range specifiers and add a CI range lint |
| [[requirements/security/supply-chain#Security.Supply.AdvisoryMonitoring]] | Record advisory scan evidence in the phase workflow |

## Scope

### In Scope

- Central file URI validation for initialize, document, and workspace handlers.
- Parser and vault scan resource-budget enforcement with tests.
- Symlink confinement tests that use real symlink targets, skipped only on
  platforms that cannot create symlinks.
- JSON-RPC payload validation for dangerous prototype keys.
- Exact dependency pinning and a manifest-range CI check.
- Documentation and test matrix updates for every passing security requirement.

### Out of Scope

- Network or remote vault support.
- New encryption, secret storage, or authentication features.
- Extension Marketplace publishing changes unrelated to dependency pinning.

## Workstreams

| Workstream | Deliverable |
|---|---|
| URI validation | Shared validator and InvalidParams responses for non-file URIs |
| Parser budgets | YAML limit, parser timeout policy, and ReDoS regression fixtures |
| Vault budgets | File-count limit, client warning, and symlink realpath confinement |
| JSON-RPC validation | Dangerous-key rejection before handler dispatch |
| Supply chain | Exact manifests, frozen lockfile refresh, range lint, and audit log |
| Evidence | Updated test matrix, test index, and phase ticket workflow logs |

## Acceptance

- Every BUG ticket in [[plans/phase-18-security-hardening-audit/index]] reaches
  `done`.
- `bun run lint --max-warnings 0`, `bun run typecheck`, `bun test`, and
  `bun run lint:docs` pass locally.
- CI passes on the phase PR.
- [[test/matrix]] and [[test/index]] contain passing evidence for all linked
  security requirements.

## Related

- [[requirements/security/index]]
- [[requirements/security/parser-safety]]
- [[requirements/security/vault-confinement]]
- [[requirements/security/input-validation]]
- [[requirements/security/supply-chain]]
- [[adr/ADR012-parser-safety-policy]]
- [[adr/ADR013-vault-root-confinement]]
- [[adr/ADR014-dependency-security-policy]]

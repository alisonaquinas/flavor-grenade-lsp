---
title: Security Requirements Index
tags:
  - requirements/security
  - requirements/security/index
aliases:
  - Security Requirements
  - Security Planguage Index
---

# Security Requirements Index

> [!NOTE] Scope
> This directory houses all security-focused requirements for `flavor-grenade-lsp`. Requirements are organized into three layers — **functional**, **technical**, and **operational** — following the structure of [[research/security-threat-model]]. All requirements use the Planguage format defined in [[requirements/index]].

---

## Requirement Files

| File | Layer | Threat Categories Addressed |
|---|---|---|
| [[requirements/security/parser-safety]] | Technical | ReDoS, YAML injection, circular embeds, vault size |
| [[requirements/security/vault-confinement]] | Functional | Path traversal, URI injection, write confinement |
| [[requirements/security/input-validation]] | Technical | JSON-RPC param validation, prototype pollution, payload size |
| [[requirements/security/supply-chain]] | Operational | Dependency pinning, ignore-scripts, advisory monitoring, OIDC |
| [[requirements/security/information-disclosure]] | Functional | Log sanitization, completion filtering, process privilege |

---

## Security Planguage Tags

| Tag | Gist | File | Priority |
|---|---|---|---|
| **Security.Parser.ReDoS** | All OFM parser regexes must be audited for catastrophic backtracking; any regex producing super-linear worst-case behaviour against crafted input is prohibited. | [[requirements/security/parser-safety]] | P1 |
| **Security.Parser.ParseTimeout** | Any single vault file must complete parsing within 200 ms; files exceeding the timeout are skipped with an empty result without crashing. | [[requirements/security/parser-safety]] | P1 |
| **Security.Parser.YAMLLimits** | Frontmatter YAML must be parsed with alias cap (50), size limit (64 KB), and in safe mode; parse failures must be caught and treated as malformed frontmatter. | [[requirements/security/parser-safety]] | P1 |
| **Security.Parser.EmbedDepth** | Embed resolution must detect cycles and enforce a maximum depth of 10; circular embeds produce FG005, depth exceeded stops resolution. | [[requirements/security/parser-safety]] | P2 |
| **Security.Parser.VaultFileLimit** | Initial vault indexing must stop at a configurable file count limit (default 50,000) and notify the client. | [[requirements/security/parser-safety]] | P3 |
| **Security.Vault.PathConfinement** | All file paths derived from vault content or LSP parameters must pass canonicalization and vault-root bounds checking before any I/O operation. | [[requirements/security/vault-confinement]] | P1 |
| **Security.Vault.SymlinkConfinement** | Symlinks inside the vault that resolve to targets outside the vault root must be treated as non-existent files and produce FG001/FG004. | [[requirements/security/vault-confinement]] | P1 |
| **Security.Vault.URISchemeAllowlist** | Only `file://` URIs are accepted; any other URI scheme in an LSP request is rejected with InvalidParams (-32602). | [[requirements/security/vault-confinement]] | P2 |
| **Security.Vault.RenameConfinement** | Rename edit targets must pass vault-root confinement before `workspace/applyEdit` is issued; escaping targets cause the rename to be rejected. | [[requirements/security/vault-confinement]] | P1 |
| **Security.Input.PositionValidation** | All LSP `Position` and `Range` parameters must be validated as non-negative integers within document bounds before reaching the VaultIndex. | [[requirements/security/input-validation]] | P2 |
| **Security.Input.PayloadSize** | JSON-RPC messages exceeding 10 MB must be rejected; the transport layer must disconnect rather than attempt to parse oversized messages. | [[requirements/security/input-validation]] | P3 |
| **Security.Input.PrototypePollution** | All incoming JSON-RPC message bodies must pass schema validation before any object merge operation; `Object.prototype` must not be pollutable from LSP input. | [[requirements/security/input-validation]] | P2 |
| **Security.Supply.FrozenLockfile** | `bun install --frozen-lockfile` must be used in all CI runs; any lockfile drift fails the build. | [[requirements/security/supply-chain]] | P1 |
| **Security.Supply.IgnoreScripts** | `bun install --ignore-scripts` must be used in all CI runs to prevent postinstall script execution. | [[requirements/security/supply-chain]] | P1 |
| **Security.Supply.ExactPinning** | All `package.json` dependencies must use exact version strings (no `^` or `~`); range specifiers fail CI linting. | [[requirements/security/supply-chain]] | P1 |
| **Security.Supply.AdvisoryMonitoring** | Direct dependencies must be reviewed against published security advisories before each upgrade; findings documented in `docs/security/dependency-audit-log.md`. | [[requirements/security/supply-chain]] | P2 |
| **Security.Supply.NoDevtoolsIntegration** | `@nestjs/devtools-integration` must never be added as a dependency (CVE-2025-54782 RCE). | [[requirements/security/supply-chain]] | P1 |
| **Security.Disclosure.LogSanitization** | Server logs must never include vault document content; only file paths, line numbers, and diagnostic codes may appear in log output. | [[requirements/security/information-disclosure]] | P2 |
| **Security.Disclosure.CompletionFilter** | Completion candidates derived from frontmatter values must not include values from sensitive key names (password, token, secret, api_key, etc.). | [[requirements/security/information-disclosure]] | P3 |
| **Security.Config.NoCodeExecution** | The `.flavor-grenade.toml` configuration schema must never include fields that specify commands, scripts, or executables to run; vault config must never cause process spawning. | [[requirements/security/information-disclosure]] | P1 |

---

## Coverage in Test Matrix

Security requirements will be added to [[test/matrix]] as implementation phases deliver them. All security requirements are currently `⏳ planned`.

| Phase | Security Requirements Delivered |
|---|---|
| Phase 2 (LSP Transport) | `Security.Input.PositionValidation`, `Security.Input.PayloadSize`, `Security.Input.PrototypePollution`, `Security.Vault.URISchemeAllowlist`, `Security.Disclosure.LogSanitization` |
| Phase 3 (OFM Parser) | `Security.Parser.ReDoS`, `Security.Parser.ParseTimeout`, `Security.Parser.YAMLLimits`, `Security.Parser.EmbedDepth`, `Security.Parser.VaultFileLimit` |
| Phase 4 (Vault Index) | `Security.Vault.PathConfinement`, `Security.Vault.SymlinkConfinement` |
| Phase 9 (Completions) | `Security.Disclosure.CompletionFilter` |
| Phase 11 (Rename) | `Security.Vault.RenameConfinement` |
| Phase 13 (CI/CD) | `Security.Supply.AdvisoryMonitoring` |
| Phase 1 + ongoing | `Security.Supply.FrozenLockfile`, `Security.Supply.IgnoreScripts`, `Security.Supply.ExactPinning`, `Security.Supply.NoDevtoolsIntegration`, `Security.Config.NoCodeExecution` |

---

## Related Documents

- [[research/security-threat-model]] — source evidence for all requirements in this directory
- [[adr/ADR012-parser-safety-policy]] — parser safety decisions
- [[adr/ADR013-vault-root-confinement]] — path confinement decisions
- [[adr/ADR014-dependency-security-policy]] — supply chain decisions
- [[requirements/index]] — master Planguage tag index (security tags listed there too)
- [[test/matrix]] — traceability matrix (security tags included)

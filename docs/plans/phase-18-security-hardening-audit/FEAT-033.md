---
id: "FEAT-033"
title: "Security hardening audit closure"
type: feature
status: in-progress
priority: "high"
phase: "18"
created: "2026-05-08"
updated: "2026-05-08"
dependencies: []
tags: [tickets/feature, "phase/18", security]
aliases: ["FEAT-033"]
---

# Security Hardening Audit Closure

> [!INFO] `FEAT-033` · Feature · Phase 18 · Priority: `high` · Status: `in-progress`

## Goal

Vault authors can open hostile or unusually large OFMarkdown vaults without the
server leaving the vault boundary, accepting unsafe URI schemes, hanging on
crafted input, or silently drifting to unreviewed dependency versions.

---

## Scope

**In scope:**

- Fix every security finding opened from the 2026-05-08 audit of `develop`.
- Add regression tests and matrix evidence for the linked security requirements.
- Preserve current read-only behavior outside LSP-mediated rename edits.

**Out of scope:**

- Remote vault protocols.
- New authentication, encryption, or secret-management features.

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `UR-SEC-001` | Vault content cannot cause path escape or unsafe host access | [[requirements/user/index]] |
| `UR-SEC-002` | Large or malformed vault content degrades safely | [[requirements/user/index]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Security.Vault.URISchemeAllowlist` | Reject non-file URIs | [[requirements/security/vault-confinement]] |
| `Security.Parser.YAMLLimits` | Bound frontmatter YAML parsing | [[requirements/security/parser-safety]] |
| `Security.Parser.ParseTimeout` | Bound parser runtime | [[requirements/security/parser-safety]] |
| `Security.Parser.ReDoS` | Prevent catastrophic parser regex behavior | [[requirements/security/parser-safety]] |
| `Security.Parser.VaultFileLimit` | Bound initial vault indexing | [[requirements/security/parser-safety]] |
| `Security.Vault.SymlinkConfinement` | Treat out-of-vault symlink targets as missing | [[requirements/security/vault-confinement]] |
| `Security.Input.PrototypePollution` | Reject dangerous JSON-RPC object keys | [[requirements/security/input-validation]] |
| `Security.Supply.ExactPinning` | Pin dependency versions exactly | [[requirements/security/supply-chain]] |
| `Security.Supply.AdvisoryMonitoring` | Record advisory scan evidence | [[requirements/security/supply-chain]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/vault-detection.feature` | Vault indexing and root-detection security behavior |
| `docs/bdd/features/ofmarkdown-parity.feature` | LSP-facing document behavior must remain unchanged |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-18-security-hardening-audit]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

- [ ] All child BUG tickets are `done`.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.
- [ ] `bun run lint:docs` passes.
- [ ] [[test/matrix]] and [[test/index]] record passing security evidence.
- [ ] Phase PR has clean CI.

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[plans/phase-18-security-hardening-audit/BUG-016]] | Reject non-file LSP URIs before path handling | open |
| [[plans/phase-18-security-hardening-audit/BUG-017]] | Enforce frontmatter YAML size and alias limits | open |
| [[plans/phase-18-security-hardening-audit/BUG-018]] | Bound parser runtime and ReDoS exposure | open |
| [[plans/phase-18-security-hardening-audit/BUG-019]] | Enforce vault scan file-count limits | open |
| [[plans/phase-18-security-hardening-audit/BUG-020]] | Prove and enforce symlink realpath confinement | open |
| [[plans/phase-18-security-hardening-audit/BUG-021]] | Reject prototype-polluting JSON-RPC payloads | open |
| [[plans/phase-18-security-hardening-audit/BUG-022]] | Pin dependency specifiers and add range lint | open |
| [[plans/phase-18-security-hardening-audit/CHORE-086]] | Security audit verification sweep | open |

---

## Notes

Audit evidence collected on 2026-05-08:

- `bun audit` reported no vulnerabilities.
- `npm audit --prefix extension --omit=dev` reported no vulnerabilities.
- The extension command bridge already rejects non-file command payload URIs.

---

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`

---

## Workflow Log

> [!INFO] Opened — 2026-05-08
> Ticket created from deep security audit. Status: `ready`; child findings are listed.

> [!INFO] Started — 2026-05-08
> Phase 18 execution began according to [[plans/phase-execution]]. Status: `in-progress`.

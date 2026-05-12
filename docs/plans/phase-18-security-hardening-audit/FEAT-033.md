---
id: "FEAT-033"
title: "Security hardening audit closure"
type: feature
status: in-review
priority: "high"
phase: "18"
created: "2026-05-08"
updated: "2026-05-08"
dependencies: []
tags: [tickets/feature, "phase/18", security]
aliases: ["FEAT-033"]
---

# Security Hardening Audit Closure

> [!INFO] `FEAT-033` · Feature · Phase 18 · Priority: `high` · Status: `in-review`

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
- [x] `bun run lint --max-warnings 0` passes.
- [x] `bun run typecheck` passes.
- [x] `bun test` passes.
- [x] `bun run lint:docs` passes.
- [x] [[test/matrix]] and [[test/index]] record passing security evidence.
- [ ] Phase PR has clean CI.

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[plans/phase-18-security-hardening-audit/BUG-016]] | Reject non-file LSP URIs before path handling | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-017]] | Enforce frontmatter YAML size and alias limits | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-018]] | Bound parser runtime and ReDoS exposure | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-019]] | Enforce vault scan file-count limits | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-020]] | Prove and enforce symlink realpath confinement | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-021]] | Reject prototype-polluting JSON-RPC payloads | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-022]] | Pin dependency specifiers and add range lint | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-023]] | Keep adversarial parser safety test inside budget | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-024]] | Restore spawned LSP integration test responses | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-025]] | Block command-start server spawn in unsupported extension environments | in-review |
| [[plans/phase-18-security-hardening-audit/BUG-033]] | Restore full BDD suite execution | verified |
| [[plans/phase-18-security-hardening-audit/BUG-034]] | Code action BDD command execution is unimplemented | verified |
| [[plans/phase-18-security-hardening-audit/BUG-035]] | Tag reference BDD includes nested tag occurrence | verified |
| [[plans/phase-18-security-hardening-audit/BUG-036]] | OFMarkdown parity BDD step coverage is incomplete | verified |
| [[plans/phase-18-security-hardening-audit/BUG-037]] | VS Code extension BDD harness has ambiguous and missing steps | verified |
| [[plans/phase-18-security-hardening-audit/BUG-038]] | Vault detection BDD scope assertion is too strict | verified |
| [[plans/phase-18-security-hardening-audit/BUG-039]] | Workspace BDD file watcher update misses 500ms index window | in-review |
| [[plans/phase-18-security-hardening-audit/TASK-280]] | Implement BDD harness coverage for default gate | done |
| [[plans/phase-18-security-hardening-audit/TASK-281]] | Move BDD step source notes out of docs | done |
| [[plans/phase-18-security-hardening-audit/CHORE-086]] | Security audit verification sweep | in-review |
| [[plans/phase-18-security-hardening-audit/CHORE-102]] | Backfill BDD gate requirements and specs | in-review |

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

> [!SUCCESS] Local review ready — 2026-05-08
> Phase 18 implementation and local verification completed. BUG-023 and BUG-024 were opened during CHORE-086 and moved to `in-review` after fixes. Status: `in-review`; final `done` remains blocked on PR CI and merge.

> [!NOTE] Extension audit reopened phase work — 2026-05-08
> Deep extension security audit opened BUG-025 for command-triggered server spawn in unsupported environments. Status: `in-progress`.

> [!SUCCESS] Extension audit fix ready — 2026-05-08
> BUG-025 moved to `in-review` after the disabled command-start guard and regression evidence were added. CHORE-086 returned to `in-review` after full extension validation. Status: `in-review`.

## Retrospective

> Written after Step L passes. Date: 2026-05-08.

### What went as planned

The ticketed audit findings converted cleanly into focused regression tests and
small implementation changes. Central URI validation, YAML limits, parser
budgets, scanner limits, symlink confinement, prototype-key rejection, and exact
dependency pinning all have local test or workflow evidence.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| BUG-023 | Bug | The adversarial parser test exposed repeated close-marker scans and O(n*m) math exclusion checks after the initial BUG-018 fix. | +0.5 h |
| BUG-024 | Bug | The scanner file-limit constructor parameter was a primitive dependency, so Nest failed startup in spawned integration tests. | +0.5 h |

### Process observations

The A-M checklist caught both regressions before the phase reached PR review.
The requirement to ticket sweep findings before fixing them kept the extra work
traceable, although the CHORE ticket dependencies needed to expand after BUG-023
and BUG-024 were opened.

### Carry-forward actions

- [ ] Consider adding a lightweight startup smoke test to catch Nest dependency
      injection failures before integration suites wait on stdio responses.
- [ ] Prefer injectable tokens or options objects for future configurable
      service limits rather than primitive constructor parameters.

### Rule / template amendments

- [ ] None.

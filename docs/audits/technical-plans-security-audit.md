---
title: Technical Plans Security Audit
tags: [audits, security, roadmap, markdown-flavor, technical-plans]
updated: 2026-05-13
---

# Technical Plans Security Audit

## Scope

Audited the current technical planning surface for security risks:

- [[docs/roadmap]]
- Phase 19-34 Markdown flavor plans under `docs/plans/`
- Phase E15-E17 extension flavor plans under `docs/plans/`
- [[docs/design/markdown-flavor-auto-detection]]
- [[docs/requirements/technical/security-parser-safety]]
- [[docs/requirements/functional/security-vault-confinement]]
- [[docs/requirements/technical/security-input-validation]]
- [[docs/requirements/functional/markdown-flavor-lsp]]
- Root and extension Markdown flavor test specifications

This audit covers planning/specification risk only. It does not assess current
runtime implementation behavior.

## Method

1. Searched the scoped docs for security-sensitive surfaces: parser work,
   configuration ingestion, URI handling, payload propagation, host/conversion
   references, rename/apply-edit paths, execution boundaries, restricted
   contexts, and validation evidence.
2. Compared planned flavor work against existing security requirements from
   Phase 18 and the threat model.
3. Identified places where new Markdown flavor work can bypass older security
   assumptions because it introduces new syntax, config, protocol payload, or
   evidence surfaces.

## Findings

| ID | Severity | Risk Area | Plan/spec evidence | Gap | Impact | Recommended correction | Affected files |
|---|---|---|---|---|---|---|---|
| AUD-SEC-001 | High | Parser resource exhaustion and ReDoS | Phase 22-34 plans add new dialect parsers/tokenizers for tables, attributes, citations, JSX, R chunks, platform references, and other syntax. Existing parser security requirements in [[docs/requirements/technical/security-parser-safety]] are written for the original OFM parser and Phase 3. | Dialect phases do not explicitly require regex safety, parse timeout, fixture size limits, or pathological-input tests for each new flavor tokenizer. | A dialect-specific parser can introduce catastrophic regex behavior or unbounded parsing even if the original OFM parser remains safe. | Extend parser-safety requirements to all Markdown flavor parsers/profiles; add Phase 19 profile-schema security fields and Phase 22-34 gate/ticket requirements for resource-budget and ReDoS evidence. | [[docs/requirements/technical/security-parser-safety]], [[docs/plans/phase-19-markdown-flavor-model-profiles]], Phase 22-34 plans and closeout chores |
| AUD-SEC-002 | High | Project config ingestion | [[docs/design/markdown-flavor-auto-detection]] and E15/E20 plans use `.flavor-grenade.toml` and project-config evidence for flavor resolution. | Existing security requirements bound YAML frontmatter, but not `.flavor-grenade.toml` size, type schema, dangerous object keys, path confinement, symlink behavior, or log redaction. | A malicious or oversized TOML config can trigger memory pressure, poison merged config objects, select unexpected behavior, leak config content into logs, or be read through an unsafe path. | Add a project-config security requirement for TOML size/schema/prototype-key rejection, vault-confined realpath, safe fallback, and redacted logs; link it from auto-detection, Phase 20, and E15. | [[docs/requirements/technical/security-input-validation]], [[docs/requirements/functional/security-vault-confinement]], [[docs/design/markdown-flavor-auto-detection]], [[docs/plans/phase-E15-markdown-flavor-selector-settings]], [[docs/plans/phase-20-markdown-flavor-server-propagation]] |
| AUD-SEC-003 | High | Resource-specific flavor propagation payloads | Phase E15 and Phase 20 plan `workspace/didChangeConfiguration` or equivalent payloads with selected/effective flavor, source, and resource keys. | Plans require resource-specific behavior but do not explicitly require payload size/depth limits, resource-key URI scheme validation, unknown-resource rejection, dangerous-key rejection, or stale-resource eviction. | A buggy or malicious client can send large maps, non-file resource keys, prototype-pollution keys, or stale cross-root entries that consume memory or cause flavor state to leak across documents. | Extend JSON-RPC input validation to flavor propagation payloads and update E15/Phase 20 tasks to validate map size, URI scheme, resource ownership, enum values, dangerous keys, and stale entries. | [[docs/requirements/technical/security-input-validation]], [[docs/plans/phase-E15-markdown-flavor-selector-settings/TASK-304]], [[docs/plans/phase-20-markdown-flavor-server-propagation/FEAT-043]], [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-288]] |
| AUD-SEC-004 | High | Host, conversion, include, bibliography, JSX, and execution boundaries | Phase 20 adds non-local boundary classification; Phase 27-32 include Pandoc, MultiMarkdown, MDX, and R Markdown syntax. | Boundary plans say live lookup/execution is deferred, but security specs do not state that includes/imports/bibliographies/chunks must not trigger network access, command execution, dynamic module loading, or file reads outside the vault. | Future implementation could accidentally read arbitrary files referenced by bibliography/include paths, attempt network/platform lookup, or execute/import code while trying to provide richer LSP behavior. | Add a boundary security requirement: all host/conversion/execution references are classified without network, process execution, dynamic import, or out-of-vault reads unless a future explicit integration threat model allows it. Link it from the applicability matrix and affected dialect phases. | [[docs/requirements/functional/markdown-flavor-lsp]], [[docs/plans/markdown-flavor-lsp-applicability-matrix]], [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]], Phase 27-32 plans |
| AUD-SEC-005 | Medium | Rename and workspace edit confinement | Flavor phases require rename dispositions for labels, headings, references, IDs, chunks, and links. Existing rename confinement requirements cover vault file writes. | Flavor rename plans do not consistently state that every generated edit URI/range must pass vault confinement, resource-specific effective flavor checks, and all-or-nothing rejection before `workspace/applyEdit`. | New profile-safe rename paths could introduce edits to non-local references, out-of-vault files, generated output, or stale resources. | Update `FlavorLSP.Rename.ProfileSafety` and dialect plans to require `Security.Vault.RenameConfinement`, non-local boundary checks, resource-specific flavor validation, and atomic rejection. | [[docs/requirements/functional/markdown-flavor-lsp]], [[docs/requirements/functional/security-vault-confinement]], Phase 22-34 LSP tasks |
| AUD-SEC-006 | Medium | Extension restricted/virtual/workspace trust boundaries | E15-E17 cover restricted and virtual contexts, selector state, and server propagation. | Plans do not explicitly tie selector writes and server propagation to workspace trust and supported filesystem schemes. E15 says standalone writes use user scope, but restricted/untrusted workspace write behavior is not security-gated in the selector plan. | The extension could persist settings or send server propagation from untrusted/virtual contexts where server startup and filesystem access should remain disabled. | Add explicit extension security acceptance: restricted, virtual, unsupported scheme, and untrusted contexts must not spawn the server, write workspace-folder settings, or propagate flavor state; user-visible selector state must degrade safely. | [[docs/plans/phase-E15-markdown-flavor-selector-settings]], [[docs/plans/phase-E16-flavor-scoped-contributions-marketplace]], [[docs/plans/phase-E17-extension-flavor-host-verification]], `extension/docs/tests/**` |
| AUD-SEC-007 | Medium | Validation evidence privacy | Flavor validation plans require host logs, package-target logs, research trace, and validation evidence files. | Specs do not state that evidence must redact user paths, document text, frontmatter values, config contents, environment variables, or server stderr containing vault content. | Committed validation artifacts can leak local usernames, private vault paths, note content, API-like strings, or workspace configuration. | Add validation-evidence redaction requirements and update root/extension validation specs and closeout chores to require sanitized logs/artifacts. | [[docs/test/markdown-flavor-validation-spec]], [[extension/docs/tests/markdown-flavor-validation-spec]], Phase 21 and E17 plans/chores |

## Summary

The current plans already recognize several important boundaries: no custom
Markdown language mode, resource-specific flavor state, host/conversion
classification, and restricted/virtual extension contexts. The remaining
security risk is mostly traceability: new flavor work can add parser,
configuration, protocol, rename, and evidence surfaces without explicitly
inheriting Phase 18 security gates.

## Verification

This audit report is documentation-only. Run:

```bash
bun run lint:docs
```

before committing.

---
title: "Phase E14: Membership Refresh And Compatibility Guardrails"
phase: E14
status: in-progress
tags: [plans, vscode, extension, language-mode, compatibility]
aliases: [Phase E14, Membership Refresh, Compatibility Guardrails]
updated: 2026-05-07
---

# Phase E14: Membership Refresh And Compatibility Guardrails

| Field | Value |
|---|---|
| Phase | E14 |
| Title | Membership Refresh And Compatibility Guardrails |
| Status | in-progress |
| Gate | Language-mode refresh and packaged client/server compatibility checks pass |
| Depends on | Phase E13 |

## Objective

Harden long-running VS Code sessions and platform packages. Documents should
enter and leave `ofmarkdown` mode as vault membership changes, and packaged
VSIXs should clearly match the bundled server target and version.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/functional/vscode-extension-parity#Extension.LanguageMode.MembershipRefresh]] | Refresh membership after server and workspace events |
| [[requirements/functional/vscode-extension-parity#Extension.Workspace.EnvironmentModes]] | Keep remote and local membership behavior consistent |
| [[requirements/functional/vscode-extension-parity#Extension.Packaging.TargetBinaryValidation]] | Validate packaged target contents |

## Scope

### In Scope

- Refresh language membership after server `ready`.
- Refresh after rebuild-index completion.
- Refresh after workspace folder changes.
- Refresh after visible editor changes and file-open events.
- Revert `ofmarkdown` to `markdown` only when both server and marker checks say
  the file is outside a vault.
- Query or expose server version and target metadata.
- Warn on client/server version mismatch.
- Validate each platform VSIX contains exactly one matching server binary.

### Out of Scope

- Server protocol redesign.
- Multi-root server session isolation.
- Automatic extension update management.

## Acceptance

- Every membership trigger produces the expected language assignment.
- Manual non-Markdown language choices are preserved.
- Version and target mismatches are visible before publish or at startup.
- Packaged VSIX smoke checks catch missing or wrong server binaries.

## Gate Verification

```bash
cd extension
npm run check-types
npm test
npm run build:extension
```

```bash
bun run build:binary
```

## Related

- [[features/ofmarkdown-language-mode]]
- [[features/vscode-extension-parity]]
- [[ADR015-platform-specific-vsix]]

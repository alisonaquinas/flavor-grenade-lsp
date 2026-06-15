---
id: "FEAT-061"
title: "Markdown Flavor Config Files Implementation"
type: feature
status: active
priority: high
phase: 35
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["FEAT-043", "FEAT-045"]
tags: [tickets/feature, "phase/35", markdown-flavor, configuration]
aliases: ["FEAT-061"]
---

# Markdown Flavor Config Files Implementation

> [!INFO] FEAT-061 - Feature - Phase 35 - Status: active

## Description

Implement `.mdfignore` and `.mdfattributes` as the authoritative file/directory
configuration model for Markdown flavor behavior. `.mdfignore` controls
Flavor Grenade visibility. `.mdfattributes` controls file and directory flavor
attributes. Auto Detect remains an independent resolver that runs when config
resolution requests it.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-355]] | Implement `.mdfignore` and `.mdfattributes` parser/resolver | Task | green |
| [[TASK-356]] | Apply `.mdfignore` visibility to vault indexing and LSP surfaces | Task | green |
| [[TASK-357]] | Refactor effective flavor resolution around config outcome and Auto Detect | Task | green |
| [[TASK-358]] | Remove legacy file and directory flavor assignment paths | Task | green |
| [[TASK-359]] | Implement extension scope prompt and `.mdfattributes` writes | Task | green |
| [[TASK-360]] | Add end-to-end config-file acceptance coverage | Task | green |
| [[CHORE-146]] | Phase 35 trace and matrix sweep | Chore | open |
| [[CHORE-147]] | Phase 35 security and confinement sweep | Chore | open |
| [[CHORE-148]] | Phase 35 verification and closeout sweep | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.AutoDetection | [[docs/requirements/functional/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.OverridePersistence | [[docs/requirements/functional/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[docs/requirements/functional/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.Refresh | [[docs/requirements/functional/vscode-extension-parity]] |
| FlavorLSP.Parser.ProfileDispatch | [[docs/requirements/functional/markdown-flavor-lsp]] |
| Security.Input.ProjectConfigSafety | [[docs/requirements/technical/security-input-validation]] |
| Security.Vault.ProjectConfigConfinement | [[docs/requirements/functional/security-vault-confinement]] |

## Definition of Done

- [x] `.mdfignore` excludes matching files from all Flavor Grenade indexing and
      LSP behavior.
- [x] `.mdfattributes` resolves visible files through Git-style pattern cascade.
- [x] Auto Detect is preserved as an independent resolver.
- [x] Legacy file/directory flavor assignment paths no longer affect effective
      flavor.
- [x] Extension selector writes `.mdfattributes` through a second scope prompt.
- [x] Unit, integration, BDD, docs, extension compile, and extension unit gates
      pass.

## Workflow Log

> [!NOTE] ACTIVE - 2026-05-29
> Phase implementation started on `feature/mdf-config-implementation`. Initial
> state:
> Parser/resolver, scanner visibility, `.mdfattributes` parse-context wiring,
> and config-marker replacement have passing focused tests. Remaining slices at
> that point:
> ignored-open-document inactivity, watcher refresh, legacy assignment removal,
> extension `.mdfattributes` writes, and end-to-end acceptance coverage.

> [!INFO] Drafted - 2026-05-29
> Status set to `draft`. Feature ticket created to document implementation plan
> before code changes.

> [!SUCCESS] GREEN - 2026-05-29
> Phase implementation is green on `feature/mdf-config-implementation`.
> `.mdfignore` visibility, `.mdfattributes` cascades, Auto Detect independence,
> legacy flavor assignment removal, extension scope writes, integration
> refresh, BDD acceptance, and extension unit/type gates all have direct
> evidence in the linked task tickets.

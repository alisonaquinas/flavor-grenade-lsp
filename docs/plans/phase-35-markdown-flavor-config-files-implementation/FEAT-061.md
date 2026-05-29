---
id: "FEAT-061"
title: "Markdown Flavor Config Files Implementation"
type: feature
status: draft
priority: high
phase: 35
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["FEAT-043", "FEAT-045"]
tags: [tickets/feature, "phase/35", markdown-flavor, configuration]
aliases: ["FEAT-061"]
---

# Markdown Flavor Config Files Implementation

> [!INFO] FEAT-061 - Feature - Phase 35 - Status: draft

## Description

Implement `.fgignore` and `.fgattributes` as the authoritative file/directory
configuration model for Markdown flavor behavior. `.fgignore` controls
Flavor Grenade visibility. `.fgattributes` controls file and directory flavor
attributes. Auto Detect remains an independent resolver that runs when config
resolution requests it.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-355]] | Implement `.fgignore` and `.fgattributes` parser/resolver | Task | open |
| [[TASK-356]] | Apply `.fgignore` visibility to vault indexing and LSP surfaces | Task | open |
| [[TASK-357]] | Refactor effective flavor resolution around config outcome and Auto Detect | Task | open |
| [[TASK-358]] | Remove legacy file and directory flavor assignment paths | Task | open |
| [[TASK-359]] | Implement extension scope prompt and `.fgattributes` writes | Task | open |
| [[TASK-360]] | Add end-to-end config-file acceptance coverage | Task | open |
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

- [ ] `.fgignore` excludes matching files from all Flavor Grenade indexing and
      LSP behavior.
- [ ] `.fgattributes` resolves visible files through Git-style pattern cascade.
- [ ] Auto Detect is preserved as an independent resolver.
- [ ] Legacy file/directory flavor assignment paths no longer affect effective
      flavor.
- [ ] Extension selector writes `.fgattributes` through a second scope prompt.
- [ ] Unit, integration, BDD, docs, extension compile, and extension unit gates
      pass.

## Workflow Log

> [!INFO] Drafted - 2026-05-29
> Status set to `draft`. Feature ticket created to document implementation plan
> before code changes.

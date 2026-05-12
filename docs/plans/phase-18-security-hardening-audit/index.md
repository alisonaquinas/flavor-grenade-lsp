---
title: Phase 18 Security Hardening Audit Tickets
phase: 18
status: planned
tags: [plans, tickets, security]
aliases: [Phase 18 Tickets]
updated: 2026-05-08
---

# Phase 18 Security Hardening Audit Tickets

## Feature

| Ticket | Title | Status |
|---|---|---|
| [[plans/phase-18-security-hardening-audit/FEAT-033]] | Security hardening audit closure | in-review |

## Security Findings

| Ticket | Title | Requirement |
|---|---|---|
| [[plans/phase-18-security-hardening-audit/BUG-016]] | Reject non-file LSP URIs before path handling | `Security.Vault.URISchemeAllowlist` |
| [[plans/phase-18-security-hardening-audit/BUG-017]] | Enforce frontmatter YAML size and alias limits | `Security.Parser.YAMLLimits` |
| [[plans/phase-18-security-hardening-audit/BUG-018]] | Bound parser runtime and ReDoS exposure | `Security.Parser.ParseTimeout`, `Security.Parser.ReDoS` |
| [[plans/phase-18-security-hardening-audit/BUG-019]] | Enforce vault scan file-count limits | `Security.Parser.VaultFileLimit` |
| [[plans/phase-18-security-hardening-audit/BUG-020]] | Prove and enforce symlink realpath confinement | `Security.Vault.SymlinkConfinement` |
| [[plans/phase-18-security-hardening-audit/BUG-021]] | Reject prototype-polluting JSON-RPC payloads | `Security.Input.PrototypePollution` |
| [[plans/phase-18-security-hardening-audit/BUG-022]] | Pin dependency specifiers and add range lint | `Security.Supply.ExactPinning` |
| [[plans/phase-18-security-hardening-audit/BUG-023]] | Keep adversarial parser safety test inside budget | `Security.Parser.ParseTimeout`, `Security.Parser.ReDoS` |
| [[plans/phase-18-security-hardening-audit/BUG-024]] | Restore spawned LSP integration test responses | `CICD.Workflow.PRGate`, `Security.Input.PayloadSize` |
| [[plans/phase-18-security-hardening-audit/BUG-025]] | Block command-start server spawn in unsupported extension environments | `Extension.Workspace.EnvironmentModes` |
| [[plans/phase-18-security-hardening-audit/BUG-033]] | Restore full BDD suite execution | `CICD.Workflow.PRGate` |
| [[plans/phase-18-security-hardening-audit/BUG-034]] | Code action BDD command execution is unimplemented | `CICD.Workflow.PRGate` |
| [[plans/phase-18-security-hardening-audit/BUG-035]] | Tag reference BDD includes nested tag occurrence | `Navigation.References.Completeness` |
| [[plans/phase-18-security-hardening-audit/BUG-036]] | OFMarkdown parity BDD step coverage is incomplete | `CICD.Workflow.PRGate` |
| [[plans/phase-18-security-hardening-audit/BUG-037]] | VS Code extension BDD harness has ambiguous and missing steps | `Extension.Tests.HostCoverage` |
| [[plans/phase-18-security-hardening-audit/BUG-038]] | Vault detection BDD scope assertion is too strict | `CICD.Workflow.PRGate` |

## Chores

| Ticket | Title | Status |
|---|---|---|
| [[plans/phase-18-security-hardening-audit/CHORE-086]] | Security audit verification sweep | in-review |
| [[plans/phase-18-security-hardening-audit/CHORE-102]] | Backfill BDD gate requirements and specs | open |

## Verification Tasks

| Ticket | Title | Status |
|---|---|---|
| [[plans/phase-18-security-hardening-audit/TASK-280]] | Implement BDD harness coverage for default gate | done |
| [[plans/phase-18-security-hardening-audit/TASK-281]] | Move BDD step source notes out of docs | done |

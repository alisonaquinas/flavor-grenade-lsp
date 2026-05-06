---
title: "Phase 15: Attachment Intelligence"
phase: 15
status: planned
tags: [plans, attachments, embeds, markdown-images, hover, diagnostics]
aliases: [Phase 15, Attachment Intelligence]
updated: 2026-05-06
---

# Phase 15: Attachment Intelligence

| Field | Value |
|---|---|
| Phase | 15 |
| Title | Attachment Intelligence |
| Status | planned |
| Gate | Attachments referenced by embeds and Markdown image links support completion, diagnostics, definition, and hover metadata |
| Depends on | Phase 14 |

## Objective

Make non-Markdown vault assets first-class targets for OFMarkdown embeds and
standard Markdown image links.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/functional/ofmarkdown-parity#Parity.Attachments.Intelligence]] | Completion, diagnostics, definition, and hover metadata for vault attachments |
| [[requirements/functional/ofmarkdown-parity#Parity.Attachments.IndexCoverage]] | Index non-Markdown vault files as attachment targets without parsed OFM documents |
| [[requirements/functional/ofmarkdown-parity#Parity.Attachments.Completion]] | Complete attachment paths in embeds and Markdown image links |
| [[requirements/functional/ofmarkdown-parity#Parity.Attachments.Diagnostics]] | Diagnose missing attachments and suppress diagnostics for existing attachments |
| [[requirements/functional/ofmarkdown-parity#Parity.Attachments.NavigationHover]] | Provide definition and lightweight metadata hover for attachment references |
| [[requirements/functional/ofmarkdown-parity#Parity.Attachments.ConfigHints]] | Respect configured attachment folder hints without hiding valid attachments |
| [[requirements/embed-resolution#Embed.Resolution.ImageTarget]] | Preserve and extend existing image embed resolution behavior |
| [[requirements/embed-resolution#Embed.Resolution.MarkdownTarget]] | Ensure Markdown documents and attachments remain distinct target classes |
| [[requirements/diagnostics#Diagnostic.Severity.Embed]] | Keep attachment/embed diagnostics at the documented severity |
| [[requirements/navigation#Navigation.Definition.AllLinkTypes]] | Definition for embed and Markdown image attachment targets |
| [[requirements/hover#HV-002]] | Hover details for embedded targets |

## Scope

### In Scope

- Index non-Markdown vault files as attachment targets.
- Complete attachment paths in `![[...]]` and `![alt](...)` contexts.
- Diagnose broken attachment references.
- Go to definition from an attachment reference to the file URI.
- Hover attachment metadata: vault-relative path, file type, size, and image
  dimensions when available without blocking the editor.
- Respect configured attachment folder hints when available.

### Out of Scope

- Moving or copying attachments.
- Rewriting attachment paths during file moves.
- Preview rendering inside hover.
- PDF page counting if it requires heavyweight parsing.

## Workstreams

| Workstream | Deliverable |
|---|---|
| Vault index | Attachment entries for non-Markdown files under each VaultFolder |
| Completion | Attachment completion provider for embed and Markdown image contexts |
| Diagnostics | Broken attachment diagnostics for embeds and Markdown image links |
| Navigation | Definition targets for attachment refs |
| Hover | Lightweight metadata hover for attachments |
| Config | Attachment folder preference discovery or FlavorConfig key |

## Acceptance

- Relevant attachment scenarios in `docs/bdd/features/ofmarkdown-parity.feature`
  pass.
- Existing embed resolution scenarios remain green.
- Missing attachment references produce diagnostics; existing attachment
  references do not.
- Attachment indexing does not add parsed OFMDoc entries for non-Markdown files.

## Risks

| Risk | Mitigation |
|---|---|
| Large binary scans slow indexing | Store cheap metadata only; defer expensive metadata |
| Non-Markdown files pollute note completions | Keep attachment completion separate from document completion |
| Remote files or virtual workspaces lack metadata | Use file existence and extension as minimum viable metadata |

## Related

- [[features/ofmarkdown-parity-roadmap]]
- [[requirements/functional/ofmarkdown-parity]]
- [[requirements/embed-resolution]]

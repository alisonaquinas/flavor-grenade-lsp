---
title: "Phase 16: Vault File Operation Refactors"
phase: 16
status: complete
tags: [plans, file-operations, rename, workspace-edit, vault-confinement]
aliases: [Phase 16, File Operation Refactors]
updated: 2026-05-06
---

# Phase 16: Vault File Operation Refactors

| Field | Value |
|---|---|
| Phase | 16 |
| Title | Vault File Operation Refactors |
| Status | complete |
| Gate | File and folder moves update all local reference forms through one vault-confined WorkspaceEdit |
| Depends on | Phase 15 |

## Objective

Make vault reorganization safe by updating every local reference to moved notes
and attachments before the editor applies file or folder moves.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.AtomicRefactor]] | Atomic file/folder move WorkspaceEdit across all local reference forms |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.CapabilityRegistration]] | Advertise and handle file-operation rename requests for supporting clients |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.MovePlannerConfinement]] | Plan old/new file and folder mappings only inside one vault root |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.ReferenceRewrite]] | Rewrite moved-target references while preserving syntax family and link details |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.SkippedAmbiguousReporting]] | Report ambiguous references that cannot be safely rewritten |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.AtomicValidation]] | Validate deterministic, non-overlapping, all-or-nothing WorkspaceEdit output |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.IndexRefresh]] | Refresh affected index and diagnostics state after `didRenameFiles` |
| [[docs/requirements/rename#Rename.Refactoring.Completeness]] | Preserve rename completeness for existing wiki-link and heading references |
| [[docs/requirements/rename#Rename.StyleBinding.Consistency]] | Preserve configured link style where wiki-link text is rewritten |
| [[docs/requirements/security/vault-confinement#Security.Vault.PathConfinement]] | Canonicalize and vault-root-check all old and new paths |
| [[docs/requirements/security/vault-confinement#Security.Vault.RenameConfinement]] | Cancel rename/move edits that escape the vault root |
| [[docs/requirements/wiki-link-resolution#Link.Wiki.StyleBinding]] | Keep wiki-link output consistent with active style |

## Scope

### In Scope

- Implement `workspace/willRenameFiles` for file rename, file move, and folder
  move events.
- Update wiki-links, embeds, Markdown inline links, reference definitions, and
  Markdown image links that resolve to moved targets.
- Preserve headings, block fragments, display aliases, and Markdown title text.
- Report references skipped because ambiguity prevents a safe rewrite.
- Reject the entire WorkspaceEdit when any source or target escapes the vault
  root.
- Refresh VaultIndex and diagnostics after `workspace/didRenameFiles`.

### Out of Scope

- Direct server-side file writes.
- Cross-vault moves.
- Manual conflict-resolution UI.
- Git move detection outside LSP file operation notifications.

## Workstreams

| Workstream | Deliverable |
|---|---|
| File operation handler | `workspace/willRenameFiles` request handler and capability registration |
| Move planner | Vault-confined old/new VaultPath mapping for files and folders |
| Reference rewriter | Syntax-preserving updates and skipped-reference reports for all local reference forms |
| Edit validator | Overlap detection and all-or-nothing WorkspaceEdit validation |
| Index refresh | `didRenameFiles` index update and diagnostics refresh |
| Regression suite | Move tests for wiki-links, embeds, Markdown links, reference defs, image links |

## Acceptance

- File move scenarios in `docs/bdd/features/ofmarkdown-parity.feature` pass.
- Escaping paths are refused before any edit is returned.
- Applying the returned WorkspaceEdit leaves no broken references to moved
  targets.
- Ambiguous references that cannot be safely rewritten are reported and never
  rewritten speculatively.
- Existing heading and file rename behavior remains green.

## Risks

| Risk | Mitigation |
|---|---|
| Folder moves generate overlapping edits | Build and validate the full edit graph before returning |
| Some clients only send `didRenameFiles` | Use `didRenameFiles` for index refresh and diagnostics, not pre-edit refactoring |
| Markdown and wiki-link path styles diverge | Preserve syntax family and use existing style-binding helpers |

## Related

- [[ADR018-vault-file-operation-refactoring]]
- [[docs/requirements/functional/ofmarkdown-parity]]
- [[docs/requirements/security/vault-confinement]]
- [[docs/features/rename]]

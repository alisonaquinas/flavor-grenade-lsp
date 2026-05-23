---
adr: "018"
title: Vault file operations update all local OFM references atomically
status: accepted
date: 2026-05-06
tags: [adr, ADR018, rename, file-operations, vault-confinement]
aliases: [ADR018, file operation refactoring, vault move refactoring]
---

# ADR 018 - Vault file operations update all local OFM references atomically

## Context

Flavor Grenade already supports rename for headings and file stems. Marksman
parity research identified broader file operation refactoring as a P1 gap:
moving files or folders should update wiki-links, embeds, Markdown inline
links, reference definitions, and attachment links without leaving broken
references.

File operations are higher risk than ordinary text edits because they can touch
many files and can be triggered by editor file explorers, command palette
actions, or external file-system changes. They must also respect ADR013 vault
root confinement.

## Decision

Vault file operations are handled as atomic workspace edits whenever the LSP
client provides pre-operation notifications such as `workspace/willRenameFiles`.

The file-operation refactorer:

- accepts file rename, file move, and folder move events
- computes old and new VaultPath values inside the same VaultFolder
- updates every local reference form that resolves to the moved target
- preserves link style and syntax family where possible
- refuses the entire edit when any target escapes the vault root
- reports skipped references when ambiguity prevents a safe rewrite

The server does not physically move files. The editor or file manager remains
responsible for the file operation; Flavor Grenade only returns the reference
updates that should accompany it.

## Consequences

**Positive:**

- Vault restructuring becomes safer.
- Wiki-links, embeds, Markdown links, and attachment references share one move
  policy.
- Path confinement remains centralized and auditable.

**Negative:**

- Batch folder moves require careful edit ordering and conflict detection.
- Some clients may only send `didRenameFiles` after the fact; those clients can
  receive diagnostics but not pre-apply refactor edits.
- Atomicity depends on the client honoring the returned WorkspaceEdit.

## Rejected Options

### Update only wiki-links on file moves

Rejected because mixed-link vaults would still break.

### Rewrite files directly from the server

Rejected because LSP clients already own workspace edit application and user
preview. Direct writes would bypass editor undo and review flows.

## Cross-References

- [[ADR013-vault-root-confinement]]
- [[ADR017-standard-markdown-link-intelligence]]
- [[docs/features/ofmarkdown-parity-roadmap]]
- [[docs/requirements/functional/ofmarkdown-parity]]
- [[docs/features/rename]]

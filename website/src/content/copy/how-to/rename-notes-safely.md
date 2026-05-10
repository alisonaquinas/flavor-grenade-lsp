---
title: "Rename Notes Safely | Flavor Grenade LSP"
description: "Rename notes and headings while preserving supported local references inside a vault."
h1: "Rename Notes Safely"
summary: "Rename notes and headings while preserving local references."
related: ["conceptRenameSafety","howToFixBrokenLinks","advancedUriConfinement"]
---

# Rename Notes Safely

Rename notes and headings while preserving local references.

## When to use it

Use this page when you want to rename a note or heading and keep supported wiki links, Markdown links, and anchors aligned.

Use rename when you want a semantic edit rather than a search-and-replace. The server should update references it can resolve and skip references that would require guessing.

## Steps

Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.

Start from a target that navigation can already resolve, then inspect the WorkspaceEdit before applying it. For heading rename, include one inbound `[[Note#Heading]]` link so you can see the reference update.

### Start from a resolved target

Use rename on a note or heading the server can resolve from the current vault index.

### Review the workspace edit

Confirm edits stay inside the vault and affect the references you expect.

### Check references after rename

Run references or navigation again to confirm inbound links point at the renamed target.

```text
Before: [[Project Plan#Risks]]
After:  [[Project Plan#Risk Log]]
```

## Expected result

The rename updates supported local references without changing external URLs or files outside the vault.

A safe rename updates the target and its supported inbound references while leaving external links, unrelated headings, and outside-vault files untouched. The result should still pass references and diagnostics checks.

## Common failure mode

Ambiguous links may be skipped so the server does not guess and damage unrelated references.

If rename skips a link, it may be ambiguous, unsupported, or outside the vault boundary. Treat skipped edits as protection rather than failure until you confirm the link should have been resolvable.

---
title: "Rename Notes Safely | Flavor Grenade LSP"
description: "Rename notes and headings while preserving supported local references inside a vault."
h1: "Rename Notes Safely"
summary: "Rename a note or heading while keeping the local links that point to it aligned."
related: ["conceptRenameSafety","howToFixBrokenLinks","advancedUriConfinement"]
---

# Rename Notes Safely

Rename a note or heading while keeping the local links that point to it aligned.

## When to use it

Use this page when a note or heading needs a better name and you want the links that point to it to move with the change.

Use rename instead of search-and-replace when identity matters. Flavor Grenade updates references it can understand and skips the ones where guessing would be unsafe.

## Steps

Work in a vault folder so rename can inspect the nearby notes before planning edits.

Start from a target navigation can already find. For a heading rename, include one inbound `[[Note#Heading]]` link so you can see the update before accepting it.

### Start from a resolved target

Use rename on a note or heading Flavor Grenade can already find.

### Review the workspace edit

Confirm the proposed edits stay inside the vault and touch the references you expect.

### Check references after rename

Run references or navigation again to make sure the old links now point to the renamed target.

```text
Before: [[Project Plan#Risks]]
After:  [[Project Plan#Risk Log]]
```

## Expected result

The rename updates supported local references without changing external URLs, examples, or files outside the vault.

Afterward, references and diagnostics should still agree about the target.

## Common failure mode

Ambiguous links may be skipped. That is usually a safety choice, not a failure.

If you expected a link to change, check whether it was ambiguous, unsupported, or outside the vault boundary before editing it by hand.

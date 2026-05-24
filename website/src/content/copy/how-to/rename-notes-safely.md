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

Use this page when a note, heading, or local file target needs a better name and you want supported references to move with the change.

Use rename instead of search-and-replace when identity matters. Flavor Grenade plans workspace edits from resolved vault targets, so it can update wiki links, heading anchors, Markdown links, Markdown images, embeds, and supported attachment references without treating unrelated text as a link.

Use file rename planning when the file itself is moving or changing names. Use symbol rename when the target is a Markdown symbol such as a heading. In both cases, the important rule is the same: only accept a plan that stays inside the vault and matches the references you expect.

## Steps

Work in a vault folder so rename can inspect the nearby notes before planning edits.

Start from a target navigation can already find. For a heading rename, include one inbound `[[Note#Heading]]` or Markdown heading link so you can see the update before accepting it.

### Start from a resolved target

Use rename on a note, heading, or local file target Flavor Grenade can already find. Go to definition, hovers, document links, and references are good checks before you rename because they show whether the target resolves the way you think it does.

### Review the workspace edit

Confirm the proposed edits stay inside the vault and touch the references you expect. A safe rename plan should not rewrite external URLs, unsupported URI schemes, examples inside opaque regions, or files outside the vault root.

### Include Markdown links and images

Check for both Obsidian-style and Markdown-style references in the preview.

```text
[[Project Plan]]
[Project plan](Project Plan.md)
![diagram](assets/diagram.png)
![[assets/diagram.png]]
```

### Check references after rename

Run references or navigation again to make sure the old links now point to the renamed target.

```text
Before: [[Project Plan#Risks]]
After:  [[Project Plan#Risk Log]]
```

## Expected result

The rename updates supported local references without changing external URLs, examples, generated regions, or files outside the vault.

Afterward, references, diagnostics, hovers, document links, code lens, and navigation should still agree about the target. The old spelling should no longer produce broken-link diagnostics unless another note still contains an unsupported or ambiguous reference that could not be updated safely.

## Common failure mode

Ambiguous links may be skipped. That is usually a safety choice, not a failure.

If you expected a link to change, check whether it was ambiguous, unsupported, outside the vault boundary, or inside an opaque region before editing it by hand. Also check whether the reference uses a Markdown destination that points somewhere different after path normalization.

Do not use global text replacement to force missed edits unless you have reviewed the results. Plain text replacement can change examples, external URLs, or unrelated prose that the language server intentionally left alone.

---
title: "Unsupported URI Schemes and Confinement | Flavor Grenade LSP"
description: "See how local vault targets are separated from external URLs, schemes, and outside paths."
h1: "Unsupported URI Schemes and Confinement"
summary: "Flavor Grenade keeps local vault edits separate from web links, app links, and paths outside the vault."
related: ["conceptWikiLinkResolution","conceptRenameSafety","howToFixBrokenLinks"]
---

# Unsupported URI Schemes and Confinement

Flavor Grenade keeps local vault edits separate from web links, app links, and paths outside the vault.

## Unsupported URI schemes

External URLs, `mailto:`, custom schemes, and paths outside the vault may be valid links, but they are not editable vault targets.

Flavor Grenade classifies them before planning diagnostics, navigation, code actions, or rename edits. A web URL is not a missing note, and it should not become part of a local vault edit.

```text
[[Project Plan]]
![Diagram](images/diagram.png)
https://example.com
mailto:team@example.com
obsidian://open?vault=Work&file=Project
../outside-vault.md
```

## Vault confinement

Rename and code actions stay inside the detected vault root. Direct clients must also use `file://` roots; non-file root URIs are outside the local indexing model.

That rule protects neighboring repositories, parent folders, and operating-system paths from accidental edits. If a target would resolve outside the vault or through an unsupported URI scheme, the safer behavior is to leave it alone.

## Diagnostic behavior

Unsupported URI schemes are ignored instead of reported as missing local notes. They may still be valid Markdown or valid app links; they are just not local file targets that Flavor Grenade can resolve and edit.

This keeps diagnostics meaningful. A warning should tell the user to fix a local vault relationship, not complain that an external protocol is not a Markdown file.

## Practical check

Test confinement with five links in one note: a wiki link, a local image, an external URL, a custom app URI, and a path that escapes the vault. The first two may be vault-local targets; the others should not become rename or code-action edits.

Avoid saying unsupported targets are invalid Markdown. They may be perfectly valid; they are just outside the set of targets Flavor Grenade can safely resolve and edit.

This matters most for rename and code actions. A tool that edits beyond the vault can damage neighboring repositories, generated files, or machine-specific paths. Confinement keeps Flavor Grenade helpful inside the vault while refusing to make claims about places it should not touch.

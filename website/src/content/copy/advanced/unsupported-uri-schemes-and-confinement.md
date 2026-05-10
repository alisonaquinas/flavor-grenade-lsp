---
title: "Unsupported URI Schemes and Confinement | Flavor Grenade LSP"
description: "See how local vault targets are separated from external URLs, schemes, and outside paths."
h1: "Unsupported URI Schemes and Confinement"
summary: "See how local vault targets are separated from external URLs, schemes, and outside paths."
related: ["conceptWikiLinkResolution","conceptRenameSafety","howToFixBrokenLinks"]
---

# Unsupported URI Schemes and Confinement

See how local vault targets are separated from external URLs, schemes, and outside paths.

## Unsupported URI schemes

External URLs, `mailto:`, custom schemes, and paths outside the vault are not editable vault targets.

The resolver must classify these before diagnostics or rename planning. A web URL can be valid Markdown, but it is not a missing note and should not become part of a vault-confined edit.

```text
[[Project Plan]]
https://example.com
mailto:team@example.com
../outside-vault.md
```

## Vault confinement

Rename and code actions should stay inside the detected vault root.

That rule protects adjacent repositories, parent folders, and operating-system paths from accidental edits. If a target would resolve outside the vault, the safer behavior is to leave it alone.

## Diagnostic behavior

Unsupported URI schemes are ignored instead of reported as missing local notes.

This keeps diagnostics meaningful. A diagnostic should tell the user to fix a local vault relationship, not complain that an external protocol is not a Markdown file.

## Practical check

Test confinement with four links in one note: a wiki link, a local image, an external URL, and a path that escapes the vault. The first two may be vault-local targets; the others should not become rename or code-action edits. The distinction is the article’s core safety promise.

The prose should avoid saying unsupported targets are invalid Markdown. They may be perfectly valid Markdown or application links; they are just outside the set of targets Flavor Grenade can safely resolve and edit. That wording keeps diagnostics honest and prevents users from interpreting silence as a parser failure or a promise to inspect the wider machine.

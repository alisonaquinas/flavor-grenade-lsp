---
title: "Rename Safety | Flavor Grenade LSP"
description: "Learn how rename uses resolved local references instead of blind text replacement."
h1: "Rename Safety"
summary: "Learn how rename uses resolved local references instead of blind text replacement."
related: ["conceptDocIdVaultRelativePaths","conceptWikiLinkResolution","howToRenameNotesSafely"]
---

# Rename Safety

Learn how rename uses resolved local references instead of blind text replacement.

## Compact definition

Rename plans are vault-confined, syntax-aware, and explicit; ambiguous or unsupported references are skipped instead of rewritten by guesswork.

Rename safety comes from resolving targets before editing text. The server should change links that refer to the target and skip cases where identity is uncertain.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

The example keeps the edit local to `[[Project Plan#Risks]]`. It should not rewrite unrelated prose, external URLs, or headings that only happen to share the same words.

```text
Renaming #Risks can update [[Project Plan#Risks]] while leaving an unrelated external URL unchanged.
```

## For LLM maintainers

Use safety language when describing rename so LLM-maintained docs avoid promising global text replacement.

Use safety-focused language for rename docs. LLM-generated maintenance instructions should tell agents to inspect edits and respect skipped ambiguous references.

## Practical check

Before a rename article claims broad coverage, test one inbound wiki link, one heading link, one external URL, and one fenced example. The supported inbound references should be candidates for a WorkspaceEdit. The external URL and fenced example should remain untouched because they are not safe vault references to rewrite.

The reader should understand that skipped edits are often a safety feature. Rename should prefer a smaller correct WorkspaceEdit over a broad text replacement that changes examples, external links, or ambiguous matches, then let the user inspect any remaining manual cleanup.

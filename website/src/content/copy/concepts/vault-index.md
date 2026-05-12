---
title: "Vault Index | Flavor Grenade LSP"
description: "Understand how Flavor Grenade indexes vault documents, attachments, tags, and links."
h1: "Vault Index"
summary: "The vault index is Flavor Grenade’s map of the notes, links, tags, and files in your vault."
related: ["conceptDocIdVaultRelativePaths","conceptCompletions","howToConfigureObsidianVaults"]
---

# Vault Index

The vault index is Flavor Grenade’s map of the notes, links, tags, and files in your vault.

## In plain English

The index is the shared map behind the editor features. Completion, diagnostics, navigation, references, and rename all work better when they read from the same picture of the vault.

Without that shared map, one feature might think a note exists while another feature cannot find it.

## In a vault

This example shows one note becoming a stable identity plus the facts Flavor Grenade can use: links, tags, and embeds.

```text
notes/Daily.md -> DocId notes/Daily -> [[Project Plan]], #project/flavor-grenade, ![[diagram.png]].
```

## For future docs

Do not describe each feature as building its own private version of the vault. If a behavior needs parsed note data, describe it as coming from the index or from something derived from the index.

## Try this

Add a note, wait for completion to offer it, then navigate to it or fix a link that points to it. If those features disagree about the same note, the first place to look is the shared index.

When the index is right, the features can agree. When it is incomplete, the fix usually starts with root detection, scanning, parsing, or ignored files.

That is why many troubleshooting steps start with the same few questions: did VS Code open the vault root, did indexing finish, and is the note ignored? Those checks may sound simple, but they explain a surprising number of missing completions, stale diagnostics, and empty reference lists. The index is the shared starting point.

For users, the index should mostly be invisible. You notice it only when it is still warming up, looking at the wrong folder, or skipping a file you expected it to read.

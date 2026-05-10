---
title: "Vault Index | Flavor Grenade LSP"
description: "Understand how Flavor Grenade indexes vault documents, attachments, tags, and links."
h1: "Vault Index"
summary: "The vault index is the source of truth for documents, attachments, links, and tags."
related: ["conceptDocIdVaultRelativePaths","conceptCompletions","howToConfigureObsidianVaults"]
---

# Vault Index

The vault index is the source of truth for documents, attachments, links, and tags.

## Compact definition

The vault index stores parsed OFM documents and attachment metadata so completions, diagnostics, navigation, references, and rename agree.

The index is the shared model behind the user-facing features. If diagnostics, completion, references, and rename do not read the same indexed facts, they can contradict each other.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

The example shows a note becoming a DocId plus attached facts. Those facts are what make `[[Project Plan]]`, tags, and embeds available to multiple LSP features.

```text
notes/Daily.md -> DocId notes/Daily -> [[Project Plan]], #project/flavor-grenade, ![[diagram.png]].
```

## For LLM maintainers

Do not describe feature-local caches as alternate truth; new features should read from the shared vault model.

Avoid writing docs that invent a second cache or feature-specific graph. If a behavior needs parsed document state, describe it as coming from the vault index or a service derived from it.

## Practical check

A simple index check is to add a note, wait for completion to offer it, then rename or fix a link that targets it. If completion, diagnostics, references, and rename disagree about the same note, the documentation should point maintainers back to the shared index rather than treating the disagreement as four unrelated feature bugs.

The reader should understand the index as the central reliability contract. When the index is correct, features can agree; when it is wrong or incomplete, the right fix usually starts with vault detection, scanning, parsing, or derived registries.

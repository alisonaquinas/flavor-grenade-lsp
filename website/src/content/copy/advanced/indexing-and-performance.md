---
title: "Indexing and Performance | Flavor Grenade LSP"
description: "Learn how scanning, parsing, ignore rules, watchers, and rebuilds affect vault features."
h1: "Indexing and Performance"
summary: "Learn how scanning, parsing, ignore rules, watchers, and rebuilds affect vault features."
related: ["conceptVaultIndex","advancedConfigurationModel","howToConfigureObsidianVaults"]
---

# Indexing and Performance

Learn how scanning, parsing, ignore rules, watchers, and rebuilds affect vault features.

## Index lifecycle

The index begins with a vault scan, stores parsed OFM documents, and refreshes as watched files change.

A healthy lifecycle is boring: scan the vault, parse documents, store facts, rebuild derived views, and let features read the same state. If a feature needs different data, add it to that path instead of creating a private interpretation.

```text
.obsidian/ root -> scan -> parse -> VaultIndex -> diagnostics/completions/references
```

## Large vaults

Use ignore rules for generated docs, exports, and vendor folders so user-authored notes stay fast and precise.

Large vaults often contain copied documentation, build output, and archives that should not drive completions. Keeping those folders out of the active graph improves both performance and trust in diagnostics.

## Performance boundary

The index is the source of truth; feature-local caches should not create a second document model.

This matters for maintainers because duplicate caches create subtle drift: completion may see one target while rename sees another. Prefer derived registries that can be rebuilt from the same indexed documents.

## Practical check

Use a small synthetic vault to explain lifecycle, then name the knobs that matter in a real vault: ignored folders, generated output, large archives, and file watching. Users do not need implementation internals before they understand that every feature depends on the same parsed document set.

For examples, prefer a before-and-after story: a generated docs folder pollutes completion, then an ignore rule removes it from the active graph. That makes performance guidance practical and reinforces the accuracy benefit of indexing only content that should participate in vault intelligence.

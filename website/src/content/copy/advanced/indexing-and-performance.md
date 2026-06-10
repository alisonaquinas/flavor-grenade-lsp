---
title: "Indexing and Performance | Flavor Grenade LSP"
description: "Learn how scanning, parsing, ignore rules, watchers, and rebuilds affect vault features."
h1: "Indexing and Performance"
summary: "Learn why the right indexed files make vault features faster and more trustworthy."
related: ["conceptVaultIndex","advancedConfigurationModel","howToConfigureObsidianVaults"]
---

# Indexing and Performance

Learn why the right indexed files make vault features faster and more trustworthy.

## Index lifecycle

Indexing starts by scanning the detected vault or project, reading Markdown files, resolving the effective Markdown flavor, and storing the facts Flavor Grenade needs later.

A healthy lifecycle should feel boring: scan, parse with the active flavor and structured profiles, store facts, refresh when files change, then let every feature read the same state.

```text
.obsidian/ or .mdfignore/.mdfattributes marker -> .mdfignore visibility -> scan visible files -> parse -> VaultIndex -> diagnostics/completions/references
```

## Large vaults

Use `.mdfignore` rules for generated docs, exports, and vendor folders so user-authored notes stay fast and precise. Generated website output and copied package documentation usually should not drive vault suggestions.

Large vaults often contain copied documentation, build output, or archives that should not drive completion. Keeping those folders out of the active index improves speed and makes diagnostics easier to trust.

## Performance boundary

The index is the shared source of truth; individual features should not invent a second private model of the vault, the active Markdown flavor, or the local path graph.

Duplicate models drift. That is how completion can see one target while rename sees another. Prefer data that can be rebuilt from the same indexed documents.

## Practical check

Use a small sample vault to explain the lifecycle, then name the real-world knobs: ignored folders, generated output, large archives, selected Markdown flavor, structured profiles, and file watching. Users do not need implementation internals before they understand that every feature depends on the same parsed document set.

For examples, use a before-and-after story: a generated docs folder pollutes completion, then `.mdfignore` removes it from the active index. That makes performance guidance practical.

Performance advice should stay tied to usefulness. The goal is not simply to index fewer files; it is to index the files that actually belong to the user’s vault. A smaller, cleaner index gives faster suggestions and fewer misleading warnings because Flavor Grenade is spending attention on the notes the user expects it to understand.

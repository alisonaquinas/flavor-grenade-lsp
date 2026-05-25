---
name: flavorgrenade-lsp
description: Flavor-aware Markdown analysis for LLM agents using Flavor Grenade LSP. Use when working with Markdown files where flavor detection, diagnostics, symbols, folds, hovers, completions, local references, structured changelog/MADR variants, or safe host-boundary handling matters.
---

# Flavor Grenade LSP

This source plugin embeds the canonical skill during packaging. In a release
artifact, this directory is replaced with the full
`skills/flavorgrenade-lsp/` tree, including wrappers, manifest, docs, examples,
and the runtime-specific embedded LSP executable.

Use:

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs analyze <path> --json
```

Do not parse Markdown flavor config yourself or execute document code.

# Flavor Grenade Analyze

Run:

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs analyze <path> --json
```

Run from the plugin root so `skills/flavorgrenade-lsp` resolves to the embedded
plugin-local skill.

Use this before broad Markdown edits. Cite wrapper `config`, `evidence`,
`diagnostics`, `symbols`, `folds`, `links`, and `boundaries` fields. Flavor
decisions may come from TOML, JSON, JSONC, YAML, `.editorconfig`, directory
overrides, LSP settings, or inference. Do not expose raw config values.

# Flavor Grenade Analyze

Run:

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs analyze <path> --json
```

Run from the plugin root so `skills/flavorgrenade-lsp` resolves to the embedded
plugin-local skill.

Use this before broad Markdown edits. Cite wrapper `config`, `evidence`,
`diagnostics`, `symbols`, `folds`, `links`, and `boundaries` fields.
`.mdfignore` can make files inactive; `.mdfattributes` can assign explicit
flavors and structured profiles; otherwise decisions may come from LSP settings
or inference. Do not expose raw config values.

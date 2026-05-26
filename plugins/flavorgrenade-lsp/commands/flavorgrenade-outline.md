# Flavor Grenade Outline

Run:

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs symbols <path> --json
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs folds <path> --json
```

Run from the plugin root so `skills/flavorgrenade-lsp` resolves to the embedded
plugin-local skill.

Use symbols and folds to build an outline. Do not execute document code or
renderer hooks while interpreting the result.

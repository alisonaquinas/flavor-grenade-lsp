# Flavor Grenade Detect

Run:

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs detect <path> --json
```

Run from the plugin root so `skills/flavorgrenade-lsp` resolves to the embedded
plugin-local skill.

Use this to explain a file's effective Markdown flavor and structured variants.
Run per target file when `.mdfignore` or cascading `.mdfattributes` files may
apply. Do not parse raw config as the source of truth.

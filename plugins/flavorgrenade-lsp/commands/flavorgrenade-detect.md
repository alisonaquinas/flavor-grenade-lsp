# Flavor Grenade Detect

Run:

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs detect <path> --json
```

Use this to explain a file's effective Markdown flavor and structured variants.
Run per target file when directory overrides or `.editorconfig` sections may
apply. Do not parse raw config as the source of truth.

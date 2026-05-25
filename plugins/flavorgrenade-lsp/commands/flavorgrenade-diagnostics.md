# Flavor Grenade Diagnostics

Run:

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs diagnostics <path> --json
```

Use this before edits that may change links, headings, changelogs, MADR
records, or flavor-specific syntax. Treat host and renderer references as
boundaries, not local files.

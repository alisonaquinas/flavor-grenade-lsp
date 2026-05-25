# Flavor Grenade Diagnostics

Run:

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs diagnostics <path> --json
```

Run from the plugin root so `skills/flavorgrenade-lsp` resolves to the embedded
plugin-local skill.

Use this before edits that may change links, headings, changelogs, MADR
records, or flavor-specific syntax. Treat host and renderer references as
boundaries, not local files.

# Flavor Grenade LSP Plugin

Plugin package around the portable `flavorgrenade-lsp` skill. Release
artifacts use the plugin-local `skills/flavorgrenade-lsp/` tree as the
canonical skill source and add the runtime-specific embedded LSP executable
during packaging.

The plugin adds curated commands, advisory hooks, specialist agent prompts, and
LSP metadata. The embedded skill remains the source of truth.

## Layout

```text
plugins/flavorgrenade-lsp/
├── .claude-plugin/
├── .codex-plugin/
├── skills/flavorgrenade-lsp/
├── commands/
├── agents/
├── hooks/
├── codex/
└── lsp/
```

Run plugin command examples from the plugin root. The relative
`skills/flavorgrenade-lsp/...` paths intentionally resolve to the embedded
plugin-local skill.

## Smoke Check

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs verify-install --json
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs detect README.md --json
```

# Flavor Grenade LSP Plugin

Plugin package around the portable `flavorgrenade-lsp` skill. Release
artifacts use the plugin-local `skills/flavorgrenade-lsp/` tree as the
canonical skill source and add the runtime-specific embedded LSP executable
during packaging.

The plugin adds curated commands, advisory hooks, specialist agent prompts, and
LSP metadata. The embedded skill remains the source of truth.

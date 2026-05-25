# Flavor Grenade LSP Plugin

Plugin package around the portable `flavorgrenade-lsp` skill. Release
artifacts copy the canonical skill from `skills/flavorgrenade-lsp/` into this
plugin under `skills/flavorgrenade-lsp/`, including the runtime-specific
embedded LSP executable.

The plugin adds curated commands, advisory hooks, specialist agent prompts, and
LSP metadata. The embedded skill remains the source of truth.

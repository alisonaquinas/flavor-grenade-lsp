# Extension Host Fixture Workspaces

These workspaces are copied to an isolated temp directory before each
`npm run test:host` run. Copying prevents the repository-level
`.flavor-grenade.toml` from making the generic Markdown fixture look like a
Flavor Grenade vault.

| Fixture | Marker | Expected behavior |
|---|---|---|
| `obsidian-vault/` | `.obsidian/` directory | Extension starts the LanguageClient and promotes Markdown notes to `ofmarkdown` |
| `flavor-config-vault/` | `.flavor-grenade.toml` file | Extension starts the LanguageClient and promotes Markdown notes to `ofmarkdown` |
| `smoketest/` | Per-flavor `.flavor-grenade.toml` files | Extension flavor evidence tests verify every supported Markdown flavor resolves from project config |
| `generic-markdown/` | none | Extension registers commands but leaves Markdown as `markdown` and keeps the LanguageClient idle |

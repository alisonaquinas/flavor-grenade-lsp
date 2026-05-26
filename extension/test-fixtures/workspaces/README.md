# Extension Host Fixture Workspaces

These workspaces are copied to an isolated temp directory before each
`npm run test:host` run. Copying prevents repository-level Flavor Grenade
project config markers from making the generic Markdown fixture look like a
Flavor Grenade vault.

| Fixture | Marker | Expected behavior |
|---|---|---|
| `obsidian-vault/` | `.obsidian/` directory | Extension starts the LanguageClient and keeps Markdown notes in `markdown` with Obsidian flavor evidence |
| `flavor-config-vault/` | Flavor Grenade project config file | Extension starts the LanguageClient and keeps Markdown notes in `markdown` with project flavor evidence |
| `smoketest/` | Per-flavor project config files | Extension flavor evidence tests verify every supported Markdown flavor resolves from project config |
| `generic-markdown/` | none | Extension registers commands but leaves Markdown as `markdown` and keeps the LanguageClient idle |

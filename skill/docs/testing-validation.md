# Testing And Validation

## Test Layers

| Layer | Purpose |
|---|---|
| Unit | Runtime resolver, manifest parser, path guard, schema normalization |
| Integration | Wrapper launches embedded LSP and completes LSP requests |
| Smoke | Packaged artifact works from an unpacked install |
| Agent compatibility | Claude Code and Codex install path fixtures work |
| Marketplace | Repository can be listed and installed as a skill source |
| Plugin | Claude and Codex plugin manifests, commands, hooks, agents, optional MCP metadata, and mandatory embedded-LSP metadata validate |
| Security | Hostile fixtures fail safely |
| Release | Artifacts, checksums, signatures, and compatibility matrix verify |

## Unit Test Requirements

Unit tests must cover:

- platform and architecture target mapping
- unsupported platform failure
- manifest schema validation
- `SKILL.md` frontmatter validation for `name` and `description`
- package version and manifest version alignment
- digest verification success and failure
- executable path resolution
- symlink escape rejection
- workspace path confinement
- unsupported scheme rejection
- config evidence redaction for TOML, JSON, JSONC, YAML, and `.editorconfig`
- directory override selector normalization and precedence: most-specific
  selector wins, and later entries win equal-specificity ties
- inherited global config keys are reported without raw values
- stable JSON envelope generation
- schema snapshot compatibility

## Integration Test Requirements

Integration tests must cover:

- `verify-install` launches the executable and completes `initialize`
- `analyze` returns flavor and symbols for CommonMark
- `detect` honors TOML configuration
- `detect` honors JSON configuration
- `detect` honors JSONC configuration
- `detect` honors YAML configuration
- `detect` honors Flavor Grenade directives in `.editorconfig`
- `detect` applies the most specific matching directory override and inherits
  omitted values from global project config
- `detect` reports safe config evidence without raw config values or absolute
  private paths
- `detect` treats sibling files in differently configured directories as
  distinct effective Markdown contexts
- `explain-flavor` reports invalid active project config with redacted errors
  and does not claim that a later project config file was used instead
- `detect` explains inference when config is absent
- `explain-flavor` returns ordered decision steps and rejected candidates
- root `README.md` does not default to OFM without evidence
- changelog files return structured variants
- MADR files return structured variants
- host references return boundaries
- completions return compact local candidates
- hover returns flavor and boundary metadata

## Smoke Fixture Matrix

| Fixture | Expected result |
|---|---|
| `explicit/commonmark` | base flavor from TOML |
| `explicit/gfm` | base flavor from TOML |
| `explicit/obsidian` | OFM behavior from TOML or vault marker |
| `explicit/json-gfm` | base flavor from JSON |
| `explicit/jsonc-pandoc` | base flavor from JSONC |
| `explicit/yaml-kramdown` | base flavor from YAML |
| `explicit/editorconfig-glfm` | base flavor from `.editorconfig` directives |
| `overrides/multi-directory` | different files resolve to different configured flavors from one config |
| `overrides/inherit-structured-profiles` | matched override inherits omitted global structured profiles |
| `overrides/glob-specificity` | most specific matching override wins |
| `overrides/equal-specificity-order` | later override wins equal-specificity ties |
| `overrides/editorconfig-section` | section directives apply only to matching files |
| `config/malformed-active` | invalid active config is redacted and project-config evidence is unavailable |
| `inferred/readme-generic` | not OFM by default |
| `inferred/github-repo` | GFM evidence when signatures exist |
| `variants/keep-a-changelog` | variant flag, unchanged base flavor |
| `variants/common-changelog` | variant flag, unchanged base flavor |
| `variants/madr` | variant flag, unchanged base flavor |
| `boundaries/github-issues` | host boundary |
| `boundaries/pandoc-conversion` | conversion boundary |
| `hostile/path-traversal` | rejected |
| `hostile/code-execution` | not executed |

## Agent Compatibility Tests

Claude Code fixture:

1. Install or copy skill into `.claude/skills/flavorgrenade-lsp`.
2. Confirm `SKILL.md` exists.
3. Run `verify-install`.
4. Run `detect` against fixtures.
5. Confirm command examples in `SKILL.md` are valid.

Codex fixture:

1. Install or copy skill into `.codex/skills/flavorgrenade-lsp`.
2. Confirm `SKILL.md` exists.
3. Run `verify-install`.
4. Run `analyze` against fixtures.
5. Confirm PowerShell-safe command examples are valid.

Marketplace fixture:

1. Run installer list command against a local checkout.
2. Confirm `flavorgrenade-lsp` is listed.
3. Install only that skill.
4. Confirm installed files match expected inventory.
5. Run `verify-install`.

Plugin fixture:

1. Validate `.claude-plugin/plugin.json`.
2. Validate `.codex-plugin/plugin.json`.
3. Confirm manifest names and versions match the skill manifest.
4. Confirm referenced skills, commands, agents, hooks, MCP files, and LSP files
   exist.
5. Confirm Codex metadata omits fields rejected by the selected Codex plugin
   validator.
6. Confirm every plugin artifact includes the target embedded LSP executable,
   runtime manifest, digest metadata, and LSP handshake verification report.
7. Confirm hooks are advisory, Markdown-scoped, and timeout-bound.
8. Confirm command prompts and agent prompts mention TOML, JSON, JSONC, YAML,
   `.editorconfig`, directory overrides, and config evidence handling.
9. Confirm plugin command and hook fixtures cover at least one non-TOML config
   file and one directory-scoped override.

## Release Validation

For every runtime artifact:

1. Unpack into a temporary directory.
2. Validate manifest.
3. Validate file inventory.
4. Validate executable digest.
5. Verify archive signature.
6. Verify executable signature when available.
7. Run `verify-install`.
8. Run one `detect` fixture.
9. Run one `analyze` fixture.
10. Confirm no unexpected files are present.

## CI Commands

Planned commands:

```bash
bun run skill:test
bun run skill:package -- --dry-run
bun run skill:verify -- --target current
bun run skill:marketplace:verify
bun run skill:plugin:verify
bun run skill:release:dry-run
```

These commands may be implemented as scripts, but their behavior is normative.

## Evidence

Each release must preserve:

- test output summary
- package file inventory
- checksum report
- signature verification report
- config fixture snapshot report for TOML, JSON, JSONC, YAML, `.editorconfig`,
  and directory overrides
- config evidence redaction report
- compatibility matrix
- installer compatibility result
- hostile fixture result
- release workflow URL

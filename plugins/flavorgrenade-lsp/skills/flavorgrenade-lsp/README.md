# Flavor Grenade LSP Skill

LLM-facing command wrappers for Flavor Grenade LSP. The skill embeds or is
packaged with one runtime-specific `flavor-grenade-lsp` executable and exposes
stable JSON commands for Markdown flavor analysis.

## Install Shape

```text
skills/flavorgrenade-lsp/
├── SKILL.md
├── manifest.json
├── wrappers/
├── docs/
├── examples/
└── bin/<target>/flavor-grenade-lsp[.exe]
```

This plugin-local source tree is the canonical skill. Release artifacts expose
it at the installable skill path and add the selected runtime target.

## Usage

```bash
node wrappers/flavorgrenade.mjs verify-install --json
node wrappers/flavorgrenade.mjs analyze <path> --json
node wrappers/flavorgrenade.mjs detect <path> --json
node wrappers/flavorgrenade.mjs diagnostics <path> --json
node wrappers/flavorgrenade.mjs symbols <path> --json
node wrappers/flavorgrenade.mjs folds <path> --json
node wrappers/flavorgrenade.mjs hover <path>:<line>:<character> --json
node wrappers/flavorgrenade.mjs completions <path>:<line>:<character> --json
node wrappers/flavorgrenade.mjs explain-flavor <path> --json
node wrappers/flavorgrenade.mjs variants <path> --json
node wrappers/flavorgrenade.mjs refs <path> --json
```

All commands default to JSON. Paths are confined to the selected workspace.
Position locators use LSP coordinates: zero-based `line` and zero-based
`character`.

Workspace commands that scan many files accept selection and safety limits:

```bash
node wrappers/flavorgrenade.mjs analyze docs --include "**/*.md" --exclude "private/**" --max-files 200 --max-bytes 262144 --json
```

- `--include <glob>`: include only matching Markdown paths; comma-separated
  selectors are allowed.
- `--exclude <glob>`: skip matching Markdown paths; comma-separated selectors
  are allowed.
- `--max-files <count>`: cap collected Markdown files. Default is `500`.
- `--max-bytes <bytes>`: skip Markdown files larger than this byte size.

Use `detect` before a flavor-sensitive edit to inspect the effective base
Markdown flavor, structured variants, config source, and inference evidence for
one file. Use `analyze` before broad rewrites so the agent can compare
diagnostics, symbols, folds, links, variants, and inferred flavor data across a
workspace or directory.

## Configuration

The embedded LSP remains authoritative. The wrapper reports config evidence but
does not invent flavor decisions. Supported project flavor config files are
`.fgignore` and `.fgattributes`.

`.fgignore` controls Flavor Grenade visibility. Matching Markdown files are
inactive, skipped by wrapper scans, and should not be edited with
flavor-sensitive assumptions unless a later negated rule re-includes them.

```gitignore
# .fgignore
drafts/
!drafts/keep.md
generated/**/*.md
```

`.fgattributes` controls explicit flavor and structured-profile attributes.
Rules cascade from the workspace root to the target file's directory. Later
matching rules override earlier rules. Negated selectors affect only matching
rules in the same `.fgattributes` file; `!flavor` clears the effective flavor
selected so far for matching files so Auto Detect can run unless a later
matching rule sets another flavor; `flavor=auto` explicitly requests Auto
Detect.

```gitattributes
# .fgattributes
*.md flavor=commonmark
docs/**/*.md flavor=gfm structured_profiles=madr
docs/private.md !flavor
CHANGELOG.md flavor=auto structured_profiles=keep-a-changelog
```

When these files do not exist or no concrete flavor applies, Auto Detect is the
default for the target directory and descendants. Legacy `.flavor-grenade.*`
files and `.editorconfig` directives are not flavor assignment sources.

## Safety

Wrappers do not download runtime binaries, execute Markdown code, run renderer
plugins, or fetch remote references. The JSON schema reserves `boundaries` for
future host and renderer boundary evidence; current wrapper output may return
empty boundary arrays.

## Maintenance

- [AGENTS.md](./AGENTS.md) defines local editing rules for this skill subtree.
- [CONCEPTS.md](./CONCEPTS.md) defines the skill-specific vocabulary.
- [docs/README.md](./docs/README.md) indexes the reference documents.
- [wrappers/README.md](./wrappers/README.md) explains the command wrapper code.
- [tests/README.md](./tests/README.md) explains the smoke-test coverage.

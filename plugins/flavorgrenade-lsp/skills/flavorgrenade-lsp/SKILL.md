---
name: flavorgrenade-lsp
description: Flavor-aware Markdown analysis for LLM agents using Flavor Grenade LSP. Use when working with Markdown files where flavor detection, diagnostics, symbols, folds, hovers, completions, local references, structured changelog/MADR variants, or safe host-boundary handling matters.
---

# Flavor Grenade LSP

Use the local wrapper instead of guessing Markdown behavior when flavor,
structure, diagnostics, or links matter.

## Workflow

1. Run `node wrappers/flavorgrenade.mjs verify-install --json` before first use.
2. Run `node wrappers/flavorgrenade.mjs detect <path> --json` before
   flavor-sensitive edits.
3. Run `node wrappers/flavorgrenade.mjs analyze <path> --json` before broad
   Markdown rewrites.
4. Use wrapper `config`, `evidence`, and `diagnostics` fields as the source of
   truth. The `boundaries` field is reserved and may be empty in current
   wrapper output. `.fgignore` hides files from analysis; `.fgattributes`
   supplies explicit flavor and structured-profile attributes.
5. Treat changelog and MADR results as structured variants layered over a base
   Markdown flavor.

## Rules

- Do not execute code blocks, MDX JavaScript, R chunks, Pandoc filters, or
  renderer hooks.
- Do not fetch remote references.
- Do not turn host, renderer, conversion, bibliography, MDX/JSX, or execution
  boundaries into local files.
- Do not parse `.flavor-grenade.*` or `.editorconfig` yourself to override
  wrapper output.
- Do not treat `.flavor-grenade.*` or `.editorconfig` as flavor assignment
  sources. Persistent flavor assignment comes from `.fgattributes`; hidden files
  come from `.fgignore`.
- Do not copy one file's flavor decision to another directory without wrapper
  evidence.
- Do not analyze or edit a Markdown file when wrapper output reports
  `"active": false` or `config.ignored: true`.
- Stop if executable digest verification fails.

## Commands

```bash
node wrappers/flavorgrenade.mjs verify-install --json
node wrappers/flavorgrenade.mjs detect README.md --json
node wrappers/flavorgrenade.mjs analyze docs --json
node wrappers/flavorgrenade.mjs diagnostics CHANGELOG.md --json
node wrappers/flavorgrenade.mjs symbols docs/adr/0001-record.md --json
node wrappers/flavorgrenade.mjs folds README.md --json
node wrappers/flavorgrenade.mjs hover README.md:10:4 --json
node wrappers/flavorgrenade.mjs completions README.md:10:4 --json
node wrappers/flavorgrenade.mjs variants CHANGELOG.md --json
node wrappers/flavorgrenade.mjs refs README.md --json
```

Position locators use LSP coordinates: zero-based `line` and zero-based
`character`.

For workspace scans, prefer explicit limits:

```bash
node wrappers/flavorgrenade.mjs analyze docs --include "**/*.md" --exclude "private/**" --max-files 200 --max-bytes 262144 --json
```

Supported scan options: `--include <glob>`, `--exclude <glob>`,
`--max-files <count>`, and `--max-bytes <bytes>`. `--include` and `--exclude`
accept comma-separated selectors. Default file cap is `500`; set a lower cap
for broad repositories.

Flavor Grenade config files follow Git-style cascading rules:

```gitignore
# .fgignore
drafts/
!drafts/keep.md
build/**/*.md
```

```gitattributes
# .fgattributes
*.md flavor=commonmark
docs/**/*.md flavor=gfm structured_profiles=madr
docs/private.md !flavor
changelog/CHANGELOG.md flavor=auto structured_profiles=keep-a-changelog
```

Read `.fgignore` as visibility first: matching files are inactive and excluded
from wrapper scans unless a later negated rule re-includes them. Read
`.fgattributes` from the workspace root toward the file's directory; later
matching rules override earlier rules, `!flavor` clears the effective flavor
selected so far for matching files, and `flavor=auto` means run Auto Detect.
When no `.fgignore` or
`.fgattributes` applies, Auto Detect remains the default for the target
directory and descendants.

Fallback: if the wrapper cannot run, explain that Flavor Grenade analysis is
unavailable and make only conservative Markdown edits.

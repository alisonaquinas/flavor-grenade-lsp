---
title: "Use the LLM Skill and Plugin | Flavor Grenade LSP"
description: "Install the Flavor Grenade LSP skill/plugin so Claude, Codex, and compatible agents can inspect Markdown flavor evidence."
h1: "Use the LLM Skill and Plugin"
summary: "Install the skill when an LLM agent needs the same flavor detection, diagnostics, symbols, folds, hovers, completions, and structured-profile evidence that the editor uses."
related: ["quickstart","advancedDirectLspIntegration","conceptMarkdownFlavorModel"]
---

# Use the LLM Skill and Plugin

Install the skill when an LLM agent needs the same flavor detection, diagnostics, symbols, folds, hovers, completions, and structured-profile evidence that the editor uses.

## When to use it

The skill packages a runtime-specific Flavor Grenade LSP executable with wrapper commands that return stable JSON. Agents can ask the wrapper for Markdown flavor, configuration evidence, diagnostics, document structure, completions, references, and structured variants before editing a file.

Use it for Claude, Codex, or another compatible skill/plugin host when Markdown edits depend on flavor behavior. The wrapper is not a Markdown renderer and does not execute code blocks, MDX JavaScript, R chunks, Pandoc filters, or remote references.

## Steps

Repository marketplace metadata points at the plugin-local skill source. Compatible installers can discover `flavorgrenade-lsp` from this repository and install the matching skill/plugin into the agent environment.

For installers that implement the `npx skill` command shape, the portable install target is:

```text
npx skill install alisonaquinas/flavor-grenade-lsp --skill flavorgrenade-lsp
npx skill list alisonaquinas/flavor-grenade-lsp
```

If your installer uses a different command shape, point it at `alisonaquinas/flavor-grenade-lsp` and choose the `flavorgrenade-lsp` skill. The repository includes separate marketplace metadata for portable skills, Claude plugin discovery, and Codex plugin discovery so host-specific installers can use their own catalog format.

## Expected result

After installation, run the wrapper's verification command from the installed skill directory. Verification checks the manifest, selected runtime target, digest, optional signature bundle, and a basic LSP handshake.

```text
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs verify-install --json
```

If verification fails, reinstall the skill or choose an artifact for the current runtime target. Do not ask the agent to continue with flavor-sensitive edits when executable digest verification fails.

## Common failure mode

The common failure mode is letting an agent guess Markdown behavior or parse Flavor Grenade configuration by itself. Ask the agent to run `detect` before flavor-sensitive edits and `analyze` before broad rewrites.

The wrapper reports the effective base flavor, structured profiles such as Keep a Changelog or MADR, `.mdfignore` visibility, `.mdfattributes` evidence, inference evidence, diagnostics, symbols, folds, hovers, and completions. The `boundaries` field is reserved and may be empty in current wrapper output.

```text
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs detect README.md --json
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs analyze docs --json
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs diagnostics CHANGELOG.md --json
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs symbols docs/adr/0001-record.md --json
```

For broad workspace commands, give the wrapper an explicit file budget and path
filter. `--include` and `--exclude` accept glob selectors, `--max-files` caps
the number of Markdown files collected, and `--max-bytes` skips oversized
Markdown files before the agent reads them.

```text
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs analyze docs --include "**/*.md" --exclude "private/**" --max-files 200 --max-bytes 262144 --json
```

Treat wrapper output as the source of truth. Do not copy one file's flavor decision to another directory without evidence, and do not reinterpret `.flavor-grenade.*` or `.editorconfig` configuration manually.

Flavor configuration uses Git-style files. `.mdfignore` controls whether Flavor Grenade sees a file at all; matching files are inactive and skipped by broad analysis unless a later negated rule re-includes them.

```gitignore
# .mdfignore
drafts/
!drafts/keep.md
generated/**/*.md
```

`.mdfattributes` controls explicit flavor and structured-profile attributes. Rules cascade from the workspace root toward the file's directory. Later matching rules override earlier rules, `!flavor` clears the effective flavor selected so far for matching files, and `flavor=auto` asks the LSP to run Auto Detect.

```gitattributes
# .mdfattributes
*.md flavor=commonmark
docs/**/*.md flavor=gfm structured_profiles=madr
docs/private.md !flavor
CHANGELOG.md flavor=auto structured_profiles=keep-a-changelog
```

When `.mdfignore` and `.mdfattributes` are absent or no concrete flavor applies, Auto Detect remains the default for the selected directory and descendants. Legacy `.flavor-grenade.*` files and `.editorconfig` directives are not flavor assignment sources.

## Choose the LSP package instead when building an editor client

Use the skill/plugin for agent workflows. Use the npm language-server package when you are wiring an editor, test harness, or direct LSP client that will launch `flavor-grenade-lsp` over stdio and send a `rootUri`.

```text
npm install --save-dev flavor-grenade-lsp
npx flavor-grenade-lsp
```

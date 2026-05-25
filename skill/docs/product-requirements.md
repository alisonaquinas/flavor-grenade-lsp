# Product Requirements

## Summary

`flavorgrenade-lsp-skill` is a distributable LLM skill that gives agents a
stable, local command interface to Flavor Grenade LSP. It embeds a trusted
runtime-specific native executable and exposes flavor-aware Markdown analysis
through wrapper commands and JSON schemas.

The skill enables LLMs to:

- detect Markdown flavors from configuration and inference
- respect TOML, JSON, JSONC, YAML, and `.editorconfig` project configuration
- handle one project config file that assigns different flavors or structured
  profiles to different directories
- understand base flavors and structured variants
- inspect diagnostics, symbols, folds, links, hovers, and completions
- preserve host, conversion, renderer, bibliography, and execution boundaries
- avoid hand-rolled Markdown parsing when server analysis is available
- operate without a VS Code extension

## Product Boundary

The skill is separate from these existing products:

| Product | Boundary |
|---|---|
| LSP server | Provides parser, diagnostics, LSP protocol, native executable |
| VS Code extension | Provides editor integration and user-facing UX |
| Website | Provides public documentation and marketing |
| Skill product | Provides LLM-facing instructions, wrappers, schemas, embedded executable, and installer compatibility |

The skill may consume the server's release artifacts, but it has an independent
version, changelog, release notes, and release workflow.

## Users

| User | Need |
|---|---|
| Coding agent | Determine Markdown flavor before editing files |
| Documentation agent | Build outlines, detect broken links, and preserve conventions |
| Release agent | Validate changelogs, ADRs, MADR records, and Markdown variants |
| CI automation | Run deterministic flavor-aware Markdown checks from a package artifact |
| Human maintainer | Install a reusable skill into Claude Code, Codex, or another compatible agent |

## Required Capabilities

The first complete skill release must provide:

- a valid `SKILL.md` with concise agent instructions
- `SKILL.md` YAML frontmatter with matching `name` and `description` metadata
- an embedded native executable for each released runtime target
- a runtime resolver that chooses the correct executable
- executable digest verification before launch
- wrapper commands for analysis, detection, diagnostics, symbols, folds,
  hovers, completions, variants, and install verification
- config-aware detection output that identifies the active project config file,
  config format, matching directory override, and inherited global values when
  those signals decide the effective Markdown context
- stable JSON output schemas
- smoke fixtures for every supported base flavor family
- smoke fixtures for Keep a Changelog, Common Changelog, and MADR variants
- installation through repository skill installers
- compatibility with Claude Code and Codex skill layouts
- plugin packaging for Claude and Codex, including manifests, commands, hooks,
  specialized agents, optional MCP metadata, and mandatory embedded-LSP metadata
  in every plugin artifact
- a skill changelog and compatibility matrix
- release artifacts signed separately from server artifacts

## Non-Goals

S1 must not implement:

- a second Markdown parser
- a long-lived daemon
- network-backed host integrations
- runtime binary downloads
- execution of Markdown code blocks, MDX code, R chunks, Pandoc filters, or
  renderer hooks
- automatic edits without a reviewable edit plan
- VS Code extension behavior
- registry-specific publishing beyond repository marketplace installation

## Base Flavor And Variant Rules

The skill must report the server's base flavor model without expanding it.
Document conventions such as Keep a Changelog, Common Changelog, and MADR are
variant flags layered over a base flavor.

Example:

```json
{
  "baseFlavor": "commonmark",
  "variants": ["keep-a-changelog", "madr"],
  "evidence": ["file-name", "heading-shape", "directory-placement"]
}
```

The skill must make this distinction explicit in prompts, docs, and JSON output
so agents do not invent new base flavors.

## Configuration Requirements

The skill must defer to the embedded LSP for configuration loading and must not
normalize config files with a separate parser except when validating wrapper
fixtures. Supported project config inputs are:

- `.flavor-grenade.toml`
- `.flavor-grenade.json`
- `.flavor-grenade.jsonc`
- `.flavor-grenade.yaml`
- `.flavor-grenade.yml`
- `.editorconfig` sections containing Flavor Grenade directives

TOML remains a first-class config format. JSON, JSONC, YAML, and
`.editorconfig` are additive alternatives, not replacements.

The skill must support the server's directory-scoped configuration model. A
single project config file can define global `core.markdown` defaults and an
ordered `core.markdown.overrides` list for vault-relative directories or globs.
For any analyzed file, wrapper output must make clear whether the base flavor
and structured profiles came from:

- global project config;
- a matching directory override;
- inherited global values under a matching override;
- `.editorconfig` section directives;
- VS Code or LSP configuration state supplied by the caller;
- auto-detection fallback.

The skill must treat malformed config the same way as the LSP: isolate the bad
file or key, continue with remaining valid layers, and report redacted config
status without document contents.

## Marketplace Product Requirements

The repository must be usable as a skill marketplace:

- the installer can list available skills from the repo
- each skill has a self-contained directory
- each skill exposes name, description, metadata, and entrypoint
- installation can target Claude Code, Codex, or all supported agents
- project-local and global installation modes work
- source and release artifacts are discoverable from GitHub
- package metadata declares compatibility, license, security model, and support
  status

## Success Criteria

- A user can install the skill from this repository with one command.
- An agent can load `SKILL.md` and know when to invoke Flavor Grenade.
- Wrapper commands work in an unpacked release artifact.
- The embedded executable is verified before use.
- Analysis output is stable enough for agent prompts and tests.
- Release notes make server compatibility clear.
- The skill can evolve without forcing a server, extension, or website version
  bump.

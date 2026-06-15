# Product Requirements

## Summary

`flavorgrenade-lsp-skill` is a distributable LLM skill that gives agents a
stable, local command interface to Flavor Grenade LSP. It embeds a trusted
runtime-specific native executable and exposes flavor-aware Markdown analysis
through wrapper commands and JSON schemas.

The skill enables LLMs to:

- detect Markdown flavors from configuration and inference
- respect `.mdfignore` visibility rules and `.mdfattributes` flavor assignment
- handle nested `.mdfattributes` files that assign different flavors or
  structured profiles to different directories
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

The skill consumes the server's release artifacts and uses the same semantic
version as the embedded server. It keeps a skill-specific changelog and release
notes so wrapper and agent-facing changes remain visible.

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
- config-aware detection output that identifies matched `.mdfignore` and
  `.mdfattributes` files, ignored status, explicit flavor attributes, and
  structured-profile attributes when those signals decide the effective
  Markdown context
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

The skill must defer to the embedded LSP for Markdown flavor behavior and must
not normalize legacy Flavor Grenade project config files with a separate parser.
Supported Markdown flavor config inputs are:

- `.mdfignore`
- `.mdfattributes`

Legacy `.flavor-grenade.*` files and Flavor Grenade `.editorconfig` directives
are not flavor assignment sources.

The wrapper contract must describe the normalized result of the Git-style
configuration files. At minimum, normalized config evidence must cover:

- active base flavor
- active structured profiles
- matched `.mdfignore` files, patterns, negation state, and ignored status
- matched `.mdfattributes` files, selectors, negation state, and assigned keys
- workspace-relative config file paths
- redacted parse or validation status

The skill must support the server's cascading configuration model. Root
`.mdfignore` and `.mdfattributes` files apply first, then matching files in
descendant directories. Later matching rules override earlier rules according
to the LSP and `markdown-flavor-detection` package.

For any analyzed file, wrapper output must make clear whether the base flavor
and structured profiles came from:

- `.mdfattributes`;
- VS Code or LSP configuration state supplied by the caller;
- auto-detection fallback.

Config decisions are file-specific. Agents must not apply one file's effective
flavor to another file unless wrapper output says the same `.mdfattributes`
rules matched both files.

The skill must treat malformed config the same way as the LSP. If a config
file is unreadable, too large, unsafe, malformed, or invalid after
normalization, the skill must report redacted config status without document
contents and must not invent a flavor assignment.

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
- The skill can evolve with the server while keeping skill-specific changes
  visible in the skill changelog.

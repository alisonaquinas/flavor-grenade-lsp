---
title: "Configuration Model | Flavor Grenade LSP"
description: "Understand .mdfignore, .mdfattributes, Auto Detect, vault markers, VS Code settings, and server options."
h1: "Configuration Model"
summary: "Learn how Flavor Grenade decides which folder is the vault, which files are visible, and which Markdown flavor applies."
related: ["howToConfigureObsidianVaults","advancedVaultSingleFileMode","advancedIndexingPerformance"]
---

# Configuration Model

Learn how Flavor Grenade decides which folder is the vault, which files are visible, and which Markdown flavor applies.

## Configuration sources

Flavor Grenade starts with the folder your editor opened. Root detection looks for `.obsidian/`, `.mdfignore`, and `.mdfattributes` markers. Visibility is resolved first from `.mdfignore`; hidden files are not processed or indexed. Flavor attributes are then resolved from `.mdfattributes`. If no concrete flavor applies, Auto Detect runs from Obsidian vault evidence, strong syntax evidence, and CommonMark fallback.

Auto Detect is independent of configuration. Configuration can request Auto Detect with `flavor=auto`, clear the effective flavor with `!flavor`, or be absent entirely. In all three cases the server still runs the same Auto Detect workflow.

Legacy `.flavor-grenade.*` files and `.editorconfig` directives are not flavor assignment sources. `.flavor-grenade.toml` can still carry non-flavor operational settings where supported, but Markdown flavor assignment belongs in `.mdfattributes`.

## Visibility with .mdfignore

Use `.mdfignore` to remove generated, private, or unrelated Markdown from Flavor Grenade's view. Rules cascade through subdirectories and use Git-style patterns. Later matching rules win, and `!` negates a prior ignore.

```gitignore
# .mdfignore
generated/
private/
!private/README.md
build/**/*.md
```

A file ignored by `.mdfignore` is inactive. It should not drive completions, diagnostics, references, rename, or skill wrapper analysis.

## Flavor attributes with .mdfattributes

Use `.mdfattributes` when the repository should carry an explicit flavor or structured-profile rule. Rules cascade from the root toward the file's directory. Later matching rules override earlier rules.

```gitattributes
# .mdfattributes
*.md flavor=commonmark
docs/github/*.md flavor=gfm structured_profiles=keep-a-changelog
docs/decisions/*.md flavor=commonmark structured_profiles=madr
docs/private.md !flavor
CHANGELOG.md flavor=auto structured_profiles=keep-a-changelog
```

Supported attributes:

- `flavor=<id>` sets the base flavor for matching files.
- `flavor=auto` explicitly asks Auto Detect to choose the base flavor.
- `!flavor` clears the effective flavor selected so far for matching files, causing Auto Detect unless a later matching rule sets a flavor.
- `structured_profiles=auto`, `structured_profiles=none`, or `structured_profiles=<profile>` controls structured-profile behavior.

Supported base flavor ids are `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow`.

## Extension selector

The VS Code extension writes `.mdfattributes` for flavor selections. After you choose a flavor, it asks whether the change applies to the selected file or to all Markdown files in that directory.

Selected-file scope writes a rule like:

```gitattributes
guide.md flavor=gfm
```

Directory scope writes a rule like:

```gitattributes
/*.md flavor=gfm
```

Choosing Auto Detect removes or resets the scoped `flavor` assignment instead of creating a legacy workspace setting. Files hidden by `.mdfignore` stay inactive and cannot be configured through the selector until they are visible again.

## VS Code settings

The VS Code extension is the packaged path for most users. It starts the bundled server module, watches Markdown and config-file changes, refreshes when `.mdfignore` or `.mdfattributes` changes, and shows effective flavor state in the editor.

Useful settings:

- `flavorGrenade.linkStyle`: wiki-link completion style.
- `flavorGrenade.completion.candidates`: maximum completion items returned.
- `flavorGrenade.diagnostics.suppress`: diagnostic codes to suppress.
- `flavorGrenade.mdfConfig.maxBytes`: maximum `.mdfignore` or `.mdfattributes` file size read for Markdown flavor detection. Default is `8192` bytes.
- `flavorGrenade.trace.server`: LSP trace level.
- `flavorGrenade.server.path`: user-level custom server command path; workspace values are ignored for safety.

Flavor and structured-profile persistence should use `.mdfattributes`, not VS Code workspace settings.

## Direct clients and skills

Direct LSP clients should send a usable `rootUri` or workspace folder and watch Markdown files, `.obsidian/`, `.mdfignore`, and `.mdfattributes`. The server owns flavor resolution. Clients should not send legacy file or directory flavor assignment payloads.

The LLM skill wrapper uses the same model. It excludes `.mdfignore` matches from broad scans, reports inactive files, and reports `.mdfattributes` evidence so agents do not guess Markdown behavior.

## Practical check

Open a folder that contains `.obsidian/`, `.mdfignore`, or `.mdfattributes`, then open a parent folder that contains the same project as a child. The first case should behave like a vault or configured Markdown project. The second should make the user or client be explicit about the intended root.

When a flavor setting appears to do nothing, check the path. VS Code users should look for `.mdfattributes` beside the selected file or directory. Direct clients should check `rootUri`, file watching, and whether the target file is hidden by `.mdfignore`.

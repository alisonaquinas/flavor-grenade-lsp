---
adr: "021"
title: Git-style .fgignore and .fgattributes flavor configuration
status: accepted
date: 2026-05-29
tags: [adr, ADR021, markdown-flavor, configuration]
aliases:
  - ADR021
  - .fgignore and .fgattributes
  - Flavor configuration files
---

# ADR 021 - Git-style .fgignore and .fgattributes flavor configuration

## Context

ADR020 kept `.md` documents in VS Code's built-in `markdown` language mode and
introduced a separate Markdown flavor selector. Its persistence model used VS
Code settings and Flavor Grenade project config files.

The revised product requirement is a Git-style file configuration model:

- `.fgignore` excludes files from all Flavor Grenade processing and indexing.
- `.fgattributes` assigns Markdown flavor and structured profile attributes to
  files by path pattern.
- both files may appear at the vault root and in subdirectories;
- later and nearer rules override earlier and broader rules;
- selectors support negation so teams can opt files out of broad patterns;
- old file/directory flavor configuration mechanisms are removed from active
  product scope.

Git ignore and attributes patterns are glob-style path patterns, not arbitrary
regular expressions. Flavor Grenade follows that model.

## Decision

Flavor Grenade will use `.fgignore` and `.fgattributes` as the only persistent
file and directory configuration mechanism for Markdown flavor membership and
flavor assignment.

This does not supersede Auto Detect. If no `.fgignore` or `.fgattributes` file
exists for a directory tree, Flavor Grenade applies Auto Detect to every
Markdown file in that directory and all subdirectories.

The accepted configuration files are:

| File | Purpose |
|---|---|
| `.fgignore` | Removes matching files and directories from Flavor Grenade visibility. Ignored files are not scanned, parsed, indexed, diagnosed, completed, renamed, or used as references. |
| `.fgattributes` | Assigns per-path attributes such as `flavor=<MarkdownFlavorId>` and structured profile flags. |

Legacy Flavor Grenade project config files and VS Code settings must not be
used for file or directory flavor selection after this decision is implemented.
They may remain only for non-flavor operational settings during migration.

The VS Code extension selector remains, but it writes `.fgattributes` instead
of VS Code flavor settings. After choosing a flavor, the extension prompts for
scope:

| Scope choice | Write behavior |
|---|---|
| Selected file | Add or update a `.fgattributes` rule for the active Markdown file. |
| All files in the directory | Add or update a `.fgattributes` `/*.md` rule for Markdown files directly in the active file's directory. |

Choosing Auto Detect removes or resets the matching `.fgattributes` assignment
at the same scope when possible, so the document falls through to lower
priority rules or automatic detection.

## Pattern Semantics

`.fgignore` uses Git ignore style wildmatch semantics:

- blank lines are ignored;
- `#` starts a comment unless escaped;
- `/` anchors a pattern to the directory containing the `.fgignore`;
- trailing `/` matches directories;
- `*`, `?`, character classes, and `**` follow Git-style glob behavior;
- `!` negates a previous ignore match;
- later rules in the same file win;
- rules in deeper directories win over ancestor rules.

`.fgattributes` uses the same selector matching model with attribute tokens
inspired by `.gitattributes`:

```gitattributes
*.md flavor=commonmark
docs/**/*.md flavor=gfm structured_profiles=keep-a-changelog
notes/**/*.md flavor=obsidian
scratch/**/*.md !flavor !structured_profiles
```

For `.fgattributes`, `!attribute` resets that attribute to unspecified for the
matched path, allowing lower-priority automatic detection or defaults to apply.
Flavor Grenade also accepts a leading `!` selector to cancel earlier attribute
rules in the same file for matching paths, mirroring the `.fgignore` mental
model where a broad rule can be narrowed later.

## Effective Order

For any candidate file, Flavor Grenade resolves configuration in this order:

1. Reject unsupported URI schemes and non-Markdown editor language ids.
2. Apply `.fgignore` from vault root to the file's directory.
3. If ignored, return `inactive` and do not process or index the file.
4. Apply `.fgattributes` from vault root to the file's directory.
5. Use the resulting `flavor` attribute when present.
6. If no `flavor` attribute applies, run Auto Detect.
7. If Auto Detect has no stronger signal, use `commonmark`.

`.obsidian/` remains an Auto Detect signal for `obsidian`. It is no longer a
persistent flavor override mechanism.

## Consequences

**Positive:**

- Teams configure flavor behavior in files that travel with the repository.
- Multiple directory-local configuration files support mixed-flavor trees.
- Ignored files cannot accidentally leak into diagnostics, rename, or reference
  graphs.
- The extension selector and CLI/editor integrations share one persistent
  model.

**Negative:**

- Existing settings-based flavor overrides need migration.
- The implementation must parse Git-style patterns consistently and explain
  where behavior intentionally differs from Git.
- Status and troubleshooting surfaces need to distinguish ignored, inactive,
  auto-detected, and explicitly attributed documents.

## Rejected Options

### Continue VS Code setting persistence for flavor

Rejected because settings do not scale well to nested mixed-flavor directory
trees and do not provide a Git-like audit trail in the project.

### Keep `.flavor-grenade.*` project flavor config

Rejected for file/directory flavor assignment because it duplicates the new
attribute file model. Non-flavor operational configuration may be reconsidered
separately.

### Use arbitrary regular expressions

Rejected because the requested model is Git-like. Git ignore and attributes use
path pattern matching, not general regex syntax.

## Cross-References

- [[docs/features/markdown-flavor-config-files]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/design/markdown-flavor-auto-detection]]
- [[docs/requirements/functional/ofmarkdown-language-mode]]
- [[docs/requirements/functional/markdown-flavor-lsp]]
- [[docs/adr/ADR020-markdown-flavor-selection]]

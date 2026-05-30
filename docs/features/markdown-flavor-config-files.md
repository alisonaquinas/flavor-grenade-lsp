---
title: Feature - Markdown Flavor Configuration Files
tags: [features/, markdown-flavor, configuration]
aliases:
  - Markdown flavor configuration files
  - .fgignore
  - .fgattributes
---

# Feature - Markdown Flavor Configuration Files

Flavor Grenade uses Git-style configuration files to decide which Markdown files
are visible and which Markdown flavor applies to each visible file.

This feature replaces file and directory flavor configuration through VS Code
settings, `.flavor-grenade.*` project flavor config, and `.editorconfig`
Flavor Grenade flavor directives. It does not replace Auto Detect.

When neither `.fgignore` nor `.fgattributes` exists for a directory tree,
Flavor Grenade applies Auto Detect to the entire directory and all
subdirectories. In that default state, `.obsidian/` still resolves Markdown
files to `obsidian`; otherwise generic Markdown falls back to `commonmark`
unless strong syntax evidence selects another flavor.

## User-Visible Behavior

| File | User effect |
|---|---|
| `.fgignore` | Matching files disappear from Flavor Grenade analysis. They are not indexed and receive no diagnostics, completion, navigation, hover, semantic tokens, rename edits, or reference graph entries. |
| `.fgattributes` | Matching files receive attributes such as Markdown flavor and structured profile flags. |

Both files may appear in a vault root and in nested directories. Configuration
applies from the vault root down to the active file's directory, with deeper
files and later rules taking precedence.

## Default Without Config Files

No config files means no files are ignored and no explicit flavor attributes are
set:

```text
project/
  README.md
  docs/guide.md
  notes/today.md
```

Interpretation:

| File | Visibility | Effective flavor |
|---|---|---|
| `README.md` | Visible | Auto Detect |
| `docs/guide.md` | Visible | Auto Detect |
| `notes/today.md` | Visible | Auto Detect |

Auto Detect applies to every Markdown file under `project/`. If `project/`
contains `.obsidian/`, all three files resolve to `obsidian` unless a future
`.fgattributes` rule overrides them.

## .fgignore

`.fgignore` follows Git ignore style path matching:

```gitignore
# Ignore generated Markdown.
dist/**/*.md

# Keep hand-written release notes visible.
!dist/release-notes.md

# Ignore private note folders.
private/
```

Ignored files are outside Flavor Grenade's visible universe. If an ignored file
is open in the editor, the extension should show inactive or ignored status for
that file and must not ask the server to process it.

Negation follows Git's traversal caveat: a file can be re-included only if its
parent directories are still traversable. Prefer `private/*` plus
`!private/keep.md` when a child needs to remain visible.

### .fgignore Interpretation Example

```text
project/
  .fgignore
  README.md
  dist/generated.md
  dist/release-notes.md
  private/journal.md
  private/shared.md
```

```gitignore
# Ignore generated Markdown anywhere under dist.
dist/**/*.md

# Re-include release notes.
!dist/release-notes.md

# Ignore private files by default, but allow one shared note.
private/*
!private/shared.md
```

Interpretation:

| File | Result | Why |
|---|---|---|
| `README.md` | Visible | No pattern matches. |
| `dist/generated.md` | Ignored | `dist/**/*.md` matches. |
| `dist/release-notes.md` | Visible | Later negation re-includes it. |
| `private/journal.md` | Ignored | `private/*` matches. |
| `private/shared.md` | Visible | Later negation re-includes it. |

Ignored files stop before flavor resolution. They are not Auto Detected.

## .fgattributes

`.fgattributes` assigns attributes to visible files:

```gitattributes
*.md flavor=commonmark
docs/**/*.md flavor=gfm structured_profiles=keep-a-changelog
notes/**/*.md flavor=obsidian
drafts/**/*.md !flavor !structured_profiles

# Explicitly ask Auto Detect to handle this subtree.
experiments/**/*.md flavor=auto
```

Supported initial attributes:

| Attribute | Values |
|---|---|
| `flavor` | `auto`, `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, `stack-overflow` |
| `structured_profiles` | `auto`, `none`, `keep-a-changelog`, `common-changelog`, `madr`, or a comma-separated compatible list |

`!flavor` and `!structured_profiles` clear the effective attribute selected so
far for matching paths. The file then uses Auto Detect unless a later matching
rule sets the attribute again.

For symmetry with `.fgignore`, a leading `!` selector may cancel earlier
`.fgattributes` selectors in the same file for matching paths. Attribute reset
tokens are preferred when only one attribute should fall through.

### .fgattributes Interpretation Example

```text
project/
  .fgattributes
  README.md
  docs/guide.md
  docs/changelog.md
  notes/today.md
  notes/drafts/idea.md
  experiments/test.md
```

```gitattributes
# Default every Markdown file in this tree to CommonMark.
*.md flavor=commonmark

# Documentation uses GitHub Flavored Markdown.
docs/**/*.md flavor=gfm

# Changelog gets a structured profile layered over GFM.
docs/changelog.md structured_profiles=keep-a-changelog

# Notes use Obsidian syntax.
notes/**/*.md flavor=obsidian

# Draft notes fall back to Auto Detect instead of inheriting Obsidian.
notes/drafts/**/*.md !flavor !structured_profiles

# Explicitly ask Auto Detect to handle this subtree.
experiments/**/*.md flavor=auto
```

Interpretation:

| File | Attributes after cascade | Effective behavior |
|---|---|---|
| `README.md` | `flavor=commonmark` | Parse as CommonMark. |
| `docs/guide.md` | `flavor=gfm` | Later `docs/**/*.md` rule overrides `*.md`. |
| `docs/changelog.md` | `flavor=gfm`, `structured_profiles=keep-a-changelog` | GFM plus Keep a Changelog structure. |
| `notes/today.md` | `flavor=obsidian` | Notes rule overrides root CommonMark. |
| `notes/drafts/idea.md` | no explicit flavor/profile | `!flavor` and `!structured_profiles` clear the accumulated attributes; Auto Detect runs. |
| `experiments/test.md` | `flavor=auto` | Auto Detect runs because auto is a configured request, not an effective flavor. |

Rules are interpreted per attribute. A later rule can change `flavor` while
leaving `structured_profiles` inherited, or reset only one attribute with
`!attribute`.

`flavor=auto` and an absent `flavor` both run Auto Detect. Difference is intent:
absent means no rule selected a flavor; `flavor=auto` means a rule deliberately
returns matching files to Auto Detect.

### Nested .fgattributes Example

```text
project/
  .fgattributes
  docs/
    .fgattributes
    guide.md
    api/reference.md
```

Root `.fgattributes`:

```gitattributes
*.md flavor=commonmark
docs/**/*.md flavor=gfm
```

`docs/.fgattributes`:

```gitattributes
# Paths are relative to docs/ because this file lives there.
api/**/*.md flavor=pandoc
```

Interpretation:

| File | Effective flavor | Why |
|---|---|---|
| `docs/guide.md` | `gfm` | Root `docs/**/*.md` matches; nested file has no matching rule. |
| `docs/api/reference.md` | `pandoc` | Nested `api/**/*.md` rule is deeper and overrides root GFM. |

## Selector Integration

The VS Code flavor selector still starts with the flavor quick-pick. After the
user chooses a flavor, a second quick-pick asks for the write scope:

1. Selected file
2. All Markdown files in this directory

The extension writes or updates `.fgattributes` in the active file's directory.

Example writes for a file `docs/guide.md`:

```gitattributes
# Selected file
guide.md flavor=gfm

# All Markdown files directly in this directory
/*.md flavor=gfm
```

Because `/` anchors the pattern to the directory containing this
`.fgattributes`, `/*.md` matches Markdown files directly beside that file and
does not match subdirectories. Use `**/*.md` only when the intended scope is the
directory and all descendants.

Choosing Auto Detect removes or resets the matching `flavor` attribute at the
selected scope when possible.

## Effective Resolution

For each file:

1. Non-file URI schemes and non-`markdown` editor language ids are inactive.
2. `.fgignore` decides whether the file is visible.
3. `.fgattributes` supplies explicit `flavor` and structured profile values.
4. `flavor=auto` or an absent flavor runs Auto Detect.
5. `.obsidian/` is an Auto Detect signal for `obsidian`.
6. Generic Markdown falls back to `commonmark`.

If no `.fgignore` or `.fgattributes` file exists anywhere between the vault root
and a file's directory, step 4 applies immediately: Auto Detect covers that file
and every other file in the unconfigured subtree.

## Acceptance Summary

- `.fgignore` and `.fgattributes` are discovered from vault root to file
  directory.
- Git-style wildmatch patterns, comments, escaping, directory anchors, `**`,
  and negation are supported where specified.
- `.fgignore` removes files from indexing and all language features.
- `.fgattributes` is the only persistent file/directory flavor assignment
  mechanism.
- The extension selector writes `.fgattributes` after a second scope prompt.
- Legacy flavor assignment through VS Code settings and `.flavor-grenade.*`
  project config is retired.

## Related

- [[docs/adr/ADR021-fgignore-fgattributes-flavor-configuration]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/design/markdown-flavor-auto-detection]]
- [[docs/requirements/functional/ofmarkdown-language-mode]]
- [[docs/requirements/functional/markdown-flavor-lsp]]

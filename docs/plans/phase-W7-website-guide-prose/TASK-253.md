---
id: "TASK-253"
title: "Concept Article: DocId and Vault-Relative Paths"
type: task
status: in-review
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-253"]
---

# Concept Article: DocId And Vault-Relative Paths

> [!INFO] `TASK-253` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `in-review`

## Text Scope

- Define DocId as a vault-relative, extension-free document identifier.
- Explain why DocIds avoid absolute paths, machine-specific folders, and
  extension-bearing comparisons.
- Show mappings from vault files to DocIds for nested notes and spaced names.

## Asset Scope

- Include a path mapping table with vault path, file path, and DocId.
- Include a short wrong-versus-right comparison for route and rename behavior.

## Draft Article Copy

### Why are DocIds vault-relative instead of absolute paths?

A DocId should identify the same note on every machine that opens the vault. Absolute paths include private folders, drive letters, usernames, mount points, and editor-specific details. A vault-relative, extension-free DocId keeps the graph portable.

Compact definition: a DocId is the vault-relative path to a Markdown document, with the `.md` extension removed and path separators normalized to `/`.

Mapping examples:

| Vault root | File path | DocId |
| --- | --- | --- |
| `C:/Users/alice/Vault` | `C:/Users/alice/Vault/Daily.md` | `Daily` |
| `C:/Users/alice/Vault` | `C:/Users/alice/Vault/notes/Project Plan.md` | `notes/Project Plan` |
| `/home/bob/Vault` | `/home/bob/Vault/people/Ada Lovelace.md` | `people/Ada Lovelace` |
| `/home/bob/Vault` | `/home/bob/Vault/archive/2026/May 09.md` | `archive/2026/May 09` |

Concrete OFM example:

```markdown
[[notes/Project Plan]]
[[Project Plan]]
[[people/Ada Lovelace#Notes]]
```

The first link already looks like a DocId path. The second link is a human-friendly stem that resolution can match when it is unique. The third link resolves the document first, then narrows to the `Notes` heading.

Wrong versus right:

| Situation | Wrong | Right |
| --- | --- | --- |
| Index key | `C:\Users\alice\Vault\notes\Project Plan.md` | `notes/Project Plan` |
| Comparison | Compare `Project Plan.md` to `Project Plan` directly | Normalize to DocId before comparing documents |
| Rename | Rewrite every text occurrence of `Project Plan` | Resolve references to the DocId, then edit supported local references |
| Public docs | Mention a maintainer's absolute path | Show vault-relative examples |

DocIds do not replace user-facing link text. They are internal identifiers that let the server compare notes consistently. A user can write `[[Project Plan]]`, `[[notes/Project Plan]]`, or a Markdown link like `[plan](notes/Project.md)` depending on syntax. The server normalizes document identity before it decides whether completion, diagnostics, references, or rename apply.

For maintainers: never store absolute paths or `.md`-bearing strings as document identity. Convert filesystem paths with `toDocId()` at the vault boundary, and convert back with `fromDocId()` only when a file URI or workspace edit needs an actual path. This prevents cross-machine leaks and avoids bugs where one feature keys `notes/Plan` while another keys `notes/Plan.md`.

Related-link intent: link this page from Vault Index, Wiki-link Resolution, Rename Safety, and vault configuration docs. It should answer identity questions before readers get to resolver or rename details.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Article explains why DocIds are vault-relative and extension-free.
- [ ] Path mapping table is present.
- [ ] Route metadata, sitemap, and tests include the article.

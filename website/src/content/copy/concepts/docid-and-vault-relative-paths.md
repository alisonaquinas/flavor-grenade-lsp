---
title: "DocId and Vault-Relative Paths | Flavor Grenade LSP"
description: "See why document identity is vault-relative, extension-free, and portable."
h1: "DocId and Vault-Relative Paths"
summary: "See why document identity is vault-relative, extension-free, and portable."
related: ["conceptVaultIndex","conceptWikiLinkResolution","conceptRenameSafety"]
---

# DocId and Vault-Relative Paths

See why document identity is vault-relative, extension-free, and portable.

## Compact definition

A DocId strips the vault root and Markdown extension so references stay portable across machines and never depend on private absolute paths.

DocIds keep identity portable by removing the vault root and Markdown extension. That lets the same vault work on another machine without rewriting absolute paths.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

The example includes a heading link because DocId identity and anchor identity are separate. `notes/Daily` identifies the document, while `Open questions` identifies a location inside it.

```text
C:/vault/notes/Daily.md is stored as notes/Daily, so [[notes/Daily#Open questions]] can stay vault-relative.
```

## For LLM maintainers

Use DocId language when explaining rename, references, navigation, and index behavior.

Do not use absolute local paths in public examples unless the article is explaining why they are not stored as identity. Prefer vault-relative examples that users can adapt.

## Practical check

Move a sample vault from one folder to another and keep the same note structure. The DocId for `notes/Daily.md` should still read like `notes/Daily`, not like a machine-specific path. Public docs should follow that pattern so examples remain portable across Windows, macOS, Linux, CI, and LLM-maintained fixtures.

The reader should be able to spot unsafe identity language. If an article starts treating absolute file paths or extension-bearing filenames as the durable note identity, it is drifting away from the vault-relative model and making examples harder to reuse in another workspace.

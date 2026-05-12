---
title: "DocId and Vault-Relative Paths | Flavor Grenade LSP"
description: "See why document identity is vault-relative, extension-free, and portable."
h1: "DocId and Vault-Relative Paths"
summary: "Document IDs stay relative to the vault so notes remain portable across machines."
related: ["conceptVaultIndex","conceptWikiLinkResolution","conceptRenameSafety"]
---

# DocId and Vault-Relative Paths

Document IDs stay relative to the vault so notes remain portable across machines.

## In plain English

A DocId is the stable name Flavor Grenade uses for a note. It removes the machine-specific vault path and the `.md` extension, so `notes/Daily.md` becomes `notes/Daily`.

That keeps links and references portable when the same vault moves between Windows, macOS, Linux, CI, or another clone.

## In a vault

The note identity and heading identity are separate. `notes/Daily` names the note; `Open questions` names a place inside that note.

```text
C:/vault/notes/Daily.md is stored as notes/Daily, so [[notes/Daily#Open questions]] can stay vault-relative.
```

## For future docs

Use vault-relative examples unless the article is specifically showing why absolute paths are not stored as identity.

## Try this

Move a sample vault from one folder to another and keep the same note structure. The DocId for `notes/Daily.md` should still read like `notes/Daily`, not like a machine-specific path. Public docs should follow that pattern so examples remain portable across Windows, macOS, Linux, CI, and LLM-maintained fixtures.

If an article treats `C:/Users/.../Daily.md` as the durable identity, it is making the example harder to reuse.

Use absolute paths only when you are explaining why they are not the identity. Most public examples should start from the vault root because that is how users think about note links. It also keeps examples from leaking private machine paths into docs, tests, or generated content.

For a reader, the payoff is simple: a vault can move, but its internal links should still make sense.

That portability is one reason vault-relative language belongs in public docs. It matches how people share notes, clone repositories, and move projects between machines.

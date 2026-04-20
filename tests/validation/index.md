---
title: Validation Test Plans — Index
tags: [test/validation, test/index]
aliases: [Validation Test Index, User Requirement Validation Index]
---

# Validation Test Plans — Index

> [!INFO] Validation plans trace directly to user requirements — implementation-agnostic goals expressed from the vault author's perspective. Each plan contains one end-to-end scenario per user requirement tag (`TC-VAL-THEME-NNN`). Scenarios are written without TypeScript/NestJS/JSON-RPC terms; they describe what a vault author experiences. Each TC-VAL entry maps to its covering TC-VER entries by ID.

Source user requirements: [[requirements/user/index]]

---

## Validation Plan Catalog

| File | User Theme | TC Prefix | User Req Tags | # TC-VAL Entries | TC-VER Coverage |
|---|---|---|---|---|---|
| [[tests/validation/validate-navigating-notes]] | Navigating Notes | `TC-VAL-NAV` | User.Navigate.* | 3 | TC-VER-NAV, TC-VER-WIKI, TC-VER-BLOK, TC-VER-TAG |
| [[tests/validation/validate-authoring-links]] | Authoring Links | `TC-VAL-AUTH` | User.Author.* | 4 | TC-VER-WIKI, TC-VER-COMP, TC-VER-DIAG |
| [[tests/validation/validate-embedding-content]] | Embedding Content | `TC-VAL-EMBD` | User.Embed.* | 2 | TC-VER-EMBD, TC-VER-DIAG |
| [[tests/validation/validate-writing-with-tags]] | Writing With Tags | `TC-VAL-TAG` | User.Tags.* | 3 | TC-VER-TAG, TC-VER-COMP |
| [[tests/validation/validate-referencing-blocks]] | Referencing Blocks | `TC-VAL-BLOK` | User.Blocks.* | 2 | TC-VER-BLOK, TC-VER-COMP, TC-VER-NAV |
| [[tests/validation/validate-seeing-broken-links]] | Seeing Broken Links | `TC-VAL-DIAG` | User.Diagnose.* | 3 | TC-VER-DIAG, TC-VER-WIKI, TC-VER-EMBD |
| [[tests/validation/validate-renaming-safely]] | Renaming Safely | `TC-VAL-REN` | User.Rename.* | 2 | TC-VER-REN |
| [[tests/validation/validate-vault-setup]] | Vault Setup | `TC-VAL-VAULT` | User.Vault.* | 2 | TC-VER-WS |
| [[tests/validation/validate-configuring-behaviour]] | Configuring Behaviour | `TC-VAL-CFG` | User.Config.* | 2 | TC-VER-CFG |

**Total entries:** 23 TC-VAL cases across 9 plans (one per user requirement)

---

## ID Scheme

`TC-VAL-<THEME>-NNN` where `<THEME>` is the abbreviation shown in the TC Prefix column above. Numbers are local to each plan (001, 002, …).

---

## User Requirement to Validation Mapping

| User Req Tag | Goal (gist) | Validation Plan | TC-VAL IDs |
|---|---|---|---|
| User.Navigate.GoToDefinition | Follow a wiki-link or embed to its target note | [[tests/validation/validate-navigating-notes]] | 001 |
| User.Navigate.FindReferences | See everywhere a note or heading is referenced | [[tests/validation/validate-navigating-notes]] | 002 |
| User.Navigate.BlockAnchor | Jump to a block via `[[note#^blockid]]` | [[tests/validation/validate-navigating-notes]] | 003 |
| User.Author.Completion | Insert correct `[[links]]` via completion | [[tests/validation/validate-authoring-links]] | 001 |
| User.Author.HeadingCompletion | Complete headings inside `[[note#...]]` | [[tests/validation/validate-authoring-links]] | 002 |
| User.Author.BrokenLink | See a diagnostic when a link target doesn't exist | [[tests/validation/validate-authoring-links]] | 003 |
| User.Author.AmbiguousLink | See a diagnostic for an ambiguous link | [[tests/validation/validate-authoring-links]] | 004 |
| User.Embed.EmbedFile | Embed a note section and see it resolved | [[tests/validation/validate-embedding-content]] | 001 |
| User.Embed.BrokenEmbed | See a diagnostic when an embed target is missing | [[tests/validation/validate-embedding-content]] | 002 |
| User.Tags.InlineTag | Use inline `#tag` and get completion | [[tests/validation/validate-writing-with-tags]] | 001 |
| User.Tags.YAMLTag | Use YAML frontmatter `tags:` and get completion | [[tests/validation/validate-writing-with-tags]] | 002 |
| User.Tags.Hierarchy | Query `#parent` and find `#parent/child` occurrences | [[tests/validation/validate-writing-with-tags]] | 003 |
| User.Blocks.CreateAnchor | Add `^blockid` anchor and get completion for it elsewhere | [[tests/validation/validate-referencing-blocks]] | 001 |
| User.Blocks.CrossRef | Reference a block in another file and navigate to it | [[tests/validation/validate-referencing-blocks]] | 002 |
| User.Diagnose.BrokenLink | Spot broken wiki-links in a multi-note vault | [[tests/validation/validate-seeing-broken-links]] | 001 |
| User.Diagnose.AmbiguousLink | Spot ambiguous wiki-links (FG003) | [[tests/validation/validate-seeing-broken-links]] | 002 |
| User.Diagnose.BrokenEmbed | Spot broken embeds (FG004) in a real vault | [[tests/validation/validate-seeing-broken-links]] | 003 |
| User.Rename.Note | Rename a note file and see all references updated | [[tests/validation/validate-renaming-safely]] | 001 |
| User.Rename.Heading | Rename a heading and see all in-file and cross-file refs updated | [[tests/validation/validate-renaming-safely]] | 002 |
| User.Vault.Detection | Open a vault and have the LSP detect it automatically | [[tests/validation/validate-vault-setup]] | 001 |
| User.Vault.SingleFile | Work on a standalone file outside any vault | [[tests/validation/validate-vault-setup]] | 002 |
| User.Config.Override | Override default settings with `.flavor-grenade.toml` | [[tests/validation/validate-configuring-behaviour]] | 001 |
| User.Config.Fallback | Misconfigured value falls back to default gracefully | [[tests/validation/validate-configuring-behaviour]] | 002 |

---

## Cross-Reference to Verification Layer

Each TC-VAL entry lists its covering TC-VER IDs inside the plan file. To trace from a user goal down to the Planguage requirement level:

1. Find the TC-VAL entry in the plan file
2. Read the **Mapped FRs** row — lists Planguage tags
3. Follow the wikilink to the corresponding [[tests/verification/verify-*]] file
4. Find the TC-VER entry matching the Planguage tag

---

## Related Indexes

- [[tests/integration/index]] — E2E smoke plans (TC-SMOKE-*)
- [[tests/verification/index]] — FR-level verification plans (TC-VER-*)
- [[requirements/user/index]] — Master user requirement list
- [[requirements/index]] — Master Planguage functional requirement list
- [[test/matrix]] — Pass/fail tracking for all test files
- [[test/index]] — Master list of all test files in the suite

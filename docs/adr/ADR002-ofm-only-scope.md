---
adr: "002"
title: Exclusively target Obsidian Flavored Markdown, not generic Markdown
status: accepted
date: 2026-04-16
---

# ADR 002 — Exclusively target Obsidian Flavored Markdown, not generic Markdown

## Context

The Markdown ecosystem has a number of LSP servers: marksman targets CommonMark plus wiki-link syntax and is the de-facto standard for Markdown LSP support. vscode-markdown-languageserver targets GitHub Flavored Markdown. Neither addresses the full feature surface of Obsidian Flavored Markdown (OFM).

OFM is a strict superset of CommonMark that adds the following constructs absent from any other Markdown dialect:

| Construct | Syntax example |
|---|---|
| Wiki-link | `[[Note Title]]` |
| Wiki-link with alias | `[[Note Title\|Display Text]]` |
| Embedded file | `![[image.png]]` or `![[note.md]]` |
| Block reference anchor | `paragraph text ^blockid` |
| Block reference link | `[[doc#^blockid]]` |
| Callout | `> [!NOTE]` |
| Obsidian comment | `%% hidden text %%` |
| Inline math | `$x^2$` |
| Display math | `$$\int f\,dx$$` |
| Templater expression | `<% tp.date.now() %>` |
| YAML alias key | `aliases: [alternative name]` |
| YAML tag hierarchy | `tags: [project/active]` |

marksman's approach is to support CommonMark plus wiki-links and ignore the rest of the OFM surface. This is a deliberate scope limitation in marksman; it is not a bug. A fork or extension approach would create an ongoing maintenance burden as marksman evolves.

Two design options were considered for flavor-grenade-lsp's scope:

**Option 1 — OFM-exclusive parser.** A dedicated parser understands every OFM construct natively. The spec (`ofm-spec/`) is the normative definition. No CommonMark fallback path exists in the architecture — `.md` files are always processed as OFM documents. This enables deep, OFM-aware features throughout the entire feature set and justifies the parser investment.

**Option 2 — CommonMark base with OFM overlay.** A CommonMark parser handles the base syntax; OFM constructs are handled by a secondary pass that patches the AST. This is the approach used by many Obsidian community plugins. It leads to ambiguous handling of edge cases (e.g., a `[[` that appears inside a fenced code block) and complicates diagnostic rules that span both layers.

## Decision

flavor-grenade-lsp **exclusively targets OFM**. There is no CommonMark-only code path and no graceful degradation to CommonMark-only features. The parser — described in [[ddd/ofm-parser/domain-model]] — treats every `.md` file as an OFM document regardless of which OFM constructs actually appear in the file.

Files that happen to contain only CommonMark-compatible syntax are still valid OFM documents; they just do not use the OFM-specific features. Such files work correctly with the server because OFM is a strict superset.

The `ofm-spec/` directory is the normative specification for every language construct. Rule codes (e.g., OFM001, OFM002) defined in `ofm-spec/` are referenced by BDD scenarios and diagnostic definitions.

## Consequences

**Positive:**
- The parser investment is fully justified by the exclusive focus on OFM. There is no dilution of effort.
- Every feature — diagnostics, completions, navigation, rename — can assume OFM semantics throughout.
- Block references, embeds, callouts, and alias-based resolution are first-class, not afterthoughts.
- The `ofm-spec/` becomes the single source of truth; no need to reconcile it with a CommonMark spec.

**Negative:**
- flavor-grenade-lsp cannot serve as a generic Markdown LSP. Users who want CommonMark-only LSP features must use marksman alongside it, or separately.
- Non-Obsidian users who write OFM-compatible Markdown (Foam, Logseq exports, Dendron) must opt in via `.flavor-grenade.toml` per [[ADR003-vault-detection]].

**Neutral:**
- `.md` files without OFM syntax are treated as valid OFM documents with no diagnostics raised, so there is no accidental penalty for users who mix OFM and plain Markdown vaults.

## Related

- [[ofm-spec/index]]
- [[ADR003-vault-detection]]
- [[architecture/overview]]
- [[ddd/ofm-parser/domain-model]]

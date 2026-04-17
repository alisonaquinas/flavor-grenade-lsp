---
adr: "006"
title: Block references indexed as first-class Defs in OFMIndex
status: accepted
date: 2026-04-16
---

# ADR 006 — Block references indexed as first-class Defs in OFMIndex

## Context

Obsidian's block reference system allows any paragraph, list item, heading, or table row to be assigned a permanent anchor identifier using the `^blockid` syntax placed at the end of the line. A separate document can then link to that specific block using `[[source-doc#^blockid]]`. This is one of the most-used features in sophisticated Obsidian vaults, particularly in Zettelkasten and evergreen note workflows, where bidirectional references between specific passages — not just whole documents — are essential.

marksman has no block reference support whatsoever. Block anchors (`^id`) and block reference links (`[[doc#^id]]`) are treated as opaque text by marksman's parser. Users who rely heavily on block references receive no LSP assistance for them.

Two approaches were evaluated for flavor-grenade-lsp:

**Approach 1 — Parse-only, no LSP features.** The parser recognises `^blockid` syntax and annotates nodes in the AST, but no indexing occurs. There are no diagnostics for broken block refs, no go-to-definition, no find-references, and no completion. This is equivalent to marksman's behaviour and provides marginal value over the status quo.

**Approach 2 — First-class indexing.** Block anchors (`^blockid`) are indexed as `BlockAnchorDef` entries in `OFMIndex`. Block reference links (`[[doc#^id]]`) are represented as `CrossBlock` refs in `RefGraph`. This enables the full suite of LSP features for block references: diagnostics (FG005, broken block ref), go-to-definition (jump to the anchored block), find-references (find all `[[doc#^id]]` uses), and completion (offer known `^id` values after typing `[[doc#^`).

The parser must correctly identify `^blockid` as a **line-end anchor**: the `^` must appear after at least one space at the end of a block-level element's last line. A `^` in the middle of a line, or a `^` that is part of a math expression, is not a block anchor. This distinction is encoded in rule OFM-BLOCK-003, defined in [[ofm-spec/block-references]].

## Decision

Index `^blockid` anchors as **`BlockAnchorDef`** in `OFMIndex`. Treat `[[doc#^id]]` as a **`CrossBlock`** ref in `RefGraph`. Implement the following LSP features for block references:

1. **FG005 diagnostic** — raised when `[[doc#^id]]` cannot be resolved because `^id` does not exist in the resolved document (see [[features/diagnostics]]).
2. **Go-to-definition** — `[[doc#^id]]` navigates to the line containing `^id` in the target document (see [[features/navigation]]).
3. **Find-references** — given the cursor on a `^blockid` anchor, returns all `[[doc#^id]]` uses across the vault (see [[features/navigation]]).
4. **Completion** — after `[[doc#^`, offers all known `^id` values from the resolved document (see [[features/completions]]).
5. **Code lens** — "N references" above each `^blockid` anchor (see [[features/code-lens]]).

## Consequences

**Positive:**
- flavor-grenade-lsp provides significantly more complete OFM support than marksman for the substantial portion of users who rely on block references.
- First-class indexing enables FG005 diagnostics that catch broken block refs before the user discovers them by navigating to a dead link.
- Completion for `^id` values is one of the most-requested missing features in marksman; this decision directly addresses the gap.

**Negative:**
- The parser must correctly implement the line-end anchor rule (OFM-BLOCK-003). An incorrect implementation would produce false-positive `BlockAnchorDef` entries (e.g., from math expressions containing `^`). This requires careful parser unit testing.
- `RefGraph` gains a new ref type (`CrossBlock`) that all graph traversal code must handle. This increases the surface area of the reference resolution domain.

**Neutral:**
- The `OFMIndex` and `RefGraph` extensions are additive; existing `WikiLinkDef`, `HeadingDef`, and `CrossDoc` ref types are unchanged.

## Related

- [[ofm-spec/block-references]]
- [[requirements/block-references]]
- [[plans/phase-08-block-refs]]
- [[concepts/symbol-model]]
- [[features/completions]]
- [[features/navigation]]
- [[features/diagnostics]]

---
adr: "004"
title: Full text sync as default; incremental opt-in
status: accepted
date: 2026-04-16
---

# ADR 004 — Full text sync as default; incremental opt-in

## Context

The LSP specification defines two document synchronisation modes advertised via the `textDocumentSync` capability during the `initialize` handshake:

**Full sync (`TextDocumentSyncKind.Full = 1`).** On every document change, the editor sends the entire document text in the `textDocument/didChange` notification's `contentChanges` array as a single item with no `range` field. The server replaces its in-memory copy of the document entirely. This is simple to implement and immune to edge cases caused by range calculation mismatch.

**Incremental sync (`TextDocumentSyncKind.Incremental = 2`).** On every document change, the editor sends one or more `TextDocumentContentChangeEvent` items, each containing a `range` (the replaced range in the previous version of the document) and `text` (the replacement text). The server applies each change in order to reconstruct the new document state. This is more efficient for large files because only the diff is transmitted across the JSON-RPC channel.

marksman defaults to Full sync and explicitly documents bugs observed in several editors' incremental sync implementations. Specifically, Neovim's `nvim-lspconfig` and older versions of lsp-mode have been observed sending overlapping or non-monotonic ranges in multi-cursor or macro-replay scenarios. These bugs cause incremental sync to produce corrupted document state in the server, leading to confusing false-positive diagnostics.

Vault documents in Obsidian use cases are typically 1 KB to 200 KB in size. At these sizes, transmitting the full document on each keystroke is not a significant bottleneck on a local stdio channel. For very large vaults with very large documents (e.g., daily log files exceeding 1 MB), incremental sync may provide a measurable improvement.

`OFMDoc.applyLspChange` — the method responsible for incorporating `didChange` updates — must handle both modes to support opt-in incremental sync.

## Decision

Advertise `TextDocumentSyncKind.Full` in the `initialize` response by default. This is controlled by the configuration key `core.text_sync`, which defaults to `"full"`.

Users may set `core.text_sync = "incremental"` in `.flavor-grenade.toml` to switch to incremental sync. When incremental sync is active, the server re-advertises the capability during the `initialize` response (the capability is determined at startup, before the first document opens, so a restart is required to change it).

`OFMDoc.applyLspChange` implements both branches. The full-sync branch replaces the document text unconditionally. The incremental branch applies each `TextDocumentContentChangeEvent` in order, computing absolute offsets from line/character pairs before applying string splicing.

## Consequences

**Positive:**

- All editors work correctly by default without any configuration. Full sync is universally supported and bug-free.
- Users with large vaults who notice latency can opt in to incremental sync with a single config line.
- If an editor's incremental sync implementation has bugs, users can revert to full sync by removing the config key.
- The `applyLspChange` dual implementation means the incremental path is available and tested regardless of the default.

**Negative:**

- Full sync transmits more data per keystroke than necessary for large documents. On a local stdio channel this is generally imperceptible, but it is not zero cost.
- Switching sync mode requires a server restart (because the capability is negotiated at `initialize` time), which may be inconvenient for users experimenting with the setting.

**Neutral:**

- The dual implementation in `OFMDoc.applyLspChange` adds complexity that must be covered by unit tests for both branches.

## Related

- [[ADR001-stdio-transport]]
- [[ddd/lsp-protocol/domain-model]]
- [[requirements/workspace]]

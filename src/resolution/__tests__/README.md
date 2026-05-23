# src/resolution/**tests**/

Unit tests for link resolution, diagnostics, reference graphs, and workspace
edit validation.

## Responsibilities

- Verify vault-local target classification before any resolution or edit.
- Cover wiki links, Markdown links, embeds, headings, blocks, attachments, and
  missing-target diagnostics.
- Preserve DocId invariants: vault-relative, extension-free, and never absolute.

Tests should make unsafe paths and unsupported URI schemes explicit.

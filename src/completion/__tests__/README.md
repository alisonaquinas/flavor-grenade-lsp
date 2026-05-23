# src/completion/**tests**/

Unit tests for completion routing and provider behavior.

## Responsibilities

- Verify trigger detection for wiki links, embeds, headings, tags, and callouts.
- Keep context analysis coverage synchronized with parser token behavior.
- Assert completion labels, insert text, ranges, and data payloads precisely.

Providers should be tested through their public APIs with small in-memory vault
fixtures.

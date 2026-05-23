# src/lsp/handlers/**tests**/

Unit tests for core LSP lifecycle and notification handlers.

## Responsibilities

- Verify initialize, initialized, shutdown, exit, configuration, and text
  document notifications.
- Preserve async request-handler behavior expected by the dispatcher.
- Check lifecycle state transitions and document-store updates explicitly.

These tests protect protocol wiring. Keep them narrower than feature-level
handler tests in `src/handlers/__tests__/`.

# src/code-actions/**tests**/

Unit tests for code action routing and quick fixes.

## Responsibilities

- Cover code action filtering by diagnostic, document context, and range.
- Verify generated edits are minimal and vault-local.
- Preserve edge-case behavior for NBSP cleanup, missing-file creation, tag YAML
  conversion, and table-of-contents generation.

Use deterministic in-memory fixtures. Do not depend on the process working
directory except through explicit test helpers.

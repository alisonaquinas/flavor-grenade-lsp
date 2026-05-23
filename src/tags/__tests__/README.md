# src/tags/**tests**/

Unit tests for vault-wide tag indexing.

## Responsibilities

- Verify tag extraction from parsed documents.
- Preserve updates when documents are added, changed, or removed.
- Keep tag index behavior independent from completion presentation.

Use parsed document fixtures that isolate tag behavior from unrelated parser
features.

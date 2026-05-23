# extension/test/marketplace/

Marketplace package proof tests for extension README assets and packaged VSIX
asset inventory.

## Responsibilities

- Verify Marketplace-facing README image references stay local and supported.
- Verify every required Markdown flavor visual is present in packaged output.
- Guard against publishing a VSIX whose Marketplace proof is incomplete.

## Notes

These tests inspect release artifacts and documentation references. Keep them
aligned with `extension/docs/` requirements and the `verify:marketplace-assets`
script.

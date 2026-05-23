# src/vault/**tests**/

Unit tests for vault detection, scanning, indexing, file watching, ignore
filters, and file-operation planning.

## Responsibilities

- Preserve vault path confinement and DocId normalization.
- Verify `VaultIndex` remains the single source of parsed `OFMDoc` objects.
- Cover watcher refresh behavior, attachment configuration, folder lookup, and
  membership decisions.

Use temporary directories or explicit fixtures. Avoid depending on sibling
repositories or user-local Obsidian vaults.

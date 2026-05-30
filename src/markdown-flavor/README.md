# Markdown Flavor Model

This directory owns the server-side model for Markdown flavor selection and
profile metadata. It does not parse documents by itself; parsers and handlers
consume the effective flavor state and the static profile registry defined here.

## Files

| File                                | Responsibility                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `markdown-flavor-contract.ts`       | Supported flavor ids, selector values, labels, and id guards.                                           |
| `fg-config-files.ts`                | Resolves `.fgignore` visibility and `.fgattributes` attributes inside a confined vault root.             |
| `markdown-flavor-profiles.ts`       | Source-backed profile registry for every explicit flavor.                                               |
| `markdown-flavor-state.ts`          | Effective flavor resolution from `.fgattributes`, Auto Detect evidence, and fallback state.              |
| `non-local-boundary-classifier.ts`  | Classifies non-local or host-boundary references so unsupported targets do not become vault operations. |
| `project-markdown-config-files.ts`  | Lists config-file markers used for Flavor Grenade vault detection.                                      |

## Invariants

- `auto` is selector state only; it must not be stored as a concrete profile id.
- Every explicit flavor id in `MARKDOWN_FLAVOR_IDS` must have a profile entry.
- `.fgignore` and `.fgattributes` reading is bounded and vault-confined.
- Host-specific syntax is descriptive metadata until a parser or handler
  explicitly consumes it.

## See Also

- [Parent README](../README.md)
- [AGENTS.md](./AGENTS.md)
- [ADR020](../../docs/adr/ADR020-markdown-flavor-selection.md)
- [Markdown flavor feature sets](../../docs/features/markdown-flavor-feature-sets.md)

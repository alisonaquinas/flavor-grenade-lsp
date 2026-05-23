# 1. Use structured profile overlays for GFM ambiguous inference smoke fixtures

Date: 2026-05-23

## Status

Accepted

## Context and Problem Statement

The smoke test needs a MADR example that can be inferred from folder placement while preserving the base markdown inference case.

## Decision Drivers

- Keep the MADR profile independent from the base flavor.
- Exercise variant-specific syntax in the same document.

## Considered Options

- Add a MADR example under the inference workspace.
- Treat MADR as a standalone markdown flavor.

## Decision Outcome

Chosen option: add a MADR example under the inference workspace because structured profiles are independent overlays.

Ambiguous GFM-like evidence: task lists and tables are present but should remain weak without additional context.

| Area | State |
| --- | --- |
| Structured profile | active |

- [x] Fixture covers the variant overlay.
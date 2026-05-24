# 1. Use structured profile overlays for Stack Overflow Markdown smoke fixtures

Date: 2026-05-23

## Status

Accepted

## Context and Problem Statement

The smoke test needs a MADR example that can be inferred from its folder placement while preserving the base Stack Overflow Markdown flavor.

## Decision Drivers

- Keep the MADR profile independent from the base flavor.
- Exercise variant-specific syntax in the same document.

## Considered Options

- Add a MADR example under the flavor workspace.
- Treat MADR as a standalone markdown flavor.

## Decision Outcome

Chosen option: add a MADR example under the flavor workspace because structured profiles are independent overlays.

Stack Overflow evidence: [tag:markdown] and a language hint are present.

<!-- language-all: lang-js -->
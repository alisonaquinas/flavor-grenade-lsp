---
title: Markdown Flavor Integration Test Specification
tags:
  - test/spec
  - integration
  - markdown-flavor
aliases:
  - Markdown Flavor Integration Tests
---

# Markdown Flavor Integration Test Specification

Integration tests prove that flavor state moves through multiple server modules
and affects analysis without requiring VS Code UI.

## Test Cases

| Spec ID | Target file | Setup | Assertions |
|---|---|---|---|
| MF-I-001 | `src/test/integration/markdown-flavor.test.ts` | Spawn server with a temp workspace and `flavorGrenade.markdownFlavor = commonmark`. | `initialize` succeeds, open document analysis records effective flavor `commonmark`, and diagnostics do not enable Obsidian-only wiki-link behavior. |
| MF-I-002 | `src/test/integration/markdown-flavor.test.ts` | Change configuration from `commonmark` to `obsidian` with an open document containing `[[Target]]`. | Server refreshes the open document and Obsidian profile enables wiki-link diagnostics/navigation. |
| MF-I-003 | `src/test/integration/markdown-flavor.test.ts` | Iterate every required explicit flavor id through configuration updates. | Server accepts each id and publishes or exposes a refresh state without process restart. |
| MF-I-004 | `src/test/integration/markdown-flavor.test.ts` | Use unsupported flavor id `asciidoc`. | Server reports configuration validation failure and keeps previous effective flavor. |
| MF-I-005 | `src/test/integration/markdown-flavor.test.ts` | Start temp workspaces with `.flavor-grenade.toml`, workspace setting, both present, standalone file context, and invalid configured values. | Effective flavor follows [[docs/design/markdown-flavor-auto-detection]]: folder/workspace override, standalone user override, project config, Obsidian marker, membership evidence, then CommonMark fallback. |
| MF-I-006 | `src/test/integration/markdown-flavor.test.ts` | Change effective flavor with an open fixture containing diagnostics, completion, navigation, hover, semantic-token, and rename trigger points. | Each handler consumes the refreshed effective flavor and returns flavor-specific results without requiring server restart. |
| MF-I-007 | `src/test/integration/markdown-flavor.test.ts` | Open two documents in different workspace roots or vault contexts with different effective flavors. | Diagnostics, completion, navigation/documentLink, hover, semantic tokens, and rename requests remain resource-specific; one document's override does not leak into the other. |
| MF-I-008 | `src/test/integration/markdown-flavor.test.ts` | Analyze host-boundary fixtures for GFM, GLFM, Pandoc, MultiMarkdown, MDX, R Markdown, Reddit, and Stack Overflow. | Host, conversion, renderer, and execution-bound references are classified without local navigation, local rename edits, broken-vault diagnostics, network access, process execution, dynamic imports, or out-of-root file reads. |
| MF-I-009 | `src/test/integration/markdown-flavor.test.ts` | Send malformed flavor propagation payloads and unsafe `.flavor-grenade.toml` fixtures. | Oversized maps, non-file URI keys, dangerous keys, stale resources, unsafe TOML paths, oversized TOML, and invalid values are rejected before effective flavor state changes. |

## Spawned-Server IDs

### MF-I-005

Spawned-server temp workspace evidence for [[docs/design/markdown-flavor-auto-detection]], `.flavor-grenade.toml`, workspace
setting, both present, invalid configured values, and fallback precedence.

### MF-I-006 - Handler Refresh Coverage

Spawned-server evidence that flavor changes reach the real LSP handlers for:

- diagnostics publication and pull/refresh paths;
- completion candidate routing;
- definition, references, document links, document symbols, and folding;
- hover;
- semantic tokens;
- `textDocument/prepareRename` and `textDocument/rename`.

### MF-I-007 - Resource-Specific Propagation

Integration evidence for the resource-specific propagation requirement in
[[docs/design/markdown-flavor-auto-detection]]. It must cover a multi-root or
multi-document workspace where at least one document resolves to `obsidian` and
one resolves to `commonmark` or another explicit flavor.

### MF-I-008 - Host Boundary Integration

Integration evidence for `FlavorLSP.HostBoundary.NonLocalReferences`. It must
prove non-local references do not produce vault edits or vault diagnostics
across a real server process boundary and do not trigger network, execution,
dynamic import, or out-of-root file access.

### MF-I-009 - Flavor Security Input Validation

Integration evidence for `Security.Input.FlavorPropagationPayload`,
`Security.Input.ProjectConfigTOMLSafety`, and
`Security.Vault.ProjectConfigConfinement`. It must prove malformed propagation
payloads and unsafe project config evidence fail before state mutation.

## Exit Criteria

- Flavor state survives a real LSP process boundary.
- Every required flavor id can be applied without restart.
- `.flavor-grenade.toml`, workspace setting, precedence, and invalid-value
  fallback are proven across the process boundary.
- Diagnostics, completion, navigation, hover, semantic tokens, and rename all
  consume refreshed effective flavor state.
- Host-boundary references stay non-local across diagnostics, navigation,
  hover, and rename surfaces.
- Malformed flavor payloads and unsafe TOML evidence cannot mutate effective
  flavor state.
- Invalid flavor ids fail without corrupting active document state.

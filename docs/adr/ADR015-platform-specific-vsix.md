---
adr: "015"
title: Platform-specific VSIX distribution for VS Code extension
status: accepted
date: 2026-04-21
---

# ADR 015 — Platform-specific VSIX distribution for VS Code extension

## Context

`flavor-grenade-lsp` needs a VS Code extension that bundles the language server binary so users get full Obsidian Flavored Markdown intelligence without installing a separate CLI tool. The server is compiled via `bun build --compile`, producing a self-contained executable with the Bun runtime embedded (~50-80 MB per platform).

Three distribution strategies were evaluated:

**Option 1 — Platform-specific VSIXs.** Publish a separate `.vsix` per platform target (linux-x64, darwin-arm64, win32-x64, etc.), each containing only the binary for that platform. This is the pattern used by rust-analyzer, the most widely adopted LSP extension in the VS Code ecosystem. VS Code 1.61+ and `vsce` 1.99.0+ support `--target` for platform-specific packaging and publishing.

**Option 2 — Download-on-activation.** Publish a single universal VSIX containing no binary. On first activation, the extension downloads the correct binary from GitHub Releases. This is the pattern used by marksman-vscode. It produces a tiny VSIX (~2 MB) but requires network access at activation time.

**Option 3 — Universal VSIX with Node fallback.** Ship the raw JavaScript server bundle (not compiled) inside the VSIX. The extension spawns it via Node.js, which VS Code's Electron runtime provides. No native binary needed. Produces a small VSIX (~5-10 MB) but introduces a runtime mismatch — the server is built and tested against Bun, and running it on Electron's Node.js may surface compatibility gaps in APIs, module resolution, or performance characteristics.

## Decision

Adopt **Option 1 — platform-specific VSIXs**. Publish 7 platform-specific packages:

| VS Code target | Bun cross-compilation target |
|---|---|
| `linux-x64` | `bun-linux-x64` |
| `linux-arm64` | `bun-linux-arm64` |
| `alpine-x64` | `bun-linux-x64-musl` |
| `darwin-x64` | `bun-darwin-x64` |
| `darwin-arm64` | `bun-darwin-arm64` |
| `win32-x64` | `bun-windows-x64` |
| `win32-arm64` | `bun-windows-arm64` |

Each VSIX bundles the compiled binary at `server/flavor-grenade-lsp[.exe]`. The extension client resolves this path at activation via a 2-tier strategy: user setting override, then bundled binary.

All 7 targets are cross-compiled on `ubuntu-latest` via Bun's built-in cross-compilation. No macOS or Windows CI runners are required for building.

## Consequences

**Positive:**

- Zero-network install. Works in airgapped and enterprise environments.
- Fast startup. Native compiled binary with `--bytecode` pre-compilation.
- Binary guaranteed present. No download failures, no GitHub rate limits, no first-run delay.
- Aligns with existing infrastructure. Phase 13 already produces cross-platform binaries via `bun build --compile`.
- Follows proven pattern. rust-analyzer has validated this approach at massive scale.

**Negative:**

- 7x build matrix. CI must produce 7 VSIXs per release. All cross-compile on Linux, so runner cost is low, but pipeline complexity increases.
- Large VSIX size. Each VSIX is ~50-80 MB due to the embedded Bun runtime. The Marketplace enforces a per-VSIX size cap (historically ~100 MB; the exact current limit is not prominently documented — see [[research/vscode-extension-publishing]] for details). Must monitor binary sizes and use `--minify --bytecode` to stay well under the cap.
- No `web` target. The extension cannot run in vscode.dev or other browser-based VS Code hosts. The server requires filesystem access for vault indexing (see [[ADR003-vault-detection]]), making browser support architecturally infeasible regardless of distribution strategy.
- Independent release coordination. Extension and server releases are decoupled. The extension must be re-published when the server binary changes. Manual `ext-v*` tags manage this for now; migration to release-please is deferred until the extension stabilizes.

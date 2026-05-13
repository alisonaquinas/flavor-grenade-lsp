---
title: Extension Test Plan
tags: [extension/docs, tests, markdown-flavor]
aliases: [Extension Tests, VS Code Extension Test Plan]
---

# Extension Test Plan

This directory tracks VS Code extension test coverage required by the current
Markdown flavor requirements. Root traceability remains in
`docs/test/matrix.md`; this extension-local view focuses on tests that must live
under `extension/` or exercise the VS Code Extension Development Host.

Detailed extension test cases live in:

- [markdown-flavor-unit-spec.md](markdown-flavor-unit-spec.md)
- [markdown-flavor-integration-spec.md](markdown-flavor-integration-spec.md)
- [markdown-flavor-e2e-spec.md](markdown-flavor-e2e-spec.md)
- [markdown-flavor-verification-spec.md](markdown-flavor-verification-spec.md)
- [markdown-flavor-validation-spec.md](markdown-flavor-validation-spec.md)

## Required Test Areas

| Area | Required coverage |
|---|---|
| Markdown language preservation | `.md` documents stay in VS Code's built-in `markdown` language mode after activation, auto-detection, and override changes. |
| Flavor selector | The selector is visible for file-backed Markdown documents and lists `auto` plus every required researched flavor. |
| Override persistence | Workspace files write flavor overrides to workspace-folder or workspace settings; standalone files write to user settings. |
| Auto-detection | `.obsidian/` resolves to Obsidian, configured workspaces resolve from workspace-folder or workspace settings, and generic Markdown resolves to CommonMark. |
| Document selector and activation | Activation events and `LanguageClient.clientOptions.documentSelector` serve file-backed `markdown` and reject stale `ofmarkdown`. |
| Server propagation | Effective flavor changes refresh server-facing analysis state for every required flavor id, preserve resource-specific state, and recover after server-unavailable paths. |
| Manual language safety | User-selected non-`markdown` language ids are preserved, including `mdx` language mode. |
| Flavor-scoped contributions | Snippets, keybindings, commands, and optional visuals are gated by flavor/context keys rather than custom language ids. |
| Marketplace proof | README/package assets show the Markdown flavor selector and OFM feature value. |
| Stale expectation scan | Current activation, document selector, package, contribution, and host tests do not assert `ofmarkdown` language promotion. |

## Planned Test Files

| Test file | Purpose |
|---|---|
| `extension/src/markdown-flavor.test.ts` | Pure unit coverage for selector state, flavor enum/schema, auto-detection, overrides, refresh triggers, and server propagation calls. |
| `extension/src/client-options.test.ts` | Planned guard for `LanguageClient.clientOptions.documentSelector` and stale `ofmarkdown` rejection. |
| `extension/src/test/suite/markdown-flavor.test.js` | Extension-host coverage for user-visible selector behavior, settings targets, and language preservation. |
| `extension/test/contributions/*.test.ts` | Retarget existing OFMarkdown language-scope tests to flavor/context-key scoping. |
| `extension/test/marketplace/readme-assets.test.ts` | Add Markdown flavor selector visual coverage alongside OFM feature proof. |
| `extension/test/marketplace/vsix-assets.test.ts` | Prove Markdown flavor selector proof assets ship in packaged VSIX output. |

## Test Plans By Level

### Unit

| Unit target | Coverage |
|---|---|
| Flavor enum/schema | `auto` plus every researched explicit flavor id is accepted and exposed in stable order. |
| Selector model | Label, quick-pick rows, effective flavor display, and inactive state for non-`markdown` documents. |
| Auto-detection resolver | `.obsidian/`, `.flavor-grenade.toml`, project setting, membership result, and generic CommonMark fallback. |
| Override persistence | Workspace-folder/workspace/user configuration target selection and `Auto Detect` clearing behavior. |
| Server propagation | Configuration or metadata refresh payload includes the effective flavor after every transition. |
| Document selector guard | Manifest activation and client options never depend on `onLanguage:ofmarkdown` or an `ofmarkdown` document selector. |
| Contribution scoping | Snippets, keybindings, and commands use flavor/context keys rather than `ofmarkdown` language scopes. |

### Integration

| Integration target | Coverage |
|---|---|
| Extension activation gate | Markdown wake, vault marker wake, command wake, flavor selector wake, and generic Markdown idle behavior. |
| Document selector guard | `extension/src/client-options.test.ts` or activation-gate integration proves file-backed `markdown` coverage and stale `ofmarkdown` rejection. |
| Server refresh wiring | `extension/src/commands.test.ts` proves selector changes trigger the same server refresh path used by rebuild/index-ready changes. |
| Server propagation payloads | Client-to-server configuration payloads include selected and effective flavor state for every explicit flavor and do not leak between resources. |
| Unsupported environments | Restricted and virtual workspaces do not spawn or propagate server flavor state from selector changes. |
| Marketplace/package proof | `extension/test/marketplace/readme-assets.test.ts` and `extension/test/marketplace/vsix-assets.test.ts` include Markdown flavor selector evidence. |

### E2E

| E2E target | Coverage |
|---|---|
| Workspace folder flow | Open a vault file, verify `languageId = markdown`, choose each required flavor, and verify workspace setting persistence. |
| Workspace fallback flow | Select an explicit flavor when workspace-folder settings are unavailable, verify workspace fallback persistence, reload, and clear the same scope with `Auto Detect`. |
| Standalone file flow | Open a file without a workspace folder, choose a flavor, and verify user setting persistence. |
| Invalid/precedence flow | Invalid settings are ignored and explicit selector choices outrank workspace/project/marker evidence. |
| Manual language flow | Change `.md` to `plaintext` or `mdx` language mode and verify Flavor Grenade leaves it alone. |
| Generic Markdown flow | Open generic Markdown and verify `Auto Detect (CommonMark)` without vault indexing work. |

### Verification

| Verification target | Coverage |
|---|---|
| Local extension gate | `npm test`, `npm run compile`, and `npm run test:host` include Markdown flavor tests. |
| Repository CI | Root CI lists extension unit/host checks, BDD, docs lint, typecheck, and package validation. |
| Package target gate | `npm run verify:package-targets` proves each VSIX target contains the expected bundled server binary and no wrong-platform payload. |
| Docs gate | `markdownlint-obsidian` runs for `docs/**/*.md` and `extension/docs/**/*.md`. |
| Host CI gate | CI runs the Markdown flavor host suite or fails without a dated blocker and replacement evidence artifact. |
| Stale expectation scan | Current tests and package/client activation paths fail if they still assert language promotion to `ofmarkdown`. |

### Validation

| Validation target | Coverage |
|---|---|
| Research trace | Every selector flavor maps to a `docs/research/` source or `ofm-spec/` source. |
| Acceptance criteria | BDD scenarios cover selector coverage, dialect profiles, persistence, auto-detection, and manual language safety. |
| Product review | Screenshots/proof show Markdown flavor behavior without custom language-mode retcons. |
| Package target evidence | Validation signoff includes `npm run verify:package-targets` output and selector proof asset coverage. |
| Stale expectation evidence | Historical `ofmarkdown` mentions are allowed only as retired context; current behavior and tests reject promotion assumptions. |

## Current Gap

Existing extension tests still exercise the retired `ofmarkdown` language-mode
controller. They should be treated as legacy coverage until replaced or
rewritten for `MarkdownFlavorController`.

See [Extension Test Matrix](matrix.md) for the extension-local traceability matrix.

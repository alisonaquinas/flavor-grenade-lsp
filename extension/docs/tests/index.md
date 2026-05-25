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
| Auto-detection | `.obsidian/` resolves to Obsidian, configured workspaces resolve from workspace-folder or workspace settings, project-config-absent strong syntax/context can infer a flavor, ambiguous shared syntax resolves to CommonMark, and generic Markdown resolves to CommonMark. |
| Structured profiles | Keep a Changelog, Common Changelog, and MADR are configured and inferred separately from the base Markdown flavor, have smoke fixtures under configured and project-config-absent inference workspaces, and never appear as Markdown flavor selector choices. |
| Fixture boundary safety | Smoketest root README and other negative controls do not inherit child fixture project config or repository ancestor project config outside the active workspace boundary. |
| Document selector and activation | Activation events and `LanguageClient.clientOptions.documentSelector` serve file-backed `markdown` and reject stale `ofmarkdown`. |
| Server propagation | Effective flavor changes refresh server-facing analysis state for every required flavor id, preserve resource-specific state, and recover after server-unavailable paths. |
| Manual language safety | User-selected non-`markdown` language ids are preserved, including `mdx` language mode. |
| Flavor-scoped contributions | Snippets, keybindings, commands, and optional visuals are gated by flavor/context keys rather than custom language ids. |
| Marketplace proof | README/package assets show the Markdown flavor selector and OFM feature value. |
| Stale expectation scan | Current activation, document selector, package, contribution, and host tests do not assert `ofmarkdown` language promotion. |

## Planned Test Files

| Test file | Purpose |
|---|---|
| `extension/src/markdown-flavor.test.ts` | Pure unit coverage for selector state, flavor enum/schema, auto-detection, override targets, document scope, and server propagation payloads. |
| `extension/src/markdown-flavor-evidence.test.ts` | Smoketest fixture inventory for configured project-config fixtures, project-config-absent inference fixtures, structured-profile examples, ambiguity samples, and marker-boundary negative controls. |
| `extension/src/language-mode.test.ts` | Preserves `markdown` language ids and rejects promotion during refresh. |
| `extension/src/client-options.test.ts` | Deferred guard for deeper `LanguageClient.clientOptions.documentSelector` wiring beyond the E15 unit assertion. |
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
| Auto-detection resolver | `.obsidian/`, `Flavor Grenade project config marker`, project setting, membership result, project-config-absent syntax/context inference, ambiguity fallback, fixture-boundary confinement, and generic CommonMark fallback. |
| Structured profile resolver | `flavorGrenade.markdownStructuredProfiles` accepts `auto`, `none`, and compatible explicit arrays; auto inference detects Keep a Changelog, Common Changelog, and MADR from local evidence without changing the base flavor. |
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
| Inference fixture inventory | Configured fixtures, project-config-absent inference fixtures, ambiguous fallback fixtures, and root README negative controls exist and stay distinct. |
| Structured profile fixture inventory | Keep a Changelog, Common Changelog, and MADR fixtures exist under configured and project-config-absent inference smoke workspaces and stay distinct from base flavor selection. |
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
| Inference flow | Open project-config-absent inference fixtures and verify strong syntax infers the expected flavor while weak/shared syntax falls back to CommonMark. |
| Structured profile flow | Open Keep a Changelog, Common Changelog, and MADR fixtures and verify the expected profile flag layers over the containing workspace's configured or inferred base flavor. |
| Fixture boundary flow | Open root smoketest README and verify it remains generic Markdown despite child fixture project config and repository ancestor project config. |

### Verification

| Verification target | Coverage |
|---|---|
| Local extension gate | `npm test`, `npm run compile`, and `npm run test:host` include Markdown flavor tests. |
| Repository CI | Root CI lists extension unit/host checks, BDD, docs lint, typecheck, and package validation. |
| Package target gate | `npm run verify:package-targets` proves the VSIX contains exactly one bundled server module and no native server executable payload. |
| Docs gate | `markdownlint-obsidian` runs for `docs/**/*.md` and `extension/docs/**/*.md`. |
| Host CI gate | CI runs the Markdown flavor host suite or fails without a dated blocker and replacement evidence artifact. |
| Stale expectation scan | Current tests and package/client activation paths fail if they still assert language promotion to `ofmarkdown`. |
| Inference fixture guard | Local or CI checks fail if project-config-absent inference fixtures, ambiguous fallback fixture, or root README negative control disappear. |
| Structured profile fixture guard | Local or CI checks fail if Keep a Changelog, Common Changelog, or MADR smoke fixtures disappear from configured or project-config-absent inference workspaces. |

### Validation

| Validation target | Coverage |
|---|---|
| Research trace | Every selector flavor maps to a `docs/research/` source or `ofm-spec/` source. |
| Acceptance criteria | BDD scenarios cover selector coverage, dialect profiles, persistence, auto-detection, and manual language safety. |
| Product review | Screenshots/proof show Markdown flavor behavior without custom language-mode retcons. |
| Package evidence | Validation signoff includes `npm run verify:package-targets` output and selector proof asset coverage. |
| Stale expectation evidence | Historical `ofmarkdown` mentions are allowed only as retired context; current behavior and tests reject promotion assumptions. |
| Inference smoke evidence | Host/manual proof records project-config-absent inference results, ambiguity fallback, and root fixture boundary behavior. |
| Structured profile smoke evidence | Host/manual proof records Keep a Changelog, Common Changelog, and MADR results across configured and project-config-absent inference smoke workspaces. |

## Current Gap

E15 replaced the language-promotion unit assertions with selector and
configuration-payload coverage. Remaining stale `ofmarkdown` contribution,
Marketplace, and host expectations are intentionally owned by E16 and E17.

See [Extension Test Matrix](matrix.md) for the extension-local traceability matrix.

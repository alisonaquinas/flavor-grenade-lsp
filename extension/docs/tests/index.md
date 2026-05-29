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
| Override persistence | Selector writes `.fgattributes` in the active file's directory after the second scope prompt chooses selected-file or directory scope. |
| Auto-detection | `.obsidian/` resolves to Obsidian, `.fgattributes flavor=auto` runs Auto Detect, absent `.fgignore`/`.fgattributes` applies Auto Detect to the whole opened tree, strong syntax/context can infer a flavor, ambiguous shared syntax resolves to CommonMark, and generic Markdown resolves to CommonMark. |
| Ignored files | `.fgignore` matches produce inactive Flavor Grenade state, no diagnostics/completions/selector writes, and return to Auto Detect after negation or removal. |
| Structured profiles | Keep a Changelog, Common Changelog, and MADR are configured through `.fgattributes` or inferred separately from the base Markdown flavor, have smoke fixtures under configured and inference workspaces, and never appear as Markdown flavor selector choices. |
| Fixture boundary safety | Smoketest root README and other negative controls do not inherit child fixture `.fgignore`/`.fgattributes` or repository ancestor config outside the active workspace boundary. |
| Document selector and activation | Activation events and `LanguageClient.clientOptions.documentSelector` serve file-backed `markdown` and reject stale `ofmarkdown`. |
| Server propagation | Effective flavor changes refresh server-facing analysis state for every required flavor id, preserve resource-specific state, and recover after server-unavailable paths. |
| Manual language safety | User-selected non-`markdown` language ids are preserved, including `mdx` language mode. |
| Flavor-scoped contributions | Snippets, keybindings, commands, and optional visuals are gated by flavor/context keys rather than custom language ids. |
| Marketplace proof | README/package assets show the Markdown flavor selector and OFM feature value. |
| Stale expectation scan | Current activation, document selector, package, contribution, and host tests do not assert `ofmarkdown` language promotion. |

## Planned Test Files

| Test file | Purpose |
|---|---|
| `extension/src/markdown-flavor.test.ts` | Pure unit coverage for selector state, flavor enum/schema, second scope prompt, `.fgattributes` writes, `.fgignore` inactive state, auto-detection, document scope, and server propagation payloads. |
| `extension/src/markdown-flavor-evidence.test.ts` | Smoketest fixture inventory for `.fgattributes` fixtures, config-absent inference fixtures, structured-profile examples, ambiguity samples, and marker-boundary negative controls. |
| `extension/src/language-mode.test.ts` | Preserves `markdown` language ids and rejects promotion during refresh. |
| `extension/src/client-options.test.ts` | Deferred guard for deeper `LanguageClient.clientOptions.documentSelector` wiring beyond the E15 unit assertion. |
| `extension/src/test/suite/markdown-flavor.test.js` | Extension-host coverage for user-visible selector behavior, `.fgattributes` writes, `.fgignore` inactive state, and language preservation. |
| `extension/test/contributions/*.test.ts` | Retarget existing OFMarkdown language-scope tests to flavor/context-key scoping. |
| `extension/test/marketplace/readme-assets.test.ts` | Add Markdown flavor selector visual coverage alongside OFM feature proof. |
| `extension/test/marketplace/vsix-assets.test.ts` | Prove Markdown flavor selector proof assets ship in packaged VSIX output. |

## Test Plans By Level

### Unit

| Unit target | Coverage |
|---|---|
| Flavor enum/schema | `auto` plus every researched explicit flavor id is accepted and exposed in stable order. |
| Selector model | Label, quick-pick rows, effective flavor display, and inactive state for non-`markdown` documents. |
| Auto-detection resolver | `.obsidian/`, `.fgattributes flavor=auto`, absent config files, membership result, syntax/context inference, ambiguity fallback, fixture-boundary confinement, and generic CommonMark fallback. |
| Structured profile resolver | `.fgattributes structured_profiles` accepts `auto`, `none`, and compatible explicit lists; auto inference detects Keep a Changelog, Common Changelog, and MADR from local evidence without changing the base flavor. |
| Override persistence | Selected-file and directory `.fgattributes` target selection plus `Auto Detect` clearing/reset behavior. |
| Ignored files | `.fgignore` matched files are inactive and do not offer active Flavor Grenade writes until re-included. |
| Server propagation | Configuration or metadata refresh payload includes the effective flavor after every transition. |
| Document selector guard | Manifest activation and client options never depend on `onLanguage:ofmarkdown` or an `ofmarkdown` document selector. |
| Contribution scoping | Snippets, keybindings, and commands use flavor/context keys rather than `ofmarkdown` language scopes. |

### Integration

| Integration target | Coverage |
|---|---|
| Extension activation gate | Markdown wake, `.obsidian/` wake, `.fgignore`/`.fgattributes` wake, command wake, flavor selector wake, and generic Markdown Auto Detect behavior without unnecessary vault indexing. |
| Document selector guard | `extension/src/client-options.test.ts` or activation-gate integration proves file-backed `markdown` coverage and stale `ofmarkdown` rejection. |
| Server refresh wiring | `extension/src/commands.test.ts` proves selector changes trigger the same server refresh path used by rebuild/index-ready changes. |
| Server propagation payloads | Client-to-server configuration payloads include selected and effective flavor state for every explicit flavor and do not leak between resources. |
| Inference fixture inventory | `.fgattributes` fixtures, config-absent inference fixtures, ambiguous fallback fixtures, and root README negative controls exist and stay distinct. |
| Structured profile fixture inventory | Keep a Changelog, Common Changelog, and MADR fixtures exist under configured and config-absent inference smoke workspaces and stay distinct from base flavor selection. |
| Unsupported environments | Restricted and virtual workspaces do not spawn or propagate server flavor state from selector changes. |
| Marketplace/package proof | `extension/test/marketplace/readme-assets.test.ts` and `extension/test/marketplace/vsix-assets.test.ts` include Markdown flavor selector evidence. |

### E2E

| E2E target | Coverage |
|---|---|
| Workspace folder flow | Open a vault file, verify `languageId = markdown`, choose each required flavor, choose selected-file or directory scope, and verify `.fgattributes` persistence. |
| Directory flow | Select an explicit flavor, choose `All files in this directory`, reload, and clear/reset the same `.fgattributes` scope with `Auto Detect`. |
| Standalone file flow | Open a file without a workspace folder, choose a flavor, choose selected-file scope, and verify `.fgattributes` beside the file. |
| Ignored file flow | Open an `.fgignore` matched file, verify inactive state and no active writes, then re-include it and verify Auto Detect returns. |
| Invalid/precedence flow | Invalid `.fgattributes` values are ignored and explicit selector-written attributes outrank marker evidence. |
| Manual language flow | Change `.md` to `plaintext` or `mdx` language mode and verify Flavor Grenade leaves it alone. |
| Generic Markdown flow | Open generic Markdown and verify `Auto Detect (CommonMark)` without vault indexing work. |
| Inference flow | Open config-absent inference fixtures and verify strong syntax infers the expected flavor while weak/shared syntax falls back to CommonMark. |
| Structured profile flow | Open Keep a Changelog, Common Changelog, and MADR fixtures and verify the expected profile flag layers over the containing workspace's configured or inferred base flavor. |
| Fixture boundary flow | Open root smoketest README and verify it remains generic Markdown despite child fixture `.fgignore`/`.fgattributes` files or repository ancestor config outside the workspace boundary. |

### Verification

| Verification target | Coverage |
|---|---|
| Local extension gate | `npm test`, `npm run compile`, and `npm run test:host` include Markdown flavor tests. |
| Repository CI | Root CI lists extension unit/host checks, BDD, docs lint, typecheck, and package validation. |
| Package target gate | `npm run verify:package-targets` proves the VSIX contains exactly one bundled server module and no native server executable payload. |
| Docs gate | `markdownlint-obsidian` runs for `docs/**/*.md` and `extension/docs/**/*.md`. |
| Host CI gate | CI runs the Markdown flavor host suite or fails without a dated blocker and replacement evidence artifact. |
| Stale expectation scan | Current tests and package/client activation paths fail if they still assert language promotion to `ofmarkdown`. |
| Inference fixture guard | Local or CI checks fail if config-absent inference fixtures, ambiguous fallback fixture, or root README negative control disappear. |
| Structured profile fixture guard | Local or CI checks fail if Keep a Changelog, Common Changelog, or MADR smoke fixtures disappear from configured or config-absent inference workspaces. |

### Validation

| Validation target | Coverage |
|---|---|
| Research trace | Every selector flavor maps to a `docs/research/` source or `ofm-spec/` source. |
| Acceptance criteria | BDD scenarios cover selector coverage, dialect profiles, persistence, auto-detection, and manual language safety. |
| Product review | Screenshots/proof show Markdown flavor behavior without custom language-mode retcons. |
| Package evidence | Validation signoff includes `npm run verify:package-targets` output and selector proof asset coverage. |
| Stale expectation evidence | Historical `ofmarkdown` mentions are allowed only as retired context; current behavior and tests reject promotion assumptions. |
| Inference smoke evidence | Host/manual proof records config-absent inference results, ambiguity fallback, and root fixture boundary behavior. |
| Structured profile smoke evidence | Host/manual proof records Keep a Changelog, Common Changelog, and MADR results across configured and config-absent inference smoke workspaces. |

## Current Gap

E15 replaced the language-promotion unit assertions with selector and
configuration-payload coverage. Remaining stale `ofmarkdown` contribution,
Marketplace, and host expectations are intentionally owned by E16 and E17.

See [Extension Test Matrix](matrix.md) for the extension-local traceability matrix.

---
title: Extension Flavor Roadmap Requirements Audit
tags: [audit, roadmap, vscode-extension, markdown-flavor]
created: 2026-05-13
---

# Extension Flavor Roadmap Requirements Audit

## Scope

This audit covers the requested extension-flavor planning surface:

- `docs/roadmap.md`, limited to extension phase sections and E15-E17 traces.
- `docs/plans/phase-E15-markdown-flavor-selector-settings.md` and tickets under
  `docs/plans/phase-E15-markdown-flavor-selector-settings/`.
- `docs/plans/phase-E16-flavor-scoped-contributions-marketplace.md` and tickets
  under `docs/plans/phase-E16-flavor-scoped-contributions-marketplace/`.
- `docs/plans/phase-E17-extension-flavor-host-verification.md` and tickets under
  `docs/plans/phase-E17-extension-flavor-host-verification/`.
- `extension/docs/**`.
- `docs/requirements/functional/ofmarkdown-language-mode.md`.
- `docs/requirements/functional/vscode-extension-parity.md`.
- `docs/design/markdown-flavor-auto-detection.md`.
- `docs/test/**` where relevant to extension flavor verification.

No implementation files were changed or assessed for current runtime behavior,
except where docs referenced planned target files or commands.

## Method

I compared requirement tags, acceptance meters, test specifications, and phase
ownership statements across the scoped documents. The audit focused on whether
roadmap and ticket plans fully trace the current requirement model:

- `.md` files stay in VS Code `markdown` language mode.
- Markdown flavor is a separate selector/configuration state.
- The required flavor set is exposed consistently.
- Auto-detection, override persistence, refresh, and server propagation are
  resource-specific.
- Contributions, activation, Marketplace proof, host tests, package-target
  checks, validation evidence, and docs lint are represented in the right
  phase gates.

This is a planning and traceability audit only. It does not fix findings.

## Findings

| ID | Severity | Requirement/spec source | Roadmap/plan evidence | Gap | Impact | Recommended correction | Affected files/tickets |
|---|---|---|---|---|---|---|---|
| AUD-EXT-RD-001 | High | `Extension.Packaging.TargetBinaryValidation` requires each packaged VSIX target to contain exactly one matching server binary and expose version mismatch evidence (`docs/requirements/functional/vscode-extension-parity.md:343-360`, `extension/docs/requirements/functional/vscode-extension-parity.md:463-480`). Extension verification also requires `npm run verify:package-targets` (`extension/docs/tests/markdown-flavor-verification-spec.md:21`). | E17 scope and acceptance say package-target evidence is in scope (`docs/plans/phase-E17-extension-flavor-host-verification.md:55`, `docs/plans/phase-E17-extension-flavor-host-verification.md:71-72`). `CHORE-114` says the complete battery includes `npm run verify:marketplace-assets`, `npm run verify:package-targets`, and docs lint (`docs/plans/phase-E17-extension-flavor-host-verification/CHORE-114.md:25-28`). Top-level E17 gate verification only lists `npm test`, `npm run test:host`, and `npm run compile` (`docs/plans/phase-E17-extension-flavor-host-verification.md:75-82`). | The phase-level E17 gate is narrower than its own scope, acceptance, closeout chore, and verification specs. It omits `npm run verify:package-targets`, `npm run verify:marketplace-assets`, and root docs lint. | E17 could be reported complete from the main phase plan while skipping VSIX binary-target proof, Marketplace selector-proof preservation, or extension docs lint. | Update E17 `Gate Verification` to match `CHORE-114`: `npm run compile`, `npm test`, `npm run test:host`, `npm run verify:marketplace-assets`, `npm run verify:package-targets`, plus root `bun run lint:docs`. Keep `CHORE-114` DoD and the phase page in sync. | `docs/plans/phase-E17-extension-flavor-host-verification.md`; `docs/plans/phase-E17-extension-flavor-host-verification/CHORE-114.md`; `TASK-311`; `TASK-312`; `CHORE-114`. |
| AUD-EXT-RD-002 | Medium | `Extension.Workspace.EnvironmentModes` requires restricted, virtual, remote, WSL, SSH, and Dev Container behavior to be documented/tested or manually verified (`docs/requirements/functional/vscode-extension-parity.md:275-290`). `Extension.Packaging.TargetBinaryValidation` requires package-target validation (`docs/requirements/functional/vscode-extension-parity.md:343-360`). | Roadmap E17 text says it records package-target evidence and selector behavior in restricted/virtual/remote contexts (`docs/roadmap.md:628-634`). The E17 phase plan traces both requirements (`docs/plans/phase-E17-extension-flavor-host-verification.md:32-33`). The roadmap E17 requirement-links line omits both tags (`docs/roadmap.md:636`). | The roadmap describes environment/package work but does not include the corresponding requirement tags in the E17 requirement link set. | Traceability consumers may miss that E17 closes environment-mode and package-target obligations, especially when reading only the roadmap. | Add `Extension.Workspace.EnvironmentModes` and `Extension.Packaging.TargetBinaryValidation` to the E17 requirement links in `docs/roadmap.md`. | `docs/roadmap.md`; E17 roadmap section. |
| AUD-EXT-RD-003 | High | Extension integration specs require exact client-to-server propagation payload coverage and server-unavailable replay/recompute behavior: `EXT-MF-I-008` and `EXT-MF-I-009` (`extension/docs/tests/markdown-flavor-integration-spec.md:21-24`, `extension/docs/tests/markdown-flavor-integration-spec.md:35-38`). The extension matrix also expects `Extension.MarkdownFlavor.ServerPropagation` to have unit, integration, and host evidence (`extension/docs/tests/matrix.md:27`). | E15 roadmap test trace mentions unit IDs and only `EXT-MF-I-004` for rebuild-triggered refresh (`docs/roadmap.md:606`). `TASK-304` has work-scope language for payload shape and server-unavailable state (`docs/plans/phase-E15-markdown-flavor-selector-settings/TASK-304.md:27-45`), but its linked tests include `EXT-MF-U-009`, `EXT-MF-U-010`, `EXT-MF-U-011`, and `EXT-MF-I-004`, not `EXT-MF-I-008` or `EXT-MF-I-009` (`docs/plans/phase-E15-markdown-flavor-selector-settings/TASK-304.md:54-61`). | The plan contains the right implementation idea, but the formal test trace omits the integration specs that prove outbound payload shape and server-unavailable behavior. | E15 could satisfy unit tests while failing the extension integration contract for real client notification shape, replay/recompute after server readiness, or resource-specific propagation. | Add `EXT-MF-I-008` and `EXT-MF-I-009` to E15 roadmap test trace and `TASK-304` linked tests/DoD. If ownership is intentionally later than E15, move those IDs explicitly to E17 and explain why unit-only propagation is sufficient for E15. | `docs/roadmap.md`; `docs/plans/phase-E15-markdown-flavor-selector-settings/TASK-304.md`; `extension/docs/tests/markdown-flavor-integration-spec.md`; `extension/docs/tests/matrix.md`. |
| AUD-EXT-RD-004 | Medium | Activation must react to `.obsidian/`, `.flavor-grenade.toml`, `markdown`, flavor selector commands, and explicit commands while generic Markdown remains idle until a positive signal (`docs/requirements/functional/vscode-extension-parity.md:163-181`, `extension/docs/requirements/functional/vscode-extension-parity.md:164-180`). Language wake is allowed but must remain lightweight (`extension/docs/features/activation-behavior.md:41-50`). | E16 `TASK-305` explicitly adds `onCommand:flavorGrenade.selectMarkdownFlavor` and removes `onLanguage:ofmarkdown` (`docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-305.md:27-40`). The main E16 acceptance says activation must not depend on `onLanguage:ofmarkdown` (`docs/plans/phase-E16-flavor-scoped-contributions-marketplace.md:60-68`). | E16 does not explicitly require or test that `onLanguage:markdown` remains present as the current language-wake signal, nor that the language-wake path performs only startup checks without vault indexing in generic Markdown. | A future edit could remove both `onLanguage:ofmarkdown` and `onLanguage:markdown`, satisfying the stale-language removal intent but violating the current activation requirement. Conversely, language wake could regress into generic-vault indexing. | Add E16 acceptance/DoD language that `activationEvents` includes `onLanguage:markdown`, excludes `onLanguage:ofmarkdown`, and that generic Markdown language wake does not spawn indexing without `.obsidian/`, `.flavor-grenade.toml`, explicit selector override, or command intent. Link this to `EXT-MF-I-002`, `EXT-MF-I-003`, and `EXT-MF-I-007`. | `docs/plans/phase-E16-flavor-scoped-contributions-marketplace.md`; `docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-305.md`; `extension/docs/tests/markdown-flavor-integration-spec.md`. |
| AUD-EXT-RD-005 | Medium | The auto-detection design requires refresh when `.flavor-grenade.toml` appears, disappears, or changes, separately from `.obsidian/` marker changes and setting changes (`docs/design/markdown-flavor-auto-detection.md:257-270`). | E15 `TASK-304` refresh DoD names selector, workspace-folder, visible editor, file-open, server-readiness, membership, marker, and settings changes (`docs/plans/phase-E15-markdown-flavor-selector-settings/TASK-304.md:72-74`). E15 main acceptance does not list refresh triggers (`docs/plans/phase-E15-markdown-flavor-selector-settings.md:67-82`). | `.flavor-grenade.toml` change handling is only implicit, if covered at all, under "marker" or "membership" changes. The design treats TOML change as its own trigger. | Project flavor changes could be missed or under-tested, especially when `.flavor-grenade.toml` changes explicit flavor without changing vault membership. | Make `.flavor-grenade.toml` appear/disappear/change explicit in E15 `TASK-303`/`TASK-304` DoD and in `EXT-MF-U-010` or `EXT-MF-I-004` test expectations. | `docs/plans/phase-E15-markdown-flavor-selector-settings/TASK-303.md`; `docs/plans/phase-E15-markdown-flavor-selector-settings/TASK-304.md`; `docs/plans/phase-E15-markdown-flavor-selector-settings.md`; `extension/docs/tests/markdown-flavor-unit-spec.md`. |
| AUD-EXT-RD-006 | Low | `Extension.Contributions.FlavorScoped` covers snippets, keybindings, commands, and optional theme examples when they affect generic Markdown (`docs/requirements/functional/vscode-extension-parity.md:298-316`, `extension/docs/requirements/functional/vscode-extension-parity.md:418-436`). Extension unit specs define `EXT-MF-C-001` through `EXT-MF-C-006`, including command and optional theme/example dispositions (`extension/docs/tests/markdown-flavor-unit-spec.md:33-44`). | E16 `TASK-306` does cover command preconditions and optional theme/example disposition (`docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-306.md:25-30`, `docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-306.md:47-49`). The roadmap E16 test trace only names `EXT-MF-C-001` through `EXT-MF-C-004` (`docs/roadmap.md:622`). | Ticket-level coverage is correct, but the roadmap trace under-reports contribution coverage by omitting `EXT-MF-C-005` and `EXT-MF-C-006`. | Roadmap readers may think command and optional theme/example contribution dispositions are outside E16, despite being required and ticketed. | Change the roadmap E16 test trace from `EXT-MF-C-001 through EXT-MF-C-004` to `EXT-MF-C-001 through EXT-MF-C-006`, or explicitly mark C-005/C-006 as not applicable if later evidence proves those contribution types are absent. | `docs/roadmap.md`; `docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-306.md`; `extension/docs/tests/markdown-flavor-unit-spec.md`. |

## Non-Finding Notes

- The E15/E16/E17 split is broadly aligned with the current requirement pivot
  away from `ofmarkdown` language-mode promotion.
- E15 correctly owns selector/schema/persistence/auto-detection/resource-specific
  propagation at a high level.
- E16 correctly owns stale activation/contribution/Marketplace language-mode
  cleanup.
- E17 correctly owns host proof, validation evidence, stale host scan, and
  matrix closeout at a high level.

The findings above are mostly traceability and gate-completeness issues, not a
rejection of the phase decomposition.

## Docs Lint

Docs lint status: passed.

Command run from repository root:

```bash
bun run lint:docs
```

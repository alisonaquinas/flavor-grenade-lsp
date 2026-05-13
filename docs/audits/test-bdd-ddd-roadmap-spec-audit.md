---
title: Test BDD DDD Roadmap Spec Audit
tags: [audits, markdown-flavor, roadmap, tests, bdd, ddd]
aliases: [Test BDD DDD Roadmap Audit]
updated: 2026-05-13
---

# Test BDD DDD Roadmap Spec Audit

## Scope

Audited the current roadmap and phase plans against the requested test,
verification, validation, BDD, and DDD specifications.

In scope:

- [[roadmap]]
- `docs/plans/phase-19` through `docs/plans/phase-34`
- `docs/plans/phase-E15` through `docs/plans/phase-E17`
- `docs/test/**`
- `extension/docs/tests/**`
- `docs/bdd/**`
- `docs/ddd/**`
- `extension/docs/bdd/**`
- `extension/docs/ddd/**`

Out of scope:

- Source implementation under `src/`, `extension/src`, `extension/test`, or
  `website`.
- Fixing any finding.
- Sibling repositories.

## Method

1. Enumerated the scoped documents with `rg --files docs extension/docs`.
2. Read the root Markdown flavor unit, integration, e2e, verification, and
   validation specs in `docs/test/`.
3. Read the extension-local Markdown flavor unit, integration, e2e,
   verification, and validation specs in `extension/docs/tests/`.
4. Read the flavor BDD feature files and extension BDD mirrors, especially
   `ofmarkdown-language-mode.feature`, `markdown-flavor-dialects.feature`,
   `vscode-extension.feature`, and `vscode-extension-parity.feature`.
5. Read the DDD glossary, bounded contexts, vault, document lifecycle,
   reference-resolution, LSP protocol, config, and editor-client models for
   ownership and vocabulary constraints.
6. Compared the roadmap phase summaries, phase plans, ticket indexes, and
   ticket DoD against those specs.

## Findings

| ID | Severity | Spec source | Roadmap/plan evidence | Gap | Impact | Recommended correction | Affected files/tickets |
|---|---|---|---|---|---|---|---|
| AUD-TBD-001 | High | `docs/test/markdown-flavor-integration-spec.md` requires `MF-I-006` handler refresh coverage, `MF-I-007` resource-specific propagation, and `MF-I-008` host-boundary integration. `docs/ddd/vault/domain-model.md` says effective flavor is URI/document-specific and host boundaries must not create vault scopes. | [[docs/plans/phase-20-markdown-flavor-server-propagation]] traces all LSP surfaces. [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-292]] maps only `MF-I-001` through `MF-I-005`. [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-293]] refreshes diagnostics only. [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]] adds the boundary classifier but does not explicitly require spawned-server `MF-I-008` proof. | Phase 20 does not explicitly plan spawned-server tests proving refreshed effective flavor reaches diagnostics, completion, navigation/document links, hover, semantic tokens, and rename, nor that flavor state stays resource-specific across multiple roots/documents. | Flavor propagation can appear complete while some handlers remain flavor-blind or one document's flavor leaks into another. Host-boundary classification could also pass unit tests but fail across the real LSP process boundary. | Expand TASK-292 or add explicit follow-up tickets for `MF-I-006`, `MF-I-007`, and `MF-I-008`. Gate Phase 20 closeout on spawned-server assertions across all named LSP surfaces and multi-root/standalone resource keys. | [[docs/plans/phase-20-markdown-flavor-server-propagation]], [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-292]], [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-293]], [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]], [[docs/plans/phase-20-markdown-flavor-server-propagation/CHORE-106]] |
| AUD-TBD-002 | Medium | `docs/test/markdown-flavor-verification-spec.md` requires docs lint evidence (`MF-VF-004`) and gate-removal checks for flavor specs/artifacts. `extension/docs/tests/markdown-flavor-verification-spec.md` requires `bun run lint:docs`, package-target verification, marketplace verification, and host-gate evidence. | Phase E15 gate verification lists only `npm run compile` and `npm test`. Phase E16 lists `npm test`, `npm run verify:marketplace-assets`, and `npm run compile`. Phase E17 lists `npm test`, `npm run test:host`, and `npm run compile`. E17's closeout chore is stronger and includes docs lint, marketplace, and package-target checks, but the phase-file gate omits them. | Top-level extension phase gates are weaker than their verification specs and, in E17, weaker than the closeout chore. | Reviewers may treat the phase-file gate as sufficient and skip docs lint, package-target evidence, marketplace evidence, or host CI guard checks required for validation signoff. | Align E15-E17 phase-file `Gate Verification` sections with their specs and closeout chores. At minimum add `bun run lint:docs` where docs or matrices change; add `npm run verify:marketplace-assets` to E17 if selector proof is revalidated; add `npm run verify:package-targets` to E17. | [[docs/plans/phase-E15-markdown-flavor-selector-settings]], [[docs/plans/phase-E16-flavor-scoped-contributions-marketplace]], [[docs/plans/phase-E17-extension-flavor-host-verification]], [[docs/plans/phase-E17-extension-flavor-host-verification/CHORE-114]] |
| AUD-TBD-003 | High | `extension/docs/tests/markdown-flavor-e2e-spec.md` defines `EXT-MF-E-001` through `EXT-MF-E-010`, including workspace fallback, invalid/precedence, selector availability, and host propagation fixtures. | [[docs/plans/phase-E17-extension-flavor-host-verification/TASK-310]] work scope mentions broad context coverage and selecting every flavor, but its linked-test table maps the host suite only to `EXT-MF-E-001` through `EXT-MF-E-006`. | `EXT-MF-E-007` through `EXT-MF-E-010` are not explicitly mapped to the E17 host suite or other evidence despite being part of the E2E spec exit criteria. | Workspace fallback persistence, invalid-setting precedence, selector availability across unsupported contexts, and end-to-end host propagation can be missed while TASK-310 still appears trace-complete. | Update TASK-310 linked tests and DoD to name `EXT-MF-E-007`, `EXT-MF-E-008`, `EXT-MF-E-009`, and `EXT-MF-E-010`, or create separate E17 tickets with explicit evidence owners. | [[docs/plans/phase-E17-extension-flavor-host-verification/TASK-310]], [[docs/plans/phase-E17-extension-flavor-host-verification]], `extension/docs/tests/markdown-flavor-e2e-spec.md` |
| AUD-TBD-004 | Medium | `extension/docs/tests/markdown-flavor-validation-spec.md` requires `EXT-MF-VA-006` and `extension/docs/tests/evidence/markdown-flavor-stale-ofmarkdown-scan.md`. `extension/docs/tests/markdown-flavor-verification-spec.md` also requires stale expectation scan coverage (`EXT-MF-VF-009`). | E17 phase scope says to run a stale `ofmarkdown` expectation scan. [[docs/plans/phase-E17-extension-flavor-host-verification/TASK-313]] owns host stale-scan work. But [[docs/plans/phase-E17-extension-flavor-host-verification/TASK-312]] says its linked validation coverage is `EXT-MF-VA-001` through `EXT-MF-VA-005`, omitting `EXT-MF-VA-006`. | The validation-evidence ticket omits the required stale scan artifact even though adjacent E17 work mentions stale scans. | Stale `ofmarkdown` promotion assumptions could be removed from tests without producing the required validation artifact that classifies remaining historical mentions. | Add `EXT-MF-VA-006` and `extension/docs/tests/evidence/markdown-flavor-stale-ofmarkdown-scan.md` to TASK-312, or explicitly make TASK-313 the artifact owner and link it from TASK-312/TASK-314. | [[docs/plans/phase-E17-extension-flavor-host-verification/TASK-312]], [[docs/plans/phase-E17-extension-flavor-host-verification/TASK-313]], [[docs/plans/phase-E17-extension-flavor-host-verification/TASK-314]], `extension/docs/tests/markdown-flavor-validation-spec.md` |
| AUD-TBD-005 | Medium | `extension/docs/tests/markdown-flavor-unit-spec.md` defines contribution unit cases `EXT-MF-C-001` through `EXT-MF-C-006`, including commands and optional theme/example contributions. | [[docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-309]] linked tests cover only `EXT-MF-C-001` through `EXT-MF-C-004`. E16 requirement trace says snippets, keybindings, and commands should be scoped by flavor/context, but the ticket mapping omits `EXT-MF-C-005` commands and `EXT-MF-C-006` optional theme/example contributions. | E16 contribution test ownership is incomplete against the extension unit spec. | Command contribution scope can remain tied to stale language assumptions, and optional examples/visual contributions can introduce custom `ofmarkdown` behavior without test coverage. | Extend TASK-309 and related E16 contribution tickets to cover `EXT-MF-C-005` and `EXT-MF-C-006`, or mark optional theme/example contributions explicitly not applicable with a validation note. | [[docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-309]], [[docs/plans/phase-E16-flavor-scoped-contributions-marketplace]], `extension/docs/tests/markdown-flavor-unit-spec.md` |
| AUD-TBD-006 | Medium | `docs/test/markdown-flavor-validation-spec.md` says validation artifacts cannot move to passing until dated, reviewer/command-named evidence exists. `docs/test/markdown-flavor-unit-spec.md` requires each Phase 22-34 dialect fixture to declare active, inert, and host-specific expectations, with deferrals linked through the applicability matrix. | Phase 22-34 top-level plans require a surface disposition table, and their closeout chores say to review verification evidence. Individual dialect test tickets are stronger. But the top-level phase files do not include concrete gate commands or artifact paths in a `Gate Verification` section. | Dialect phase gate expectations are split between ticket details and closeout chores, with no phase-level command battery equivalent to Phases 19-21. | A dialect phase can be considered planned/closed using ticket-local checks while omitting a consistent root command set or required validation artifact links. | Add a standard Gate Verification section to Phase 22-34 top-level plans or make each closeout chore list exact commands and artifact paths: targeted unit tests, spawned integration tests, BDD, `bun test src/test/ci-workflow.test.ts`, `bun run lint:docs`, typecheck, lint, and build. | [[docs/plans/phase-22-original-markdown-language-support]] through [[docs/plans/phase-34-stack-overflow-markdown-language-support]], closeout chores `CHORE-116` through `CHORE-140`, dialect test/evidence tasks `TASK-317` through `TASK-353` |
| AUD-TBD-007 | Low | `docs/test/markdown-flavor-e2e-spec.md` defines Phase 21 as root/server BDD and validation evidence, while E17 remains the VS Code host proof owner. | [[docs/plans/phase-21-markdown-flavor-bdd-validation]] says Phase 21 depends on Phase E15. The roadmap describes Phase 21 as root/server BDD and validation evidence and separately assigns real VS Code host proof to E17. | The E15 dependency is not explained as a contract dependency versus an implementation dependency. | Server/root BDD validation may be unnecessarily blocked on extension selector implementation, or reviewers may assume Phase 21 BDD counts as extension host proof. | Clarify Phase 21 dependency wording: either depend on the E15 selector contract/spec only, or state why E15 implementation must complete before root/server BDD. Reaffirm that E17 remains the only VS Code host proof owner. | [[docs/plans/phase-21-markdown-flavor-bdd-validation]], [[roadmap]], `docs/test/markdown-flavor-e2e-spec.md` |

## Notes

- Many detailed tickets are stronger than their parent phase summaries. The
  audit findings above target places where the weaker parent gate or incomplete
  spec-ID mapping can hide required evidence.
- DDD ownership is mostly reflected correctly: BC4 owns authoritative
  `EffectiveMarkdownFlavor`, BC6 owns selector state, and host-specific
  boundaries are not vault scopes. The main DDD risk is insufficient integration
  evidence for resource-specific flavor state and non-local boundaries.
- I did not fix any finding.

## Docs Lint

Ran after writing this report:

```bash
bun run lint:docs
```

Result: passed.

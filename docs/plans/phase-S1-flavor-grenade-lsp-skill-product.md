---
title: "Phase S1: Flavor Grenade LSP Skill Product"
phase: S1
status: planned
tags: [plans, skill-product, llm, distribution, release]
aliases: [Phase S1, Flavor Grenade Skill, LSP Skill Product]
updated: 2026-05-24
---

# Phase S1: Flavor Grenade LSP Skill Product

| Field | Value |
|---|---|
| Phase | S1 |
| Title | Flavor Grenade LSP Skill Product |
| Status | planned |
| Gate | Versioned skill artifacts install locally, select the correct native executable, analyze representative Markdown workspaces, and publish through a separate skill release flow |
| Depends on | Phase 34, current native executable release pipeline |

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [skill/docs/index](../../skill/docs/index.md) | Maintain the normative skill specification set |
| [skill/docs/product-requirements](../../skill/docs/product-requirements.md) | Define product boundary, users, capabilities, and non-goals |
| [skill/docs/embedded-lsp-runtime](../../skill/docs/embedded-lsp-runtime.md) | Embed and verify the runtime-specific native LSP executable |
| [skill/docs/agent-compatibility](../../skill/docs/agent-compatibility.md) | Support Claude Code, Codex, and generic agent workflows |
| [skill/docs/distribution-marketplace](../../skill/docs/distribution-marketplace.md) | Make this repo usable as a skill marketplace and installer source |
| [skill/docs/commands-and-json](../../skill/docs/commands-and-json.md) | Specify wrapper commands and stable JSON schemas |
| [skill/docs/release-versioning](../../skill/docs/release-versioning.md) | Release and version the skill independently |
| [skill/docs/security](../../skill/docs/security.md) | Constrain wrapper, path, process, logging, and supply-chain behavior |
| [skill/docs/testing-validation](../../skill/docs/testing-validation.md) | Verify packaging, installer compatibility, runtime behavior, and hostile fixtures |

## Objective

Create a separately versioned and separately released `flavorgrenade-lsp` LLM
skill product that packages practical instructions, wrapper tooling, and a
runtime-specific Flavor Grenade LSP executable so an LLM agent can inspect,
classify, diagnose, and edit Markdown files across supported flavors without
requiring a VS Code extension.

The skill must make the LSP useful from agent environments that do not speak LSP
natively. It should hide JSON-RPC details behind stable helper commands while
still preserving the server as the source of truth for flavor detection,
diagnostics, symbols, folds, hovers, completions, and safe Markdown-aware
operations.

## Product Boundary

`flavorgrenade-lsp` remains the server package and native executable product.
The new skill is a distinct product named `flavorgrenade-lsp-skill`.

The skill has its own:

- source layout
- package manifest
- semantic version
- changelog
- release notes
- release tags
- release workflow
- artifact checksums
- signed release artifacts
- compatibility matrix against server executable versions

The skill may be developed in this repository, but it must not share version
numbers with the server, VS Code extension, or website unless a release manager
explicitly chooses matching versions for a coordinated release.

## Target Users

- LLM coding agents working in Markdown-heavy repositories.
- Documentation maintainers who want flavor-aware lint, symbols, and
  navigation without launching an editor.
- Release and support agents validating changelogs, ADRs, MADR documents,
  CommonMark, GFM, GLFM, Pandoc, MultiMarkdown, MDX, kramdown, Markdown Extra,
  R Markdown, Reddit Markdown, Stack Overflow Markdown, and Obsidian Markdown.
- CI or local automation that needs a small, deterministic Markdown analysis
  tool exposed through agent-friendly commands.

## Runtime Model

The skill ships as a small directory bundle:

```text
skills/flavorgrenade-lsp/
├── SKILL.md
├── README.md
├── CHANGELOG.md
├── manifest.json
├── bin/
│   ├── darwin-arm64/flavor-grenade-lsp
│   ├── darwin-x64/flavor-grenade-lsp
│   ├── linux-x64/flavor-grenade-lsp
│   └── win-x64/flavor-grenade-lsp.exe
├── wrappers/
│   ├── flavorgrenade-analyze.mjs
│   ├── flavorgrenade-lsp-client.mjs
│   └── flavorgrenade-runtime.mjs
├── examples/
│   ├── mixed-flavors/
│   ├── inferred-flavors/
│   └── structured-variants/
└── tests/
    ├── fixtures/
    └── skill-smoke.test.mjs
```

The distributable artifact may be published as one archive per runtime target
or as one archive containing all runtime targets. The first release should
prefer per-runtime archives to avoid unnecessarily large installs:

| Artifact | Contents |
|---|---|
| `flavorgrenade-lsp-skill-vX.Y.Z-linux-x64.tar.gz` | Skill docs, wrappers, examples, Linux executable |
| `flavorgrenade-lsp-skill-vX.Y.Z-darwin-arm64.tar.gz` | Skill docs, wrappers, examples, macOS arm64 executable |
| `flavorgrenade-lsp-skill-vX.Y.Z-darwin-x64.tar.gz` | Skill docs, wrappers, examples, macOS x64 executable |
| `flavorgrenade-lsp-skill-vX.Y.Z-win-x64.zip` | Skill docs, wrappers, examples, Windows executable |

Each artifact must include:

- the matching executable
- a manifest that records skill version, server version, git commit, platform,
  SHA-256 digest, and signing bundle path
- a generated install verification report
- a short `SKILL.md` entrypoint optimized for agent use
- `SKILL.md` YAML frontmatter with `name: flavorgrenade-lsp` and a concise
  `description` so repository skill installers can discover it
- no source repository history, local config, `.env` files, caches, or test
  output

## Skill Contract

The skill must present a concise agent-facing contract:

1. When asked to work on Markdown files, determine whether flavor-aware analysis
   is useful.
2. Locate the repository or document root.
3. Run the wrapper command instead of directly parsing Markdown by hand when the
   task involves supported flavor detection, diagnostics, symbols, folds,
   hovers, completions, or structural edits.
4. Treat the LSP output as advisory analysis unless a wrapper command explicitly
   returns an edit plan.
5. Never send document contents to a network service.
6. Never execute embedded code blocks, MDX JavaScript, R chunks, Pandoc filters,
   or renderer-specific hooks.
7. Preserve flavor boundaries and host/conversion boundary classifications.
8. Prefer local, reversible edits and show diagnostics before applying broad
   rewrites.

The `SKILL.md` file should be short enough for an agent to load by default, with
deeper references moved into `README.md` and `examples/`.

## Wrapper Commands

The skill must not require an LLM to manually speak JSON-RPC. It must include
wrapper commands that launch the native executable, perform the required LSP
handshake, open files or workspace roots, issue requests, and return compact
JSON.

Minimum command surface:

| Command | Purpose |
|---|---|
| `flavorgrenade analyze <path>` | Return effective flavor, variants, diagnostics, headings, links, symbols, and boundary warnings for one file or a workspace |
| `flavorgrenade detect <path>` | Return flavor detection evidence, including TOML config, VS Code config hints, file naming, folder placement, and syntax inference |
| `flavorgrenade diagnostics <path>` | Return diagnostics only, grouped by file and severity |
| `flavorgrenade symbols <path>` | Return document symbols and workspace symbol summaries |
| `flavorgrenade folds <path>` | Return folding ranges useful for large-document navigation |
| `flavorgrenade hover <path>:<line>:<character>` | Return concise hover text and flavor/boundary metadata |
| `flavorgrenade completions <path>:<line>:<character>` | Return relevant local completions for links, headings, labels, tags, or flavor-specific constructs |
| `flavorgrenade explain-flavor <path>` | Explain why a flavor or variant was selected, including confidence and fallback behavior |
| `flavorgrenade verify-install` | Verify executable presence, digest, signature bundle, platform match, and basic LSP handshake |

Nice-to-have command surface:

| Command | Purpose |
|---|---|
| `flavorgrenade outline <path>` | Produce an LLM-friendly Markdown outline from symbols and folds |
| `flavorgrenade refs <path>` | Return local links, embeds, references, and unresolved targets |
| `flavorgrenade variants <path>` | Report Keep a Changelog, Common Changelog, MADR, and other structured-profile flags |
| `flavorgrenade edit-plan <path>` | Produce a safe, reviewable edit plan for supported refactors without applying it |

## Runtime Selection

Runtime selection must be deterministic and inspectable:

1. Read `manifest.json`.
2. Detect `process.platform` and `process.arch`.
3. Map to one supported target:
   - `linux-x64`
   - `darwin-arm64`
   - `darwin-x64`
   - `win-x64`
4. Resolve the executable under `bin/<target>/`.
5. Verify the executable exists and is executable.
6. Verify SHA-256 digest against the manifest.
7. If a Sigstore bundle is included, verify the bundle when `cosign` is
   available.
8. Run an LSP `initialize` smoke handshake.
9. Fail closed with a plain error if any step fails.

The runtime resolver must not download binaries at runtime in the first
release. Download-on-demand can be reconsidered later with a separate ADR,
cache policy, signature verification, and offline behavior plan.

## LSP Adapter Design

The wrapper adapter owns one short-lived LSP process per command by default.
Long-lived daemon mode is explicitly out of scope for S1.

Adapter responsibilities:

- spawn the native executable with stdio pipes
- send `initialize`
- send `initialized`
- open target documents with `textDocument/didOpen`
- wait for diagnostics or request-driven analysis to settle
- issue LSP requests for symbols, folding ranges, hovers, completions, document
  links, references, and workspace symbols as needed
- normalize responses into stable skill JSON
- shut down and exit cleanly
- time out hung startup or request paths
- redact document content from logs
- preserve server stderr separately for troubleshooting without dumping file
  contents

Stable JSON result envelope:

```json
{
  "schemaVersion": "1.0",
  "skillVersion": "0.1.0",
  "serverVersion": "0.5.0",
  "platform": "linux-x64",
  "workspace": {
    "root": ".",
    "mode": "workspace"
  },
  "files": [],
  "diagnostics": [],
  "flavors": [],
  "variants": [],
  "symbols": [],
  "folds": [],
  "links": [],
  "boundaries": [],
  "warnings": []
}
```

The envelope must be documented and versioned independently from raw LSP
protocol shapes so agent prompts do not depend on server-internal response
details.

## Flavor And Variant Behavior

The skill must expose the same effective flavor model as the server:

- explicit TOML config wins
- VS Code configuration may be considered when available in the workspace
- when configuration is absent, inference uses naming, folder placement,
  frontmatter, syntax signatures, links, code fences, tables, admonitions,
  wiki-links, embeds, host syntax, and structured-profile clues
- root `README.md` must not default to Obsidian Flavored Markdown without
  stronger evidence
- changelog and MADR formats are variants or structured-profile flags, not
  separate base flavors

Structured variants must be reported alongside the base flavor:

```json
{
  "baseFlavor": "commonmark",
  "variants": ["keep-a-changelog", "madr"],
  "confidence": "high",
  "evidence": ["file-name", "heading-shape", "directory-placement"]
}
```

The skill must not expand the base flavor list. It must help agents understand
the difference between base Markdown flavors and independently applicable
document conventions.

## Security Requirements

The skill product has a larger attack surface than the server alone because it
is designed to be run by LLM agents. S1 must treat the wrapper as a security
boundary.

Required controls:

- no network access from wrappers
- no runtime binary downloads
- no shell interpolation of user-supplied paths
- spawn the executable with an argv array, never a shell command string
- reject paths outside the requested workspace root
- interpret `--include` and `--exclude` globs inside the wrapper after
  workspace confinement, never through shell expansion
- reject unsupported URI schemes before sending analysis requests
- never execute Markdown code blocks, MDX imports, R chunks, Pandoc filters, or
  renderer hooks
- redact document text from logs and errors
- cap file count, file size, request duration, and output size
- include a `--json` mode as the default machine-readable output
- avoid writing files unless a future edit command explicitly requests a
  reviewed edit plan
- verify bundled executable digests before launch
- carry Sigstore bundles from the executable release into the skill release
- document exactly which executable version the skill uses

Security test coverage must include command injection paths, path traversal,
workspace escape attempts, oversized inputs, unsupported schemes, malicious
frontmatter, executable code blocks, and corrupted executable digest metadata.

## Versioning

The skill uses independent semantic versioning:

```text
skill version: 0.1.0
server version: >=0.5.0 <0.6.0
artifact tag: skill-v0.1.0
```

Versioning rules:

- Patch: prompt wording, docs fixes, wrapper bug fixes that do not change JSON
  schema or minimum server version.
- Minor: new commands, new JSON fields, new supported runtime targets, broader
  Markdown analysis surfaces, or compatible server-version range changes.
- Major: breaking JSON schema changes, command removals, changed default safety
  behavior, or incompatible server-version range changes.

The skill artifact manifest must include:

```json
{
  "name": "flavorgrenade-lsp-skill",
  "version": "0.1.0",
  "server": {
    "package": "flavor-grenade-lsp",
    "version": "0.5.0",
    "commit": "<server-release-commit>"
  },
  "artifact": {
    "target": "linux-x64",
    "sha256": "<digest>",
    "sigstoreBundle": "bin/linux-x64/flavor-grenade-lsp.sigstore.json"
  },
  "schemaVersion": "1.0"
}
```

## Release Flow

The skill release is separate from the server release.

Tag pattern:

```text
skill-v*.*.*
skill-v*.*.*-test*
```

Release flow:

1. Create `release/skill-vX.Y.Z` from `develop`.
2. Update `skills/flavorgrenade-lsp/CHANGELOG.md`.
3. Set `skills/flavorgrenade-lsp/manifest.json` version.
4. Select the server executable release version to embed.
5. Build or download trusted native executable artifacts from the matching
   server release.
6. Verify server executable checksums and Sigstore bundles.
7. Assemble runtime-specific skill archives.
8. Run local install verification for every target possible on CI.
9. Sign skill archives with GitHub OIDC Sigstore.
10. Publish a GitHub release for the `skill-vX.Y.Z` tag.
11. Attach archives, checksums, signature bundles, release notes, and
    compatibility table.
12. Merge the release branch according to git-flow.

Test tags must exercise packaging and signing without publishing a production
release. They may produce draft prereleases. Test tags must not trigger server
npm publishing or extension publishing.

## CI Plan

Pull request CI must run:

```bash
bun test skills/flavorgrenade-lsp/tests
bun run build:binary
bun run skill:package -- --dry-run
bun run skill:verify -- --target current
bun run lint
bun run typecheck
bun run lint:docs
```

Release CI must run:

- package each supported runtime target
- verify every manifest digest
- verify included Sigstore bundles when possible
- run a basic LSP handshake on native runners for Linux, macOS arm64, macOS
  x64, and Windows x64
- run wrapper command smoke tests on platform fixtures
- sign archives with OIDC
- upload artifacts and signatures

CI must fail if:

- `SKILL.md` references a command that is not packaged
- `SKILL.md` lacks required `name` or `description` frontmatter
- a manifest executable digest does not match the bundled executable
- a wrapper command shells out with unescaped user input
- a runtime target is missing from the compatibility matrix
- the skill embeds an executable not built from the declared server commit
- the skill release tries to reuse a previously published skill version

## Test Plan

### Unit Tests

- Runtime target resolution maps known `platform` and `arch` values correctly.
- Unsupported runtimes fail with actionable errors.
- Manifest parsing rejects missing version, missing server commit, missing
  digest, unknown target, and malformed JSON.
- Digest verification rejects modified executables.
- Path normalization rejects workspace escapes and unsupported schemes.
- JSON result normalization is stable and schema-versioned.

### Integration Tests

- Wrapper launches the native executable and completes `initialize`.
- `analyze` returns diagnostics and symbols for a CommonMark fixture.
- `detect` returns explicit TOML evidence when config exists.
- `detect` returns inference evidence when config is absent.
- Root `README.md` without Obsidian evidence does not detect as OFM.
- Changelog files report Keep a Changelog or Common Changelog variants without
  changing the base flavor.
- MADR files report the MADR variant without changing the base flavor.
- Unsupported host/conversion references are reported as boundaries, not local
  broken links.

### Smoke Fixtures

The skill should reuse and copy a minimized subset of the extension smoketest
fixtures:

- explicit TOML base flavor examples
- inferred flavor examples
- root README examples
- changelog variants
- MADR variants
- mixed structured-profile documents
- large outline document
- hostile path and code-execution examples

### Agent Behavior Tests

Use prompt-level tests where feasible:

- agent asks for Markdown flavor detection and calls `flavorgrenade detect`
- agent asks for diagnostics and calls `flavorgrenade diagnostics`
- agent asks for document outline and calls `flavorgrenade symbols` or
  `flavorgrenade outline`
- agent receives a boundary warning and does not rewrite it as a local link
- agent sees a structured variant and does not invent a new base flavor

## Documentation Plan

The skill docs must include:

- `SKILL.md`: short operational instructions for LLM agents
- `README.md`: installation, commands, examples, troubleshooting
- `CHANGELOG.md`: skill-only changelog
- `docs/compatibility.md`: skill version to server version mapping
- `docs/security.md`: local-only behavior, no execution, no network, path
  confinement, and signing model
- `docs/json-schema.md`: stable output schemas for wrapper commands
- `examples/`: small examples for each supported analysis flow

Docs must be clear that this is an LLM skill product, not the VS Code extension
and not a replacement for the server package.

## Implementation Workstreams

| Workstream | Deliverable |
|---|---|
| Product scaffold | `skills/flavorgrenade-lsp/` source tree, skill manifest, skill changelog, docs |
| Runtime resolver | Cross-platform executable selection, digest verification, install verification |
| LSP adapter | JSON-RPC subprocess client used by wrapper commands |
| Command wrappers | Agent-friendly command surface with stable JSON output |
| Packaging | Runtime-specific archives with manifest, executable, docs, examples, checksums |
| Release automation | `skill-v*` workflows, OIDC signing, draft test releases, production releases |
| Compatibility | Server-version matrix, schema-version matrix, artifact provenance |
| Security | Path confinement, no network, no code execution, command injection tests |
| Validation | Unit, integration, smoke, prompt-level behavior, release dry-run evidence |

## Acceptance

- A clean checkout can build or assemble a skill artifact for the current
  runtime.
- `flavorgrenade verify-install` passes from the unpacked skill artifact.
- `flavorgrenade analyze` works against representative Markdown fixtures.
- `flavorgrenade detect` reports config-based and inference-based flavor
  decisions with evidence.
- Changelog and MADR conventions appear as variants, not base flavors.
- The skill artifact includes exactly one runtime executable for the target
  platform unless an all-platform artifact is explicitly selected.
- The manifest records skill version, server version, commit, target, digest,
  and signature metadata.
- PR CI verifies dry-run packaging and current-platform install.
- Release CI builds all supported runtime artifacts and signs them.
- A `skill-v*.*.*-test*` tag can force a dry-run release without triggering
  server npm publishing, extension publishing, or website deployment.
- The skill changelog and release notes are independent from the root server
  changelog.

## Gate Verification

```bash
bun test skills/flavorgrenade-lsp/tests
bun run skill:package -- --dry-run
bun run skill:verify -- --target current
bun run lint
bun run typecheck
bun run lint:docs
```

GitHub Actions evidence must also show the skill packaging dry-run, executable
digest verification, wrapper smoke tests, and release-signing dry-run passing.

## Out Of Scope

- Long-lived LSP daemon mode.
- Runtime binary downloads.
- Network-backed host integrations for GitHub, GitLab, Reddit, Stack Overflow,
  citation databases, or package registries.
- Code execution inside Markdown documents.
- Automatic file edits outside a future explicit edit-plan command.
- Replacing the VS Code extension.
- Publishing to third-party skill registries until a registry-specific release
  policy is documented.

## Open Decisions

| Decision | Default for S1 | Follow-up trigger |
|---|---|---|
| One archive per target vs all targets | One archive per target | Switch only if users need offline multi-platform transfer |
| Skill source directory name | `skills/flavorgrenade-lsp/` | Revisit if a registry mandates another layout |
| Wrapper implementation language | Node `.mjs` scripts | Revisit if agent runtimes cannot rely on Node |
| Binary source | Embed release-built executable | Revisit if reproducible local build is required |
| Release destination | GitHub Releases | Revisit when a skill registry is selected |
| Prompt tests | Local fixture-driven tests first | Expand once target agent harness is stable |

## Risks

| Risk | Mitigation |
|---|---|
| Skill prompts drift from executable behavior | Keep wrappers authoritative; keep `SKILL.md` short; validate against fixtures |
| Artifact size grows too large | Prefer per-runtime artifacts; omit source history and caches |
| LLM agents misuse diagnostics as edit commands | Separate analysis from edit-plan commands; return warnings explicitly |
| Runtime selection breaks on unsupported platforms | Fail closed with target list and install guidance |
| Wrapper becomes an injection surface | Use argv spawning, path confinement, and adversarial tests |
| Separate versioning confuses releases | Maintain compatibility docs and independent changelog |
| Test tags trigger unrelated publishers | Add explicit workflow guards for `skill-v*` tags |

## Related

- [[docs/plans/phase-13-ci-delivery]]
- [[docs/plans/phase-19-markdown-flavor-model-profiles]]
- [[docs/plans/phase-20-markdown-flavor-server-propagation]]
- [[docs/plans/phase-21-markdown-flavor-bdd-validation]]
- [[docs/plans/phase-34-stack-overflow-markdown-language-support]]
- [[docs/requirements/functional/markdown-flavor-lsp]]
- [[docs/requirements/operational/ci-cd]]
- [[docs/requirements/operational/security-supply-chain]]
- [skill/docs/index](../../skill/docs/index.md)
- [skill/docs/product-requirements](../../skill/docs/product-requirements.md)
- [skill/docs/embedded-lsp-runtime](../../skill/docs/embedded-lsp-runtime.md)
- [skill/docs/agent-compatibility](../../skill/docs/agent-compatibility.md)
- [skill/docs/distribution-marketplace](../../skill/docs/distribution-marketplace.md)
- [skill/docs/commands-and-json](../../skill/docs/commands-and-json.md)
- [skill/docs/release-versioning](../../skill/docs/release-versioning.md)
- [skill/docs/security](../../skill/docs/security.md)
- [skill/docs/testing-validation](../../skill/docs/testing-validation.md)

---
title: Behavior Layer — BDD Scenario Index
tags: [design, bdd, behavior, testing, scenarios, feature-files]
aliases: [bdd-index, behavior-layer, feature-files, bdd-scenarios]
---

# Behavior Layer — BDD Scenario Index

`flavor-grenade-lsp` uses Behavior-Driven Development (BDD) as the primary mechanism for specifying, communicating, and verifying server behavior. BDD scenarios written in Gherkin serve as both living documentation and the integration test suite. Every LSP method and every OFM-specific feature has at least one corresponding `.feature` file.

> [!note] BDD drives TDD
> The development cycle is: write a scenario in Gherkin → run `bun run bdd` → watch it fail (red) → implement the feature or harness coverage → watch it pass (green) → refactor. Scenarios are written by the developer alongside architecture decisions, not after implementation. This means the scenario suite captures the intended semantics, not just the implemented behavior.

---

## Tag Taxonomy

Scenarios are tagged to enable selective test execution. The tag system defines these tiers:

| Tag | Meaning | Used In | CI Gate? |
|-----|---------|---------|----------|
| `@smoke` | Must pass before any other tests are run; covers critical paths | All feature files (≥ 1 per file) | Yes — blocks merge if failing |
| `@ofm` | OFM-specific behavior not present in generic Markdown LSPs | wiki-link, embed, block-ref, tag, callout, alias features | No (but included in full CI) |
| `@lsp` | Protocol-level behavior — JSON-RPC framing, capability negotiation, error responses | initialization, lifecycle, error-handling | No |
| `@planned` | Future behavior contract kept as Gherkin before product code or harness steps exist | Roadmap-driven feature files | No — excluded by `cucumber.yaml` until implementation lands |
| `@wip` | Historical work-in-progress marker; checked-in scenarios must still execute in the default gate unless explicitly excluded in `cucumber.yaml` | Any file | Yes when included by the default Cucumber config |

Tags are composable. A scenario can carry multiple tags:

```gherkin
@smoke @ofm
Scenario: resolving a wiki-link with alias to an aliased document
```

Running `bun run bdd -- --tags @smoke` executes only smoke scenarios. Running `bun run bdd` runs the default full Cucumber catalog configured by `cucumber.yaml`, excluding scenarios tagged `@planned`.

---

## Feature File Catalog

All `.feature` files live in `docs/bdd/features/`. They are executable specifications and may remain in `docs/`; source-owned step definitions and implementation notes live under `src/test/bdd/`.

| Feature File | Requirements Tested | Primary Tags | Scenario Count |
|-------------|---------------------|-------------|----------------|
| `docs/bdd/features/block-references.feature` | Block anchor indexing, cross-reference diagnostics, and completion | `@ofm`, `@smoke` | 9 |
| `docs/bdd/features/callouts.feature` | Callout parsing and completion behavior | `@ofm`, `@smoke` | 9 |
| `docs/bdd/features/code-actions.feature` | Code-action availability and deterministic command/edit expectations | `@ofm`, `@workflow-pending` | 2 |
| `docs/bdd/features/completions.feature` | Completion routing, caps, trigger contexts, and candidate ordering | `@lsp`, `@smoke` | 10 |
| `docs/bdd/features/diagnostics.feature` | Broken-link, ambiguity, embed, block-ref, and lifecycle diagnostics | `@lsp`, `@smoke` | 9 |
| `docs/bdd/features/embeds.feature` | Embed resolution, diagnostics, navigation, hover, and attachment behavior | `@ofm`, `@smoke` | 10 |
| `docs/bdd/features/frontmatter.feature` | YAML frontmatter parsing and metadata behavior | `@ofm`, `@smoke` | 9 |
| `docs/bdd/features/navigation.feature` | Definitions, references, CodeLens, highlights, and tag precision | `@lsp`, `@smoke` | 9 |
| `docs/bdd/features/markdown-flavor-dialects.feature` | Researched Markdown flavor-specific behavior and dialect profiles | `@extension`, `@vscode`, `@markdown-flavor` | 5 |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | Markdown flavor selection, auto-detection, override persistence, and manual-mode safety | `@extension`, `@vscode`, `@markdown-flavor` | 7 |
| `docs/bdd/features/ofmarkdown-parity.feature` | Standard Markdown link parity, structural LSP, attachments, and file operations | `@lsp`, `@parity` | 10 |
| `docs/bdd/features/rename.feature` | Prepare-rename and workspace-edit behavior | `@lsp`, `@smoke` | 8 |
| `docs/bdd/features/tags.feature` | Tag indexing, hierarchy, references, completion, and YAML equivalence | `@ofm` | 9 |
| `docs/bdd/features/transport.feature` | JSON-RPC transport and LSP lifecycle handshake | `@lsp`, `@smoke` | 2 |
| `docs/bdd/features/vault-detection.feature` | Vault root detection, single-file mode, file-extension filters, and confinement setup | `@lsp`, `@smoke` | 8 |
| `docs/bdd/features/vscode-extension-parity.feature` | Extension parity scenarios for activation, membership refresh, host coverage, and package behavior | `@vscode`, `@extension`, `@parity` | 6 |
| `docs/bdd/features/vscode-extension.feature` | Extension activation, status bar, commands, binary resolution, crash recovery, and lifecycle behavior | `@extension`, `@lsp`, `@wip` | 13 |
| `docs/bdd/features/wiki-links.feature` | Wiki-link completion, definition, diagnostics, references, aliases, and style behavior | `@ofm`, `@smoke` | 10 |
| `docs/bdd/features/workspace.feature` | Workspace scanning, lookup, ignore rules, file watching, and multi-root behavior | `@lsp` | 10 |

Total: **155 scenarios** across 19 feature files. The default `bun run bdd` gate currently executes all checked-in scenarios.

---

## Scenario Naming Conventions

Scenario names follow the template:

```text
<subject> <verb> <condition>
```

Examples:

- `wiki-link completion returns document slugs matching partial text`
- `diagnostics clears BrokenLink after target document is created`
- `rename heading updates all CrossSection refs across vault`
- `prepareRename rejects cursor on wiki-link label text`
- `hover shows first 5 lines of target document for resolved wiki-link`

The subject is the feature area, the verb is the action or behavior, and the condition is the triggering state or context. Negative scenarios use "rejects", "skips", or "does not":

- `completion does not offer candidates inside fenced code block`
- `tags never produce BrokenLink diagnostics`
- `diagnostics skips TagRef when scanning unresolved refs`

---

## Step Definition Structure

Step definitions live in `src/test/bdd/step-definitions/`. Each step module corresponds to a domain area:

```text
src/test/bdd/step-definitions/
  ├── common.steps.ts             ← Shared vault, document, and assertion steps
  ├── transport.steps.ts          ← JSON-RPC and LSP lifecycle steps
  ├── wiki-links.steps.ts         ← Wiki-link resolution and diagnostic steps
  ├── block-references.steps.ts   ← Block anchor steps
  ├── callouts.steps.ts           ← Callout parsing and completion steps
  ├── code-actions.steps.ts       ← Code action list and edit assertions
  ├── completions.steps.ts        ← Completion item assertions
  ├── diagnostics.steps.ts        ← Diagnostic code/range assertions
  ├── embeds.steps.ts             ← Embed and attachment assertions
  ├── extension-harness.steps.ts  ← Deterministic extension acceptance state
  ├── frontmatter.steps.ts        ← Frontmatter parsing assertions
  ├── navigation.steps.ts         ← Definition, references, CodeLens, highlights
  ├── ofmarkdown-parity.steps.ts  ← Standard Markdown parity and file operations
  ├── rename.steps.ts             ← Prepare-rename and workspace edits
  ├── tags.steps.ts               ← Tag index, hierarchy, completion, references
  └── vault-detection.steps.ts    ← Vault detection, scanner, and watcher steps
```

### Integration Test Infrastructure

Steps use the shared `FGWorld` and helpers in `src/test/bdd/world.ts` plus per-area step modules in `src/test/bdd/step-definitions/`. The harness:

1. Spawns a real `flavor-grenade-lsp` process for server-side LSP scenarios.
2. Manages JSON-RPC framing over stdin/stdout
3. Provides typed request/notification helpers through `FGWorld`
4. Waits for `textDocument/publishDiagnostics` before asserting on diagnostics
5. Creates a temporary vault directory for each scenario and tears it down after
6. Uses deterministic harness state for extension scenarios that are covered by VS Code host tests elsewhere

Server-side BDD scenarios are **full integration tests**: they run the real server path rather than a mocked handler. Extension BDD scenarios use deterministic Cucumber harness state for acceptance traceability; extension-host execution is covered by `npm run test:host`.

> [!tip] Test vault isolation
> Each BDD scenario gets a fresh temporary vault directory. The `vault.steps.ts` `Given` steps create files in this directory before the scenario sends `initialized` to the server. After the scenario, the directory is deleted. This ensures scenario isolation even when scenarios test file creation or rename side effects.

---

## Example Feature File Structure

```gherkin
# docs/bdd/features/diagnostics.feature
Feature: Diagnostic publication for broken wiki-links and OFM refs

  Background:
    Given a fresh vault at a temporary directory
    And the LSP server is running against that vault

  @smoke @ofm
  Scenario: BrokenLink diagnostic for unresolved wiki-link
    Given a file "notes/index.md" with content:
      """
      See [[nonexistent-note]] for details.
      """
    When I open "notes/index.md" in the editor
    Then diagnostics for "notes/index.md" should contain:
      | code        | severity | message                                |
      | BrokenLink  | Error    | No document found for 'nonexistent-note' |

  @ofm
  Scenario: BrokenLink clears after target document is created
    Given a file "notes/index.md" with content "See [[new-note]]."
    And I open "notes/index.md" in the editor
    And diagnostics for "notes/index.md" contain "BrokenLink"
    When a file "notes/new-note.md" is created on disk
    Then diagnostics for "notes/index.md" should be empty

  @ofm
  Scenario: tags never produce BrokenLink diagnostics
    Given a file "notes/index.md" with content "#completely-unknown-tag"
    When I open "notes/index.md" in the editor
    Then diagnostics for "notes/index.md" should be empty
```

---

## Relation to Requirements

The BDD feature files are the primary traceability artifact linking implementation to requirements. Each `@requirements` tag (used informally in feature file comments) cites the requirement document from `docs/requirements/` that the scenario validates.

The traceability matrix is maintained in [[docs/test/matrix]]. For each functional requirement, it lists the tests or BDD step files that verify it and their current pass/fail status.

---

## Cross-References

- [[docs/design/api-layer]] — LSP methods tested by each feature file
- [[docs/design/domain-layer]] — Domain concepts expressed in scenario language
- [[docs/concepts/connection-graph]] — RefGraph behavior validated in diagnostics and definition scenarios
- [[docs/concepts/symbol-model]] — Sym types asserted in definition and references scenarios
- [[docs/architecture/data-flow]] — Flows exercised by completion and diagnostics scenarios
- `docs/bdd/features/vscode-extension.feature` — VS Code extension lifecycle and integration scenarios
- `docs/bdd/features/ofmarkdown-language-mode.feature` — Markdown flavor selector acceptance scenarios
- [[docs/adr/ADR015-platform-specific-vsix]] — Decision record for platform-specific VSIX packaging
- [[docs/adr/ADR020-markdown-flavor-selection]] — Decision record for Markdown flavor selection

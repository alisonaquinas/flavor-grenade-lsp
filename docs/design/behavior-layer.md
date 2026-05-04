---
title: Behavior Layer — BDD Scenario Index
tags: [design, bdd, behavior, testing, scenarios, feature-files]
aliases: [bdd-index, behavior-layer, feature-files, bdd-scenarios]
---

# Behavior Layer — BDD Scenario Index

`flavor-grenade-lsp` uses Behavior-Driven Development (BDD) as the primary mechanism for specifying, communicating, and verifying server behavior. BDD scenarios written in Gherkin serve as both living documentation and the integration test suite. Every LSP method and every OFM-specific feature has at least one corresponding `.feature` file.

> [!note] BDD drives TDD
> The development cycle is: write a scenario in Gherkin → run `bun test --bdd` → watch it fail (red) → implement the feature → watch it pass (green) → refactor. Scenarios are written by the developer alongside architecture decisions, not after implementation. This means the scenario suite captures the intended semantics, not just the implemented behavior.

---

## Tag Taxonomy

Scenarios are tagged to enable selective test execution. The tag system has four tiers:

| Tag | Meaning | Used In | CI Gate? |
|-----|---------|---------|----------|
| `@smoke` | Must pass before any other tests are run; covers critical paths | All feature files (≥ 1 per file) | Yes — blocks merge if failing |
| `@ofm` | OFM-specific behavior not present in generic Markdown LSPs | wiki-link, embed, block-ref, tag, callout, alias features | No (but included in full CI) |
| `@lsp` | Protocol-level behavior — JSON-RPC framing, capability negotiation, error responses | initialization, lifecycle, error-handling | No |
| `@wip` | Work-in-progress — scenario written but implementation incomplete | Any file | No — excluded from CI |

Tags are composable. A scenario can carry multiple tags:

```gherkin
@smoke @ofm
Scenario: resolving a wiki-link with alias to an aliased document
```

Running `bun test --tags @smoke` executes only the CI gate scenarios. Running `bun test --tags @ofm` runs the full OFM regression suite.

---

## Feature File Catalog

All `.feature` files live in `bdd/features/`. Each file covers one functional area.

| Feature File | Requirements Tested | Primary Tags | Scenario Count |
|-------------|---------------------|-------------|----------------|
| `bdd/features/initialization.feature` | Server startup, capability negotiation, vault detection, single-file mode detection | `@smoke`, `@lsp` | 8 |
| `bdd/features/transport.feature` | LSP stdio transport, JSON-RPC framing, initialize/initialized handshake, shutdown/exit sequence | `@smoke`, `@lsp` | 2 |
| `bdd/features/wiki-link-completion.feature` | Document slug completion, heading anchor completion, block ref completion, alias matching, `isIncomplete` flag | `@smoke`, `@ofm` | 14 |
| `bdd/features/wiki-link-definition.feature` | Go-to-def for `CrossDoc`, `CrossSection`, `CrossBlock`, `IntraRef`; alias resolution; ambiguous target handling | `@smoke`, `@ofm` | 11 |
| `bdd/features/wiki-link-references.feature` | Find-all-refs for `DocDef`, `HeaderDef`, `BlockAnchorDef`, `AliasDef`; vault-wide cross-ref counting | `@smoke`, `@ofm` | 10 |
| `bdd/features/diagnostics.feature` | `BrokenLink`, `BrokenSection`, `BrokenBlockRef`, `BrokenEmbed`, `BrokenIntraLink`, `AmbiguousLink`; diagnostic lifecycle on doc change | `@smoke`, `@ofm` | 16 |
| `bdd/features/embeds.feature` | Embed completion, embed definition (`.md` targets), embed definition (image targets), broken embed diagnostics, MIME hint in hover | `@ofm` | 9 |
| `bdd/features/tags.feature` | Tag completion, tag references, tag hierarchy (`#project/active`), tags-never-broken invariant, frontmatter `tags:` equivalent to inline `#tag` | `@ofm` | 8 |
| `bdd/features/hover.feature` | Wiki-link hover preview (first 5 lines), tag info (usage count), frontmatter key descriptions, no hover in ignore regions | `@smoke`, `@ofm` | 7 |
| `bdd/features/rename.feature` | Heading rename (updates all section refs), file rename (updates all doc refs), `prepareRename` rejection on non-renameable positions, alias-aware rename | `@ofm` | 10 |
| `bdd/features/symbols.feature` | `documentSymbol` heading tree, `workspace/symbol` subsequence matching, `codeLens` reference counts on headings and block anchors | `@smoke`, `@ofm` | 9 |
| `bdd/features/semantic-tokens.feature` | Token type for each OFM element, no tokens inside ignore regions, callout type token, block anchor token | `@ofm` | 12 |
| `bdd/features/code-actions.feature` | `InsertTOC` action, `CreateMissingFile` action, `TagToYaml` action, `NormalizeFrontmatter` action, action availability by cursor position | `@ofm` | 8 |
| `bdd/features/vscode-extension.feature` | VS Code extension activation, status bar widget, palette commands (restart, rebuild, show output), binary resolution (user setting / bundled), server config change restart, deactivation cleanup, crash recovery, LanguageClient selector continuity | `@smoke`, `@extension`, `@lsp` | 12 |
| `bdd/features/ofmarkdown-language-mode.feature` | Dynamic `ofmarkdown` language assignment for vault/index documents; Markdown parity and manual mode safety | `@extension`, `@ofmarkdown` | 6 |

Total: **142 scenarios** across 15 feature files (as of the initial specification; `@wip` scenarios are counted but excluded from CI).

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

Step definitions live in `bdd/steps/`. Each step module corresponds to a domain area:

```text
bdd/steps/
  ├── lsp-client.steps.ts        ← Given/When/Then for raw LSP requests (shared)
  ├── vault.steps.ts             ← Given: vault setup, file creation, file content
  ├── completion.steps.ts        ← Then: completion item assertions
  ├── definition.steps.ts        ← Then: definition location assertions
  ├── references.steps.ts        ← Then: reference list assertions
  ├── diagnostics.steps.ts       ← Then: diagnostic code/range assertions
  ├── hover.steps.ts             ├── Then: hover content assertions
  ├── rename.steps.ts            ← Then: workspace edit assertions
  ├── symbols.steps.ts           ← Then: symbol tree and code lens assertions
  ├── semantic-tokens.steps.ts   ← Then: semantic token type assertions
  └── code-actions.steps.ts      ← Then: code action list and edit assertions
```

### Integration Test Infrastructure

Steps use a `LspTestClient` helper (in `bdd/support/lsp-test-client.ts`) that:

1. Spawns a real `flavor-grenade-lsp` process via `child_process.spawn`
2. Manages JSON-RPC framing over stdin/stdout
3. Provides typed request/notification helpers (`client.didOpen(uri, text)`, `client.completion(uri, position)`, etc.)
4. Waits for `textDocument/publishDiagnostics` before asserting on diagnostics (async barrier)
5. Creates a temporary vault directory (`tmp/bdd-vault-XXXX/`) for each scenario and tears it down after

The `LspTestClient` is a **full integration test** — it runs the real server binary, not a mock. This ensures scenarios test the complete stack including JSON-RPC serialization, NestJS module initialization, and filesystem operations.

> [!tip] Test vault isolation
> Each BDD scenario gets a fresh temporary vault directory. The `vault.steps.ts` `Given` steps create files in this directory before the scenario sends `initialized` to the server. After the scenario, the directory is deleted. This ensures scenario isolation even when scenarios test file creation or rename side effects.

---

## Example Feature File Structure

```gherkin
# bdd/features/diagnostics.feature
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

The traceability matrix is maintained in `docs/requirements/traceability.md`. For each functional requirement, it lists the scenarios that verify it and their current pass/fail status in CI.

---

## Cross-References

- [[design/api-layer]] — LSP methods tested by each feature file
- [[design/domain-layer]] — Domain concepts expressed in scenario language
- [[concepts/connection-graph]] — RefGraph behavior validated in diagnostics and definition scenarios
- [[concepts/symbol-model]] — Sym types asserted in definition and references scenarios
- [[architecture/data-flow]] — Flows exercised by completion and diagnostics scenarios
- `docs/bdd/features/vscode-extension.feature` — VS Code extension lifecycle and integration scenarios
- `docs/bdd/features/ofmarkdown-language-mode.feature` — OFMarkdown language-mode acceptance scenarios
- [[adr/ADR015-platform-specific-vsix]] — Decision record for platform-specific VSIX packaging
- [[adr/ADR016-ofmarkdown-language-mode]] — Decision record for dynamic OFMarkdown assignment

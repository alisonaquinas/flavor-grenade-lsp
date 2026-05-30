@vscode @extension @parity @adr:ADR019
# Curated extension-doc reference mirror only. Executable cucumber source lives
# under docs/bdd/features. Each scenario below declares its source file because
# this mirror intentionally gathers parity and Markdown-flavor scenarios.
Feature: VS Code extension parity
  The VS Code extension should provide Markdown-flavor-aware client behavior
  without moving language intelligence out of the server.

  # Source: docs/bdd/features/vscode-extension-parity.feature
  @req:Extension.Activation.MarkerEvents
  Scenario: Vault marker activation starts the extension
    Given a VS Code workspace contains ".obsidian/"
    When the extension host starts
    Then Flavor Grenade activates
    And the LanguageClient is prepared for vault membership detection

  # Source: docs/bdd/features/vscode-extension-parity.feature
  @req:Extension.Activation.MarkerEvents @req:Extension.MarkdownFlavor.Refresh
  Scenario: Generic Markdown remains lightweight
    Given a workspace has Markdown files but no vault marker
    When the extension host starts
    Then generic Markdown remains in "markdown" mode
    And no vault indexing work is requested

  # Source: docs/bdd/features/ofmarkdown-language-mode.feature
  @req:Extension.MarkdownFlavor.Selector @req:Extension.MarkdownFlavor.RequiredCoverage
  Scenario Outline: Markdown flavor selector exposes every required choice
    Given a Markdown document is active with language id "markdown"
    When the user opens the Markdown flavor selector
    Then the selector includes id "<id>" with label "<label>"

    Examples:
      | id             | label                         |
      | auto           | Auto Detect                   |
      | original       | Original Markdown             |
      | commonmark     | CommonMark                    |
      | obsidian       | Obsidian                      |
      | gfm            | GitHub Flavored Markdown      |
      | glfm           | GitLab Flavored Markdown      |
      | pandoc         | Pandoc Markdown               |
      | multimarkdown  | MultiMarkdown                 |
      | mdx            | MDX                           |
      | kramdown       | kramdown                      |
      | markdown-extra | Markdown Extra                |
      | r-markdown     | R Markdown                    |
      | reddit         | Reddit Markdown               |
      | stack-overflow | Stack Overflow Markdown       |

  # Extension-local summary; detailed source scenarios live in
  # docs/bdd/features/ofmarkdown-language-mode.feature and
  # docs/bdd/features/vscode-extension-parity.feature.
  @planned @req:Extension.MarkdownStructuredProfiles.Configuration
  Scenario: Structured profile ids stay outside the Markdown flavor selector
    Given a Markdown document is active with language id "markdown"
    When the user opens the Markdown flavor selector
    Then the selector does not include id "keep-a-changelog"
    And the selector does not include id "common-changelog"
    And the selector does not include id "madr"

  # Extension-local summary; detailed source scenarios live in
  # docs/bdd/features/ofmarkdown-language-mode.feature and
  # docs/bdd/features/vscode-extension-parity.feature.
  @planned @req:Extension.MarkdownStructuredProfiles.Configuration @req:FlavorLSP.StructuredProfiles.Flags
  Scenario Outline: Structured profile settings propagate with the effective flavor
    Given a Markdown document is active with language id "markdown"
    And the effective Markdown flavor becomes "<baseFlavor>"
    When ".fgattributes" sets "structured_profiles=<selection>" for the active resource
    Then the extension sends structured profile selection "<selection>" to the server with the active resource
    And server diagnostics, completions, navigation, hover, semantic tokens, and rename use expected structured profile state "<profile>"
    And the Markdown flavor selector still shows only base flavor choices

    Examples:
      | baseFlavor | selection             | profile           |
      | commonmark | keep-a-changelog      | keep-a-changelog  |
      | gfm        | common-changelog      | common-changelog  |
      | obsidian   | madr                  | madr              |
      | pandoc     | none                  | none              |

  # Source: docs/bdd/features/ofmarkdown-language-mode.feature
  @req:Extension.MarkdownFlavor.OverridePersistence
  Scenario: Markdown flavor overrides persist at the active document scope
    Given a Markdown document belongs to an open workspace folder
    When the user selects "CommonMark" from the Markdown flavor selector
    And the user selects "Selected file" from the scope prompt
    Then ".fgattributes" receives a file-specific "flavor=commonmark" rule
    When the user opens a standalone Markdown file and selects "Original Markdown"
    And the user selects "Selected file" from the scope prompt
    Then ".fgattributes" beside the standalone file receives a file-specific "flavor=original" rule

  # Source: docs/bdd/features/ofmarkdown-language-mode.feature
  @req:Extension.MarkdownFlavor.ServerPropagation
  Scenario: Markdown flavor changes refresh server analysis
    Given a Markdown document is active with effective flavor "commonmark"
    When the user selects "Obsidian" from the Markdown flavor selector
    Then the extension sends the effective flavor "obsidian" to the server
    And open Markdown diagnostics are refreshed

  # Source: docs/bdd/features/ofmarkdown-language-mode.feature
  @req:Extension.MarkdownFlavor.AutoDetection
  Scenario Outline: .fgattributes flavor=auto controls Auto Detect label
    Given ".fgattributes" sets "flavor=auto" for the active Markdown document
    And local evidence resolves Auto Detect to "<id>"
    And a Markdown document is active with language id "markdown"
    When Markdown flavor auto-detection runs
    Then the selector shows "Auto Detect (<label>)"
    And the effective flavor sent to the server is "<id>"

    Examples:
      | id             | label                    |
      | commonmark     | CommonMark               |
      | obsidian       | Obsidian                 |
      | gfm            | GitHub Flavored Markdown |
      | glfm           | GitLab Flavored Markdown |
      | pandoc         | Pandoc Markdown          |
      | multimarkdown  | MultiMarkdown            |
      | mdx            | MDX                      |
      | kramdown       | kramdown                 |
      | markdown-extra | Markdown Extra           |
      | r-markdown     | R Markdown               |
      | reddit         | Reddit Markdown          |
      | stack-overflow | Stack Overflow Markdown  |

  # Source: docs/bdd/features/markdown-flavor-dialects.feature
  @req:FlavorLSP.Profile.SignatureCoverage @req:Extension.MarkdownFlavor.DialectProfiles
  Scenario Outline: Markdown flavor choice selects matching dialect profile
    Given a Markdown document is active with language id "markdown"
    When the effective Markdown flavor becomes "<id>"
    Then server diagnostics, completions, navigation, hover, semantic tokens, and rename use the "<id>" profile
    And "<signature>" is treated as flavor-specific behavior
    And non-local host, conversion, or execution references are not resolved as vault files

    Examples:
      | id             | signature                                    |
      | original       | historical core Markdown baseline           |
      | commonmark     | standardized CommonMark edge cases          |
      | obsidian       | wiki links, embeds, and vault semantics     |
      | gfm            | tables, task lists, strikethrough            |
      | glfm           | GitLab-specific CommonMark extensions        |
      | pandoc         | citations, math, metadata, extension toggles |
      | multimarkdown  | metadata, tables, cross-references           |
      | mdx            | JSX expressions and components               |
      | kramdown       | block and span attributes                    |
      | markdown-extra | tables, definition lists, footnotes          |
      | r-markdown     | YAML metadata and executable code chunks     |
      | reddit         | Reddit platform Markdown behavior            |
      | stack-overflow | Stack Overflow technical-writing behavior    |

  # Source: docs/bdd/features/ofmarkdown-language-mode.feature
  @req:Extension.MarkdownFlavor.ManualLanguageSafety
  Scenario Outline: Manual non-Markdown language selections are preserved
    Given a ".md" document has language id "<languageId>"
    When Markdown flavor auto-detection runs
    Then the document language id remains "<languageId>"
    And no Markdown flavor override is applied to that document

    Examples:
      | languageId |
      | plaintext  |
      | mdx        |

  # Source: docs/bdd/features/vscode-extension-parity.feature
  @req:Extension.CommandBridges.PayloadValidation @req:Extension.CommandBridges.GraphActions
  Scenario: Command bridge invokes native references UI
    Given "flavorGrenade.showReferences" is registered
    When the command receives valid source and reference locations
    Then VS Code receives "editor.action.showReferences"

  # Source: docs/bdd/features/vscode-extension-parity.feature
  @req:Extension.Status.QuickActions
  Scenario: Status bar exposes error details
    Given the server reports an error status
    When the status bar updates
    Then the status item displays an error icon
    And the tooltip includes the error message

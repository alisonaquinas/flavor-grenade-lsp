@vscode @extension @parity @adr:ADR019
# Reference mirror only. The executable cucumber source lives under
# docs/bdd/features, especially vscode-extension-parity.feature and
# ofmarkdown-language-mode.feature.
Feature: VS Code extension parity
  The VS Code extension should provide Markdown-flavor-aware client behavior
  without moving language intelligence out of the server.

  @req:Extension.Activation.MarkerEvents
  Scenario: Vault marker activation starts the extension
    Given a VS Code workspace contains ".obsidian/"
    When the extension host starts
    Then Flavor Grenade activates
    And the LanguageClient is prepared for vault membership detection

  @req:Extension.Activation.MarkerEvents @req:Extension.MarkdownFlavor.Refresh
  Scenario: Generic Markdown remains lightweight
    Given a workspace has Markdown files but no vault marker
    When the extension host starts
    Then generic Markdown remains in "markdown" mode
    And no vault indexing work is requested

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

  @req:Extension.MarkdownFlavor.OverridePersistence
  Scenario: Markdown flavor overrides persist at the active document scope
    Given a Markdown document belongs to an open workspace folder
    When the user selects "CommonMark" from the Markdown flavor selector
    Then "flavorGrenade.markdownFlavor" is written to the workspace-folder or workspace target
    When the user opens a standalone Markdown file and selects "Original Markdown"
    Then "flavorGrenade.markdownFlavor" is written to the user target

  @req:Extension.MarkdownFlavor.ServerPropagation
  Scenario: Markdown flavor changes refresh server analysis
    Given a Markdown document is active with effective flavor "commonmark"
    When the user selects "Obsidian" from the Markdown flavor selector
    Then the extension sends the effective flavor "obsidian" to the server
    And open Markdown diagnostics are refreshed

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

  @req:Extension.CommandBridges.PayloadValidation @req:Extension.CommandBridges.GraphActions
  Scenario: Command bridge invokes native references UI
    Given "flavorGrenade.showReferences" is registered
    When the command receives valid source and reference locations
    Then VS Code receives "editor.action.showReferences"

  @req:Extension.Status.QuickActions
  Scenario: Status bar exposes error details
    Given the server reports an error status
    When the status bar updates
    Then the status item displays an error icon
    And the tooltip includes the error message

@extension @vscode @markdown-flavor
@adr:ADR020
Feature: Markdown flavor selection

  The VS Code extension keeps Markdown files in the built-in Markdown language
  mode and exposes Markdown flavor through a separate selector.

  Background:
    Given a VS Code instance with the Flavor Grenade extension installed

  Scenario: Obsidian vault markdown remains Markdown and auto-detects Obsidian
    Given a workspace folder containing a ".obsidian/" directory
    When the user opens a file "notes/welcome.md" in the workspace
    Then the extension activates via the "onLanguage:markdown" activation event
    And the document language id remains "markdown"
    And the Markdown flavor selector eventually shows "Auto Detect (Obsidian)"

  Scenario: Generic markdown remains Markdown and auto-detects CommonMark
    Given a workspace folder with no ".obsidian/" directory
    And no ".flavor-grenade.toml" file
    And the server does not index "README.md"
    When the user opens "README.md"
    Then the document language id remains "markdown"
    And the Markdown flavor selector shows "Auto Detect (CommonMark)"

  Scenario: User overrides flavor for a workspace folder
    Given a workspace folder containing ".flavor-grenade.toml"
    And the user opens "notes/welcome.md"
    When the user selects "CommonMark" from the Markdown flavor selector
    Then the document language id remains "markdown"
    And "flavorGrenade.markdownFlavor" is written to the project settings as "commonmark"
    And the server is refreshed with effective flavor "commonmark"

  Scenario Outline: User can select any required researched flavor
    Given a workspace folder containing ".flavor-grenade.toml"
    And the user opens "notes/welcome.md"
    When the user selects "<label>" from the Markdown flavor selector
    Then the document language id remains "markdown"
    And "flavorGrenade.markdownFlavor" is written to the project settings as "<id>"
    And the server is refreshed with effective flavor "<id>"

    Examples:
      | label                    | id             |
      | Original Markdown        | original       |
      | CommonMark               | commonmark     |
      | Obsidian                 | obsidian       |
      | GitHub Flavored Markdown | gfm            |
      | GitLab Flavored Markdown | glfm           |
      | Pandoc Markdown          | pandoc         |
      | MultiMarkdown            | multimarkdown  |
      | MDX                      | mdx            |
      | kramdown                 | kramdown       |
      | Markdown Extra           | markdown-extra |
      | R Markdown               | r-markdown     |
      | Reddit Markdown          | reddit         |
      | Stack Overflow Markdown  | stack-overflow |

  Scenario: User overrides flavor for a standalone file
    Given the user opens a standalone Markdown file with no workspace folder
    When the user selects "Original Markdown" from the Markdown flavor selector
    Then the document language id remains "markdown"
    And "flavorGrenade.markdownFlavor" is written to user settings as "original"
    And the server is refreshed with effective flavor "original"

  Scenario: Auto Detect clears the override at the current scope
    Given a workspace folder has "flavorGrenade.markdownFlavor" set to "commonmark"
    And the user opens "notes/welcome.md"
    When the user selects "Auto Detect" from the Markdown flavor selector
    Then the project override is cleared or reset to "auto"
    And the effective flavor is recomputed from workspace and vault signals

  Scenario: Manual language mode selection is preserved
    Given a workspace folder containing a ".obsidian/" directory
    And the user opens "notes/welcome.md"
    And the user manually changes the document language id to "plaintext"
    When Flavor Grenade refreshes Markdown flavor detection
    Then the document language id remains "plaintext"
    And no Markdown flavor override is applied to that document

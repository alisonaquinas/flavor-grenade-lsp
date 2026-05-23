@extension @vscode @markdown-flavor
@adr:ADR020
# Reference mirror only. Executable cucumber source:
# docs/bdd/features/ofmarkdown-language-mode.feature.
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

  @req:Extension.MarkdownFlavor.AutoDetection
  Scenario Outline: Workspace flavor config sets the Auto Detect default
    Given a workspace folder containing ".flavor-grenade.toml"
    And the workspace config declares default Markdown flavor "<id>"
    And no Markdown flavor override is configured
    When the user opens "notes/welcome.md"
    Then the document language id remains "markdown"
    And the Markdown flavor selector shows "Auto Detect (<label>)"
    And the server is refreshed with effective flavor "<id>"

    Examples:
      | id             | label                    |
      | original       | Original Markdown        |
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

  Scenario Outline: Markdown flavor selector enumerates every required choice
    Given a Markdown document is active with language id "markdown"
    When the user opens the Markdown flavor selector
    Then the selector includes id "<id>" with label "<label>"

    Examples:
      | id             | label                    |
      | auto           | Auto Detect              |
      | original       | Original Markdown        |
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

  @structured-profile @req:Extension.MarkdownStructuredProfiles.Configuration
  Scenario Outline: Structured profiles are not Markdown flavor selector choices
    Given a Markdown document is active with language id "markdown"
    When the user opens the Markdown flavor selector
    Then the selector does not include id "<profile>"

    Examples:
      | profile           |
      | keep-a-changelog  |
      | common-changelog  |
      | madr              |

  @structured-profile @req:Extension.MarkdownStructuredProfiles.Configuration
  Scenario Outline: Structured profile configuration propagates with the base flavor
    Given a workspace folder containing ".flavor-grenade.toml"
    And "flavorGrenade.markdownFlavor" is set to "<baseFlavor>"
    And "flavorGrenade.markdownStructuredProfiles" is set to "<selection>"
    When the user opens "<path>"
    Then the document language id remains "markdown"
    And the server is refreshed with effective flavor "<baseFlavor>"
    And the client sends a "workspace/didChangeConfiguration" notification with structured profiles "<expectedProfiles>"

    Examples:
      | baseFlavor | selection          | expectedProfiles    | path                               |
      | commonmark | keep-a-changelog   | keep-a-changelog    | CHANGELOG.md                       |
      | gfm        | common-changelog   | common-changelog    | CHANGELOG.md                       |
      | obsidian   | madr               | madr                | docs/decisions/0001-use-profile.md |
      | pandoc     | none               | none                | CHANGELOG.md                       |

  @structured-profile @req:Extension.MarkdownStructuredProfiles.Configuration
  Scenario Outline: Auto Detect infers structured profiles from document context
    Given no structured profile override is configured
    And "flavorGrenade.markdownFlavor" is set to "<baseFlavor>"
    When the user opens "<path>" containing "<evidence>"
    Then the document language id remains "markdown"
    And the server is refreshed with effective flavor "<baseFlavor>"
    And the effective structured profile flags include "<profile>"

    Examples:
      | baseFlavor | profile          | path                               | evidence                         |
      | commonmark | keep-a-changelog | CHANGELOG.md                       | ## [Unreleased]                  |
      | gfm        | common-changelog | CHANGELOG.md                       | ## 1.0.0 - 2026-05-23            |
      | obsidian   | madr             | docs/decisions/0001-use-profile.md | ## Context and Problem Statement |

  Scenario: User overrides flavor for a workspace folder target
    Given a workspace folder containing ".flavor-grenade.toml"
    And the user opens "notes/welcome.md"
    When the user selects "CommonMark" from the Markdown flavor selector
    Then the document language id remains "markdown"
    And "flavorGrenade.markdownFlavor" is written to the workspace-folder target as "commonmark"
    And the server is refreshed with effective flavor "commonmark"
    And the client sends a "workspace/didChangeConfiguration" notification with Markdown flavor "commonmark" and effective flavor "commonmark"

  Scenario: User overrides flavor for a workspace fallback target
    Given a Markdown document belongs to a workspace fallback target
    When the user selects "Obsidian" from the Markdown flavor selector
    Then the document language id remains "markdown"
    And "flavorGrenade.markdownFlavor" is written to the workspace target as "obsidian"
    And the server is refreshed with effective flavor "obsidian"
    And the client sends a "workspace/didChangeConfiguration" notification with Markdown flavor "obsidian" and effective flavor "obsidian"

  Scenario Outline: User can select any required researched flavor
    Given a workspace folder containing ".flavor-grenade.toml"
    And the user opens "notes/welcome.md"
    When the user selects "<label>" from the Markdown flavor selector
    Then the document language id remains "markdown"
    And "flavorGrenade.markdownFlavor" is written to the workspace-folder target as "<id>"
    And the server is refreshed with effective flavor "<id>"
    And the client sends a "workspace/didChangeConfiguration" notification with Markdown flavor "<id>" and effective flavor "<id>"

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

  @req:Extension.MarkdownFlavor.ServerPropagation @req:Extension.MarkdownFlavor.DialectProfiles
  Scenario Outline: Selecting a flavor changes analysis without changing language mode
    Given a Markdown document is active with language id "markdown"
    And the server last analyzed it as effective flavor "commonmark"
    When the user selects "<label>" from the Markdown flavor selector
    Then the document language id remains "markdown"
    And the server is refreshed with effective flavor "<id>"
    And open Markdown diagnostics, completions, navigation, hover, semantic tokens, and rename use the "<id>" dialect profile
    And the VS Code language picker still shows "Markdown"

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
    And "flavorGrenade.markdownFlavor" is written to the user target as "original"
    And the server is refreshed with effective flavor "original"
    And the client sends a "workspace/didChangeConfiguration" notification with Markdown flavor "original" and effective flavor "original"

  Scenario: Auto Detect clears the override at the current scope
    Given a workspace folder has "flavorGrenade.markdownFlavor" set to "commonmark"
    And the user opens "notes/welcome.md"
    When the user selects "Auto Detect" from the Markdown flavor selector
    Then the workspace-folder target override is cleared or reset to "auto"
    And the effective flavor is recomputed from workspace and vault signals
    And the client sends a "workspace/didChangeConfiguration" notification with Markdown flavor "auto" and effective flavor "commonmark"

  Scenario Outline: Manual language mode selection is preserved
    Given a workspace folder containing a ".obsidian/" directory
    And the user opens "notes/welcome.md"
    And the user manually changes the document language id to "<languageId>"
    When the user selects "Obsidian" from the Markdown flavor selector
    Then the document language id remains "<languageId>"
    And no Markdown flavor override is applied to that document
    And no Markdown flavor override write is recorded
    And no workspace/didChangeConfiguration notification is sent to the server

    Examples:
      | languageId |
      | plaintext  |
      | mdx        |

  @req:Extension.MarkdownFlavor.ManualLanguageSafety
  Scenario: Explicit MDX language mode is not taken over by the MDX flavor
    Given the user opens "docs/page.mdx"
    And the document language id is "mdx"
    When Markdown flavor auto-detection runs
    Then the document language id remains "mdx"
    And no "flavorGrenade.markdownFlavor" override is applied to that document
    And no workspace/didChangeConfiguration notification is sent to the server

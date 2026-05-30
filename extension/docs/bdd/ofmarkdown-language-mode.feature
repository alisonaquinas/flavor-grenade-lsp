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
    And no ".fgignore" or ".fgattributes" file applies
    And the server does not index "README.md"
    When the user opens "README.md"
    Then the document language id remains "markdown"
    And the Markdown flavor selector shows "Auto Detect (CommonMark)"

  @req:Extension.MarkdownFlavor.AutoDetection
  Scenario Outline: .fgattributes can explicitly return a path to Auto Detect
    Given a workspace folder containing ".fgattributes"
    And ".fgattributes" contains "docs/**/*.md flavor=auto"
    And the workspace has evidence for Markdown flavor "<id>"
    When the user opens "docs/welcome.md"
    Then the document language id remains "markdown"
    And the Markdown flavor selector shows "Auto Detect (<label>)"
    And the server is refreshed with effective flavor "<id>"

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

  @planned @structured-profile @req:Extension.MarkdownStructuredProfiles.Configuration
  Scenario Outline: Structured profiles are not Markdown flavor selector choices
    Given a Markdown document is active with language id "markdown"
    When the user opens the Markdown flavor selector
    Then the selector does not include id "<profile>"

    Examples:
      | profile           |
      | keep-a-changelog  |
      | common-changelog  |
      | madr              |

  @planned @structured-profile @req:Extension.MarkdownStructuredProfiles.Configuration
  Scenario Outline: Structured profile configuration propagates with the base flavor
    Given a workspace folder containing ".fgattributes"
    And ".fgattributes" sets "flavor=<baseFlavor>" for "<path>"
    And ".fgattributes" sets "structured_profiles=<selection>" for "<path>"
    When the user opens "<path>"
    Then the document language id remains "markdown"
    And the server is refreshed with effective flavor "<baseFlavor>"
    And the client sends structured profiles "<expectedProfiles>" to the server with the active resource

    Examples:
      | baseFlavor | selection        | expectedProfiles | path                                |
      | commonmark | keep-a-changelog | keep-a-changelog | CHANGELOG.md                        |
      | gfm        | common-changelog | common-changelog | CHANGELOG.md                        |
      | obsidian   | madr             | madr             | docs/decisions/0001-use-profile.md |
      | pandoc     | none             | none             | CHANGELOG.md                        |

  @planned @structured-profile @req:Extension.MarkdownStructuredProfiles.Configuration
  Scenario Outline: Structured profile inference layers over a configured base flavor
    Given no structured profile attribute applies to "<path>"
    And ".fgattributes" sets "flavor=<baseFlavor>" for "<path>"
    When the user opens "<path>" containing "<evidence>"
    Then the document language id remains "markdown"
    And the server is refreshed with effective flavor "<baseFlavor>"
    And the effective structured profile flags include "<profile>"

    Examples:
      | baseFlavor | profile          | path                               | evidence                         |
      | commonmark | keep-a-changelog | CHANGELOG.md                       | ## [Unreleased]                  |
      | gfm        | common-changelog | CHANGELOG.md                       | ## 1.0.0 - 2026-05-23            |
      | obsidian   | madr             | docs/decisions/0001-use-profile.md | ## Context and Problem Statement |

  Scenario: User overrides flavor for a selected file
    Given a workspace folder containing ".fgattributes"
    And the user opens "notes/welcome.md"
    When the user selects "CommonMark" from the Markdown flavor selector
    And the user selects "Selected file" from the scope prompt
    Then the document language id remains "markdown"
    And ".fgattributes" beside "notes/welcome.md" contains "welcome.md flavor=commonmark"
    And the server is refreshed with effective flavor "commonmark"
    And the client sends Markdown flavor "commonmark" and effective flavor "commonmark" to the server

  Scenario: User overrides flavor for the current directory
    Given a Markdown document belongs to a workspace folder
    When the user selects "Obsidian" from the Markdown flavor selector
    And the user selects "All files in this directory" from the scope prompt
    Then the document language id remains "markdown"
    And ".fgattributes" in the active file's directory contains "/*.md flavor=obsidian"
    And the server is refreshed with effective flavor "obsidian"
    And the client sends Markdown flavor "obsidian" and effective flavor "obsidian" to the server

  Scenario Outline: User can select any required researched flavor
    Given a workspace folder containing ".fgattributes"
    And the user opens "notes/welcome.md"
    When the user selects "<label>" from the Markdown flavor selector
    And the user selects "Selected file" from the scope prompt
    Then the document language id remains "markdown"
    And ".fgattributes" beside "notes/welcome.md" contains "welcome.md flavor=<id>"
    And the server is refreshed with effective flavor "<id>"
    And the client sends Markdown flavor "<id>" and effective flavor "<id>" to the server

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
    And the user selects "Selected file" from the scope prompt
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
    And the user selects "Selected file" from the scope prompt
    Then the document language id remains "markdown"
    And ".fgattributes" beside the standalone file contains a file-specific "flavor=original" rule
    And the server is refreshed with effective flavor "original"
    And the client sends Markdown flavor "original" and effective flavor "original" to the server

  Scenario: Auto Detect clears the override at the selected scope
    Given ".fgattributes" has "welcome.md flavor=commonmark"
    And the user opens "notes/welcome.md"
    When the user selects "Auto Detect" from the Markdown flavor selector
    And the user selects "Selected file" from the scope prompt
    Then the selected-file "flavor" attribute is cleared or reset to "auto"
    And the effective flavor is recomputed from workspace and vault signals
    And the client sends Markdown flavor "auto" and the recomputed effective flavor to the server

  Scenario Outline: Manual language mode selection is preserved
    Given a workspace folder containing a ".obsidian/" directory
    And the user opens "notes/welcome.md"
    And the user manually changes the document language id to "<languageId>"
    When the user selects "Obsidian" from the Markdown flavor selector
    Then the document language id remains "<languageId>"
    And no Markdown flavor override is applied to that document
    And no Markdown flavor override write is recorded
    And no flavor refresh notification is sent to the server

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
    And no Markdown flavor override is applied to that document
    And no flavor refresh notification is sent to the server

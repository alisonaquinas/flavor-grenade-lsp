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

  @planned @req:Extension.MarkdownFlavor.AutoDetection
  Scenario: Generic markdown remains Markdown and auto-detects CommonMark
    Given a workspace folder with no ".obsidian/" directory
    And no ".mdfignore" or ".mdfattributes" file applies to "README.md"
    And the server does not index "README.md"
    When the user opens "README.md"
    Then the document language id remains "markdown"
    And the Markdown flavor selector shows "Auto Detect (CommonMark)"

  @planned @req:Extension.MarkdownFlavor.AutoDetection
  Scenario Outline: .mdfattributes selects each required explicit flavor
    Given a workspace folder containing ".mdfattributes"
    And ".mdfattributes" contains "notes/welcome.md flavor=<id>"
    When the user opens "notes/welcome.md"
    Then the document language id remains "markdown"
    And the Markdown flavor selector shows "<label>"
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

  @planned @req:Extension.MarkdownFlavor.AutoDetection
  Scenario Outline: .mdfattributes requests Auto Detect instead of selecting a flavor
    Given a workspace folder containing ".mdfattributes"
    And ".mdfattributes" contains "<rule>"
    And the workspace folder has no ".obsidian/" directory
    When the user opens "docs/README.md"
    Then the document language id remains "markdown"
    And the Markdown flavor selector shows "Auto Detect (CommonMark)"
    And the server is refreshed with effective flavor "commonmark"

    Examples:
      | rule                        |
      | docs/README.md flavor=auto  |
      | docs/README.md !flavor      |

  @planned @req:Extension.MarkdownFlavor.AutoDetection
  Scenario: .mdfattributes applies directory-specific flavor and profile rules
    Given a workspace folder containing ".mdfattributes"
    And ".mdfattributes" contains "*.md flavor=commonmark"
    And ".mdfattributes" contains "docs/api/**/*.md flavor=glfm structured_profiles=common-changelog"
    And ".mdfattributes" contains "docs/decisions/**/*.md structured_profiles=madr"
    When the user opens "docs/api/CHANGELOG.md"
    Then the document language id remains "markdown"
    And the server is refreshed with effective flavor "glfm"
    And the effective structured profile flags include "common-changelog"
    When the user opens "docs/decisions/0001-use-profile.md"
    Then the document language id remains "markdown"
    And the server is refreshed with effective flavor "commonmark"
    And the effective structured profile flags include "madr"

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
    Given a workspace folder containing ".mdfattributes"
    And ".mdfattributes" contains "<path> flavor=<baseFlavor> structured_profiles=<selection>"
    When the user opens "<path>"
    Then the document language id remains "markdown"
    And the server is refreshed with effective flavor "<baseFlavor>"
    And the effective structured profile flags include "<expectedProfiles>"

    Examples:
      | baseFlavor | selection        | expectedProfiles | path                                |
      | commonmark | keep-a-changelog | keep-a-changelog | CHANGELOG.md                        |
      | gfm        | common-changelog | common-changelog | CHANGELOG.md                        |
      | obsidian   | madr             | madr             | docs/decisions/0001-use-profile.md |
      | pandoc     | none             | none             | CHANGELOG.md                        |

  @planned @structured-profile @req:Extension.MarkdownStructuredProfiles.Configuration
  Scenario Outline: Structured profile inference layers over a configured base flavor
    Given no structured profile attribute applies to "<path>"
    And ".mdfattributes" selects base flavor "<baseFlavor>" for "<path>"
    When the user opens "<path>" containing "<evidence>"
    Then the document language id remains "markdown"
    And the server is refreshed with effective flavor "<baseFlavor>"
    And the effective structured profile flags include "<profile>"

    Examples:
      | baseFlavor | profile          | path                               | evidence                          |
      | commonmark | keep-a-changelog | CHANGELOG.md                       | ## [Unreleased]                   |
      | gfm        | common-changelog | CHANGELOG.md                       | ## 1.0.0 - 2026-05-23             |
      | obsidian   | madr             | docs/decisions/0001-use-profile.md | ## Context and Problem Statement  |

  @planned @req:Extension.MarkdownFlavor.OverridePersistence
  Scenario: User overrides flavor for the selected file
    Given a workspace folder containing ".mdfattributes"
    And the user opens "notes/welcome.md"
    When the user selects "CommonMark" from the Markdown flavor selector
    And the user chooses "Selected file" from the Markdown flavor scope prompt
    Then the document language id remains "markdown"
    And "notes/.mdfattributes" receives a file-specific rule "welcome.md flavor=commonmark"
    And the server is refreshed with effective flavor "commonmark"

  @planned @req:Extension.MarkdownFlavor.OverridePersistence
  Scenario: User overrides flavor for all Markdown files in the active directory
    Given a workspace folder containing ".mdfattributes"
    And the user opens "notes/welcome.md"
    When the user selects "Obsidian" from the Markdown flavor selector
    And the user chooses "All files in this directory" from the Markdown flavor scope prompt
    Then the document language id remains "markdown"
    And "notes/.mdfattributes" receives a directory rule "/*.md flavor=obsidian"
    And the server is refreshed with effective flavor "obsidian"

  @planned @req:Extension.MarkdownFlavor.OverridePersistence
  Scenario Outline: User can select any required researched flavor
    Given a workspace folder containing ".mdfattributes"
    And the user opens "notes/welcome.md"
    When the user selects "<label>" from the Markdown flavor selector
    And the user chooses "Selected file" from the Markdown flavor scope prompt
    Then the document language id remains "markdown"
    And "notes/.mdfattributes" receives a file-specific rule "welcome.md flavor=<id>"
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

  @planned @req:Extension.MarkdownFlavor.ServerPropagation @req:Extension.MarkdownFlavor.DialectProfiles
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

  @planned @req:Extension.MarkdownFlavor.OverridePersistence
  Scenario: User overrides flavor for a standalone file
    Given the user opens a standalone Markdown file with no workspace folder
    When the user selects "Original Markdown" from the Markdown flavor selector
    And the user chooses "Selected file" from the Markdown flavor scope prompt
    Then the document language id remains "markdown"
    And ".mdfattributes" is written beside the standalone file with a file-specific rule "standalone.md flavor=original"
    And the server is refreshed with effective flavor "original"

  @planned @req:Extension.MarkdownFlavor.OverridePersistence
  Scenario: Auto Detect clears the override at the current scope
    Given "notes/.mdfattributes" contains "welcome.md flavor=commonmark"
    And the user opens "notes/welcome.md"
    When the user selects "Auto Detect" from the Markdown flavor selector
    And the user chooses "Selected file" from the Markdown flavor scope prompt
    Then the matching ".mdfattributes" flavor assignment is removed or reset with "!flavor"
    And the effective flavor is recomputed from Auto Detect signals

  @planned @req:Extension.MarkdownFlavor.ManualLanguageSafety
  Scenario Outline: Manual language mode selection is preserved
    Given a workspace folder containing a ".obsidian/" directory
    And the user opens "notes/welcome.md"
    And the user manually changes the document language id to "<languageId>"
    When the user selects "Obsidian" from the Markdown flavor selector
    Then the document language id remains "<languageId>"
    And no Markdown flavor override is applied to that document
    And no ".mdfattributes" write is recorded
    And no server flavor refresh is sent for that selector attempt

    Examples:
      | languageId |
      | plaintext  |
      | mdx        |

  @planned @req:Extension.MarkdownFlavor.ManualLanguageSafety
  Scenario: Explicit MDX language mode is not taken over by the MDX flavor
    Given the user opens "docs/page.mdx"
    And the document language id is "mdx"
    When Markdown flavor auto-detection runs
    Then the document language id remains "mdx"
    And no ".mdfattributes" override is applied to that document
    And no server flavor refresh is sent for that selector attempt

@extension @vscode @language-mode
@adr:ADR016
Feature: OFMarkdown language mode assignment

  The VS Code extension contributes an OFMarkdown language mode and applies it
  only to Markdown documents that Flavor Grenade detects as vault or indexed
  OFM documents. Generic Markdown files remain in VS Code's built-in Markdown
  mode.

  Background:
    Given a VS Code instance with the Flavor Grenade extension installed

  Scenario: Obsidian vault markdown is promoted to OFMarkdown
    Given a workspace folder containing a ".obsidian/" directory
    When the user opens a file "notes/welcome.md" in the workspace
    Then the extension activates via the "onLanguage:markdown" activation event
    And the document language id eventually becomes "ofmarkdown"
    And the language picker label is "OFMarkdown"

  Scenario: Indexed Flavor Grenade vault markdown is promoted to OFMarkdown
    Given a workspace folder containing ".flavor-grenade.toml" and no ".obsidian/" directory
    And the server index contains "notes/welcome.md"
    When the user opens a file "notes/welcome.md" in the workspace
    Then the extension asks the server for "flavorGrenade/documentMembership" for that URI
    And the server reports the document is indexed
    And the document language id eventually becomes "ofmarkdown"

  Scenario: Generic markdown remains Markdown
    Given a workspace folder with no ".obsidian/" directory
    And no ".flavor-grenade.toml" file
    And the server does not index "README.md"
    When the user opens "README.md"
    Then the document language id remains "markdown"

  Scenario: Manual language mode selection is preserved
    Given a workspace folder containing a ".obsidian/" directory
    And the user opens "notes/welcome.md"
    And the user manually changes the document language id to "plaintext"
    When Flavor Grenade refreshes language mode detection
    Then the document language id remains "plaintext"

  Scenario: Language mode promotion does not restart the language client
    Given a workspace folder containing a ".obsidian/" directory
    And the LanguageClient is running
    When the user opens "notes/welcome.md"
    And the document language id changes from "markdown" to "ofmarkdown"
    Then the LanguageClient remains running
    And the extension calls "setTextDocumentLanguage" at most once for that URI

  Scenario: OFMarkdown keeps Markdown editing behavior
    Given a workspace folder containing a ".obsidian/" directory
    When the user opens a Markdown note with headings, lists, links, frontmatter, and fenced code blocks
    And the document language id becomes "ofmarkdown"
    Then Markdown grammar highlighting is still available
    And Flavor Grenade semantic tokens are still requested for the document

@extension @vscode @markdown-flavor @original-markdown @commonmark
@adr:ADR020
Feature: Original and CommonMark Markdown flavor behavior

  Original Markdown and CommonMark are first-class Markdown flavors, not only
  labels in the selector. The extension keeps documents in VS Code's built-in
  Markdown language mode while the effective flavor controls which Markdown
  dialect behavior the server applies.

  Background:
    Given a VS Code instance with the Flavor Grenade extension installed
    And a Markdown document is open with language id "markdown"

  Scenario: Original Markdown override uses the historical baseline
    Given "flavorGrenade.markdownFlavor" is set to "original"
    And the document contains:
      """
      # Title

          indented code

      This is [a link](https://example.com/).

      ```js
      const extension = true;
      ```

      | a | b |
      |---|---|
      | 1 | 2 |

      [[Obsidian Link]]
      """
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "original"
    And the document language id remains "markdown"
    And ATX headings, indented code blocks, and inline links are treated as Original Markdown syntax
    And fenced code blocks, pipe tables, and wiki links are treated as non-core Original Markdown constructs

  Scenario: Original Markdown auto-detect can be restored after an override
    Given "flavorGrenade.markdownFlavor" is set to "original"
    When the user selects "Auto Detect" from the Markdown flavor selector
    Then the "original" override is cleared at the active settings scope
    And Flavor Grenade recomputes the effective flavor from workspace and vault signals
    And the document language id remains "markdown"

  Scenario: CommonMark override enables CommonMark core syntax
    Given "flavorGrenade.markdownFlavor" is set to "commonmark"
    And the document contains:
      """
      # Title

      ```js
      const standardized = true;
      ```

      > [!note]
      > Obsidian callout text

      [[Obsidian Link]]
      """
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "commonmark"
    And the document language id remains "markdown"
    And fenced code blocks are treated as CommonMark syntax
    And Obsidian callouts and wiki links are not enabled as Obsidian syntax unless the effective flavor is "obsidian"

  Scenario: CommonMark is the fallback for generic Markdown
    Given the workspace has no ".obsidian/" directory
    And the workspace has no ".flavor-grenade.toml" file
    And no Markdown flavor override is configured
    When the user opens "README.md"
    Then the Markdown flavor selector shows "Auto Detect (CommonMark)"
    And the server is refreshed with effective flavor "commonmark"
    And the document language id remains "markdown"

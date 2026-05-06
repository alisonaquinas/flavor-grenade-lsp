@lsp @parity @adr:ADR017 @adr:ADR018
Feature: OFMarkdown parity roadmap
  Flavor Grenade should cover local standard Markdown links, attachment
  references, heading ambiguity, and vault file operations with OFM-aware
  behavior.

  Background:
    Given a vault with notes and attachments:
      | path                  | headings                 | anchors      | attachments        |
      | notes/alpha.md        | Overview, Overview, Deep | alpha-block  | assets/diagram.png |
      | notes/beta.md         | Summary                  | beta-block   | assets/report.pdf  |
      | notes/mixed-links.md  | Links                    |              |                    |

  Scenario: Local Markdown inline links resolve like wiki-links
    Given "notes/mixed-links.md" contains "[Alpha](alpha.md)"
    When go-to-definition is requested on "alpha.md"
    Then the definition target is "notes/alpha.md"
    And no broken-link diagnostic is published for "[Alpha](alpha.md)"

  Scenario: Reference-style links resolve through their link definitions
    Given "notes/mixed-links.md" contains "[Alpha][alpha-ref]"
    And "notes/mixed-links.md" contains "[alpha-ref]: alpha.md"
    When go-to-definition is requested on "alpha-ref"
    Then the definition target is the "[alpha-ref]: alpha.md" definition
    When find-references is requested on the "[alpha-ref]: alpha.md" definition
    Then the references include "[Alpha][alpha-ref]"

  Scenario: External Markdown links do not produce vault diagnostics
    Given "notes/mixed-links.md" contains "[External](https://example.com/page)"
    When diagnostics are requested for "notes/mixed-links.md"
    Then no FG001 diagnostic is published for the external link

  Scenario: Duplicate heading anchors produce related information
    Given "notes/alpha.md" has two headings named "Overview"
    And "notes/mixed-links.md" contains "[Overview](alpha.md#overview)"
    When diagnostics are requested for "notes/mixed-links.md"
    Then a heading ambiguity diagnostic is published
    And the diagnostic related information includes both "Overview" headings

  Scenario: Attachment references support completion, definition, and hover
    Given "notes/mixed-links.md" contains "![Diagram](assets/diagram.png)"
    When completion is requested inside "![Diagram]("
    Then the completion list includes "assets/diagram.png"
    When go-to-definition is requested on "assets/diagram.png"
    Then the definition target is "assets/diagram.png"
    When hover is requested on "assets/diagram.png"
    Then the hover includes the file type "png"

  Scenario: File move refactoring updates every local reference form
    Given "notes/mixed-links.md" references "notes/alpha.md" as a wiki-link
    And "notes/mixed-links.md" references "notes/alpha.md" as an embed
    And "notes/mixed-links.md" references "notes/alpha.md" as an inline Markdown link
    And "notes/mixed-links.md" references "notes/alpha.md" as a reference definition
    When workspace/willRenameFiles moves "notes/alpha.md" to "archive/alpha.md"
    Then the returned WorkspaceEdit updates all references to "archive/alpha.md"
    And applying the WorkspaceEdit leaves no broken-reference diagnostics

  Scenario: File move refactoring refuses paths outside the vault
    When workspace/willRenameFiles moves "notes/alpha.md" to "../outside/alpha.md"
    Then the server refuses the WorkspaceEdit
    And no file outside the vault root is written


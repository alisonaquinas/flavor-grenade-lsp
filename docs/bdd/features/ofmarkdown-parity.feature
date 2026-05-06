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

  @req:Parity.MarkdownLinks.ParseCoverage @req:Parity.MarkdownLinks.TargetClassification @req:Parity.MarkdownLinks.NavigationAndReferences
  Scenario: Local Markdown inline links resolve like wiki-links
    Given "notes/mixed-links.md" contains "[Alpha](alpha.md)"
    When go-to-definition is requested on "alpha.md"
    Then the definition target is "notes/alpha.md"
    And no broken-link diagnostic is published for "[Alpha](alpha.md)"

  @req:Parity.MarkdownLinks.ReferenceGraph @req:Parity.MarkdownLinks.NavigationAndReferences
  Scenario: Reference-style links resolve through their link definitions
    Given "notes/mixed-links.md" contains "[Alpha][alpha-ref]"
    And "notes/mixed-links.md" contains "[alpha-ref]: alpha.md"
    When go-to-definition is requested on "alpha-ref"
    Then the definition target is the "[alpha-ref]: alpha.md" definition
    When find-references is requested on the "[alpha-ref]: alpha.md" definition
    Then the references include "[Alpha][alpha-ref]"

  @req:Parity.MarkdownLinks.TargetClassification
  Scenario: External Markdown links do not produce vault diagnostics
    Given "notes/mixed-links.md" contains "[External](https://example.com/page)"
    When diagnostics are requested for "notes/mixed-links.md"
    Then no FG001 diagnostic is published for the external link

  @req:Parity.MarkdownLinks.SameDocumentAnchor @req:Parity.MarkdownLinks.RenameAnchors
  Scenario: Same-document Markdown anchors behave like heading references
    Given "notes/mixed-links.md" contains the heading "Links"
    And "notes/mixed-links.md" contains "[Links](#Links)"
    When go-to-definition is requested on "#Links"
    Then the definition target is the "Links" heading in "notes/mixed-links.md"
    When find-references is requested on the "Links" heading
    Then the references include "[Links](#Links)"
    When the heading "Links" is renamed to "Link Index"
    Then the returned WorkspaceEdit updates the link target to "#Link-Index"

  @req:Parity.MarkdownLinks.SameDocumentAnchor
  Scenario: Same-document Markdown anchors diagnose missing headings
    Given "notes/mixed-links.md" contains "[Missing](#Missing)"
    When diagnostics are requested for "notes/mixed-links.md"
    Then a missing heading diagnostic is published for "#Missing"

  @req:Parity.HeadingAmbiguity.Diagnostics
  Scenario: Duplicate heading anchors produce related information
    Given "notes/alpha.md" has two headings named "Overview"
    And "notes/mixed-links.md" contains "[Overview](alpha.md#overview)"
    When diagnostics are requested for "notes/mixed-links.md"
    Then a heading ambiguity diagnostic is published
    And the diagnostic related information includes both "Overview" headings

  @req:Parity.Attachments.IndexCoverage @req:Parity.Attachments.Completion @req:Parity.Attachments.NavigationHover
  Scenario: Attachment references support completion, definition, and hover
    Given "notes/mixed-links.md" contains "![Diagram](assets/diagram.png)"
    When completion is requested inside "![Diagram]("
    Then the completion list includes "assets/diagram.png"
    When go-to-definition is requested on "assets/diagram.png"
    Then the definition target is "assets/diagram.png"
    When hover is requested on "assets/diagram.png"
    Then the hover includes the file type "png"

  @req:Parity.FileOperations.CapabilityRegistration @req:Parity.FileOperations.ReferenceRewrite @req:Parity.FileOperations.AtomicValidation
  Scenario: File move refactoring updates every local reference form
    Given "notes/mixed-links.md" references "notes/alpha.md" as a wiki-link
    And "notes/mixed-links.md" references "notes/alpha.md" as an embed
    And "notes/mixed-links.md" references "notes/alpha.md" as an inline Markdown link
    And "notes/mixed-links.md" references "notes/alpha.md" as a reference definition
    When workspace/willRenameFiles moves "notes/alpha.md" to "archive/alpha.md"
    Then the returned WorkspaceEdit updates all references to "archive/alpha.md"
    And applying the WorkspaceEdit leaves no broken-reference diagnostics

  @req:Parity.FileOperations.MovePlannerConfinement
  Scenario: File move refactoring refuses paths outside the vault
    When workspace/willRenameFiles moves "notes/alpha.md" to "../outside/alpha.md"
    Then the server refuses the WorkspaceEdit
    And no file outside the vault root is written

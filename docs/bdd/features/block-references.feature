@ofm
Feature: Block reference indexing and resolution

  Background:
    Given a vault containing:
      | path                | content                                                            |
      | notes/source.md     | # Source\nThis is a paragraph. ^para-one\nAnother line. ^para-two |
      | notes/target.md     | # Target\nSome content here                                        |
      | notes/referencing.md| # Refs\n![[source#^para-one]]\n[[source#^para-two]]               |

  @smoke
  Scenario: Block anchor is indexed and go-to-definition navigates to it
    Given the file "notes/source.md" has been indexed
    When a textDocument/definition request is made on "[[source#^para-one]]" in "notes/referencing.md"
    Then the response is a Location pointing to "notes/source.md"
    And the target range covers the line containing "^para-one"

  Scenario: Broken block reference reports FG005
    Given the file "notes/index.md" contains "[[source#^missing-anchor]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then a diagnostic with code "FG005" is published for "notes/index.md"
    And the diagnostic severity is "Error"
    And the diagnostic message contains "Cannot resolve block reference"
    And the diagnostic message contains "missing-anchor"

  Scenario: Block anchor mid-sentence is NOT treated as a block anchor
    Given the file "notes/prose.md" contains "The price is $5^2 which is 25"
    When the LSP processes textDocument/didOpen for "notes/prose.md"
    Then the block "2" is not indexed as a block anchor for "notes/prose.md"
    And no diagnostics are published for "notes/prose.md"

  Scenario: Block anchor must be at end of line to be valid
    Given the file "notes/anchors.md" contains:
      """
      # Anchors
      Valid line with anchor at end ^anchor-a
      ^anchor-b invalid anchor at start of line
      Middle ^anchor-c text is not an anchor
      """
    When the LSP processes textDocument/didOpen for "notes/anchors.md"
    Then only "anchor-a" is indexed as a block anchor for "notes/anchors.md"

  Scenario: Completion offers block anchor values after [[doc#^ trigger
    Given "notes/source.md" has been indexed with anchors "para-one" and "para-two"
    When a textDocument/completion request is made after "[[source#^" in "notes/index.md"
    Then the completion list includes "para-one"
    And the completion list includes "para-two"
    And each completion item has kind "Reference"

  Scenario: Intra-document block reference [[#^id]] works
    Given the file "notes/self-ref.md" contains:
      """
      # Self Reference
      Important paragraph here. ^important-note

      See [[#^important-note]] for context.
      """
    When the LSP processes textDocument/didOpen for "notes/self-ref.md"
    Then no diagnostics are published for "notes/self-ref.md"
    And the link "[[#^important-note]]" resolves to the anchor "important-note" in "notes/self-ref.md"

  Scenario: Block reference in embed validates anchor exists
    Given the file "notes/index.md" contains "![[source#^para-one]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the embed resolves to "notes/source.md" at the anchor "para-one"

  Scenario: Find-references on a block anchor returns all linking references
    Given the vault has been fully indexed
    When a textDocument/references request is made on "^para-one" in "notes/source.md"
    Then the references list contains the location of "[[source#^para-one]]" in "notes/referencing.md"
    And the references list contains the location of "![[source#^para-one]]" in "notes/referencing.md"

  Scenario: Block anchor with alphanumeric ID only is valid
    Given the file "notes/valid-anchors.md" contains "Line content ^abc123"
    When the LSP processes textDocument/didOpen for "notes/valid-anchors.md"
    Then the block "abc123" is indexed as a block anchor for "notes/valid-anchors.md"
    And no diagnostics are published for "notes/valid-anchors.md"

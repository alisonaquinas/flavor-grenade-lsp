@ofm
Feature: Embed resolution

  Background:
    Given a vault containing:
      | path                   | content                                                      |
      | notes/doc.md           | # Document\n## Section One\nBody text\n^block-anchor-one     |
      | assets/image.png       | <binary>                                                     |
      | assets/diagram.svg     | <binary>                                                     |
      | notes/another.md       | # Another\nSome text here                                    |

  @smoke
  Scenario: Valid markdown embed passes without diagnostic
    Given the file "notes/index.md" contains "![[doc]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the embed "![[doc]]" resolves to "notes/doc.md"

  Scenario: Broken embed reports FG004 with Warning severity
    Given the file "notes/index.md" contains "![[missing-document]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then a diagnostic with code "FG004" is published for "notes/index.md"
    And the diagnostic severity is "Warning"
    And the diagnostic range covers "![[missing-document]]"
    And the diagnostic message contains "Cannot resolve embed"

  Scenario: Image embed for missing image reports FG004 not FG001
    Given the file "notes/index.md" contains "![[missing-image.png]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then a diagnostic with code "FG004" is published for "notes/index.md"
    And no diagnostic with code "FG001" is published for "notes/index.md"
    And the diagnostic message contains "Cannot resolve embed"

  Scenario: Heading embed validates both doc and heading exist
    Given the file "notes/index.md" contains "![[doc#Section One]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the embed "![[doc#Section One]]" resolves to the "## Section One" heading in "notes/doc.md"

  Scenario: Heading embed with nonexistent heading reports FG004
    Given the file "notes/index.md" contains "![[doc#Nonexistent Section]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then a diagnostic with code "FG004" is published for "notes/index.md"
    And the diagnostic message contains "Nonexistent Section"

  Scenario: Block embed validates block anchor exists in target document
    Given the file "notes/index.md" contains "![[doc#^block-anchor-one]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the embed "![[doc#^block-anchor-one]]" resolves to the block "block-anchor-one" in "notes/doc.md"

  Scenario: Block embed with nonexistent block anchor reports FG004
    Given the file "notes/index.md" contains "![[doc#^missing-anchor]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then a diagnostic with code "FG004" is published for "notes/index.md"
    And the diagnostic message contains "missing-anchor"

  Scenario: Embed width syntax is valid and produces no diagnostic
    Given the file "notes/index.md" contains "![[image.png|200]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the embed "![[image.png|200]]" is recognized as a sized image embed

  Scenario: Embed width and height syntax is valid
    Given the file "notes/index.md" contains "![[image.png|200x150]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"

  Scenario: SVG file embed resolves without diagnostic
    Given the file "notes/index.md" contains "![[diagram.svg]]"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the embed "![[diagram.svg]]" resolves to "assets/diagram.svg"

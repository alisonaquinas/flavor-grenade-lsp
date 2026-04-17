@ofm
Feature: Wiki-link resolution

  Background:
    Given a vault containing:
      | path                | content                                          |
      | notes/existing.md   | # Existing Note                                  |
      | notes/another.md    | # Another Note\naliases: [alt, alternative]      |
      | notes/heading.md    | # Top Heading\n## Sub Heading\nsome body text    |
      | notes/ambiguous.md  | # Ambiguous                                      |
      | nested/ambiguous.md | # Ambiguous Nested                               |

  @smoke
  Scenario: Valid wiki-link passes without diagnostic
    Given the file "notes/index.md" contains "See [[existing]] for details"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the link "[[existing]]" resolves to "notes/existing.md"

  Scenario: Broken wiki-link reports FG001 (BrokenWikiLink)
    Given the file "notes/index.md" contains "See [[nonexistent-note]] for details"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then a diagnostic with code "FG001" is published for "notes/index.md"
    And the diagnostic severity is "Error"
    And the diagnostic range covers "[[nonexistent-note]]"
    And the diagnostic message contains "Cannot resolve wiki-link"

  Scenario: Alias-based wiki-link resolves correctly
    Given the file "notes/index.md" contains "See [[alt]] for details"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the link "[[alt]]" resolves to "notes/another.md" via alias

  Scenario: Ambiguous wiki-link reports FG002 (AmbiguousWikiLink)
    Given the file "notes/index.md" contains "See [[ambiguous]] for details"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then a diagnostic with code "FG002" is published for "notes/index.md"
    And the diagnostic severity is "Warning"
    And the diagnostic message contains "Ambiguous wiki-link"
    And the diagnostic relatedInformation lists all candidate files:
      | notes/ambiguous.md  |
      | nested/ambiguous.md |

  Scenario: Heading wiki-link resolves to correct heading
    Given the file "notes/index.md" contains "See [[heading#Sub Heading]] for details"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the link "[[heading#Sub Heading]]" resolves to line 2 of "notes/heading.md"

  Scenario: Broken heading reference within existing file reports FG001 variant
    Given the file "notes/index.md" contains "See [[heading#Nonexistent Heading]] for details"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then a diagnostic with code "FG001" is published for "notes/index.md"
    And the diagnostic message contains "heading"
    And the diagnostic message contains "Nonexistent Heading"

  Scenario: Empty wiki-link [[]] reports FG003 (MalformedWikiLink)
    Given the file "notes/index.md" contains "This is broken [[]] wiki-link"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then a diagnostic with code "FG003" is published for "notes/index.md"
    And the diagnostic severity is "Warning"
    And the diagnostic message contains "Malformed wiki-link"

  Scenario: Single-file mode suppresses FG001
    Given no vault root is detected (single-file mode)
    And the file "orphan.md" contains "See [[missing-note]] for context"
    When the LSP processes textDocument/didOpen for "orphan.md"
    Then no diagnostics with code "FG001" are published for "orphan.md"

  Scenario: Pipe-aliased wiki-link [[target|display]] resolves to target
    Given the file "notes/index.md" contains "See [[existing|click here]] for details"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the link "[[existing|click here]]" resolves to "notes/existing.md"

  Scenario: Path-qualified wiki-link [[folder/note]] resolves correctly
    Given the file "notes/index.md" contains "See [[notes/existing]] for details"
    When the LSP processes textDocument/didOpen for "notes/index.md"
    Then no diagnostics are published for "notes/index.md"
    And the link "[[notes/existing]]" resolves to "notes/existing.md"

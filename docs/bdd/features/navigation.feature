@lsp
@adr:ADR005 @adr:ADR006
Feature: Navigation — go-to-definition and find-references

  Background:
    Given a vault containing:
      | path                    | content                                                                   |
      | notes/target.md         | # Target Doc\n## Section Alpha\n### Sub Section\nBody. ^anchor-x         |
      | notes/referrer-a.md     | # Referrer A\n[[target]] and [[target#Section Alpha]]                     |
      | notes/referrer-b.md     | # Referrer B\n[[target#Section Alpha]] see also [[target#^anchor-x]]      |
      | notes/referrer-c.md     | # Referrer C\nTagged with #topic-one and #topic-one/sub                   |
      | notes/referrer-d.md     | # Referrer D\nAlso #topic-one here                                        |
      | notes/orphaned.md       | # Orphaned Doc\n## Orphaned Heading\nNo one links here.                   |

  @smoke
  Scenario: Go-to-definition on [[doc]] navigates to target document
    Given the cursor is on "[[target]]" in "notes/referrer-a.md"
    When a textDocument/definition request is made
    Then the response is a Location with uri "notes/target.md"
    And the target range covers the start of the document (line 0, character 0)

  Scenario: Go-to-definition on [[doc#heading]] navigates to the heading line
    Given the cursor is on "[[target#Section Alpha]]" in "notes/referrer-a.md"
    When a textDocument/definition request is made
    Then the response is a Location with uri "notes/target.md"
    And the target range covers the "## Section Alpha" heading line

  Scenario: Go-to-definition on [[doc#^blockid]] navigates to the block anchor line
    Given the cursor is on "[[target#^anchor-x]]" in "notes/referrer-b.md"
    When a textDocument/definition request is made
    Then the response is a Location with uri "notes/target.md"
    And the target range covers the line containing "^anchor-x"

  Scenario: Find-references on a heading returns all wiki-links targeting that heading
    Given the cursor is on "## Section Alpha" in "notes/target.md"
    When a textDocument/references request is made with includeDeclaration=false
    Then the references list contains the location of "[[target#Section Alpha]]" in "notes/referrer-a.md"
    And the references list contains the location of "[[target#Section Alpha]]" in "notes/referrer-b.md"
    And the references list has exactly 2 items

  Scenario: Find-references on a tag returns all occurrences across vault
    Given the cursor is on "#topic-one" in "notes/referrer-c.md"
    When a textDocument/references request is made
    Then the references list contains the "#topic-one" occurrence in "notes/referrer-c.md"
    And the references list contains the "#topic-one" occurrence in "notes/referrer-d.md"
    And "#topic-one/sub" is NOT included in the references (different tag)

  Scenario: Code lens on a heading with references shows correct count
    Given the LSP has fully indexed the vault
    When a textDocument/codeLens request is made for "notes/target.md"
    Then the code lens on "## Section Alpha" shows "2 references"
    And the code lens command triggers find-references for that heading

  Scenario: Code lens on an orphaned heading shows 0 references
    Given the LSP has fully indexed the vault
    When a textDocument/codeLens request is made for "notes/orphaned.md"
    Then the code lens on "## Orphaned Heading" shows "0 references"

  Scenario: Go-to-definition on a file-only link when file has no headings points to line 0
    Given "notes/simple.md" contains only "# Simple\nJust body text."
    And "notes/link-to-simple.md" contains "[[simple]]"
    Given the cursor is on "[[simple]]" in "notes/link-to-simple.md"
    When a textDocument/definition request is made
    Then the response is a Location with uri "notes/simple.md"
    And the target range is at line 0, character 0

  Scenario: Find-references with includeDeclaration=true includes the definition site
    Given the cursor is on "## Section Alpha" in "notes/target.md"
    When a textDocument/references request is made with includeDeclaration=true
    Then the references list contains the heading definition in "notes/target.md"
    And the references list contains the references in "notes/referrer-a.md"
    And the references list contains the references in "notes/referrer-b.md"
    And the references list has exactly 3 items

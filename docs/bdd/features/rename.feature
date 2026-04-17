@lsp
Feature: Rename refactoring

  Background:
    Given a vault containing:
      | path                    | content                                                               |
      | notes/source.md         | # Source Doc\n## Old Heading\nBody text here.\n## Other Heading      |
      | notes/ref-one.md        | # Ref One\n[[source#Old Heading]] and more text                      |
      | notes/ref-two.md        | # Ref Two\nSee [[source#Old Heading]] for details                    |
      | notes/file-linker-a.md  | # File Linker A\n[[source]] is a good note                           |
      | notes/file-linker-b.md  | # File Linker B\nAlso [[source|Source Doc]] for reference            |
      | notes/body-text.md      | # Body\nThis is just prose text without any links.                   |

  @smoke
  Scenario: Rename heading updates all [[doc#heading]] references
    Given the cursor is on "## Old Heading" in "notes/source.md"
    When a textDocument/rename request is made with newName "New Heading"
    Then the WorkspaceEdit renames "Old Heading" to "New Heading" in "notes/source.md"
    And the WorkspaceEdit updates "[[source#Old Heading]]" to "[[source#New Heading]]" in "notes/ref-one.md"
    And the WorkspaceEdit updates "[[source#Old Heading]]" to "[[source#New Heading]]" in "notes/ref-two.md"
    And no changes are applied to "notes/file-linker-a.md"
    And no changes are applied to "notes/file-linker-b.md"

  Scenario: Rename file updates all [[filename]] and [[filename|alias]] references
    Given the cursor is on the document title "source" (file rename context)
    When a textDocument/rename request is made with newName "renamed-source"
    Then the WorkspaceEdit renames the file from "notes/source.md" to "notes/renamed-source.md"
    And the WorkspaceEdit updates "[[source]]" to "[[renamed-source]]" in "notes/file-linker-a.md"
    And the WorkspaceEdit updates "[[source|Source Doc]]" to "[[renamed-source|Source Doc]]" in "notes/file-linker-b.md"
    And heading-specific links are also updated:
      | old                           | new                                   | file              |
      | [[source#Old Heading]]        | [[renamed-source#Old Heading]]        | notes/ref-one.md  |
      | [[source#Old Heading]]        | [[renamed-source#Old Heading]]        | notes/ref-two.md  |

  Scenario: prepareRename returns a valid range when cursor is on a heading
    Given the cursor is on "## Old Heading" in "notes/source.md"
    When a textDocument/prepareRename request is made
    Then the response contains a range covering "Old Heading"
    And the response placeholder is "Old Heading"

  Scenario: prepareRename rejects cursor positioned on body text
    Given the cursor is on the prose text "Body text here." in "notes/source.md"
    When a textDocument/prepareRename request is made
    Then the response is an error with message "Cannot rename at this location"

  Scenario: prepareRename rejects cursor positioned on math block content
    Given the file "notes/math-doc.md" contains:
      """
      # Math Document
      Inline math $x^2 + y^2 = z^2$ here.

      $$
      E = mc^2
      $$
      """
    And the cursor is inside the math block in "notes/math-doc.md"
    When a textDocument/prepareRename request is made
    Then the response is an error with message "Cannot rename at this location"

  Scenario: Rename in file-stem style updates only file-stem links
    Given the server is configured with linkStyle = "file-stem"
    And the cursor is on "## Old Heading" in "notes/source.md"
    When a textDocument/rename request is made with newName "New Heading"
    Then the WorkspaceEdit contains only changes to file-stem style links
    And no path-prefixed links are modified

  Scenario: Zero-reference rename still succeeds as a no-op workspace edit
    Given the cursor is on "## Other Heading" in "notes/source.md"
    And no other files link to "[[source#Other Heading]]"
    When a textDocument/rename request is made with newName "Other Heading Renamed"
    Then the WorkspaceEdit renames the heading text in "notes/source.md"
    And the WorkspaceEdit contains no changes to any other file
    And the response is a valid (non-error) WorkspaceEdit

  Scenario: Rename heading with special characters escapes correctly
    Given the file "notes/special.md" contains "## Heading with (Parens) & Symbols"
    And "notes/special-ref.md" contains "[[special#Heading with (Parens) & Symbols]]"
    Given the cursor is on "## Heading with (Parens) & Symbols" in "notes/special.md"
    When a textDocument/rename request is made with newName "Clean Heading"
    Then the WorkspaceEdit updates "[[special#Heading with (Parens) & Symbols]]" to "[[special#Clean Heading]]" in "notes/special-ref.md"

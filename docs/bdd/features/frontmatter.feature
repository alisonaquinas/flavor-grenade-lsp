@ofm
Feature: YAML frontmatter parsing

  Background:
    Given a vault containing:
      | path                   | content                                                          |
      | notes/base.md          | # Base Note\nSome body content                                   |
      | notes/linked.md        | # Linked Note\n[[alt-name]]                                      |

  @smoke
  Scenario: aliases key is extracted and used for wiki-link resolution
    Given the file "notes/aliased.md" contains:
      """
      ---
      aliases:
        - alt-name
        - shortname
      ---
      # Aliased Note
      Body content here.
      """
    When the LSP processes textDocument/didOpen for "notes/aliased.md"
    And the LSP processes textDocument/didOpen for "notes/linked.md"
    Then the link "[[alt-name]]" in "notes/linked.md" resolves to "notes/aliased.md"
    And no diagnostics are published for "notes/linked.md"

  Scenario: tags key values are indexed as vault tags
    Given the file "notes/tagged.md" contains:
      """
      ---
      tags:
        - project/planning
        - review
        - status/active
      ---
      # Tagged Document
      Body without inline tags.
      """
    When the LSP processes textDocument/didOpen for "notes/tagged.md"
    Then the tag "#project/planning" appears in the registry from "notes/tagged.md"
    And the tag "#review" appears in the registry from "notes/tagged.md"
    And the tag "#status/active" appears in the registry from "notes/tagged.md"

  Scenario: Malformed YAML frontmatter reports FG007
    Given the file "notes/malformed.md" contains:
      """
      ---
      title: Good Title
      aliases: [unclosed bracket
      tags: also-malformed: yaml: here
      ---
      # Malformed Frontmatter
      """
    When the LSP processes textDocument/didOpen for "notes/malformed.md"
    Then a diagnostic with code "FG007" is published for "notes/malformed.md"
    And the diagnostic severity is "Warning"
    And the diagnostic message contains "Malformed YAML frontmatter"

  Scenario: Frontmatter must start on line 1 with --- delimiter
    Given the file "notes/late-frontmatter.md" contains:
      """
      # Heading First

      ---
      title: Too Late
      ---
      Body content here.
      """
    When the LSP processes textDocument/didOpen for "notes/late-frontmatter.md"
    Then the OFM index for "notes/late-frontmatter.md" contains no parsed frontmatter
    And the "---" block is treated as a horizontal rule in the document body

  Scenario: Frontmatter without closing --- delimiter is treated as body text
    Given the file "notes/unclosed.md" contains:
      """
      ---
      title: Unclosed Frontmatter
      aliases: [unclosed]
      # Heading
      Body content
      """
    When the LSP processes textDocument/didOpen for "notes/unclosed.md"
    Then the OFM index for "notes/unclosed.md" contains no parsed frontmatter
    And the entire document is treated as body text

  Scenario: Inline array tags are parsed correctly
    Given the file "notes/inline-array.md" contains:
      """
      ---
      tags: [alpha, beta, gamma/nested]
      ---
      # Inline Array Tags
      """
    When the LSP processes textDocument/didOpen for "notes/inline-array.md"
    Then the tag "#alpha" appears in the registry from "notes/inline-array.md"
    And the tag "#beta" appears in the registry from "notes/inline-array.md"
    And the tag "#gamma/nested" appears in the registry from "notes/inline-array.md"
    And no diagnostics are published for "notes/inline-array.md"

  Scenario: Block array tags are parsed correctly
    Given the file "notes/block-array.md" contains:
      """
      ---
      tags:
        - one
        - two
        - three/deep
      ---
      # Block Array Tags
      """
    When the LSP processes textDocument/didOpen for "notes/block-array.md"
    Then the tag "#one" appears in the registry from "notes/block-array.md"
    And the tag "#two" appears in the registry from "notes/block-array.md"
    And the tag "#three/deep" appears in the registry from "notes/block-array.md"

  Scenario: title key is extracted and available in document metadata
    Given the file "notes/titled.md" contains:
      """
      ---
      title: My Custom Title
      ---
      # Heading Title
      """
    When the LSP processes textDocument/didOpen for "notes/titled.md"
    Then the document metadata for "notes/titled.md" has title "My Custom Title"

  Scenario: Empty frontmatter block with no keys is parsed without error
    Given the file "notes/empty-fm.md" contains:
      """
      ---
      ---
      # Body Only
      """
    When the LSP processes textDocument/didOpen for "notes/empty-fm.md"
    Then no diagnostics are published for "notes/empty-fm.md"
    And the OFM index for "notes/empty-fm.md" has an empty frontmatter object

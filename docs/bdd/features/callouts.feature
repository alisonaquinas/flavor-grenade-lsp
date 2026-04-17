@ofm
@adr:ADR002
Feature: Callout block detection

  Background:
    Given a vault containing:
      | path                | content                                         |
      | notes/callouts.md   | # Callouts Demo                                 |
      | notes/nested.md     | # Nested Callouts                               |
      | notes/blockquote.md | # Blockquotes                                   |

  @smoke
  Scenario: Standard callout type NOTE is detected
    Given the file "notes/callouts.md" contains:
      """
      > [!NOTE]
      > This is a note callout with important information.
      """
    When the LSP processes textDocument/didOpen for "notes/callouts.md"
    Then the OFM index for "notes/callouts.md" contains a callout of type "NOTE"
    And no diagnostics are published for "notes/callouts.md"

  Scenario: All 13 primary callout types are recognized
    Given a file containing one of each primary callout type:
      | type        |
      | NOTE        |
      | INFO        |
      | TIP         |
      | WARNING     |
      | DANGER      |
      | SUCCESS     |
      | QUESTION    |
      | FAILURE     |
      | BUG         |
      | EXAMPLE     |
      | QUOTE       |
      | ABSTRACT    |
      | TODO        |
    When the LSP processes textDocument/didOpen for that file
    Then the OFM index contains callouts for all 13 primary types
    And no diagnostics are published

  Scenario: Foldable callout with dash suffix is detected
    Given the file "notes/callouts.md" contains:
      """
      > [!NOTE]-
      > This callout is foldable and collapsed by default.
      """
    When the LSP processes textDocument/didOpen for "notes/callouts.md"
    Then the OFM index contains a callout of type "NOTE" with foldable=true and defaultOpen=false

  Scenario: Foldable callout with plus suffix is detected as expanded by default
    Given the file "notes/callouts.md" contains:
      """
      > [!TIP]+
      > This callout is foldable and open by default.
      """
    When the LSP processes textDocument/didOpen for "notes/callouts.md"
    Then the OFM index contains a callout of type "TIP" with foldable=true and defaultOpen=true

  Scenario: Custom callout type produces no diagnostic by default
    Given the file "notes/callouts.md" contains:
      """
      > [!MY-CUSTOM-TYPE]
      > A project-specific callout with a custom type name.
      """
    When the LSP processes textDocument/didOpen for "notes/callouts.md"
    Then the OFM index contains a callout of type "MY-CUSTOM-TYPE"
    And no diagnostics are published for "notes/callouts.md"

  Scenario: Completion offers callout types after "> [!" trigger
    Given the LSP has loaded the standard callout type registry
    When a textDocument/completion request is made after "> [!" in any document
    Then the completion list includes "NOTE"
    And the completion list includes "WARNING"
    And the completion list includes "TIP"
    And the completion list includes all 13 primary callout types
    And each completion item has kind "EnumMember"

  Scenario: Nested callout at depth 2 is detected
    Given the file "notes/nested.md" contains:
      """
      > [!NOTE]
      > Outer callout content.
      > > [!WARNING]
      > > Inner nested callout content.
      """
    When the LSP processes textDocument/didOpen for "notes/nested.md"
    Then the OFM index contains a callout of type "NOTE" at depth 1
    And the OFM index contains a callout of type "WARNING" at depth 2
    And no diagnostics are published for "notes/nested.md"

  Scenario: Non-callout blockquote without [!...] is not treated as callout
    Given the file "notes/blockquote.md" contains:
      """
      > This is a regular blockquote without a callout marker.
      > It has multiple lines but no type tag.
      """
    When the LSP processes textDocument/didOpen for "notes/blockquote.md"
    Then the OFM index contains no callouts for "notes/blockquote.md"
    And no diagnostics are published for "notes/blockquote.md"

  Scenario: Callout with title text is detected and title is preserved
    Given the file "notes/callouts.md" contains:
      """
      > [!NOTE] Custom Title Text
      > The callout body content here.
      """
    When the LSP processes textDocument/didOpen for "notes/callouts.md"
    Then the OFM index contains a callout of type "NOTE" with title "Custom Title Text"

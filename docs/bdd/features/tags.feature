@ofm
@adr:ADR002
Feature: Tag indexing and completion

  Background:
    Given a vault containing:
      | path                | content                                                   |
      | notes/work.md       | # Work\n#project/active some task\n#meeting note          |
      | notes/personal.md   | # Personal\n#journal/daily entry for today                |
      | notes/code.md       | # Code\n```\n#not-a-tag inside code\n```\nBody #real-tag  |
      | notes/math.md       | # Math\n$$\n#not-a-tag-in-math\n$$\nNormal #math-note     |

  @smoke
  Scenario: Inline tag is indexed correctly in the vault tag registry
    Given the file "notes/work.md" has been indexed
    When the vault tag registry is queried for all tags
    Then the tag "#project/active" appears in the registry
    And the tag "#meeting" appears in the registry
    And the source location for "#project/active" points to "notes/work.md"

  Scenario: Nested tag hierarchy is preserved
    Given the vault has been fully indexed
    When the tag hierarchy is queried for "#project"
    Then "#project" is returned as a parent tag
    And "#project/active" is returned as a child of "#project"
    And the hierarchy depth for "#project/active" is 2

  Scenario: YAML frontmatter tags are equivalent to inline tags
    Given the file "notes/yaml-tags.md" contains:
      """
      ---
      tags:
        - project/backlog
        - review
      ---
      # YAML Tag Note
      """
    When the LSP processes textDocument/didOpen for "notes/yaml-tags.md"
    Then the tag "#project/backlog" appears in the registry from "notes/yaml-tags.md"
    And the tag "#review" appears in the registry from "notes/yaml-tags.md"
    And no diagnostics are published for "notes/yaml-tags.md"

  Scenario: Unicode tag with emoji is indexed
    Given the file "notes/emoji-tags.md" contains "#🚀launch and #café notes"
    When the LSP processes textDocument/didOpen for "notes/emoji-tags.md"
    Then the tag "#🚀launch" appears in the registry
    And the tag "#café" appears in the registry

  Scenario: Tag completion offers known tags after # trigger character
    Given the vault has been fully indexed with tags "#project/active", "#meeting", "#journal/daily"
    When a textDocument/completion request is made in "notes/new.md" after the character "#"
    Then the completion list includes "project/active"
    And the completion list includes "meeting"
    And the completion list includes "journal/daily"
    And each completion item has kind "Value"

  Scenario: Tag inside fenced code block is NOT indexed
    Given the file "notes/code.md" has been indexed
    When the vault tag registry is queried for all tags
    Then the tag "#not-a-tag" does not appear in the registry
    And the tag "#real-tag" appears in the registry from "notes/code.md"

  Scenario: Tag inside math block is NOT indexed
    Given the file "notes/math.md" has been indexed
    When the vault tag registry is queried for all tags
    Then the tag "#not-a-tag-in-math" does not appear in the registry
    And the tag "#math-note" appears in the registry from "notes/math.md"

  Scenario: Tag inside inline code span is NOT indexed
    Given the file "notes/inline-code.md" contains "Use `#not-indexed` and then #indexed"
    When the LSP processes textDocument/didOpen for "notes/inline-code.md"
    Then the tag "#not-indexed" does not appear in the registry
    And the tag "#indexed" appears in the registry from "notes/inline-code.md"

  Scenario: Find-references on a tag returns all occurrences across the vault
    Given the vault has been fully indexed
    When a textDocument/references request is made on the tag "#meeting" in "notes/work.md"
    Then the references list contains the location of "#meeting" in "notes/work.md"
    And all returned locations have tag "#meeting"

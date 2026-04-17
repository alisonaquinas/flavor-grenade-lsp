@lsp
Feature: LSP diagnostics

  Background:
    Given a vault containing:
      | path                   | content                                                              |
      | notes/existing.md      | # Existing Note\n## Sub Section\nBody text. ^anchor-a               |
      | notes/ambig-a.md       | # Ambiguous Title                                                    |
      | notes/sub/ambig-b.md   | # Ambiguous Title                                                    |

  @smoke
  Scenario: Broken wiki-link produces FG001 with Error severity
    Given the file "notes/broken.md" contains "[[totally-missing-note]]"
    When the LSP processes textDocument/didOpen for "notes/broken.md"
    Then a diagnostic is published for "notes/broken.md" with:
      | field    | value                     |
      | code     | FG001                     |
      | severity | Error                     |
      | source   | flavor-grenade            |
    And the diagnostic range covers the full "[[totally-missing-note]]" span

  Scenario: Ambiguous wiki-link produces FG002 with relatedInformation
    Given the file "notes/multi-ref.md" contains "[[Ambiguous Title]]"
    When the LSP processes textDocument/didOpen for "notes/multi-ref.md"
    Then a diagnostic is published for "notes/multi-ref.md" with:
      | field    | value             |
      | code     | FG002             |
      | severity | Warning           |
      | source   | flavor-grenade    |
    And the diagnostic relatedInformation contains a location for "notes/ambig-a.md"
    And the diagnostic relatedInformation contains a location for "notes/sub/ambig-b.md"
    And the relatedInformation message says "Candidate:"

  Scenario: Broken embed produces FG004 with Warning severity
    Given the file "notes/bad-embed.md" contains "![[nonexistent-file]]"
    When the LSP processes textDocument/didOpen for "notes/bad-embed.md"
    Then a diagnostic is published for "notes/bad-embed.md" with:
      | field    | value          |
      | code     | FG004          |
      | severity | Warning        |
      | source   | flavor-grenade |

  Scenario: Broken block reference produces FG005 with Error severity
    Given the file "notes/bad-block.md" contains "[[existing#^nonexistent-anchor]]"
    When the LSP processes textDocument/didOpen for "notes/bad-block.md"
    Then a diagnostic is published for "notes/bad-block.md" with:
      | field    | value          |
      | code     | FG005          |
      | severity | Error          |
      | source   | flavor-grenade |
    And the diagnostic message contains "nonexistent-anchor"

  Scenario: Non-breaking whitespace after # heading produces FG006
    Given the file "notes/bad-heading.md" contains a heading line "# Title" where the space is a non-breaking space (U+00A0)
    When the LSP processes textDocument/didOpen for "notes/bad-heading.md"
    Then a diagnostic is published for "notes/bad-heading.md" with:
      | field    | value          |
      | code     | FG006          |
      | severity | Warning        |
      | source   | flavor-grenade |
    And the diagnostic message contains "non-breaking whitespace"
    And the diagnostic offers a quick-fix to replace with a regular space

  Scenario: Malformed frontmatter YAML produces FG007
    Given the file "notes/bad-yaml.md" contains:
      """
      ---
      aliases: [unclosed
      tags: : broken : yaml
      ---
      # Body
      """
    When the LSP processes textDocument/didOpen for "notes/bad-yaml.md"
    Then a diagnostic is published for "notes/bad-yaml.md" with:
      | field    | value          |
      | code     | FG007          |
      | severity | Warning        |
      | source   | flavor-grenade |

  Scenario: All cross-file diagnostics suppressed in single-file mode
    Given no vault root is detected (single-file mode)
    And the file "orphan.md" contains:
      """
      [[missing-note]]
      ![[missing-embed]]
      [[also-missing#^no-anchor]]
      """
    When the LSP processes textDocument/didOpen for "orphan.md"
    Then no diagnostic with code "FG001" is published for "orphan.md"
    And no diagnostic with code "FG002" is published for "orphan.md"
    And no diagnostic with code "FG004" is published for "orphan.md"
    And no diagnostic with code "FG005" is published for "orphan.md"

  Scenario: Diagnostics are cleared when a broken link is fixed
    Given the file "notes/fixable.md" contains "[[broken-link]]"
    And the LSP has published FG001 for "notes/fixable.md"
    When the file "notes/broken-link.md" is created with content "# Broken Link"
    And the vault index is updated
    And textDocument/didChange is sent for "notes/fixable.md" with no content change
    Then no diagnostics are published for "notes/fixable.md"

  Scenario: Multiple diagnostics from one file are all published together
    Given the file "notes/many-errors.md" contains:
      """
      [[missing-a]] and [[missing-b]] and ![[missing-c]]
      """
    When the LSP processes textDocument/didOpen for "notes/many-errors.md"
    Then a diagnostic with code "FG001" covers "[[missing-a]]"
    And a diagnostic with code "FG001" covers "[[missing-b]]"
    And a diagnostic with code "FG004" covers "![[missing-c]]"
    And exactly 3 diagnostics are published for "notes/many-errors.md"

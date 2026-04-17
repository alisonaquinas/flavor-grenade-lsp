@lsp @adr:ADR002
Feature: Completion provider

  Background:
    Given a vault with 10 documents and 5 tags:
      | document              | headings                        | anchors         | tags            |
      | notes/alpha.md        | Introduction, Methods, Results  | result-one      | #research       |
      | notes/beta.md         | Overview, Details               | detail-a        | #project/active |
      | notes/gamma.md        | Summary                         |                 | #project/done   |
      | notes/delta.md        | Background, Discussion          | disc-one        | #meeting        |
      | notes/epsilon.md      | Abstract                        |                 | #journal        |
      | notes/zeta.md         | Introduction, Conclusion        |                 |                 |
      | notes/eta.md          | Preamble                        | anchor-eta      |                 |
      | notes/theta.md        | Overview                        |                 |                 |
      | notes/iota.md         | Notes                           |                 |                 |
      | notes/kappa.md        | Appendix                        | appendix-one    |                 |

  @smoke
  Scenario: Wiki-link completion returns document candidates after [[ trigger
    When a textDocument/completion request is made after "[[" in "notes/new.md"
    Then the completion list includes "alpha"
    And the completion list includes "beta"
    And the completion list includes "gamma"
    And the completion list includes at least 10 items
    And each completion item has kind "File"
    And the response isIncomplete is false when all candidates fit within the limit

  Scenario: Tag completion returns candidates after # trigger character
    When a textDocument/completion request is made after "#" in "notes/new.md"
    Then the completion list includes "research"
    And the completion list includes "project/active"
    And the completion list includes "project/done"
    And the completion list includes "meeting"
    And the completion list includes "journal"
    And each completion item has kind "Value"

  Scenario: Callout completion returns all 13 types after "> [!" trigger
    When a textDocument/completion request is made after "> [!" in "notes/new.md"
    Then the completion list includes "NOTE"
    And the completion list includes "WARNING"
    And the completion list includes "TIP"
    And the completion list includes "INFO"
    And the completion list includes "SUCCESS"
    And the completion list includes "QUESTION"
    And the completion list includes "DANGER"
    And the completion list includes "FAILURE"
    And the completion list includes "BUG"
    And the completion list includes "EXAMPLE"
    And the completion list includes "QUOTE"
    And the completion list includes "ABSTRACT"
    And the completion list includes "TODO"
    And the completion list has exactly 13 or more items
    And each completion item has kind "EnumMember"

  Scenario: Heading completion returns heading candidates after [[doc# trigger
    When a textDocument/completion request is made after "[[alpha#" in "notes/new.md"
    Then the completion list includes "Introduction"
    And the completion list includes "Methods"
    And the completion list includes "Results"
    And each completion item has kind "Reference"
    And no other document headings are mixed into the list

  Scenario: Block reference completion returns anchors after [[doc#^ trigger
    When a textDocument/completion request is made after "[[alpha#^" in "notes/new.md"
    Then the completion list includes "result-one"
    And each completion item has kind "Reference"
    And no anchors from other documents appear in the list

  Scenario: Candidate list is capped and isIncomplete true when exceeds limit
    Given the server is configured with completion.candidates = 5
    When a textDocument/completion request is made after "[[" in "notes/new.md"
    Then the completion list contains at most 5 items
    And the response field isIncomplete is true

  Scenario: Completion respects file-stem style configuration
    Given the server is configured with linkStyle = "file-stem"
    When a textDocument/completion request is made after "[[" in "notes/new.md"
    Then all completion insert texts use the file stem without path prefix
    And "notes/alpha.md" appears as insert text "alpha"

  Scenario: Completion respects title-slug style when configured
    Given the server is configured with linkStyle = "title-slug"
    And "notes/alpha.md" has frontmatter title "Alpha Document"
    When a textDocument/completion request is made after "[[" in "notes/new.md"
    Then "notes/alpha.md" appears in the list with insert text "Alpha Document"

  Scenario: Completion in single-file mode returns no cross-file candidates
    Given no vault root is detected (single-file mode)
    When a textDocument/completion request is made after "[[" in "orphan.md"
    Then the completion list is empty or contains only intra-document headings
    And no cross-file document names appear in the list

  Scenario: Partial text after trigger filters completion candidates
    When a textDocument/completion request is made after "[[alp" in "notes/new.md"
    Then the completion list includes "alpha"
    And the completion list does not include "beta"
    And the completion list does not include "gamma"

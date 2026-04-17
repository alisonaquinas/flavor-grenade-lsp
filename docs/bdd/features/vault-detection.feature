@smoke @lsp
Feature: Vault root detection

  Background:
    Given a clean temporary directory for each scenario

  Scenario: .obsidian/ found — vault mode active with full features
    Given a directory structure at "test-vault/":
      | path                              | type      |
      | test-vault/.obsidian/             | directory |
      | test-vault/.obsidian/app.json     | file      |
      | test-vault/notes/index.md         | file      |
    When the LSP server initializes with rootUri "test-vault/"
    Then the VaultDetector returns:
      | field        | value       |
      | mode         | obsidian    |
      | vaultRoot    | test-vault/ |
      | fullFeatures | true        |
    And the capability "flavorGrenade.crossFileLinks" is active

  Scenario: .flavor-grenade.toml found — vault mode active with full features
    Given a directory structure at "project/":
      | path                             | type |
      | project/.flavor-grenade.toml     | file |
      | project/docs/README.md           | file |
    When the LSP server initializes with rootUri "project/"
    Then the VaultDetector returns:
      | field        | value        |
      | mode         | flavor-grenade |
      | vaultRoot    | project/     |
      | fullFeatures | true         |
    And the capability "flavorGrenade.crossFileLinks" is active

  Scenario: Both .obsidian/ and .flavor-grenade.toml present — obsidian takes precedence
    Given a directory structure at "mixed/":
      | path                          | type      |
      | mixed/.obsidian/              | directory |
      | mixed/.flavor-grenade.toml    | file      |
      | mixed/notes/doc.md            | file      |
    When the LSP server initializes with rootUri "mixed/"
    Then the VaultDetector returns:
      | field        | value    |
      | mode         | obsidian |
      | vaultRoot    | mixed/   |
      | fullFeatures | true     |
    And the VaultDetector preference log records "obsidian marker takes precedence"

  Scenario: Neither marker found — single-file mode with cross-file features suppressed
    Given a directory structure at "plain-dir/":
      | path              | type |
      | plain-dir/doc.md  | file |
    And no .obsidian/ directory exists at or above "plain-dir/"
    And no .flavor-grenade.toml exists at or above "plain-dir/"
    When the LSP server initializes with rootUri "plain-dir/"
    Then the VaultDetector returns:
      | field        | value       |
      | mode         | single-file |
      | vaultRoot    | null        |
      | fullFeatures | false       |
    And the capability "flavorGrenade.crossFileLinks" is inactive
    And diagnostics FG001, FG002, FG004, FG005 are suppressed

  Scenario: Nested .obsidian/ found — innermost is the vault root
    Given a directory structure:
      | path                                     | type      |
      | outer/.obsidian/                         | directory |
      | outer/inner/.obsidian/                   | directory |
      | outer/inner/notes/doc.md                 | file      |
    When the LSP server initializes with rootUri "outer/inner/"
    Then the VaultDetector returns vaultRoot "outer/inner/"
    And the vault index is scoped to "outer/inner/" only
    And documents under "outer/" but outside "outer/inner/" are not indexed

  Scenario: .flavor-grenade.toml configures custom extension list
    Given the file "custom/.flavor-grenade.toml" contains:
      """
      [vault]
      extensions = [".md", ".markdown", ".txt"]
      """
    And a directory structure at "custom/":
      | path                   | type |
      | custom/notes/note.md   | file |
      | custom/notes/note.txt  | file |
      | custom/notes/note.rst  | file |
    When the LSP server initializes with rootUri "custom/"
    Then the document index DOES contain "custom/notes/note.md"
    And the document index DOES contain "custom/notes/note.txt"
    And the document index does NOT contain "custom/notes/note.rst"

  Scenario: Vault root detection works when server starts with a file URI (not folder)
    Given the file "standalone/some-note.md" exists
    And no vault markers are present in "standalone/"
    When the LSP server initializes with a file URI for "standalone/some-note.md"
    Then the VaultDetector walks up the directory tree from "standalone/"
    And returns single-file mode if no marker is found

  Scenario: Detection result is cached and not re-run on each document open
    Given a vault at "cached-vault/" with .obsidian/
    When the LSP server initializes and opens 5 documents sequentially
    Then the VaultDetector runs exactly once during initialization
    And subsequent textDocument/didOpen events do not re-trigger vault detection

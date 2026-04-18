---
title: Security Threat Model — flavor-grenade-lsp
tags:
  - research/security
  - security/threat-model
aliases:
  - Security Research
  - Threat Model
updated: 2026-04-17
---

# Security Threat Model

> [!NOTE] Scope
> This document surveys security threats applicable to `flavor-grenade-lsp` — a long-running, stdio-transport LSP server that reads from user vaults, parses Obsidian Flavored Markdown, and performs file writes via LSP rename operations. It draws on CVEs, security research, and attack patterns relevant to LSP servers, NestJS, Bun, JSON-RPC transports, and Markdown parsers as of April 2026.

> [!WARNING] Not an audit
> This is a research document, not a security audit. Issues identified here are candidates for mitigation; they have not been verified against the current implementation. See [[requirements/ci-cd]] and [[adr/ADR009-precommit-hooks-zero-warnings]] for enforcement mechanisms.

---

## System Characterization

Before enumerating threats it is necessary to characterize what this system is and — importantly — what it is not.

| Property | Value |
|---|---|
| **Transport** | `stdio` only — JSON-RPC over stdin/stdout; no network socket |
| **Client trust** | The LSP client (editor) is fully trusted; it controls all LSP method calls |
| **Vault trust** | The vault directory is **partially trusted** — the user owns it, but it may contain content crafted by third parties (shared vaults, cloned repos, Obsidian Publish mirrors) |
| **Write capability** | Yes — the server performs file writes via `workspace/applyEdit` in the rename refactoring path |
| **Process privilege** | Runs as the editor's user — inherits full read access to the user's file system |
| **Authentication** | None — the LSP protocol has no authentication layer; trust is derived from process ownership |
| **Network exposure** | None in the stdio transport model; no HTTP server, no listening socket |

The stdio transport model eliminates an entire class of network-facing threats (SSRF, unauthenticated RPC endpoints, CORS misconfigurations). However, the server's position as a long-lived, file-system-reading process with write-back capability creates a distinct and non-trivial threat surface.

---

## Threat Surface Map

```text
┌─────────────────────────────────────────────────────────────────┐
│                    TRUST BOUNDARY                               │
│                                                                 │
│  Trusted                         Partially Trusted             │
│  ─────────                       ──────────────────            │
│  Editor (client)                 Vault directory               │
│  User's intent                   Shared vault content          │
│  LSP method calls                Cloned repository vaults      │
│                                  Frontmatter YAML              │
│                                  Wiki-link targets             │
│                                  Block IDs                     │
└─────────────────────────────────────────────────────────────────┘

                 ┌─────────────────────────────────┐
                 │      flavor-grenade-lsp          │
                 │                                  │
  JSON-RPC/stdio │  ┌──────────────┐               │
  ◄──────────────┤  │  LSP Layer   │               │
                 │  └──────┬───────┘               │
                 │         │                        │
                 │  ┌──────▼───────┐               │
                 │  │  OFM Parser  │ ◄─── vault files
                 │  └──────┬───────┘               │
                 │         │                        │
                 │  ┌──────▼───────┐               │
                 │  │  VaultIndex  │ ◄─── file watcher
                 │  └──────────────┘               │
                 │         │                        │
                 │  workspace/applyEdit ────────────┼──► writes files
                 └─────────────────────────────────┘
```

---

## Threat Category 1: Malicious Vault Content

#### Severity: High | Likelihood: Medium

### Background

The server reads every `.md` file in the vault and parses it to build the VaultIndex and OFMIndex. A vault may be shared (via Obsidian Sync, a cloned git repository, or a network share) and its content may have been crafted by a third party with knowledge of how this server processes files.

This is a well-established attack pattern for developer tools. The 2026 OpenCode vulnerability demonstrated that "reading" a file through an LSP-configured tool can trigger arbitrary command execution — users expect reads to be safe, but LSP infrastructure does not guarantee it. While flavor-grenade-lsp does not execute vault content, it does parse it in ways that could be exploited.

### Sub-threat 1.1: ReDoS via Crafted Markdown

The OFM parser uses regular expressions for wiki-links, tags, block IDs, callouts, and frontmatter. Several established Markdown parsing libraries have ReDoS CVEs:

- **markdown-it** — CVE-2022-21670: `_*…` pattern causes quadratic backtracking
- **marked** — CVE pre-4.0.10: `block.def` regex causes catastrophic backtracking
- **CodeMirror** — CVE-2025-6493: multiple ReDoS locations in `markdown.js`
- **markdown-link-extractor** — exponential ReDoS on non-matching repeated characters

A custom OFM parser using naively written regexes for `[[` wiki-link parsing, `#tag` detection, or `%%comment%%` extraction is directly exposed to this class of attack. A vault file containing a crafted sequence of characters (e.g., `[[` followed by thousands of `|` characters without a closing `]]`) could lock the server's event loop for seconds, causing the editor to time out and become unresponsive.

**Mitigations:**

- Audit all OFM regex patterns against catastrophic backtracking using a tool such as `safe-regex`, `vuln-regex-detector`, or manual analysis
- Set per-file parse timeout (e.g., 100 ms) to bound worst-case event loop stall
- Prefer non-regex parsers (e.g., character-at-a-time state machines) for OFM constructs with recursive or unbounded structure
- Fuzz the parser with corpus-based inputs (e.g., AFL++, jsfuzz)

### Sub-threat 1.2: Path Traversal via Vault URIs

**CVE-2024-22415** (JupyterLab-LSP, CVSS 8.8) demonstrated that an LSP extension's file serving logic can allow path traversal beyond the intended root, giving unauthorized access to the file system.

In flavor-grenade-lsp the analogous risk is in URI normalization: if a vault document contains a wiki-link whose resolved path traverses outside the vault root (e.g., `[[../../../etc/hosts]]` or `[[%2e%2e%2fetc%2fpasswd]]`), the server's VaultIndex lookup or `textDocument/definition` response handler must not resolve and read files outside the vault root.

The risk escalates in the `workspace/applyEdit` rename path: if the server computes an edit target URI from a resolved wiki-link that has not been bounds-checked, a rename operation could write to a file outside the vault.

**Mitigations:**

- All file paths resolved from vault content must be canonicalized and checked against the vault root before any I/O operation
- Reject any resolved URI whose canonical form falls outside `rootUri`
- Use `path.resolve()` then verify the result starts with the vault root (not `startsWith` on the un-resolved string, which can be bypassed)
- Apply the check in both read paths (VaultIndex construction) and write paths (rename edits)

### Sub-threat 1.3: YAML Frontmatter Injection

Obsidian frontmatter is YAML. YAML parsers have a history of code execution vulnerabilities when `!!python/object` or similar tags are used — though JavaScript YAML parsers (e.g., `js-yaml`) default to safe mode. Even in safe mode, malformed YAML can trigger denial of service via deeply nested structures or exceptionally large anchors.

Additionally, frontmatter `aliases:` values flow directly into the VaultIndex as link resolution candidates. If alias values are not sanitized, they could influence completion results, diagnostic messages, or rename edit targets in unexpected ways.

**Mitigations:**

- Parse YAML frontmatter with `js-yaml` in safe mode (`safeLoad` / `load` without `Function` schema)
- Set a maximum depth limit and maximum string length on frontmatter parsing
- Treat all frontmatter values as untrusted strings — do not eval, exec, or interpolate them into shell commands or file paths without normalization

---

## Threat Category 2: JSON-RPC Input Validation

#### Severity: Medium | Likelihood: Medium

### Background: JSON-RPC

The LSP protocol communicates via JSON-RPC 2.0. The editor client is fully trusted, but the server must still validate all incoming parameters for correctness — both because buggy clients exist and because any future TCP/pipe transport mode would expose the RPC surface to potentially untrusted callers.

### Sub-threat 2.1: Malformed Position and Range Objects

LSP methods such as `textDocument/completion`, `textDocument/hover`, and `textDocument/definition` accept `Position` objects with `line` and `character` fields. An out-of-bounds position (e.g., `line: -1`, `character: 2147483647`, or `line: NaN`) that reaches the VaultIndex without validation can produce undefined behaviour in the parser:

- Array index `-1` in JavaScript returns `undefined`, which silently propagates
- `NaN` comparisons always return false, producing incorrect range checks
- Integer overflow in character offsets can wrap around in some implementations

These are not typically exploitable for RCE in a TypeScript process, but they are reliable denial-of-service vectors and can produce incorrect LSP responses (e.g., wrong rename targets).

**Mitigations:**

- Validate all incoming LSP position/range parameters: `line >= 0`, `character >= 0`, both are integers, both are within the bounds of the document's line array
- Use Zod or a similar validation library on the server's request handler layer
- Return `ResponseError` with code `InvalidParams` (-32602) for invalid inputs rather than crashing or silently mishandling

### Sub-threat 2.2: Oversized Payloads

A malicious or buggy client could send an arbitrarily large `textDocument/didChange` notification (e.g., a 500 MB document change). Without a payload size limit, the server will attempt to parse the entire string, potentially exhausting heap memory.

**Mitigations:**

- Enforce a maximum `contentLength` for LSP messages (e.g., 10 MB)
- Disconnect (close stdin read stream) if a message exceeds the limit
- Apply debounce to `textDocument/didChange` to avoid re-parsing on every keystroke

### Sub-threat 2.3: Prototype Pollution via JSON Parsing

**CVE-2024-29409** (`@nestjs/common`, Arbitrary Code Injection via `FileTypeValidator`) and multiple npm prototype pollution CVEs (flatnest, dset, web3-utils) demonstrate that untrusted JSON fed into JavaScript object operations can pollute `Object.prototype`, causing unexpected behaviour across the application.

In flavor-grenade-lsp the JSON-RPC message body is parsed from stdin as a JSON string. If the parsed JSON contains `__proto__`, `constructor`, or `prototype` keys that flow into object merge operations (e.g., in NestJS's DI configuration or parameter validation), prototype pollution could result.

**Mitigations:**

- Use `JSON.parse()` directly (which does not execute code), then pass the result through a schema validator (Zod) before any object merge
- Never use `Object.assign(target, untrustedInput)` or spread `{...untrustedInput}` without prior validation
- Consider `Object.freeze(Object.prototype)` in the server bootstrap to make pollution attempts fail loudly rather than silently
- Audit NestJS dependency tree for prototype pollution CVEs on each release; subscribe to `@nestjs/core` and `@nestjs/common` security advisories

---

## Threat Category 3: Supply Chain

#### Severity: High | Likelihood: Low-Medium

### Background: Supply Chain

The **Shai-Hulud 2.0** campaign (November 2025, Palo Alto Unit 42 / Endor Labs) targeted the npm ecosystem and specifically exploited the Bun runtime as an evasion mechanism — malicious `preinstall` scripts downloaded and executed Bun to bypass Node.js-focused security monitoring. Over 25,000 malicious repositories were created. This is directly relevant because flavor-grenade-lsp uses Bun as its runtime and package manager.

**CVE-2024-29409** (`@nestjs/common` ≤ 10.4.15 / ≤ 11.0.15): Arbitrary code injection via improper MIME type validation in `FileTypeValidator`. Patched in 10.4.16 / 11.0.16.

**CVE-2025-54782** (`@nestjs/devtools-integration`): RCE via `vm.runInNewContext()` escape in the `/inspector/graph/interact` endpoint. Not directly applicable (flavor-grenade-lsp does not use devtools-integration), but illustrates that the NestJS ecosystem has had RCE-class vulnerabilities.

**Bun `.npmrc` ignore-scripts bypass** (bunsecurity.dev, CVSS 5.5, CWE-183): Bun's package manager respects `--ignore-scripts` CLI flag but ignores the `ignore-scripts=true` directive in `.npmrc`. This means organizations cannot centrally enforce no-script-execution policy through `.npmrc` when using `bun install`.

### Sub-threat 3.1: Compromised Dependency

A dependency (direct or transitive) is taken over via account compromise and a malicious version is published. Because Bun's `.npmrc` `ignore-scripts` bypass prevents centralized enforcement, `postinstall` scripts in malicious versions can execute arbitrary code on the developer's machine during `bun install`.

**Mitigations:**

- Pin all dependency versions exactly (`exact = true` in `bunfig.toml` — already configured)
- Use `bun install --frozen-lockfile` in CI (already in `ci.yml`) — prevents lockfile drift
- Subscribe to GitHub security advisories for all direct dependencies
- Use `bun install --ignore-scripts` (CLI flag, not `.npmrc`) as the default install command in CI
- Enable OIDC provenance on all published versions so consumers can verify the build chain
- Audit `bun.lockb` on every dependency update PR — review the diff of resolved versions

### Sub-threat 3.2: Dependency Confusion / Typosquatting

An attacker registers an npm package with a name similar to a dependency (e.g., `@nestjs/commom` vs. `@nestjs/common`). A typographical error in `package.json` or an intern's `bun add` command installs the malicious package.

**Mitigations:**

- Lockfile pins exact resolved registry URLs — never install without verifying against the lockfile
- Review all `bun add` commands in PRs before merging
- Consider using a private registry proxy (Verdaccio, npm Enterprise) that mirrors only approved packages for production builds

---

## Threat Category 4: Process Privilege and Information Disclosure

#### Severity: Medium | Likelihood: Low

### Background: Process Privilege

The LSP server runs as the editor user and inherits that user's full read access to the file system. Obsidian vaults frequently contain sensitive personal information: journal entries, passwords in frontmatter, API keys embedded in notes, health records, and financial data.

### Sub-threat 4.1: Vault Content Leakage via Logs

If the server logs vault file content (e.g., in debug-level error messages or diagnostic output), sensitive vault content can appear in log files accessible to other processes or persistent in log aggregation systems.

**Mitigations:**

- Never log the content of vault documents — log only file paths, line numbers, and diagnostic codes
- Sanitize all error message strings to strip document content before logging
- Set log level to `error` and `warn` only in production (already in the `bootstrap()` in `src/main.ts`)

### Sub-threat 4.2: Completion Responses Exposing Sensitive Frontmatter

The completion handler for wiki-links and tags may surface frontmatter values (e.g., `aliases:` values, `tags:` values) as completion candidates. If a vault document contains a frontmatter alias that is an API key or password (e.g., `aliases: ["sk-proj-XXXXXXXX"]`), that value will appear in LSP completion responses sent back to the editor.

Since the editor client is trusted and the user is present, this is not a remote disclosure risk — but it is a local design issue that could lead to sensitive data appearing in editor autocomplete UI.

**Mitigations:**

- Filter completion candidates against a configurable blocklist of frontmatter key names (e.g., do not offer values from `password:`, `token:`, `secret:`, `api_key:` frontmatter fields)
- Document this behavior in the `[diagnostics]` section of `.flavor-grenade.toml`

### Sub-threat 4.3: Rename Writes Outside Vault Root

The `workspace/applyEdit` rename path writes to files. If the resolved rename target URI is not bounds-checked against the vault root (see Threat 1.2), a rename operation could write to arbitrary files accessible to the user.

**Mitigations:**

- Same path-canonicalization check as Sub-threat 1.2 — applied in the rename edit builder
- Add a `readonly` mode flag to the server that disables all write operations (`workspace/applyEdit` returns an error) when enabled via `.flavor-grenade.toml`

---

## Threat Category 5: Denial of Service / Resource Exhaustion

#### Severity: Medium | Likelihood: Medium (DoS)

### Background: Denial of Service

The LSP server is a long-running process that the editor expects to remain responsive. Node.js (and Bun) run on a single-threaded event loop; any synchronous blocking operation starves all other handlers. Recent Node.js CVEs include resource exhaustion via HTTP/2 WINDOW_UPDATE (CVE-2026-21714) and TLS error handling file descriptor leaks.

### Sub-threat 5.1: Vault Size Bomb

A vault directory containing millions of small files (e.g., a malicious vault that was mounted to the workspace, or a large software repository erroneously set as the vault root) can cause VaultIndex construction to exhaust heap memory or stall for minutes during initial indexing.

**Mitigations:**

- Enforce a configurable maximum file count during initial indexing (default: 50,000 files)
- Emit an LSP `window/showMessage` warning when the vault exceeds a threshold
- Index incrementally using Bun's file watcher rather than a full sync scan on startup

### Sub-threat 5.2: Circular Embed Chain

`![[A]]` in document A embeds document B which contains `![[A]]`, creating an infinite loop in any recursive embed resolver.

**Mitigations:**

- Track visited document URIs in a `Set` during embed resolution; return `FG005` (circular embed) diagnostic on cycle detection
- Set a maximum embed depth limit (default: 10) independent of cycle detection

### Sub-threat 5.3: Deeply Nested YAML

YAML supports anchors and references that can produce exponentially large object graphs when expanded. A frontmatter block using YAML anchors to create a "billion laughs" style expansion can cause the `js-yaml` parser to exhaust memory.

**Mitigations:**

- Pass `{ maxAliases: 100 }` (or lower) to `js-yaml`'s `load()` to cap alias expansion
- Wrap frontmatter parsing in a try/catch that treats any parse failure as malformed frontmatter (emit FG007, continue indexing)

---

## Threat Category 6: LSP Workspace URI Injection

#### Severity: Low-Medium | Likelihood: Low

### Background: Workspace URI Injection

The LSP `initialize` request includes `rootUri` and `workspaceFolders` parameters that tell the server where the vault root is. These parameters come from the editor client, which is trusted. However, if a malicious `.editorconfig`, `.vscode/settings.json`, or other workspace configuration file causes the editor to send a modified `rootUri`, the server could be directed to index a directory it should not.

This is less a server-side vulnerability and more a client-side configuration injection risk, but the server can mitigate it by validating the received root.

**Mitigations:**

- Validate that `rootUri` is a `file://` URI (not `http://`, `ftp://`, or other schemes)
- Log the resolved vault root at startup at `warn` level so users can verify it
- Do not support any URI scheme other than `file://` in Phase 1 through Phase 12

---

## Threat Category 7: LSP Configuration as Code Execution Vector

#### Severity: High | Likelihood: Low → Medium

### Background: Config as Code Execution

The 2026 OpenCode vulnerability showed that allowing a repository to configure which LSP server binary to launch (via a config file in the repository) creates an arbitrary code execution vector — any `command` array in the config can spawn any process.

flavor-grenade-lsp does not launch other LSP servers, but its `.flavor-grenade.toml` configuration schema could evolve to include features that execute external tools (e.g., a `[hooks]` section, a `[formatter]` section pointing to a custom script). If such features are ever added without strict validation, a malicious vault's `.flavor-grenade.toml` could spawn arbitrary processes.

**Mitigations:**

- The current `.flavor-grenade.toml` schema contains no command-execution fields; maintain this invariant
- If hook or formatter execution is added in a future phase, require explicit user confirmation (LSP `window/showMessageRequest`) before executing any binary named in vault-provided configuration
- Document this as a non-goal in [[adr/ADR002-ofm-only-scope]]: vault configuration files must never cause process spawning

---

## Priority Matrix

| # | Threat | Severity | Likelihood | Priority | Phase to Address |
|---|---|---|---|---|---|
| 1.1 | ReDoS via crafted Markdown | High | Medium | **P1** | Phase 3 (OFM Parser) |
| 1.2 | Path traversal via vault URIs | High | Medium | **P1** | Phase 4 (Vault Index) |
| 3.1 | Compromised dependency | High | Low-Medium | **P1** | Phase 1 (ongoing) |
| 5.2 | Circular embed chain | Medium | High | **P2** | Phase 7 (Embeds) |
| 2.1 | Malformed position/range | Medium | Medium | **P2** | Phase 2 (LSP Transport) |
| 2.3 | Prototype pollution via JSON | Medium | Low | **P2** | Phase 2 (LSP Transport) |
| 4.3 | Rename writes outside vault root | High | Low | **P2** | Phase 11 (Rename) |
| 5.3 | Deeply nested YAML frontmatter | Medium | Medium | **P2** | Phase 3 (OFM Parser) |
| 5.1 | Vault size bomb | Medium | Medium | **P3** | Phase 4 (Vault Index) |
| 1.3 | YAML frontmatter injection | Medium | Low | **P3** | Phase 3 (OFM Parser) |
| 2.2 | Oversized JSON-RPC payloads | Medium | Low | **P3** | Phase 2 (LSP Transport) |
| 4.1 | Vault content leakage via logs | Medium | Low | **P3** | Phase 2 (LSP Transport) |
| 6.0 | LSP workspace URI injection | Low-Medium | Low | **P4** | Phase 2 (LSP Transport) |
| 7.0 | Config-as-code execution | High | Low | **P4** | Never (by design) |
| 4.2 | Sensitive frontmatter in completions | Low | Medium | **P4** | Phase 9 (Completions) |
| 3.2 | Dependency confusion | High | Low | **P4** | Phase 1 (ongoing) |

---

## Mitigations Already in Place

| Mitigation | Status | Reference |
|---|---|---|
| stdio-only transport (no network socket) | ✅ Architecture decision | [[adr/ADR001-stdio-transport]] |
| Exact dependency pinning (`exact = true` in bunfig.toml) | ✅ Phase 1 | [[plans/phase-01-scaffold]] |
| `--frozen-lockfile` in CI | ✅ Phase 1 | [[.github/workflows/ci.yml]] |
| OIDC provenance publishing | ✅ Phase 13 planned | [[adr/ADR008-oidc-publishing]] |
| TypeScript strict mode (eliminates whole class of type errors) | ✅ Phase 1 | [[requirements/code-quality#Quality.Types.StrictMode]] |
| No `@nestjs/devtools-integration` dependency | ✅ By design | [[plans/phase-01-scaffold]] |
| No `@nestjs/platform-express` (no HTTP server) | ✅ By design | [[adr/ADR001-stdio-transport]] |

---

## Recommended Future ADRs

| ADR | Topic |
|---|---|
| ADR012 | Parser safety policy: timeouts, depth limits, ReDoS-safe regex discipline |
| ADR013 | Vault root confinement: path canonicalization and bounds-checking contract |
| ADR014 | Dependency security policy: `--ignore-scripts` in CI, advisory subscriptions |

---

## Sources and References

### CVEs and Vulnerability Reports

- [CVE-2024-22415: JupyterLab-LSP Path Traversal (Snyk)](https://security.snyk.io/vuln/SNYK-PYTHON-JUPYTERLABLSP-6180562)
- [CVE-2024-22415 Analysis (Ogma)](https://ogma.in/cve-2024-22415-addressing-security-vulnerabilities-in-jupyterlab-lsp)
- [CVE-2022-23853: KDE Kate LSP Plugin](https://www.cvedetails.com/cve/CVE-2022-23853/)
- [CVE-2024-29409: @nestjs/common Arbitrary Code Injection (Snyk)](https://security.snyk.io/vuln/SNYK-JS-NESTJSCOMMON-9538801)
- [Critical NestJS RCE Vulnerability (linuxsecurity.com)](https://linuxsecurity.com/news/security-vulnerabilities/critical-nestjs-rce-vulnerability)
- [CVE-2025-6493: CodeMirror ReDoS (Snyk)](https://security.snyk.io/vuln/SNYK-JS-CODEMIRROR-10494092)
- [ReDoS in markdown-it (Snyk)](https://security.snyk.io/vuln/SNYK-JS-MARKDOWNIT-2331914)
- [ReDoS in markdown-to-jsx (GitHub Security Lab)](https://securitylab.github.com/advisories/GHSL-2020-300-redos-markdown-to-jsx/)
- [Node.js January 2026 Security Releases](https://nodejs.org/en/blog/vulnerability/december-2025-security-releases)
- [Node.js March 2026 Security Releases](https://nodejs.org/en/blog/vulnerability/march-2026-security-releases)

### Supply Chain

- [Shai-Hulud 2.0 npm Supply Chain Attack (Palo Alto Unit 42)](https://unit42.paloaltonetworks.com/npm-supply-chain-attack/)
- [Shai-Hulud 2.0 Uses Bun Runtime (Endor Labs)](https://www.endorlabs.com/learn/shai-hulud-2-malware-campaign-targets-github-and-cloud-credentials-using-bun-runtime)
- [Shai-Hulud 2.0 Guidance (Microsoft Security Blog)](https://www.microsoft.com/en-us/security/blog/2025/12/09/shai-hulud-2-0-guidance-for-detecting-investigating-and-defending-against-the-supply-chain-attack/)
- [Bun Package Manager ignore-scripts Bypass (bunsecurity.dev)](https://www.bunsecurity.dev/blog/bun-security-vulnerability-insecure-practice-package-manager/)
- [Brief History of npm Supply Chain Attacks 2025 (Emily Xiong, Medium)](https://emilyxiong.medium.com/brief-history-of-npm-supply-chain-attacks-in-year-2025-a887dd2e11a4)

### Developer Tool Trust and LSP Security

- [When "Read This File" Means "Run This Code": LSP Configuration in OpenCode (DEV Community)](https://dev.to/pachilo/when-read-this-file-means-run-this-code-lsp-configuration-in-opencode-44g1)
- [Prompt Injection and the Security Risks of Agentic Coding Tools (Secure Code Warrior)](https://www.securecodewarrior.com/article/prompt-injection-and-the-security-risks-of-agentic-coding-tools)
- [RoguePilot: GitHub Copilot Repository Takeover (Orca Security)](https://orca.security/resources/blog/roguepilot-github-copilot-vulnerability/)

### Reference Standards

- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [CWE-22: Path Traversal](https://cwe.mitre.org/data/definitions/22.html)
- [JSON-RPC Security Best Practices (StackHawk)](https://www.stackhawk.com/blog/json-rpc-security-best-practices/)
- [LSP Specification 3.17](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)

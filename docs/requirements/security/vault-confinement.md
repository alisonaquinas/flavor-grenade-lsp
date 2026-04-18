---
title: Requirements — Vault Root Confinement
tags:
  - requirements/security
  - requirements/security/vault-confinement
aliases:
  - Vault Confinement Requirements
  - Path Traversal Prevention
---

# Vault Root Confinement Requirements

> [!NOTE] Scope
> These are **functional security requirements** governing how the server resolves file paths derived from vault content and LSP parameters. They prevent path traversal attacks that could expose files outside the vault root (information disclosure) or overwrite arbitrary files on the user's system (via the rename write path). Evidence is drawn from [[research/security-threat-model#Threat-Category-1]] and [[research/security-threat-model#Threat-Category-4]]. The canonical decision is [[adr/ADR013-vault-root-confinement]].

---

**Tag:** Security.Vault.PathConfinement
**Gist:** Every file path derived from vault content or LSP parameters must be canonicalized and verified against the vault root before any I/O operation; paths that resolve outside the vault root must produce a null result and never reach the file system.
**Ambition:** CVE-2024-22415 (JupyterLab-LSP, CVSS 8.8) demonstrated that a path traversal vulnerability in an LSP extension can give unauthorized read access to files anywhere on the file system. The attack requires no special privileges — the LSP server is already running as the user. A vault document containing `[[../../../etc/passwd]]` or `[[%2e%2e/sensitive]]` (percent-encoded traversal) must not cause the server to resolve and read that file. The confinement function is the single enforcement point: all path resolution flows through it, and it is unit-tested against every known bypass technique.
**Scale:** Percentage of path traversal attempts in the test suite (covering raw `../`, percent-encoded `%2e%2e/`, absolute paths, URL-encoded slashes `%2f`) that: (a) return null from the confinement function, (b) never reach the file system, and (c) produce the correct FG001 or FG004 diagnostic.
**Meter:**

1. Create an integration test suite with at least 5 traversal patterns:
   - `[[../outside]]` — raw relative traversal
   - `[[%2e%2e/outside]]` — percent-encoded traversal
   - `[[/absolute/path]]` — absolute path reference
   - `[[..%2Foutside]]` — mixed encoding
   - `[[....//outside]]` — double-dot variant
2. For each pattern, trigger the link resolver and capture the resolved path.
3. Verify `confineToVaultRoot()` returns null for each.
4. Verify no file system read is attempted outside the vault root (mock or spy on `fs.readFile`).
5. Verify FG001 diagnostic is emitted for each.
6. Compute: (attempts correctly confined / total attempts) × 100.
**Fail:** Any traversal pattern that reaches the file system outside the vault root; any pattern that returns a non-null path from `confineToVaultRoot()` when the resolved path is outside the vault root.
**Goal:** 100% of traversal patterns are confined — zero file system accesses outside the vault root.
**Stakeholders:** Vault authors, file system security, users of shared vaults.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-1.2]], [[adr/ADR013-vault-root-confinement]], CVE-2024-22415, OWASP Path Traversal.

---

**Tag:** Security.Vault.SymlinkConfinement
**Gist:** Symlinks within the vault that resolve to targets outside the vault root must be treated as non-existent files, producing FG001 or FG004; the real symlink target path must be checked, not the symlink's own path.
**Ambition:** A symlink inside the vault (e.g., `vault/link-to-secret -> /etc/ssh/id_rsa`) passes the `startsWith(vaultRoot)` check on the symlink's own path but points to a file outside the vault root. Any server that checks the symlink path rather than the resolved target path is vulnerable to a symlink-based path traversal. The fix is to call `fs.realpath()` on the resolved path and apply the vault root check to the real path, not the symlink path. This is a distinct code path from percent-encoding traversal and must be tested separately.
**Scale:** Percentage of symlink-based traversal test cases where the server correctly treats the symlinked file as non-existent and emits FG001/FG004 rather than following the symlink outside the vault root.
**Meter:**

1. Create a test vault with a symlink whose target is outside the vault root.
2. Create a vault document referencing the symlinked file via wiki-link.
3. Trigger link resolution.
4. Verify `fs.realpath()` is called on the resolved path (via mock or spy).
5. Verify the real path fails the vault root check.
6. Verify FG001 is emitted for the wiki-link.
7. Verify no file content from outside the vault root is read.
**Fail:** Any symlink-based traversal that results in reading a file outside the vault root; any server that checks the symlink path rather than the real path.
**Goal:** 100% of out-of-vault symlinks treated as non-existent — zero symlink-based traversals succeed.
**Stakeholders:** File system security, vault authors on multi-user systems.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-1.2]], [[adr/ADR013-vault-root-confinement#4-symlink-policy]].

---

**Tag:** Security.Vault.URISchemeAllowlist
**Gist:** The server must only process `file://` URIs; any LSP request referencing a URI with a non-`file://` scheme must be rejected with a JSON-RPC InvalidParams error (-32602) before reaching any resolver.
**Ambition:** The LSP protocol accepts URIs for document identification. An editor extension, a buggy client, or a future TCP-transport mode could pass URIs with schemes other than `file://` (e.g., `http://`, `ftp://`, `data:`, `untitled://`). Processing these URIs could cause the server to make outbound network requests (information exfiltration via SSRF patterns), attempt to read from unsupported sources, or produce undefined behaviour in the file path resolver. Rejecting non-`file://` URIs at the transport boundary is the simplest and most robust mitigation.
**Scale:** Percentage of LSP requests carrying a non-`file://` document URI that are rejected with InvalidParams (-32602) before reaching the VaultIndex or any file system operation.
**Meter:**

1. Send `textDocument/hover` requests with URIs: `http://example.com/note.md`, `ftp://host/note.md`, `data:text/plain,hello`, `untitled://note.md`.
2. For each, capture the JSON-RPC response.
3. Verify each produces a JSON-RPC error response with code -32602 (InvalidParams).
4. Verify no file system operation is attempted (spy on file system calls).
5. Compute: (non-file URIs rejected / total non-file URIs sent) × 100.
**Fail:** Any non-`file://` URI that reaches the VaultIndex or triggers a file system operation.
**Goal:** 100% of non-`file://` URIs rejected at the transport boundary.
**Stakeholders:** Security auditors, future TCP-transport mode users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Threat-Category-6]], [[adr/ADR013-vault-root-confinement#3-uri-scheme-allowlist]].

---

**Tag:** Security.Vault.RenameConfinement
**Gist:** Every file URI produced by the rename edit builder must pass vault-root confinement before being included in the `workspace/applyEdit` request; any edit targeting a path outside the vault root must cause the rename to be rejected entirely.
**Ambition:** The `workspace/applyEdit` rename path is the only code path in this server that writes to the file system. If a rename target URI is derived from a crafted wiki-link that resolves outside the vault root (see `Security.Vault.PathConfinement`), the consequence is not just information disclosure — it is arbitrary file write as the editor user. A rogue rename operation could overwrite `~/.bashrc`, `~/.ssh/authorized_keys`, or any other file the user owns. The confinement check in the rename builder must be independent of and in addition to the check in the link resolver: defense in depth ensures that a bug in the resolver cannot propagate to the write path.
**Scale:** Percentage of rename operations where any computed edit target URI fails the vault-root confinement check and the entire rename operation is cancelled (no `workspace/applyEdit` is sent to the client).
**Meter:**

1. Create an integration test that injects a crafted rename target URI pointing outside the vault root into the rename edit builder.
2. Trigger a rename operation that would produce this URI.
3. Verify no `workspace/applyEdit` request is sent to the client.
4. Verify the server returns a `ResponseError` to the `textDocument/rename` request.
5. Verify no files outside the vault root are modified.
**Fail:** Any `workspace/applyEdit` request issued by the rename handler where any edit URI resolves outside the vault root.
**Goal:** 0 out-of-vault rename writes — any escaping URI cancels the entire rename operation.
**Stakeholders:** File system security, vault authors, users on multi-user systems.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-4.3]], [[adr/ADR013-vault-root-confinement#2-application-points]], [[plans/phase-11-rename]].

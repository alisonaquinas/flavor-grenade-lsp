---
title: Verification — Security — Vault Root Confinement
tags: [test/verification, "requirements/security/vault-confinement"]
aliases: [Verify Vault Confinement]
---

# Verification — Security — Vault Root Confinement

## Purpose

This document defines verification test cases for the vault root confinement security requirements of `flavor-grenade-lsp`. Each test case validates that the server correctly prevents path traversal attacks — via raw `../` sequences, percent-encoded variants, absolute paths, and symlinks — from reaching files outside the configured vault root. The requirements are defined in [[requirements/security/vault-confinement]] and the threat analysis in [[research/security-threat-model]]. All four test cases are predominantly Agent-driven because they require constructing adversarial LSP requests and observing actual server behaviour against a live process.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Security.Vault.PathConfinement` | All file paths derived from vault content canonicalized and verified against vault root before any I/O | Phase 4 |
| `Security.Vault.SymlinkConfinement` | Symlinks pointing outside vault root treated as non-existent; real path checked, not symlink path | Phase 4 |
| `Security.Vault.URISchemeAllowlist` | Only `file://` URIs processed; non-`file://` URIs rejected with InvalidParams (-32602) | Phase 2 |
| `Security.Vault.RenameConfinement` | Every rename edit URI must pass vault-root confinement; escaping URI cancels the entire rename | Phase 11 |

---

## Test Cases

### TC-VER-SECV-001 — Security.Vault.PathConfinement

**Planguage Tag:** `Security.Vault.PathConfinement`
**Gist:** Every file path derived from vault content or LSP parameters must be canonicalized and verified against the vault root before any I/O operation; paths that resolve outside the vault root must produce a null result and never reach the file system.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 4

> [!WARNING] Threat: Path traversal via wiki-links containing `../` sequences or percent-encoded variants can expose files anywhere on the user's file system to the LSP server — reproducing CVE-2024-22415 (JupyterLab-LSP, CVSS 8.8) in the context of vault link resolution. Since the server runs as the editor user, it inherits full read access to the user's home directory, SSH keys, and credentials files.

**Setup:** A running `flavor-grenade-lsp` server instance with a test vault at `/tmp/test-vault/`. The file `/tmp/outside-secret.txt` exists outside the vault root and contains a known sentinel string. A spy is placed on `fs.readFile` to detect any read outside `/tmp/test-vault/`.

**Agent-driven steps:**

1. Agent constructs a vault file `vault/traversal-test.md` containing the wiki-link `[[../outside-secret]]`. Agent triggers `textDocument/definition` for the position of that link.
2. Agent verifies the JSON-RPC response is either `null` (no location found) or a JSON-RPC error — NOT a location pointing outside the vault root.
3. Agent verifies via the `fs.readFile` spy that no read was attempted on `/tmp/outside-secret.txt` or any path outside `/tmp/test-vault/`.
4. Agent repeats with percent-encoded traversal: vault file containing `[[%2e%2e/outside-secret]]`. Verifies same null result and no file system read outside vault root.
5. Agent repeats with absolute path in wiki-link: `[[/etc/passwd]]`. Verifies null result and no read.
6. Agent repeats with mixed encoding: `[[..%2Foutside-secret]]`. Verifies null result and no read.
7. Agent repeats with double-dot variant: `[[....//outside-secret]]`. Verifies null result and no read.
8. Agent sends a direct `textDocument/definition` LSP request with `textDocument.uri` set to `file:///tmp/test-vault/note.md` and `position` inside a raw `../` traversal link. Verifies FG001 diagnostic is emitted for the traversal link in the document.
9. Agent confirms 5/5 traversal patterns return null from the confinement check, with zero file system reads outside the vault root.

**Pass criterion:** 100% of traversal patterns are confined — zero file system accesses outside the vault root; `confineToVaultRoot()` returns null for all five traversal variants; FG001 diagnostic emitted for each.
**Fail criterion:** Any traversal pattern that reaches the file system outside the vault root; any pattern that returns a non-null path from `confineToVaultRoot()` when the resolved path is outside the vault root.

---

### TC-VER-SECV-002 — Security.Vault.SymlinkConfinement

**Planguage Tag:** `Security.Vault.SymlinkConfinement`
**Gist:** Symlinks within the vault that resolve to targets outside the vault root must be treated as non-existent files, producing FG001 or FG004; the real symlink target path must be checked, not the symlink's own path.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 4

> [!WARNING] Threat: A symlink inside the vault (e.g., `vault/link-to-secret -> /etc/ssh/id_rsa`) passes a naive `startsWith(vaultRoot)` check on the symlink's own path — because the symlink itself is inside the vault — but its resolved target is outside the vault root. Any server that checks the symlink path rather than the resolved target is vulnerable to this bypass, allowing arbitrary file read.

**Setup:** A test vault at `/tmp/test-vault/`. A symlink `vault/escape-link.md -> /etc/hostname` (or equivalent readable file outside vault). A spy on `fs.realpath` to verify it is called.

**Agent-driven steps:**

1. Agent creates a vault file `vault/linker.md` containing `[[escape-link]]`. The file `vault/escape-link.md` is a symlink pointing to `/etc/hostname` (outside the vault root).
2. Agent triggers `textDocument/definition` for the wiki-link `[[escape-link]]` in `linker.md`.
3. Agent verifies via the `fs.realpath` spy that the server called `fs.realpath()` on the resolved path of `escape-link.md`, obtaining the real path `/etc/hostname`.
4. Agent verifies the server applied the vault-root confinement check to the real path `/etc/hostname`, not to `vault/escape-link.md`.
5. Agent verifies the server returned null (no location) or a JSON-RPC error — NOT a location pointing to `/etc/hostname`.
6. Agent verifies FG001 (or FG004) diagnostic is emitted for the `[[escape-link]]` wiki-link.
7. Agent verifies no content from `/etc/hostname` was read or returned in any LSP response.
8. Agent creates a contrasting case: `vault/internal-link.md` is a real (non-symlink) file inside the vault. Agent verifies `[[internal-link]]` resolves correctly, confirming the symlink check does not affect non-symlink files.

**Pass criterion:** 100% of out-of-vault symlinks treated as non-existent; `fs.realpath()` called on resolved paths; FG001/FG004 emitted; zero symlink-based traversals succeed.
**Fail criterion:** Any symlink-based traversal that results in reading a file outside the vault root; any server that checks the symlink path rather than the real path via `fs.realpath()`.

---

### TC-VER-SECV-003 — Security.Vault.URISchemeAllowlist

**Planguage Tag:** `Security.Vault.URISchemeAllowlist`
**Gist:** The server must only process `file://` URIs; any LSP request referencing a URI with a non-`file://` scheme must be rejected with a JSON-RPC InvalidParams error (-32602) before reaching any resolver.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 2

> [!WARNING] Threat: Non-`file://` URI schemes passed in LSP requests could cause the server to make outbound network requests (SSRF-like behaviour via `http://` or `ftp://` URIs), attempt to read from unsupported sources, or reach undefined behaviour in the file path resolver — especially relevant if the server is ever extended with a TCP transport mode.

**Setup:** A running server instance (post-initialize). A spy on all file system operations to verify no I/O is attempted for non-file URIs.

**Agent-driven steps:**

1. Agent sends a `textDocument/hover` request with `textDocument.uri` set to `http://example.com/note.md`. Agent verifies the response is a JSON-RPC error object with `code: -32602` (InvalidParams).
2. Agent sends a `textDocument/hover` request with `textDocument.uri` set to `ftp://host/note.md`. Agent verifies error code -32602.
3. Agent sends a `textDocument/hover` request with `textDocument.uri` set to `data:text/plain,hello`. Agent verifies error code -32602.
4. Agent sends a `textDocument/hover` request with `textDocument.uri` set to `untitled://note.md`. Agent verifies error code -32602.
5. Agent verifies via the file system spy that no read, stat, or exists check was made during any of the four requests above.
6. Agent sends a `textDocument/hover` request with a valid `file://` URI for an existing vault file. Agent verifies this request succeeds (200-level response), confirming the allowlist does not block legitimate requests.
7. Agent confirms 4/4 non-`file://` URIs produced error -32602 with zero file system operations.

**Pass criterion:** 100% of non-`file://` URIs rejected with code -32602 at the transport boundary; zero file system operations for any non-`file://` URI; valid `file://` requests succeed normally.
**Fail criterion:** Any non-`file://` URI that reaches the VaultIndex or triggers a file system operation; any valid `file://` request incorrectly rejected.

---

### TC-VER-SECV-004 — Security.Vault.RenameConfinement

**Planguage Tag:** `Security.Vault.RenameConfinement`
**Gist:** Every file URI produced by the rename edit builder must pass vault-root confinement before being included in the `workspace/applyEdit` request; any edit targeting a path outside the vault root must cause the rename to be rejected entirely.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 11

> [!WARNING] Threat: The rename path is the only code path in this server that writes to the file system. If a rename target URI derived from a crafted wiki-link is not bounds-checked against the vault root, a rename operation could overwrite `~/.bashrc`, `~/.ssh/authorized_keys`, or any other file the user owns — this is arbitrary file write as the editor user, not just information disclosure.

**Setup:** A running server instance with a test vault. A mock LSP client that captures `workspace/applyEdit` requests. A spy to detect any file writes outside the vault root.

**Agent-driven steps:**

1. Agent injects a crafted wiki-link into a vault file that would resolve to a rename target outside the vault root when used as a rename source. Specifically: vault file `vault/source.md` contains `[[../outside-target]]`, and the agent triggers `textDocument/rename` at the position of that link with `newName: "renamed"`.
2. Agent verifies the mock client receives NO `workspace/applyEdit` request — the rename operation must be cancelled entirely, not partially applied.
3. Agent verifies the server returns a `ResponseError` (JSON-RPC error response) to the `textDocument/rename` request — not a successful `WorkspaceEdit` result.
4. Agent verifies via the file system spy that no file outside the vault root was modified, created, or overwritten.
5. Agent constructs a more sophisticated variant: a rename source that is inside the vault but whose computed rename target (derived from the new name) resolves outside the vault via a `../` sequence. Agent verifies the same cancellation behaviour.
6. Agent performs a control test: a rename where both source and target are inside the vault root. Agent verifies the rename succeeds and `workspace/applyEdit` IS sent to the client with the correct edits.
7. Agent confirms the confinement check in the rename builder is independent of the read-path confinement check (defense in depth) by temporarily disabling the read-path check in a test build and verifying the rename-path check still catches the traversal.

**Pass criterion:** 0 out-of-vault rename writes; any escaping URI cancels the entire rename operation; `workspace/applyEdit` is never sent when any edit URI resolves outside the vault root.
**Fail criterion:** Any `workspace/applyEdit` request issued by the rename handler where any edit URI resolves outside the vault root; any file write outside the vault root resulting from a rename operation.

---
adr: "013"
title: Vault Root Confinement — Path Canonicalization and Bounds-Checking Contract
status: accepted
date: 2026-04-17
---

# ADR013 — Vault Root Confinement

## Context

**CVE-2024-22415** (JupyterLab-LSP, CVSS 8.8) demonstrated that an LSP server's file-serving logic can allow relative path traversal beyond the intended root directory, giving unauthorized read access to the entire file system. The vulnerability existed because resolved file paths were not canonicalized before use — a URL-encoded `%2e%2e` or a relative `../` sequence in a document URI bypassed the intended root check.

flavor-grenade-lsp operates on the user's file system as the editor user, with full read access to all files that user can read. It also performs **write operations** via `workspace/applyEdit` in the rename refactoring path. The consequence of a path traversal bug in the rename path is not just information disclosure — it is arbitrary file write as the user.

The threat is documented in [[research/security-threat-model#Sub-threat-1.2]]. The attack vector is a vault document containing a crafted wiki-link whose resolved target path, after URI decoding and resolution, falls outside the vault root. If the server computes an edit URI from this resolved path without bounds-checking, the rename handler could overwrite a file anywhere on the user's file system.

## Decision

The server must enforce a **vault root confinement contract** at every point where a file path is derived from vault content (wiki-link targets, embed targets, block anchor document URIs) or from LSP parameters (document URIs in `textDocument/definition`, `workspace/rename` targets).

### 1. The Confinement Function

A single function — `confineToVaultRoot(rawPath: string, vaultRoot: string): string | null` — must be the **sole** code path through which resolved file paths pass before any I/O operation. It must:

1. Decode any percent-encoding in `rawPath` (handle `%2e%2e`, `%2f`, etc.)
2. Resolve the decoded path against `vaultRoot` using `path.resolve(vaultRoot, decoded)`
3. Verify the resolved absolute path starts with `vaultRoot + path.sep` (or equals `vaultRoot`)
4. Return the resolved path if it passes the check; return `null` if it does not

Step 3 must use the **resolved absolute path** — never a `startsWith` check on the raw or decoded input string, which can be bypassed by normalization tricks.

### 2. Application Points

The confinement check must be applied at every one of the following code sites:

| Code Site | Operation | Consequence of Escape |
|---|---|---|
| VaultIndex file scanner | Read | Index contains out-of-root files |
| Wiki-link definition resolver | Read | `textDocument/definition` jumps outside vault |
| Embed target resolver | Read | Embed resolution follows outside vault |
| Block anchor resolver | Read | Block ref follows outside vault |
| Rename edit builder | **Write** | Overwrites arbitrary file as user |
| `textDocument/didOpen` URI handler | Read | Server processes files outside vault |

### 3. URI Scheme Allowlist

The server must only operate on `file://` URIs. Any document URI with a scheme other than `file://` (e.g., `http://`, `untitled://`, `ftp://`) must be rejected with an LSP `ResponseError` (code `-32602` InvalidParams) and must not reach the file system.

### 4. Symlink Policy

Symlinks within the vault that point outside the vault root must be treated as if they point to a non-existent file. The confinement check must be applied to the **resolved symlink target** (using `fs.realpath()` or equivalent), not to the symlink path itself. This prevents symlink-based escapes.

If `fs.realpath()` fails (e.g., the symlink target does not exist), the file is treated as non-existent and produces the appropriate diagnostic (FG001 or FG004).

### 5. Test Fixtures

Phase 4 must include integration tests that exercise the following confinement scenarios:

- `[[../outside-vault]]` — relative path escaping vault root
- `[[%2e%2e/outside-vault]]` — percent-encoded relative path
- `[[/absolute/path/outside]]` — absolute path reference
- A symlink inside the vault pointing to a file outside the vault root
- A valid `[[nested/subdir/note]]` that should resolve correctly

All four escape scenarios must produce `null` from `confineToVaultRoot` and result in an FG001 diagnostic, not a file read.

## Consequences

### Positive

- Path traversal attacks via crafted vault content cannot reach files outside the vault root, regardless of encoding or normalization tricks
- The single `confineToVaultRoot` function is the sole enforcement point — easy to audit, easy to test, easy to replace if the implementation proves incorrect
- Write operations (rename) are protected by the same mechanism as read operations

### Negative

- Symlink resolution requires an additional `fs.realpath()` call per file access; this adds latency on vaults with many symlinks
- Users who intentionally symlink notes from outside the vault root into the vault (an Obsidian power-user pattern) will find that those symlinked notes produce FG001 diagnostics rather than resolving

### Neutral

- The confinement policy is vault-scoped; multiple vault roots (Phase 4, `Workspace.MultiFolder.Isolation`) each enforce confinement independently

## Related

- [[adr/ADR012-parser-safety-policy]] — companion parser-level safety ADR
- [[research/security-threat-model#Sub-threat-1.2]] — CVE-2024-22415 and path traversal evidence
- [[research/security-threat-model#Threat-Category-4]] — rename write risk
- [[requirements/security/vault-confinement]] — Planguage requirements derived from this ADR
- [[plans/phase-04-vault-index]] — implementation phase for VaultIndex confinement
- [[plans/phase-11-rename]] — implementation phase for rename confinement

# Security Policy

## Supported Versions

Only the latest published version of Flavor Grenade LSP receives security fixes.

| Version | Supported |
|---|---|
| Latest (`main`) | Yes |
| Older releases | No |

Once a patched version is published, the previous release is no longer supported. Users are expected to upgrade.

---

## Reporting a Vulnerability

**Do not open a public GitHub issue to report a security vulnerability.**

Use [GitHub's private security disclosure](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) feature:

1. Navigate to the repository on GitHub.
2. Click the **Security** tab.
3. Click **Report a vulnerability**.
4. Fill in the form with a description of the issue, steps to reproduce, and any relevant version information.

You will receive an acknowledgement within **48 hours**. Critical vulnerabilities will be patched within **14 days** of triage confirmation.

---

## Response Timeline

| Severity | Triage | Patch target |
|---|---|---|
| Critical (CVSS 9.0–10.0) | 48 hours | 14 days |
| High (CVSS 7.0–8.9) | 48 hours | 30 days |
| Medium (CVSS 4.0–6.9) | 7 days | 60 days |
| Low (CVSS < 4.0) | 14 days | Next scheduled release |

These are targets, not guarantees. The project is maintained on a volunteer basis.

---

## Scope

The following are **in scope** for this security policy:

- The `flavor-grenade-lsp` server process itself
- The LSP protocol implementation (stdio transport, message parsing, dispatch)
- The vault indexer (file system traversal, OFM parser)
- Configuration parsing (`.flavor-grenade.toml`)
- npm / Bun package supply-chain issues (malicious dependency, compromised publish)

> [!NOTE]
> Flavor Grenade LSP is **read-only** with respect to vault files during normal operation. The only write operation is rename refactoring, which is performed through the LSP `workspace/applyEdit` mechanism — meaning the editor confirms and applies the edit, not the server directly.

---

## Out of Scope

The following are **not in scope** for this security policy:

- **Obsidian itself** — report Obsidian vulnerabilities to Obsidian Ltd.
- **User vault content** — the server reads vault files to build an index but does not transmit, store, or log vault content beyond the in-process index. The vault content is the user's responsibility.
- Vulnerabilities in the editor (Neovim, VS Code, Helix, Zed) that happen to involve LSP communication.
- Issues that require physical access to the machine running the LSP server.
- Social engineering attacks against maintainers.

---

## Disclosure Policy

Once a patch is ready, the maintainers will:

1. Publish the patched version to npm and the Bun registry.
2. Create a GitHub Security Advisory with a CVE (if applicable).
3. Add a note to the release changelog.

We request that reporters allow a **90-day coordinated disclosure window** before publishing details publicly. This window may be shortened by mutual agreement if a public exploit is actively circulating.

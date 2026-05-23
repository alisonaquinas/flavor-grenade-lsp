# Security Policy

Flavor Grenade LSP processes local vault files and exposes editor features over
the Language Server Protocol. Treat issues that can escape the vault, execute
unexpected code, disclose local data, corrupt user files, or compromise the
release pipeline as security issues.

## Supported Versions

Only the latest published release line receives security fixes.

| Component | Supported version | Status |
|---|---:|---|
| LSP server | `0.4.x` | Supported |
| VS Code extension | `0.2.x` | Supported |
| Older server releases | `< 0.4.2` | Unsupported |
| Older extension releases | `< 0.2.2` | Unsupported |

> [!IMPORTANT]
> Once a patched version is published, earlier releases are no longer supported.
> Users should upgrade promptly.

## Reporting A Vulnerability

Do not open a public GitHub issue for a vulnerability.

Use
[GitHub private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability):

1. Open the repository on GitHub.
2. Select the **Security** tab.
3. Select **Report a vulnerability**.
4. Include affected versions, operating system, editor, reproduction steps, and
   expected impact.

You should receive an acknowledgement within 48 hours.

## Response Targets

| Severity | Triage target | Patch target |
|---|---:|---:|
| Critical, CVSS 9.0-10.0 | 48 hours | 14 days |
| High, CVSS 7.0-8.9 | 48 hours | 30 days |
| Medium, CVSS 4.0-6.9 | 7 days | 60 days |
| Low, CVSS below 4.0 | 14 days | Next scheduled release |

These are targets, not guarantees. The project is maintained on a volunteer
basis.

## In Scope

| Area | Examples |
|---|---|
| LSP server process | JSON-RPC framing, dispatch, lifecycle, request handling |
| Vault scanner and indexer | Path traversal, symlink confinement, file watcher behavior |
| OFM parser | Parser denial of service, YAML safety, prototype pollution |
| Resolution and edits | Unsafe workspace edits, rename behavior, attachment resolution |
| VS Code extension | Workspace trust, virtual workspace handling, command execution, bundled server module startup, user-level server path overrides |
| Release pipeline | npm trusted publishing, package contents, VSIX package targets, pinned CI actions |
| Supply chain | Malicious dependencies or compromised publish configuration |

> [!NOTE]
> Normal diagnostics, completion, and navigation are read-only. Rename and
> create-file workflows are returned as LSP workspace edits for the editor to
> apply.

## Out Of Scope

- Obsidian itself.
- Vulnerabilities in editors or generic LSP clients.
- User vault content quality or private content that the user intentionally
  opens in the editor.
- Issues requiring physical access to the machine.
- Social engineering against maintainers.
- Denial-of-service reports that require intentionally opening extremely large
  or hostile local files beyond documented parser limits, unless they bypass an
  implemented limit.

## Current Hardening

- Local file URI and target classification before resolution.
- Realpath confinement for vault scans and symlink handling.
- Root-level `.obsidian/` ignored by Git.
- YAML frontmatter size and alias-count limits.
- Prototype-pollution rejection during frontmatter parsing.
- Parser and recursive embed budgets.
- VS Code startup blocked in untrusted and virtual workspaces.
- Custom server command path scoped to user or machine settings, not workspace
  settings; packaged users run the bundled `server/main.js` module.
- GitHub Actions pinned by commit SHA.

## Disclosure Policy

After a fix is ready, maintainers will:

1. Publish patched packages.
2. Create or update a GitHub Security Advisory when appropriate.
3. Add release notes to the changelog.
4. Credit the reporter when requested and appropriate.

We request a 90-day coordinated disclosure window before public details are
published. This window may be shortened by mutual agreement or when public
exploitation is already active.

# Embedded LSP Runtime

## Purpose

The skill embeds the Flavor Grenade LSP native executable so agents can use the
server in environments where Bun, Node source builds, or VS Code are absent.

The embedded executable is the only analysis engine. Wrappers must call it
through LSP stdio and must not duplicate server behavior.

## Runtime Targets

S1 supports the native targets already produced by the server release workflow:

| Target | Executable |
|---|---|
| `linux-x64` | `flavor-grenade-lsp` |
| `darwin-arm64` | `flavor-grenade-lsp` |
| `darwin-x64` | `flavor-grenade-lsp` |
| `win-x64` | `flavor-grenade-lsp.exe` |

Unsupported targets fail closed with an actionable error that lists supported
targets.

## Artifact Layout

Runtime-specific artifacts should contain one executable target:

```text
skill/flavorgrenade-lsp/
├── SKILL.md
├── README.md
├── CHANGELOG.md
├── manifest.json
├── bin/
│   └── linux-x64/
│       ├── flavor-grenade-lsp
│       └── flavor-grenade-lsp.sigstore.json
├── wrappers/
│   ├── flavorgrenade.mjs
│   ├── lsp-client.mjs
│   ├── runtime.mjs
│   └── schema.mjs
├── examples/
└── docs/
```

An all-platform artifact may be added later. S1 should prefer one artifact per
target to keep installs small and verification simple.

## Manifest

Each artifact must include `manifest.json`.

```json
{
  "name": "flavorgrenade-lsp-skill",
  "installName": "flavorgrenade-lsp",
  "version": "0.1.0",
  "schemaVersion": "1.0",
  "server": {
    "name": "flavor-grenade-lsp",
    "version": "0.5.0",
    "commit": "0000000000000000000000000000000000000000",
    "releaseTag": "v0.5.0"
  },
  "runtime": {
    "target": "linux-x64",
    "executable": "bin/linux-x64/flavor-grenade-lsp",
    "sha256": "0000000000000000000000000000000000000000000000000000000000000000",
    "sigstoreBundle": "bin/linux-x64/flavor-grenade-lsp.sigstore.json"
  },
  "commands": {
    "main": "wrappers/flavorgrenade.mjs"
  }
}
```

## Runtime Resolution

The runtime resolver must:

1. Load `manifest.json`.
2. Determine host platform and architecture.
3. Map the host to a supported target.
4. Confirm the manifest target matches the host target.
5. Resolve the executable path relative to the skill root.
6. Reject symlink escapes outside the skill root.
7. Verify the executable exists.
8. Verify executable permissions on Unix-like platforms.
9. Compute SHA-256 and compare to the manifest.
10. Optionally verify Sigstore bundle when `cosign` is available.
11. Run a minimal LSP `initialize` handshake.

The resolver must never download a replacement binary.

## LSP Process Lifecycle

Wrappers should use one short-lived LSP process per command:

1. spawn executable with stdio pipes
2. send `initialize`
3. send `initialized`
4. open target documents or workspace roots
5. issue the requested LSP calls
6. normalize output
7. send `shutdown`
8. send `exit`
9. enforce timeout and cleanup

Long-lived server reuse is out of scope for S1.

## Failure Modes

| Failure | Required behavior |
|---|---|
| Unsupported platform | Exit non-zero and list supported targets |
| Missing executable | Exit non-zero and suggest reinstall |
| Digest mismatch | Exit non-zero; do not launch executable |
| Signature verification unavailable | Warn only when digest verification passes |
| Signature verification fails | Exit non-zero |
| LSP handshake fails | Exit non-zero with redacted troubleshooting data |
| Timeout | Kill child process and return structured error |

## Logging

Logs may include command names, file paths relative to the workspace, target
runtime, versions, request IDs, and diagnostic codes.

Logs must not include document contents, frontmatter values, code block contents,
environment variables, credentials, or absolute paths unless the user explicitly
requests verbose local troubleshooting.

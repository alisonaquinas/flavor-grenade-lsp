# Wrappers

This directory contains the Node.js command layer that makes the embedded LSP
usable by LLM agents. The wrappers keep subprocess launch, path confinement,
runtime verification, JSON schema shaping, and LSP request orchestration outside
the prompt-facing `SKILL.md`.

## Files

| File | Responsibility |
| --- | --- |
| `flavorgrenade.mjs` | CLI entrypoint and command routing for analysis commands |
| `runtime.mjs` | Runtime target selection, manifest loading, digest checks, and optional Sigstore verification |
| `lsp-client.mjs` | Minimal JSON-RPC/LSP client used by wrapper commands |
| `schema.mjs` | Stable success and error envelope helpers |

## Local Rules

- Spawn the LSP with argv arrays and `shell: false`.
- Keep every user-provided path inside the selected workspace.
- Honor scan selection flags in `flavorgrenade.mjs`: `--include`,
  `--exclude`, `--max-files`, and `--max-bytes`.
- Resolve `.mdfignore` before collecting files so ignored Markdown is not sent
  to the embedded LSP for broad analysis.
- Report `.mdfattributes` evidence without treating legacy `.flavor-grenade.*`
  files or `.editorconfig` directives as flavor assignment sources.
- Keep all externally visible output inside the documented JSON envelope.
- Redact private absolute paths from default errors.
- Do not add network access or runtime downloads here.

## See Also

- [Wrapper agent guidance](./AGENTS.md)
- [Skill concepts](../CONCEPTS.md)
- [JSON schema](../docs/json-schema.md)
- [Security](../docs/security.md)

# Security Specification

## Threat Model

The skill is run by LLM agents against user workspaces. It can read Markdown
files and launch an embedded native executable. The primary risks are command
injection, path traversal, untrusted document execution, data leakage, and
supply-chain substitution of the embedded executable.

## Hard Requirements

- No network access from wrappers.
- No runtime binary downloads.
- No shell command strings built from user input.
- Plugin commands and hooks must not shell-expand user-controlled paths or globs.
- Spawn the executable with argv arrays.
- Verify executable digest before launch.
- Verify signatures when the required verifier is available, unless the user
  explicitly disables runtime signature verification.
- Reject paths outside the selected workspace.
- Reject unsupported URI schemes.
- Treat project config files as untrusted input, including TOML, JSON, JSONC,
  YAML, and `.editorconfig`.
- Reject dangerous object keys and path escapes in directory override selectors.
- Redact raw config values from default JSON output, traces, logs, fixture
  evidence, and plugin validation reports.
- Do not execute Markdown code blocks.
- Do not evaluate MDX ESM or JSX.
- Do not run R chunks.
- Do not run Pandoc filters.
- Do not load renderer plugins.
- Do not import user workspace code.
- Do not log document contents.
- Do not write files except explicit future edit-plan outputs.

## Path Handling

Wrappers must:

1. Resolve workspace root.
2. Resolve requested paths relative to root.
3. Resolve symlinks.
4. Confirm final paths remain inside root.
5. Reject device paths, UNC surprises, unsupported schemes, and path traversal.
6. Pass paths as argv values or JSON-RPC data, not shell-expanded strings.

`--include` and `--exclude` globs must be parsed by wrapper code after workspace
root resolution. They must never be delegated to shell expansion, and every
matched path must pass the same workspace confinement checks as direct path
arguments.

## Output Limits

Default caps:

| Cap | Default |
|---|---|
| files | 500 |
| bytes per file | 1 MiB |
| total JSON output | 10 MiB |
| command timeout | 30 seconds |
| diagnostics per file | 500 |
| completions | 100 |

Caps may be configurable, but unsafe unlimited mode must not be the default.

## Logging Rules

Allowed:

- relative paths
- diagnostic codes
- line and character ranges
- flavor names
- variant names
- runtime target
- wrapper command name
- elapsed time

Forbidden:

- document contents
- frontmatter values
- raw config values
- code block contents
- environment variables
- credentials
- absolute private paths in default output
- raw LSP payloads containing document text

## Boundary Preservation

The skill must preserve the server's non-local boundary model. It must not turn
host-specific, conversion-bound, renderer-bound, bibliography-bound, JSX/ESM, or
execution-bound references into local file edits.

Required boundary categories:

- local file
- local heading
- local label
- local citation file when configured
- host reference
- conversion reference
- renderer reference
- bibliography reference
- MDX/JSX reference
- execution reference
- unsupported scheme
- out-of-workspace path

## Supply Chain

Each release artifact must include:

- executable SHA-256 digest
- archive SHA-256 digest
- executable Sigstore bundle from the selected server release
- archive Sigstore bundle
- server commit
- server release tag
- skill release commit
- release workflow identity

Production skill packaging must fetch the embedded executable from a server
GitHub Release and verify its Sigstore bundle against the server `release.yml`
GitHub OIDC identity before packaging. Local server builds are allowed for
development smoke tests only; they must not be used for production skill
release artifacts.

The wrapper must verify the executable digest every time before launch. Archive
signature verification is part of install and release validation.

Runtime signature verification is a defense-in-depth check on top of mandatory
digest verification. `--no-signature-check` may skip only this runtime Sigstore
check; it must not bypass digest verification, release-time archive signature
verification, or CI validation. `--require-signature` must fail closed if the
verifier is missing or signature verification cannot complete.

## Security Tests

Required tests:

- path traversal is rejected
- symlink escape is rejected
- unsupported URI scheme is rejected
- shell metacharacters in file names are safe
- malformed active TOML, JSON, JSONC, YAML, and `.editorconfig` config files
  are redacted and do not crash the wrapper
- config parse errors are reported with redacted codes, not parser excerpts
- directory override selectors cannot escape the workspace
- directory override selectors cannot use absolute paths, parent traversal, or
  unsupported schemes
- dangerous keys such as `__proto__`, `prototype`, and `constructor` are
  rejected or ignored during config normalization
- config evidence snapshots omit raw values, document contents, frontmatter,
  environment variables, and private absolute paths
- corrupted executable digest blocks launch
- missing executable blocks launch
- malicious frontmatter is treated as text
- fenced shell code is not executed
- MDX import is not loaded
- R chunk is not executed
- Pandoc filter metadata is not executed
- output caps truncate or fail safely
- logs do not contain fixture secrets

## Security Review Gate

No skill release is complete until a reviewer can verify:

- wrappers do not use `shell: true`
- plugin hooks and command launchers do not use shell interpolation for paths,
  globs, or file names
- wrapper subprocess calls use argv arrays
- file reads are workspace-confined
- digest verification is mandatory
- network APIs are absent from wrappers
- tests cover hostile fixtures
- release artifacts are signed
- embedded executables are signed server release artifacts
- plugin manifests do not reference remote MCP servers, unverified LSP
  executables, or missing hook files

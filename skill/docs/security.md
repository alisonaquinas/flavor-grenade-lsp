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
- Spawn the executable with argv arrays.
- Verify executable digest before launch.
- Verify signatures when the required verifier is available.
- Reject paths outside the selected workspace.
- Reject unsupported URI schemes.
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
- executable Sigstore bundle when available
- archive Sigstore bundle
- server commit
- skill release commit
- release workflow identity

The wrapper must verify the executable digest every time before launch. Archive
signature verification is part of install and release validation.

## Security Tests

Required tests:

- path traversal is rejected
- symlink escape is rejected
- unsupported URI scheme is rejected
- shell metacharacters in file names are safe
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
- wrapper subprocess calls use argv arrays
- file reads are workspace-confined
- digest verification is mandatory
- network APIs are absent from wrappers
- tests cover hostile fixtures
- release artifacts are signed

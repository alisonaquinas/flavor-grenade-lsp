# Concepts

## Boundary

A boundary is a reference that the skill must report without converting into a
local file operation. Host links, renderer references, conversion-only targets,
bibliography entries, MDX/JSX references, and execution-bound references are
boundaries because editing them as local Markdown would be unsafe or incorrect.

**See also:** [Security](./docs/security.md), [Skill README](./README.md)

## Embedded Runtime

The embedded runtime is the native `flavor-grenade-lsp` executable packaged
inside a release artifact for one target platform. The manifest records its
path, target, digest, and Sigstore bundle so wrappers can verify the executable
before launch.

**See also:** [Compatibility](./docs/compatibility.md), [Wrapper guidance](./wrappers/README.md)

## Flavor Decision

A flavor decision is the wrapper's JSON summary of the effective Markdown base
flavor, structured variants, confidence, config source, and evidence for a
file. `.mdfattributes` can provide an explicit flavor or structured profile;
otherwise Auto Detect remains responsible for selecting the base flavor. The
LSP provides the core decision; the wrapper formats it and adds safe filesystem
context.

**See also:** [JSON schema](./docs/json-schema.md), [Examples](./examples/README.md)

## Flavor Visibility

Flavor visibility determines whether Flavor Grenade should process a Markdown
file at all. `.mdfignore` uses Git-style patterns and negation. A matching
ignored file is inactive in wrapper output and excluded from broad scans.

**See also:** [Skill README](./README.md), [JSON schema](./docs/json-schema.md)

## Structured Variant

A structured variant is a layer such as Keep a Changelog, Common Changelog, or
MADR that can apply over any supported base Markdown flavor. Variants are
reported separately from the base flavor so agents do not confuse document
structure with Markdown syntax rules.

**See also:** [Compatibility](./docs/compatibility.md), [Structured variant example](./examples/structured-variants/CHANGELOG.md)

## Workspace

A workspace is the root directory used to resolve user paths, collect Markdown
files, and confine wrapper filesystem access. The wrapper can accept an
explicit `--workspace`; otherwise it derives the workspace from the target path.

**See also:** [Security](./docs/security.md), [Wrapper guidance](./wrappers/AGENTS.md)

# AGENTS.md — scripts/

Repository automation scripts live here. They are run by developers and CI but
are not imported by the LSP server.

## Layout

```text
scripts/
├── build-binary.mjs              # Build native server binaries for local/server release use
├── check-exact-dependencies.mjs  # Enforce exact dependency versions
├── check-release-versions.mjs    # Enforce linked server/package release versions
├── copy-binary.mjs               # Copy native binary output into extension/server/
├── lint-all.sh                   # Run local lint battery
├── set-version.sh                # Update linked root and package versions
├── update-test-index.sh          # Reserved test-index command
├── validate-docs.sh              # Run Markdown documentation checks
└── README.md                     # Human-facing script reference
```

## Workflows

### Changing a script used by CI

1. Find every workflow or package script that invokes it.
2. Keep arguments explicit and shell-safe.
3. Add or update focused tests when the script has branching logic.
4. Run the direct script command and the smallest CI-equivalent command.

## Invariants

- Scripts must resolve paths from the repository root unless documented
  otherwise.
- Do not make CI scripts depend on sibling repositories.
- Do not weaken dependency, docs, package-target, or release gates without an
  explicit docs update explaining the new gate.

## See Also

- [Root AGENTS.md](../AGENTS.md)
- [README.md](./README.md)
- [CI workflow](../.github/workflows/ci.yml)

# scripts/

Automation scripts that act on the repository. These scripts are **not** linked into `src/` and are never imported by the application. They are intended to be run by developers and CI operators from the repository root.

---

## Scripts

| Script                         | Description                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `set-version.sh`               | Bump linked root and `markdown-flavor-detection` package versions to a new semver string.                                                       |
| `build-binary.mjs`             | Compile native server binaries with Bun for local experiments and server GitHub Release artifacts.                                              |
| `check-exact-dependencies.mjs` | Enforce exact dependency versions in root package metadata.                                                                                     |
| `check-release-versions.mjs`   | Verify root version, `markdown-flavor-detection` version, dependency specifier, and optional release tag stay aligned.                          |
| `copy-binary.mjs`              | Copy a compiled server binary from `dist/` into `extension/server/`.                                                                            |
| `lint-all.sh`                  | Run all linters sequentially (TypeScript, ESLint, Prettier, markdownlint-obsidian, markdownlint-cli2) and print a per-linter PASS/FAIL summary. |
| `validate-docs.sh`             | Run only the Markdown linters — useful for doc-only changes.                                                                                    |
| `update-test-index.sh`         | Reserved command for future test index generation; currently exits with a not-implemented message.                                              |

---

## How to Run

Make shell scripts executable once after cloning:

```sh
chmod +x scripts/*.sh
```

Then run them from the **repository root**:

```sh
./scripts/lint-all.sh
./scripts/set-version.sh 1.2.3
node scripts/build-binary.mjs --outfile=dist/flavor-grenade-lsp
./scripts/validate-docs.sh
./scripts/update-test-index.sh
```

---

## Binary Build Notes

`build-binary.mjs` supports `--bytecode`, but extension release builds no
longer ship native Bun executables. Extension `0.1.2` showed that Bun `1.3.13`
on Linux could cross-compile a Windows executable with `--bytecode` that crashed
immediately on startup. Current extension releases package the JavaScript server
module at `server/main.js` and gate Marketplace publish on package-target and
server-module smoke tests.

Use `--bytecode` only for local binary experiments or after revalidating every
published platform artifact.

---

## Conventions

- Scripts use paths relative to the repository root (the working directory from which they are invoked).
- Shell scripts use `set -euo pipefail` — they abort immediately on any error, unset variable reference, or failed pipeline stage.
- Scripts print a brief usage message when called with `--help` or with missing required arguments.
- Scripts exit non-zero on any failure so they can be composed in CI pipelines.

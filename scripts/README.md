# scripts/

Automation scripts that act on the repository. These scripts are **not** linked into `src/` and are never imported by the application. They are intended to be run by developers and CI operators from the repository root.

---

## Scripts

| Script                 | Description                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `set-version.sh`       | Bump the version field in `package.json` to a new semver string.                                                                                |
| `build-binary.mjs`     | Compile the server binary with Bun using the shared optional-dependency externals used by local and extension release builds.                   |
| `copy-binary.mjs`      | Copy a compiled server binary from `dist/` into `extension/server/`.                                                                            |
| `lint-all.sh`          | Run all linters sequentially (TypeScript, ESLint, Prettier, markdownlint-obsidian, markdownlint-cli2) and print a per-linter PASS/FAIL summary. |
| `validate-docs.sh`     | Run only the Markdown linters — useful for doc-only changes.                                                                                    |
| `update-test-index.sh` | (Stub) Scan `tests/` and regenerate `docs/test/index.md` and `docs/test/matrix.md`. Not yet implemented.                                        |

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

`build-binary.mjs` supports `--bytecode`, but extension release builds must not use it by default. Extension `0.1.2` showed that Bun `1.3.13` on Linux could cross-compile a Windows executable with `--bytecode` that crashed immediately on startup. The `0.1.3` release workflow uses `--compile --minify` and gates Marketplace publish on a Windows launch smoke test of the packaged `win32-x64` VSIX.

Use `--bytecode` only for local experiments or after revalidating every published platform artifact.

---

## Conventions

- Scripts use paths relative to the repository root (the working directory from which they are invoked).
- Shell scripts use `set -euo pipefail` — they abort immediately on any error, unset variable reference, or failed pipeline stage.
- Scripts print a brief usage message when called with `--help` or with missing required arguments.
- Scripts exit non-zero on any failure so they can be composed in CI pipelines.

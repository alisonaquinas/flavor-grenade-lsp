---
title: "Phase E5: CI/CD Pipeline"
phase: E5
status: planned
tags: [extension, ci-cd, github-actions, vsix, publishing, cross-compilation]
updated: 2026-05-06
---

# Phase E5: CI/CD Pipeline

| Field      | Value |
|------------|-------|
| Phase      | E5 |
| Title      | CI/CD Pipeline |
| Status     | ⏳ planned |
| Gate       | All 7 VSIXs build and the packaged Windows server launches before publish |
| Depends on | Phase E4 (Packaging & Local Test) |

---

## Objective

Create `extension-release.yml` GitHub Actions workflow triggered by `ext-v*` tags. A 7-target build matrix cross-compiles server binaries on `ubuntu-latest` via Bun, packages platform-specific VSIXs, smoke-tests the packaged Windows server binary, and publishes all 7 to the VS Code Marketplace in a gated publish job. Gate: all 7 VSIXs build successfully and the packaged `win32-x64` server launches on Windows before publish.

---

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `.github/workflows/extension-release.yml` | Create | Tag-triggered matrix build + publish workflow |
| `docs/roadmap.md` | Modify | Update extension phase statuses |

---

## Platform Target Reference

| VS Code target | Bun `--target` | Binary name |
|---|---|---|
| `linux-x64` | `bun-linux-x64` | `flavor-grenade-lsp` |
| `linux-arm64` | `bun-linux-arm64` | `flavor-grenade-lsp` |
| `alpine-x64` | `bun-linux-x64-musl` | `flavor-grenade-lsp` |
| `darwin-x64` | `bun-darwin-x64` | `flavor-grenade-lsp` |
| `darwin-arm64` | `bun-darwin-arm64` | `flavor-grenade-lsp` |
| `win32-x64` | `bun-windows-x64` | `flavor-grenade-lsp.exe` |
| `win32-arm64` | `bun-windows-arm64` | `flavor-grenade-lsp.exe` |

---

## Task List

- [ ] **1. Create `extension-release.yml` workflow**

  Create `.github/workflows/extension-release.yml`:

  ```yaml
  name: Extension Release

  on:
    push:
      tags:
        - 'ext-v*'

  permissions:
    contents: read

  jobs:
    build:
      name: Build VSIX (${{ matrix.vsce-target }})
      runs-on: ubuntu-latest
      strategy:
        fail-fast: true
        matrix:
          include:
            - vsce-target: linux-x64
              bun-target: bun-linux-x64
              binary-name: flavor-grenade-lsp
            - vsce-target: linux-arm64
              bun-target: bun-linux-arm64
              binary-name: flavor-grenade-lsp
            - vsce-target: alpine-x64
              bun-target: bun-linux-x64-musl
              binary-name: flavor-grenade-lsp
            - vsce-target: darwin-x64
              bun-target: bun-darwin-x64
              binary-name: flavor-grenade-lsp
            - vsce-target: darwin-arm64
              bun-target: bun-darwin-arm64
              binary-name: flavor-grenade-lsp
            - vsce-target: win32-x64
              bun-target: bun-windows-x64
              binary-name: flavor-grenade-lsp.exe
            - vsce-target: win32-arm64
              bun-target: bun-windows-arm64
              binary-name: flavor-grenade-lsp.exe

      steps:
        - uses: actions/checkout@v4

        - uses: oven-sh/setup-bun@v2
          with:
            bun-version: latest

        - uses: actions/setup-node@v4
          with:
            node-version: 20

        - name: Install server dependencies
          run: bun install --frozen-lockfile

        - name: Cross-compile server binary
          run: |
            mkdir -p extension/server
            bun build --compile --minify \
              --target=${{ matrix.bun-target }} \
              src/main.ts \
              --outfile extension/server/${{ matrix.binary-name }}

        - name: Install extension dependencies
          working-directory: extension
          run: npm ci

        - name: Build extension client
          working-directory: extension
          run: npm run build:extension

        - name: Package VSIX
          working-directory: extension
          run: npx vsce package --target ${{ matrix.vsce-target }}

        - name: Upload VSIX artifact
          uses: actions/upload-artifact@v4
          with:
            name: vsix-${{ matrix.vsce-target }}
            path: extension/*.vsix
            if-no-files-found: error

    smoke-test-windows-binary:
      name: Smoke Test Windows Binary
      runs-on: windows-latest
      needs: build
      steps:
        - uses: actions/download-artifact@v4
          with:
            name: vsix-win32-x64
            path: vsix-artifact

        - name: Run bundled Windows server
          shell: pwsh
          run: |
            $ErrorActionPreference = 'Stop'
            $vsix = Get-ChildItem -Path vsix-artifact -Filter '*.vsix' | Select-Object -First 1
            $extractDir = Join-Path $PWD 'vsix-extracted'
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::ExtractToDirectory($vsix.FullName, $extractDir)

            $server = Join-Path $extractDir 'extension/server/flavor-grenade-lsp.exe'
            $process = Start-Process -FilePath $server -NoNewWindow -PassThru
            if (!$process.WaitForExit(5000)) {
              Stop-Process -Id $process.Id -Force
              exit 0
            }
            if ($process.ExitCode -ne 0) {
              throw "Server exited with code $($process.ExitCode)."
            }

    publish:
      name: Publish to Marketplace
      runs-on: ubuntu-latest
      needs: [build, smoke-test-windows-binary]
      steps:
        - uses: actions/download-artifact@v4
          with:
            path: vsix-artifacts
            pattern: vsix-*
            merge-multiple: true

        - uses: actions/setup-node@v4
          with:
            node-version: 20

        - name: Install vsce
          run: npm install -g @vscode/vsce

        - name: Publish all VSIXs
          run: vsce publish --packagePath vsix-artifacts/*.vsix
          env:
            VSCE_PAT: ${{ secrets.VSCE_PAT }}
  ```

  Design notes:
  - All 7 targets cross-compiled on `ubuntu-latest`. Bun supports cross-compilation natively.
  - Extension release binaries use `--compile --minify` and intentionally omit `--bytecode`.
  - `0.1.2` showed that Linux Bun `1.3.13` cross-compiling a Windows executable with `--bytecode` could produce a binary that segfaulted immediately on Windows.
  - The Windows smoke test extracts the packaged `win32-x64` VSIX and launches the bundled server before publish.
  - `fail-fast: true` — if any platform fails, cancel all. Nothing publishes unless all 7 succeed.
  - `VSCE_PAT` is a repository secret scoped to Marketplace `Manage`. Must be configured before first publish.
  - Build, smoke test, and publish are separate jobs. Publish is gated on all 7 build jobs and the Windows launch smoke test completing.
  - This is a new workflow, independent from existing `ci.yml` and `release.yml`. Extension and server have independent release cycles.
  - Tag convention: `ext-v0.1.0` for extension releases. Manual tags for now — release-please integration deferred.

  Validate YAML:

  ```bash
  python3 -c "import yaml; yaml.safe_load(open('.github/workflows/extension-release.yml'))"
  ```

  Commit.

- [ ] **2. Update roadmap and execution ledger**

  Update `docs/roadmap.md` — mark completed extension phases as `complete` with dates.

  Update `docs/plans/execution-ledger.md` if extension phases are tracked there.

  Commit.

---

## Gate Verification

```bash
# Tag push triggers the workflow; verify all 7 VSIX artifacts are produced,
# the Windows smoke test passes, and the publish job completes successfully.
git tag ext-v0.1.0
git push origin ext-v0.1.0
```

---

## References

- `[[docs/research/vscode-extension-publishing]]`
- `[[plans/phase-E4-packaging-local-test]]`
- `[[plans/phase-13-ci-delivery]]`

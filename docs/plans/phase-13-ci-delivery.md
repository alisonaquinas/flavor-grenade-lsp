---
title: "Phase 13: CI & Delivery"
phase: 13
status: planned
tags: [ci, github-actions, packaging, release, binary, npm, editors]
updated: 2026-04-16
---

# Phase 13: CI & Delivery

| Field      | Value |
|------------|-------|
| Phase      | 13 |
| Title      | CI & Delivery |
| Status     | ⏳ planned |
| Gate       | CI passes on all PRs; release binary builds for linux-x64, darwin-arm64, darwin-x64, win-x64; npm package published |
| Depends on | Phase 12 (Code Actions) |

---

## Objective

Set up continuous integration, packaging, and release automation. After this phase, every pull request is automatically tested, and every semver tag produces a GitHub Release with binary artifacts and an npm publish.

---

## Task List

- [ ] **1. Create GitHub Actions CI workflow**

  Create `.github/workflows/ci.yml`. The CI workflow runs on every push and pull request to `main`:

  ```yaml
  name: CI

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    test:
      strategy:
        matrix:
          os: [ubuntu-latest, macos-latest, windows-latest]
          bun-version: ['1.1']
      runs-on: ${{ matrix.os }}
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
          with:
            bun-version: ${{ matrix.bun-version }}
        - run: bun install --frozen-lockfile
        - run: bun run build
        - run: bun run lint
        - run: bun test --coverage
        - run: bun run bdd -- --tags @smoke
        - uses: actions/upload-artifact@v4
          if: always()
          with:
            name: cucumber-report-${{ matrix.os }}
            path: reports/cucumber-report.html
  ```

- [ ] **2. Create coverage upload step**

  After `bun test --coverage`, upload to Codecov (or a self-hosted alternative):

  ```yaml
  - uses: codecov/codecov-action@v4
    with:
      token: ${{ secrets.CODECOV_TOKEN }}
      files: coverage/lcov.info
      fail_ci_if_error: true
  ```

- [ ] **3. Create full BDD workflow (separate job, slower)**

  The full BDD suite (not just `@smoke`) runs on the CI but in a separate job that does not block PR merges — it is informational until all scenarios pass:

  ```yaml
  bdd-full:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run bdd
      continue-on-error: true  # Remove when all scenarios pass
  ```

- [ ] **4. Implement `bun build` — single-file binary**

  Add `package.json` build script for binary compilation:

  ```json
  {
    "scripts": {
      "build:binary": "bun build src/main.ts --compile --outfile=dist/flavor-grenade-lsp",
      "build:binary:win": "bun build src/main.ts --compile --outfile=dist/flavor-grenade-lsp.exe"
    }
  }
  ```

  The compiled binary embeds the Bun runtime and requires no separate Node.js or Bun installation on the target machine.

- [ ] **5. Create release workflow**

  Create `.github/workflows/release.yml`. Triggered on semver tags (`v*.*.*`):

  ```yaml
  name: Release

  on:
    push:
      tags:
        - 'v[0-9]+.[0-9]+.[0-9]+'

  jobs:
    build-binaries:
      strategy:
        matrix:
          include:
            - os: ubuntu-latest
              target: linux-x64
              binary: flavor-grenade-lsp
            - os: macos-latest
              target: darwin-arm64
              binary: flavor-grenade-lsp
            - os: macos-13
              target: darwin-x64
              binary: flavor-grenade-lsp
            - os: windows-latest
              target: win-x64
              binary: flavor-grenade-lsp.exe
      runs-on: ${{ matrix.os }}
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
        - run: bun install --frozen-lockfile
        - run: bun run build:binary
        - name: Rename binary with target suffix
          shell: bash
          run: |
            mv dist/${{ matrix.binary }} \
               dist/flavor-grenade-lsp-${{ matrix.target }}${{ matrix.os == 'windows-latest' && '.exe' || '' }}
        - uses: actions/upload-artifact@v4
          with:
            name: binary-${{ matrix.target }}
            path: dist/flavor-grenade-lsp-${{ matrix.target }}*

    create-release:
      needs: build-binaries
      runs-on: ubuntu-latest
      steps:
        - uses: actions/download-artifact@v4
          with:
            pattern: binary-*
            merge-multiple: true
            path: dist/
        - uses: softprops/action-gh-release@v2
          with:
            files: dist/flavor-grenade-lsp-*
            generate_release_notes: true
  ```

- [ ] **6. Configure npm publish**

  Update `package.json` to include the binary in the npm package:

  ```json
  {
    "name": "flavor-grenade-lsp",
    "version": "0.1.0",
    "bin": {
      "flavor-grenade-lsp": "dist/flavor-grenade-lsp"
    },
    "files": [
      "dist/",
      "README.md",
      "LICENSE"
    ],
    "publishConfig": {
      "access": "public"
    }
  }
  ```

  Add npm publish step to the release workflow:

  ```yaml
  publish-npm:
    needs: create-release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  ```

- [ ] **7. Write Neovim lspconfig example**

  Create `editors/neovim/flavor-grenade.lua` with setup instructions:

  ```lua
  -- editors/neovim/flavor-grenade.lua
  -- Add to your lspconfig setup:
  local lspconfig = require('lspconfig')
  local configs = require('lspconfig.configs')

  if not configs.flavor_grenade then
    configs.flavor_grenade = {
      default_config = {
        cmd = { 'flavor-grenade-lsp' },
        filetypes = { 'markdown' },
        root_dir = function(fname)
          return lspconfig.util.root_pattern('.obsidian', '.flavor-grenade.toml')(fname)
            or lspconfig.util.find_git_ancestor(fname)
        end,
        settings = {
          flavorGrenade = {
            linkStyle = 'file-stem',
            completion = { candidates = 100 },
          }
        },
      },
    }
  end

  lspconfig.flavor_grenade.setup({})
  ```

- [ ] **8. Write VS Code settings example**

  Create `editors/vscode/settings.json` with example configuration:

  ```json
  {
    "[markdown]": {
      "editor.quickSuggestions": {
        "other": "on",
        "comments": "off",
        "strings": "off"
      },
      "editor.suggest.showFiles": true
    },
    "flavorGrenade.linkStyle": "file-stem",
    "flavorGrenade.completion.candidates": 100,
    "flavorGrenade.diagnostics.suppress": []
  }
  ```

- [ ] **9. Write Helix editor configuration example**

  Create `editors/helix/languages.toml` with Helix LSP configuration.

- [ ] **10. Set up branch protection rules (manual)**

  Configure GitHub repository settings (human task, not automated):
  - Require CI to pass before merge
  - Require at least 1 review for PRs to `main`
  - Require linear history (no merge commits)
  - Enable "Require branches to be up to date before merging"

- [ ] **11. Add `CHANGELOG.md` automation**

  Configure `release-please` or `conventional-changelog` to auto-generate changelog entries from conventional commit messages.

---

## Gate Verification

```bash
# CI must be green on all three platforms
# Verified by checking GitHub Actions workflow status for the PR

# Binary builds correctly on local machine
bun run build:binary
./dist/flavor-grenade-lsp --version  # Should print version string

# npm package dry run
npm publish --dry-run
```

The gate is considered passing when:
1. A PR to `main` shows all CI checks green (ubuntu, macos, windows)
2. A tag `v0.1.0` triggers the release workflow and produces 4 binary artifacts
3. The npm publish dry run exits 0

---

## References

- `[[adr/ADR004-release-strategy]]`
- `[[concepts/packaging]]`

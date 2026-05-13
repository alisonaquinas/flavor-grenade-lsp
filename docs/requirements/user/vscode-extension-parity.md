---
title: VS Code Extension Parity User Requirements
tags:
  - requirements/user/vscode-extension-parity
aliases:
  - Extension Parity User Goals
---

# VS Code Extension Parity User Requirements

---

## User.Extension.StartOnlyForVaults

**Tag:** User.Extension.StartOnlyForVaults
**Goal:** Start automatically for vaults without invading generic Markdown
**Need:** A VS Code user wants Flavor Grenade to activate when they open an Obsidian or Flavor Grenade vault, while ordinary README files and generic Markdown workspaces remain lightweight.
**Maps to:** Extension.Activation.VaultPrecision, Extension.Activation.MarkerEvents, Extension.MarkdownFlavor.Refresh

---

## User.Extension.UseNativeVSCodeActions

**Tag:** User.Extension.UseNativeVSCodeActions
**Goal:** Use native VS Code actions for vault navigation
**Need:** A VS Code user wants references, backlinks, outlinks, and embed navigation to open in familiar VS Code pickers and panels.
**Maps to:** Extension.CommandBridges.NativeUI, Extension.CommandBridges.PayloadValidation, Extension.CommandBridges.GraphActions, Extension.Contributions.FlavorScoped

---

## User.Extension.TrustExtensionBehavior

**Tag:** User.Extension.TrustExtensionBehavior
**Goal:** Trust extension behavior across updates
**Need:** A VS Code user wants activation, commands, status, and Markdown flavor behavior to be tested so extension updates do not break basic editing workflows.
**Maps to:** Extension.Tests.HostCoverage, Extension.MarkdownFlavor.Refresh, Extension.Workspace.EnvironmentModes, Extension.Packaging.TargetBinaryValidation

---

## User.Extension.EvaluateBeforeInstall

**Tag:** User.Extension.EvaluateBeforeInstall
**Goal:** Understand the extension before installing
**Need:** A prospective user wants Marketplace screenshots that show actual OFMarkdown behavior instead of only generic Markdown claims.
**Maps to:** Extension.Marketplace.OFMProof, Extension.Marketplace.AssetPackaging

---

## User.Extension.InstallCompatiblePackage

**Tag:** User.Extension.InstallCompatiblePackage
**Goal:** Install a platform-compatible extension package
**Need:** A VS Code user wants the installed package to contain a server binary that matches their platform and extension version, so the extension starts reliably after install or update.
**Maps to:** Extension.Packaging.TargetBinaryValidation, Extension.Workspace.EnvironmentModes

---

## User.Extension.UnderstandServerState

**Tag:** User.Extension.UnderstandServerState
**Goal:** Understand server state at a glance
**Need:** A VS Code user wants the status bar to say whether Flavor Grenade is starting, indexing, ready, disabled, or broken, and what to do next.
**Maps to:** Extension.Status.Diagnostics, Extension.Status.QuickActions, Extension.Workspace.EnvironmentModes

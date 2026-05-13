---
title: OFMarkdown Parity User Requirements
tags:
  - requirements/user/ofmarkdown-parity
aliases:
  - OFMarkdown Parity User Goals
---

# OFMarkdown Parity User Requirements

---

## User.Author.UseStandardMarkdownLinks

**Tag:** User.Author.UseStandardMarkdownLinks
**Goal:** Use standard Markdown links safely
**Need:** A vault author who writes `[text](note.md)` or reference-style links wants the same confidence they get from wiki-links: completion, navigation, diagnostics, and refactors should work when the target is local to the vault.
**Maps to:** Parity.MarkdownLinks.LocalResolution, Parity.MarkdownLinks.ParseCoverage, Parity.MarkdownLinks.TargetClassification, Parity.MarkdownLinks.ReferenceGraph, Parity.MarkdownLinks.Completion

---

## User.Diagnose.SpotAmbiguousHeadingAnchors

**Tag:** User.Diagnose.SpotAmbiguousHeadingAnchors
**Goal:** Detect ambiguous heading links
**Need:** A vault author linking to a heading wants to know when the target note has duplicate headings that could make the link unstable or surprising.
**Maps to:** Parity.HeadingAmbiguity.Diagnostics, Parity.MarkdownLinks.SameDocumentAnchor

---

## User.Rename.MoveNotesSafely

**Tag:** User.Rename.MoveNotesSafely
**Goal:** Move notes without breaking links
**Need:** A vault author reorganizing folders wants all references to moved notes and attachments to update automatically, regardless of whether each reference is a wiki-link, embed, Markdown link, or reference definition.
**Maps to:** Parity.FileOperations.AtomicRefactor, Parity.FileOperations.CapabilityRegistration, Parity.FileOperations.MovePlannerConfinement, Parity.FileOperations.ReferenceRewrite, Parity.FileOperations.SkippedAmbiguousReporting, Parity.FileOperations.AtomicValidation, Parity.FileOperations.IndexRefresh

---

## User.Embed.ManageAttachments

**Tag:** User.Embed.ManageAttachments
**Goal:** Manage attachments with editor help
**Need:** A vault author embedding images, PDFs, audio, or other files wants completion, broken-reference warnings, hover details, and navigation for those assets.
**Maps to:** Parity.Attachments.Intelligence, Parity.Attachments.IndexCoverage, Parity.Attachments.Completion, Parity.Attachments.Diagnostics, Parity.Attachments.NavigationHover, Parity.Attachments.ConfigHints

---

## User.Navigate.UseEditorStructure

**Tag:** User.Navigate.UseEditorStructure
**Goal:** Use editor structure tools in OFMarkdown
**Need:** A vault author working in a long note wants clickable links, folding, and selection expansion to understand OFMarkdown structure instead of treating the note as flat text.
**Maps to:** Parity.StructuralLSP.Coverage, Parity.StructuralLSP.CapabilityRegistration, Parity.StructuralLSP.DocumentLinks, Parity.StructuralLSP.FoldingRanges, Parity.StructuralLSP.SelectionRanges

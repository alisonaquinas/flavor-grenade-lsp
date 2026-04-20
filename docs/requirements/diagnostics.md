---
title: Diagnostic Requirements
tags:
  - requirements/diagnostics
aliases:
  - Diagnostic Requirements
  - FG Diagnostics
---

# Diagnostic Requirements

> [!NOTE] Scope
> These requirements govern the diagnostic system: severity assignment, FG-code enumeration, debounce latency, `relatedInformation` population, and single-file mode suppression. Diagnostic triggers (i.e., the conditions under which each code is emitted) are specified in the feature files that own each link or embed type: [[wiki-link-resolution]], [[embed-resolution]], [[requirements/block-references]]. This file governs the cross-cutting properties that apply uniformly to all diagnostics.

---

**Tag:** Diagnostic.Severity.WikiLink
**User Req:** User.Diagnose.SpotBrokenLinks
**Gist:** Diagnostics with codes FG001 (BrokenWikiLink), FG002 (AmbiguousWikiLink), and FG003 (MalformedWikiLink) must be published with LSP `DiagnosticSeverity.Error` (value 1).
**Ambition:** Broken, ambiguous, and malformed wiki-links are not cosmetic issues — they represent a failure of the vault's link graph that will cause incorrect rendering, navigation failures, or silent data-loss when following links. Error severity ensures that LSP clients display these diagnostics with maximum visual prominence (red underlines, error counts in the status bar) and that CI tooling treating errors as blocking can act on them. Downgrading to Warning would cause them to be ignored alongside stylistic suggestions.
**Scale:** Percentage of FG001, FG002, and FG003 diagnostics published by the server that carry `severity: 1` (DiagnosticSeverity.Error). Scope: all `textDocument/publishDiagnostics` notifications issued during a full vault analysis session.
**Meter:**

1. Create a test vault with at least 5 broken wiki-links (FG001 cases), at least 2 ambiguous wiki-links (FG002 cases — two documents with the same stem), and at least 2 malformed wiki-links (FG003 cases — e.g. `[[]]` or `[[|]]`).
2. Open all documents; collect all `textDocument/publishDiagnostics` notifications.
3. Filter to diagnostics with code `FG001`, `FG002`, or `FG003`.
4. Verify every such diagnostic has `severity: 1`.
5. Compute: (FG001/FG002/FG003 diagnostics with severity=1 / total FG001/FG002/FG003 diagnostics) × 100.
**Fail:** Any FG001, FG002, or FG003 diagnostic with severity other than 1.
**Goal:** 100% of FG001, FG002, and FG003 diagnostics carry severity Error.
**Stakeholders:** LSP client developers, CI pipeline maintainers, vault authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[wiki-link-resolution]], [[design/api-layer#diagnostic-handler]], LSP specification §3.17 DiagnosticSeverity.

---

**Tag:** Diagnostic.Severity.Embed
**User Req:** User.Diagnose.SpotBrokenEmbeds
**Gist:** Diagnostics with code FG004 (BrokenEmbed) must be published with LSP `DiagnosticSeverity.Warning` (value 2).
**Ambition:** Broken embeds degrade the rendered note but do not prevent navigation or corrupt the link graph in the same way a broken wiki-link does — the note remains readable, and the author's intent is recoverable. Warning severity distinguishes embed issues from link-graph failures without dismissing them as informational. It allows clients to display them with yellow/orange prominence and allows authors to triage broken embeds separately from broken links, which is the priority ordering that matches Obsidian's own rendering hierarchy.
**Scale:** Percentage of FG004 diagnostics published by the server that carry `severity: 2` (DiagnosticSeverity.Warning). Scope: all `textDocument/publishDiagnostics` notifications during a full vault analysis session.
**Meter:**

1. Create a test vault with at least 5 broken embed links covering markdown and image targets.
2. Open all documents; collect all `textDocument/publishDiagnostics` notifications.
3. Filter to diagnostics with code `FG004`.
4. Verify every such diagnostic has `severity: 2`.
5. Compute: (FG004 diagnostics with severity=2 / total FG004 diagnostics) × 100.
**Fail:** Any FG004 diagnostic with severity other than 2.
**Goal:** 100% of FG004 diagnostics carry severity Warning.
**Stakeholders:** LSP client developers, vault authors, Obsidian Publish users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[embed-resolution]], [[design/api-layer#diagnostic-handler]], LSP specification §3.17 DiagnosticSeverity.

---

**Tag:** Diagnostic.Code.Assignment
**User Req:** User.Diagnose.SpotBrokenLinks, User.Diagnose.SpotBrokenEmbeds
**Gist:** Each diagnostic type emitted by the server must carry its assigned FG-prefixed numeric code string in the `code` field, and no two distinct diagnostic types may share the same code.
**Ambition:** Stable, unique diagnostic codes enable downstream tooling — CI scripts, editor rule configurations, custom linters, and documentation — to identify, filter, and suppress specific diagnostic types without relying on fragile message-string matching. A code registry that allows collisions or undefined codes makes the diagnostic system unreliable as a machine-readable interface, eroding the value of the entire system as a programmatic signal.
**Scale:** Percentage of diagnostic instances emitted during a full vault analysis session that carry a non-null `code` value matching the expected FG-code for their type, as defined in the diagnostic code registry in [[design/api-layer#diagnostic-codes]].
**Meter:**

1. Construct a test vault that exercises at least one instance of each defined diagnostic type: FG001, FG002, FG004, FG005.
2. Collect all `textDocument/publishDiagnostics` notifications.
3. For each diagnostic, check that `code` is present, is a string of the form `FG\d+`, and matches the code assigned to the diagnostic's type in the registry.
4. Verify no two diagnostics of different types share the same code string.
5. Compute: (diagnostics with correct assigned code / total diagnostics) × 100.
**Fail:** Any diagnostic with a missing, null, or incorrect code value; any two diagnostic types sharing a code.
**Goal:** 100% of diagnostics carry their correct assigned FG code; 0 code collisions.
**Stakeholders:** CI engineers, LSP client plugin authors, tool integrators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer#diagnostic-codes]], [[wiki-link-resolution]], [[embed-resolution]], [[requirements/block-references]].

---

**Tag:** Diagnostic.Debounce.Latency
**User Req:** User.Diagnose.SpotBrokenLinks, User.Diagnose.SpotBrokenEmbeds
**Gist:** After the last document change event in an editing session, the server must publish updated diagnostics within 500 ms, measured at the median across repeated trials in a vault of at most 1000 documents.
**Ambition:** Diagnostic latency directly affects the perceived responsiveness of the LSP. A server that takes multiple seconds to report a broken link after the author types it fails to provide the real-time feedback loop that distinguishes an LSP from a batch linter. The 500 ms threshold is set at the upper bound of what UX research identifies as "immediate" response; the 200 ms goal reflects a target that keeps the diagnostic system imperceptible as a source of latency during normal typing.
**Scale:** Median time in milliseconds between the last `textDocument/didChange` notification in a typing burst and the subsequent `textDocument/publishDiagnostics` notification for the changed document. Measured across at least 20 trials in a vault of 1000 documents.
**Meter:**

1. Construct a vault with exactly 1000 documents, each containing at least 3 wiki-links.
2. Open a document. Using an automated LSP test client, send 5 `textDocument/didChange` notifications at 50 ms intervals simulating a typing burst.
3. Record the timestamp of the last `didChange` notification.
4. Record the timestamp of the first `publishDiagnostics` notification received after the burst ends.
5. Compute the latency for this trial as (publishDiagnostics timestamp − last didChange timestamp) in milliseconds.
6. Repeat for 20 trials. Compute the median latency across all trials.
**Fail:** Median latency > 500 ms.
**Goal:** Median latency ≤ 200 ms.
**Stakeholders:** Vault authors, editor UX quality, performance-sensitive integrations.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[architecture/overview#debounce-strategy]], [[design/api-layer#diagnostic-handler]], LSP specification §3.17 publishDiagnostics.

---

**Tag:** Diagnostic.Ambiguous.RelatedInfo
**User Req:** User.Diagnose.SpotAmbiguousLinks
**Gist:** FG002 (AmbiguousWikiLink) diagnostics must populate the `relatedInformation` array with one entry for each document location that matches the ambiguous link target, allowing the author to inspect all candidate definitions.
**Ambition:** An ambiguous wiki-link — where two or more vault documents share the same file stem or title — cannot be resolved deterministically. Simply flagging the diagnostic without indicating which documents are in conflict forces the author to perform a manual search to understand the ambiguity. Providing `relatedInformation` entries that point directly to each candidate document transforms a frustrating error into an actionable diagnosis: the author can navigate to each candidate and decide which to rename or disambiguate.
**Scale:** Percentage of FG002 diagnostics whose `relatedInformation` array contains exactly one entry per duplicate candidate document location (no more, no fewer). An ambiguous link with N matching documents must have exactly N `relatedInformation` entries.
**Meter:**

1. Create a test vault with at least 3 distinct ambiguity scenarios:
   - Scenario A: 2 documents sharing the same file stem
   - Scenario B: 3 documents sharing the same file stem
   - Scenario C: 2 documents sharing the same title (different stems)
2. Author wiki-links targeting each ambiguous name; wait for FG002 diagnostics.
3. For each FG002 diagnostic, inspect `relatedInformation`.
4. Verify Scenario A produces 2 `relatedInformation` entries, Scenario B produces 3, Scenario C produces 2.
5. Verify each entry's `location.uri` points to one of the candidate documents and `location.range` covers the document title or link-target token.
6. Compute: (FG002 diagnostics with correct relatedInformation count / total FG002 diagnostics) × 100.
**Fail:** Any FG002 diagnostic with a missing, empty, or incorrectly-sized `relatedInformation` array.
**Goal:** 100% of FG002 diagnostics have correctly populated `relatedInformation`.
**Stakeholders:** Vault authors resolving naming conflicts, teams managing large shared vaults.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[wiki-link-resolution]], [[design/api-layer#diagnostic-handler]], LSP specification §3.17 DiagnosticRelatedInformation.

---

**Tag:** Diagnostic.SingleFile.Suppression
**User Req:** User.Diagnose.SpotBrokenLinks
**Gist:** All cross-file diagnostics — FG001 (BrokenWikiLink), FG002 (AmbiguousWikiLink), FG004 (BrokenEmbed), and FG005 (BrokenBlockRef) — must be suppressed and must not appear in any `textDocument/publishDiagnostics` notification when the server is operating in single-file mode.
**Ambition:** Single-file mode operates without a VaultIndex. Cross-file diagnostics require inter-document knowledge — whether a target document exists, whether an anchor is defined, whether a name is ambiguous — that is simply unavailable in single-file mode. Emitting these diagnostics in single-file mode would produce false positives for every wiki-link in the document, flooding the author with spurious errors that cannot be acted upon and destroying the signal value of the diagnostic system entirely. Suppression is the correct and principled behaviour.
**Scale:** Percentage of `textDocument/publishDiagnostics` notifications issued in single-file mode that contain zero diagnostics with codes FG001, FG002, FG004, or FG005.
**Meter:**

1. Author a document with at least 5 wiki-links, 3 embed links, and 2 block cross-references — all of which would produce cross-file diagnostics in multi-file mode.
2. Open the document in the LSP client in single-file mode (no `rootUri`, no `workspaceFolders`).
3. Wait for `textDocument/publishDiagnostics`.
4. Inspect all returned diagnostics; filter to those with codes FG001, FG002, FG004, FG005.
5. Verify the filtered set is empty.
6. Compute: (notifications with zero suppressed-code diagnostics / total notifications issued) × 100.
**Fail:** Any FG001, FG002, FG004, or FG005 diagnostic appearing in single-file mode.
**Goal:** 0 cross-file diagnostics in single-file mode.
**Stakeholders:** Text editor users opening individual files, developers testing isolated documents.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[wiki-link-resolution#Link.Resolution.ModeScope]], [[requirements/block-references#Block.CrossRef.Diagnostic]], [[design/api-layer#single-file-mode]], [[architecture/overview#mode-detection]].

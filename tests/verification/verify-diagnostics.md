---
title: Verification — Diagnostics
tags: [test/verification, "requirements/diagnostics"]
aliases: [Verify Diagnostics]
---

# Verification — Diagnostics

## Purpose

This file defines scripted and agent-driven verification test cases for the six Planguage requirements in the diagnostics domain. Each test case maps directly to one Planguage tag defined in [[requirements/diagnostics]] and validates the cross-cutting properties of the server's diagnostic system against the Fail and Goal thresholds stated there. The tests cover FG001/FG002/FG003 severity assignment, FG004 severity assignment, FG-code uniqueness and correctness, debounce latency under a 1000-document vault load, `relatedInformation` population for FG002 ambiguity diagnostics, and suppression of all cross-file diagnostic codes in single-file mode.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Diagnostic.Severity.WikiLink` | FG001, FG002, and FG003 must carry `DiagnosticSeverity.Error` (value 1). | Phase 1 |
| `Diagnostic.Severity.Embed` | FG004 must carry `DiagnosticSeverity.Warning` (value 2). | Phase 1 |
| `Diagnostic.Code.Assignment` | Every diagnostic must carry its assigned FG-prefixed code; no two types may share a code. | Phase 1 |
| `Diagnostic.Debounce.Latency` | Median latency from last `didChange` to `publishDiagnostics` must be ≤ 500 ms over 20 trials in a 1000-document vault. | Phase 2 |
| `Diagnostic.Ambiguous.RelatedInfo` | FG002 diagnostics must populate `relatedInformation` with exactly one entry per candidate document. | Phase 1 |
| `Diagnostic.SingleFile.Suppression` | FG001, FG002, FG004, and FG005 must not appear in any `publishDiagnostics` notification in single-file mode. | Phase 1 |

## Test Cases

### TC-VER-DIAG-001 — Diagnostic.Severity.WikiLink

**Planguage Tag:** `Diagnostic.Severity.WikiLink`
**Gist:** Diagnostics with codes FG001 (BrokenWikiLink), FG002 (AmbiguousWikiLink), and FG003 (MalformedWikiLink) must be published with LSP `DiagnosticSeverity.Error` (value 1).
**Type:** Both
**BDD Reference:** [[bdd/features/diagnostics]] — `Broken wiki-link produces FG001 with Error severity` and `Ambiguous wiki-link produces FG002 with relatedInformation`
**Phase:** Phase 1

**Setup:**
Create a test vault with at least 5 broken wiki-links (FG001 cases), at least 2 ambiguous wiki-links (FG002 cases — two documents with the same stem), and at least 2 malformed wiki-links (FG003 cases, e.g., `[[]]` or `[[|]]`). Open all documents and collect all `textDocument/publishDiagnostics` notifications.

**Scripted steps:**

```gherkin
Given a vault with:
  "notes/ambig-a.md" and "notes/sub/ambig-a.md" (same stem — triggers FG002)
  "notes/broken.md" containing 5 wiki-links to non-existent documents (triggers FG001)
  "notes/malformed.md" containing "[[]]" and "[[|]]" (triggers FG003)
When the LSP processes textDocument/didOpen for all documents
And all publishDiagnostics notifications are collected
Then every FG001 diagnostic has severity equal to 1
And every FG002 diagnostic has severity equal to 1
And every FG003 diagnostic has severity equal to 1
And (FG001/FG002/FG003 diagnostics with severity=1 / total FG001/FG002/FG003 diagnostics) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes `notes/ambig-a.md` (content: `# Ambiguous A`) and `notes/sub/ambig-a.md` (content: `# Ambiguous Sub`).
3. Agent writes `notes/broken.md`:
   ```
   [[missing-one]]
   [[missing-two]]
   [[missing-three]]
   [[missing-four]]
   [[missing-five]]
   ```
4. Agent writes `notes/ref.md` containing `[[ambig-a]]` (triggers FG002).
5. Agent writes `notes/malformed.md`:
   ```
   [[]]
   [[|]]
   ```
6. Agent spawns LSP server: `bun run start 2>/dev/null &`
7. Agent sends `initialize` + `initialized` JSON-RPC.
8. Agent sends `textDocument/didOpen` for each of `notes/broken.md`, `notes/ref.md`, `notes/malformed.md`; collects all `publishDiagnostics` notifications until settled.
9. Agent filters collected diagnostics to those with code `FG001`, `FG002`, or `FG003`.
10. Agent asserts every filtered diagnostic has `severity` equal to `1`.
11. Agent computes (FG001/FG002/FG003 diagnostics with severity=1 / total FG001/FG002/FG003 diagnostics) × 100; records against Fail/Goal thresholds.
12. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of FG001, FG002, and FG003 diagnostics carry `DiagnosticSeverity.Error` (severity value 1).
**Fail criterion:** Any FG001, FG002, or FG003 diagnostic with a severity value other than 1.

---

### TC-VER-DIAG-002 — Diagnostic.Severity.Embed

**Planguage Tag:** `Diagnostic.Severity.Embed`
**Gist:** Diagnostics with code FG004 (BrokenEmbed) must be published with LSP `DiagnosticSeverity.Warning` (value 2).
**Type:** Both
**BDD Reference:** [[bdd/features/diagnostics]] — `Broken embed produces FG004 with Warning severity`
**Phase:** Phase 1

**Setup:**
Create a test vault with at least 5 broken embed links covering markdown and image targets. Open all documents and collect all `textDocument/publishDiagnostics` notifications. Filter to FG004 diagnostics.

**Scripted steps:**

```gherkin
Given a vault with a document "notes/bad-embeds.md" containing:
  "![[missing-doc-a]]", "![[missing-doc-b]]", "![[missing-doc-c]]" (missing markdown targets)
  "![[missing-image.png]]", "![[missing-asset.svg]]" (missing image targets)
When the LSP processes textDocument/didOpen for "notes/bad-embeds.md"
And all publishDiagnostics notifications are collected
Then every FG004 diagnostic has severity equal to 2
And (FG004 diagnostics with severity=2 / total FG004 diagnostics) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes `notes/bad-embeds.md`:
   ```
   ![[missing-doc-a]]
   ![[missing-doc-b]]
   ![[missing-doc-c]]
   ![[missing-image.png]]
   ![[missing-asset.svg]]
   ```
3. Agent spawns LSP server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` + `initialized` JSON-RPC.
5. Agent sends `textDocument/didOpen` for `notes/bad-embeds.md`; waits for `publishDiagnostics` to settle.
6. Agent collects all diagnostics; filters to those with code `FG004`.
7. Agent asserts every FG004 diagnostic has `severity` equal to `2`.
8. Agent computes (FG004 diagnostics with severity=2 / total FG004 diagnostics) × 100; records against Fail/Goal thresholds.
9. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of FG004 diagnostics carry `DiagnosticSeverity.Warning` (severity value 2).
**Fail criterion:** Any FG004 diagnostic with a severity value other than 2.

---

### TC-VER-DIAG-003 — Diagnostic.Code.Assignment

**Planguage Tag:** `Diagnostic.Code.Assignment`
**Gist:** Each diagnostic type emitted by the server must carry its assigned FG-prefixed numeric code string in the `code` field, and no two distinct diagnostic types may share the same code.
**Type:** Both
**BDD Reference:** [[bdd/features/diagnostics]] — `Broken wiki-link produces FG001 with Error severity`, `Ambiguous wiki-link produces FG002 with relatedInformation`, `Broken embed produces FG004 with Warning severity`, `Broken block reference produces FG005 with Error severity`
**Phase:** Phase 1

**Setup:**
Construct a test vault that exercises at least one instance of each defined diagnostic type: FG001, FG002, FG004, FG005. Collect all `textDocument/publishDiagnostics` notifications during a full vault analysis session.

**Scripted steps:**

```gherkin
Given a vault exercising at least one FG001, one FG002, one FG004, and one FG005 instance
When all publishDiagnostics notifications are collected
Then every diagnostic has a non-null "code" field
And every "code" value matches the pattern FG\d+
And every diagnostic's code matches the code assigned to its type in the diagnostic registry
And no two diagnostics of different types share the same code string
And (diagnostics with correct assigned code / total diagnostics) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes `notes/source.md`:
   ```
   # Source
   Paragraph text. ^valid-anchor
   ```
3. Agent writes `notes/ambig-a.md` (content: `# Ambig`) and `notes/sub/ambig-a.md` (content: `# Ambig Sub`).
4. Agent writes `notes/all-codes.md`:
   ```
   [[missing-note]]
   [[ambig-a]]
   ![[missing-embed]]
   [[source#^nonexistent-anchor]]
   ```
5. Agent spawns LSP server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` + `initialized` JSON-RPC.
7. Agent sends `textDocument/didOpen` for `notes/all-codes.md`; waits for `publishDiagnostics` to settle.
8. Agent collects all diagnostics.
9. Agent asserts every diagnostic has a non-null, non-empty `code` field.
10. Agent asserts every `code` value matches the regular expression `^FG\d+$`.
11. Agent asserts each diagnostic's `code` matches the registry entry for its diagnostic type (FG001 for broken wiki-link, FG002 for ambiguous wiki-link, FG004 for broken embed, FG005 for broken block ref).
12. Agent builds a set of (code → type) pairs; asserts no two distinct types share the same code string.
13. Agent computes (diagnostics with correct assigned code / total diagnostics) × 100; records against Fail/Goal thresholds.
14. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of diagnostics carry their correct assigned FG code; 0 code collisions across distinct diagnostic types.
**Fail criterion:** Any diagnostic with a missing, null, or incorrect code value; any two diagnostic types sharing a code.

---

### TC-VER-DIAG-004 — Diagnostic.Debounce.Latency

**Planguage Tag:** `Diagnostic.Debounce.Latency`
**Gist:** After the last document change event in an editing session, the server must publish updated diagnostics within 500 ms, measured at the median across repeated trials in a vault of at most 1000 documents.
**Type:** Agent-driven
**BDD Reference:** **BDD gap** — no scenario covers this requirement
**Phase:** Phase 2

**Setup:**
Construct a vault with exactly 1000 documents, each containing at least 3 wiki-links. Open a document. Using an automated LSP test client, send 5 `textDocument/didChange` notifications at 50 ms intervals to simulate a typing burst. Repeat for 20 trials. Compute the median latency.

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes a script to generate exactly 1000 markdown documents under `notes/`, each containing:
   ```
   # Note NNN
   [[note-0001]] [[note-0002]] [[note-0003]]
   ```
   where NNN is the zero-padded document number.
3. Agent spawns LSP server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` + `initialized` JSON-RPC; waits for the vault index to finish building (no `publishDiagnostics` notifications for 1000 ms).
5. Agent sends `textDocument/didOpen` for `notes/note-0001.md`.
6. Agent begins Trial 1:
   a. Agent sends `textDocument/didChange` notification 1 (minor edit, e.g., append a space); records nothing yet.
   b. Agent waits 50 ms; sends `textDocument/didChange` notification 2.
   c. Agent waits 50 ms; sends `textDocument/didChange` notification 3.
   d. Agent waits 50 ms; sends `textDocument/didChange` notification 4.
   e. Agent waits 50 ms; sends `textDocument/didChange` notification 5 (**last change**); records `T_change` = timestamp at send time (Unix epoch in milliseconds).
   f. Agent listens on server stdout for the next `textDocument/publishDiagnostics` notification for `notes/note-0001.md`; records `T_diag` = timestamp at receipt time.
   g. Agent computes trial latency: `T_diag − T_change` milliseconds.
7. Agent repeats step 6 for Trials 2 through 20, restoring the document to a known state between trials.
8. Agent sorts the 20 trial latency values; computes the median (average of 10th and 11th values).
9. Agent asserts median latency ≤ 500 ms (Fail threshold) and records whether median latency ≤ 200 ms (Goal threshold).
10. Agent records the full distribution (min, median, 90th-percentile, max) for diagnostic purposes.
11. Agent sends `shutdown` + `exit`.

**Pass criterion:** Median latency across 20 trials ≤ 200 ms.
**Fail criterion:** Median latency > 500 ms.

---

### TC-VER-DIAG-005 — Diagnostic.Ambiguous.RelatedInfo

**Planguage Tag:** `Diagnostic.Ambiguous.RelatedInfo`
**Gist:** FG002 (AmbiguousWikiLink) diagnostics must populate the `relatedInformation` array with one entry for each document location that matches the ambiguous link target, allowing the author to inspect all candidate definitions.
**Type:** Both
**BDD Reference:** [[bdd/features/diagnostics]] — `Ambiguous wiki-link produces FG002 with relatedInformation`
**Phase:** Phase 1

**Setup:**
Create a test vault with at least 3 distinct ambiguity scenarios: Scenario A — 2 documents sharing the same file stem; Scenario B — 3 documents sharing the same file stem; Scenario C — 2 documents sharing the same title (different stems). Author wiki-links targeting each ambiguous name and await FG002 diagnostics.

**Scripted steps:**

```gherkin
Given a vault with:
  Scenario A: "notes/shared.md" and "archive/shared.md" (same stem — 2 candidates)
  Scenario B: "p1/topic.md", "p2/topic.md", "p3/topic.md" (same stem — 3 candidates)
  Scenario C: "notes/doc-x.md" (title: "Common Title") and "notes/doc-y.md" (title: "Common Title")
And a document "notes/refs.md" containing "[[shared]]", "[[topic]]", and "[[Common Title]]"
When the LSP processes textDocument/didOpen for "notes/refs.md"
Then the FG002 diagnostic for "[[shared]]" has exactly 2 relatedInformation entries
And the FG002 diagnostic for "[[topic]]" has exactly 3 relatedInformation entries
And the FG002 diagnostic for "[[Common Title]]" has exactly 2 relatedInformation entries
And each relatedInformation entry has a location.uri pointing to one of the candidate documents
And (FG002 diagnostics with correct relatedInformation count / total FG002 diagnostics) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes Scenario A documents: `notes/shared.md` (content: `# Shared Notes`) and `archive/shared.md` (content: `# Shared Archive`).
3. Agent writes Scenario B documents: `p1/topic.md`, `p2/topic.md`, `p3/topic.md` each with unique body content.
4. Agent writes Scenario C documents:
   `notes/doc-x.md`:
   ```
   ---
   title: Common Title
   ---
   # Doc X
   ```
   `notes/doc-y.md`:
   ```
   ---
   title: Common Title
   ---
   # Doc Y
   ```
5. Agent writes `notes/refs.md`:
   ```
   [[shared]]
   [[topic]]
   [[Common Title]]
   ```
6. Agent spawns LSP server: `bun run start 2>/dev/null &`
7. Agent sends `initialize` + `initialized` JSON-RPC.
8. Agent sends `textDocument/didOpen` for `notes/refs.md`; waits for `publishDiagnostics` to settle.
9. Agent collects all diagnostics for `notes/refs.md`; filters to code `FG002`.
10. Agent locates the FG002 for `[[shared]]`; asserts `relatedInformation` has exactly 2 entries; asserts each entry's `location.uri` is one of `notes/shared.md` or `archive/shared.md`.
11. Agent locates the FG002 for `[[topic]]`; asserts `relatedInformation` has exactly 3 entries; asserts each entry's `location.uri` is one of `p1/topic.md`, `p2/topic.md`, or `p3/topic.md`.
12. Agent locates the FG002 for `[[Common Title]]`; asserts `relatedInformation` has exactly 2 entries; asserts each entry's `location.uri` is one of `notes/doc-x.md` or `notes/doc-y.md`.
13. Agent computes (FG002 diagnostics with correct `relatedInformation` count / total FG002 diagnostics) × 100; records against Fail/Goal thresholds.
14. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of FG002 diagnostics have correctly populated `relatedInformation` — exactly one entry per candidate document, no more, no fewer.
**Fail criterion:** Any FG002 diagnostic with a missing, empty, or incorrectly-sized `relatedInformation` array.

---

### TC-VER-DIAG-006 — Diagnostic.SingleFile.Suppression

**Planguage Tag:** `Diagnostic.SingleFile.Suppression`
**Gist:** All cross-file diagnostics — FG001 (BrokenWikiLink), FG002 (AmbiguousWikiLink), FG004 (BrokenEmbed), and FG005 (BrokenBlockRef) — must be suppressed and must not appear in any `textDocument/publishDiagnostics` notification when the server is operating in single-file mode.
**Type:** Both
**BDD Reference:** [[bdd/features/diagnostics]] — `All cross-file diagnostics suppressed in single-file mode`
**Phase:** Phase 1

**Setup:**
Author a document with at least 5 wiki-links, 3 embed links, and 2 block cross-references — all of which would produce cross-file diagnostics (FG001, FG002, FG004, FG005) in multi-file mode. Open the document in the LSP client in single-file mode (no `rootUri`, no `workspaceFolders` in the `initialize` request).

**Scripted steps:**

```gherkin
Given no vault root is detected (single-file mode)
And the file "orphan.md" contains:
  "[[missing-note-a]]", "[[missing-note-b]]", "[[missing-note-c]]", "[[missing-note-d]]", "[[missing-note-e]]"
  "![[missing-embed-a]]", "![[missing-embed-b]]", "![[missing-embed-c]]"
  "[[some-doc#^missing-anchor-a]]", "[[some-doc#^missing-anchor-b]]"
When the LSP processes textDocument/didOpen for "orphan.md"
Then no diagnostic with code "FG001" is published for "orphan.md"
And no diagnostic with code "FG002" is published for "orphan.md"
And no diagnostic with code "FG004" is published for "orphan.md"
And no diagnostic with code "FG005" is published for "orphan.md"
And (notifications with zero suppressed-code diagnostics / total notifications issued) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates a temp directory with no `.obsidian/` subdirectory and no vault root structure.
2. Agent writes `orphan.md`:
   ```
   [[missing-note-a]]
   [[missing-note-b]]
   [[missing-note-c]]
   [[missing-note-d]]
   [[missing-note-e]]
   ![[missing-embed-a]]
   ![[missing-embed-b]]
   ![[missing-embed-c]]
   [[some-doc#^missing-anchor-a]]
   [[some-doc#^missing-anchor-b]]
   ```
3. Agent spawns LSP server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` with no `rootUri` and no `workspaceFolders` + `initialized` JSON-RPC.
5. Agent sends `textDocument/didOpen` for `orphan.md`; waits for `publishDiagnostics` to settle.
6. Agent collects all `publishDiagnostics` notifications for `orphan.md`.
7. Agent filters collected diagnostics to those with codes `FG001`, `FG002`, `FG004`, or `FG005`; asserts the filtered set is empty.
8. Agent counts: (notifications with zero suppressed-code diagnostics / total `publishDiagnostics` notifications received) × 100.
9. Agent records measurement against Fail/Goal thresholds.
10. Agent sends `shutdown` + `exit`.

**Pass criterion:** 0 cross-file diagnostics (FG001, FG002, FG004, FG005) in any `publishDiagnostics` notification while the server operates in single-file mode.
**Fail criterion:** Any FG001, FG002, FG004, or FG005 diagnostic appearing in single-file mode.

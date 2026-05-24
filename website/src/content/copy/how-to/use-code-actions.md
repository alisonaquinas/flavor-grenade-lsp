---
title: "Use Code Actions | Flavor Grenade LSP"
description: "Apply Flavor Grenade quick fixes for missing files, table of contents updates, tags, and non-breaking spaces."
h1: "Use Code Actions"
summary: "Use code actions when Flavor Grenade can make a bounded, editor-reviewed edit for a recognized Markdown problem."
related: ["conceptDiagnostics","howToFixBrokenLinks","howToUseStructuredProfiles"]
---

# Use Code Actions

Use code actions when Flavor Grenade can make a bounded, editor-reviewed edit for a recognized Markdown problem.

## When to use it

Use this page when VS Code shows a lightbulb, a quick fix, or a source action in a Markdown file that Flavor Grenade understands. Code actions are deliberately narrower than diagnostics. A diagnostic can explain many problems; a code action is offered only when the server can produce a concrete edit without guessing.

Current actions cover creating a missing file for an unresolved wiki link, inserting or updating a table of contents, moving an inline tag to frontmatter, and replacing a non-breaking space flagged by a diagnostic. The editor still shows the action before applying it, and the generated edit stays within the current document or detected project boundary.

## Steps

Put the cursor on the warning, link, tag, or heading that should drive the action. In VS Code, use the lightbulb or the Quick Fix command. Direct LSP clients should request `textDocument/codeAction` with the current range and any diagnostics that apply to that range.

Review the action title before applying it. Flavor Grenade names actions by effect, so the choice should say whether it will create a missing file, update a table of contents, move a tag, or fix whitespace.

### Fix a missing wiki target

Place the cursor on a broken wiki link such as `[[Project Kickoff]]`, then choose the create-missing-file quick fix when FG001 is active.

### Generate or update a table of contents

Place the cursor near a heading and choose the table of contents source action when the document has headings worth indexing.

### Move tags or fix whitespace

Place the cursor on `#project/flavor-grenade` to move an inline tag into frontmatter, or use the quick fix offered for a non-breaking space warning.

```markdown
[[Project Kickoff]]

# Project Kickoff

## Decisions

#project/flavor-grenade
```

## Expected result

The selected action returns a WorkspaceEdit that the client can apply. Creating a missing file should add the target note under the detected boundary. Updating a table of contents should rewrite the current document. Moving a tag should update frontmatter and remove the inline tag where supported. Fixing a non-breaking space should replace it with a regular ASCII space.

After the edit, related diagnostics should clear or become more specific. For example, a newly created `Project Kickoff.md` should stop the broken-link warning on `[[Project Kickoff]]` once the index refreshes.

## Common failure mode

The common failure is expecting a code action for an ambiguous or unsafe problem. Flavor Grenade should not create files for external URLs, unsupported URI schemes, paths outside the project, or links where the intended target is ambiguous.

Another failure is requesting source actions without enough document context. If a direct client sends no diagnostics, no root, or stale document text, the server may return fewer actions than VS Code would. Refresh the document, confirm the root, and request the action again from the exact range.

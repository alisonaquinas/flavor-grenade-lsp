---
id: "TASK-232"
title: "Add icon affordances to footer links"
type: task
status: green
priority: medium
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/task, "phase/W6", website, footer, icons]
aliases: ["TASK-232"]
---

# Add Icon Affordances To Footer Links

> [!INFO] `TASK-232` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `green`

## Description

Add icons to the footer creator links and project links while keeping visible
text labels and accessible names.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| 6 | Creator links | Add icons |
| 7 | GitHub repository link | Add an icon |
| 8 | Visual Studio Marketplace link | Add an icon |

## Implementation Details

Create or update tests before implementation:

- `website/tests/footer.test.ts`

Expected behavior:

- Alison website, GitHub, and LinkedIn footer links have meaningful icons.
- Flavor Grenade GitHub repository link has a GitHub or repository icon.
- Visual Studio Marketplace link has a marketplace, package, extension, or VS
  Code-oriented icon.
- Icons supplement visible descriptive text rather than replacing it.

## Definition of Done

- [ ] Failing regression test exists before implementation.
- [ ] Footer creator links include icons.
- [ ] Footer project links include icons.
- [ ] Visible descriptive labels remain present.
- [ ] Icons do not create cramped mobile layout.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from browser review comments 6, 7, and 8. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added footer link coverage requiring creator and project link icons.

> [!SUCCESS] Green · 2026-05-09
> Added icon metadata and rendered inline icons for creator and project footer
> links.

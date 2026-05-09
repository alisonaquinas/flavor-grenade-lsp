# Interactive Docs Controls Functional Requirements

## Website.Commands.Copyable

Tag: `Website.Commands.Copyable`

Gist: Make install and configuration commands copyable while preserving visible
text.

Ambition: Users can run setup commands with low transcription risk, while still
being able to inspect and select command text.

Scale: Percentage of command blocks marked copyable that expose a copy control,
remain selectable as text, and copy the exact visible command.

Meter: Inspect all copyable command blocks in the production build. For each
block, use the copy control and compare clipboard text to visible command text.

Fail: Any copyable command lacks a copy control, prevents text selection, or
copies text that differs from the visible command.

Goal: 100% of copyable command blocks expose copy controls, remain selectable,
and copy exact visible text.

Stretch: Goal level plus successful copy feedback is visible and announced
accessibly.

Wish: Stretch level plus copy feedback clears without stealing focus.

Stakeholders: Quickstart users, keyboard users, screen-reader users.

Owner: Website implementation.

Source: [[requirements/user/quickstart]], [[requirements/design/index]]

Open questions:

- Which commands are in scope for copy controls in the first release?

## Website.Disclosure.ProgressiveDetail

Tag: `Website.Disclosure.ProgressiveDetail`

Gist: Use accordions or disclosure controls only for progressive detail.

Ambition: Essential setup steps stay visible, while advanced details can be
expanded without overwhelming first-time users.

Scale: Percentage of required setup steps hidden behind disclosure controls on
quickstart and install pages.

Meter: Review quickstart and install pages in the production build. Classify
each setup step as required or optional based on page intent, then count
required steps hidden in closed disclosures at initial render.

Fail: Any required setup step is hidden in a closed disclosure at initial
render.

Goal: 0% of required setup steps are hidden in closed disclosures at initial
render.

Stretch: Goal level plus optional disclosure controls have accessible names and
expanded states.

Wish: Stretch level plus disclosure state is preserved during same-page
navigation when useful.

Stakeholders: First-time users, keyboard users.

Owner: Website implementation.

Source: [[requirements/design/index]], [[requirements/user/quickstart]]

Open questions:

- Which install details count as required versus optional for direct LSP users?

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

Source: [[website/docs/requirements/user/quickstart]], [[website/docs/requirements/design/index]]

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

Source: [[website/docs/requirements/design/index]], [[website/docs/requirements/user/quickstart]]

Open questions:

- Which install details count as required versus optional for direct LSP users?

## Website.Homepage.FeatureProofSelection

Tag: `Website.Homepage.FeatureProofSelection`

Gist: Make homepage feature proof cards selectable and use selection to show
deeper practical behavior.

Ambition: Users can move from a short capability claim to a concrete example of
how Flavor Grenade and related Markdown linting workflows detect, complete,
rename, or keep Obsidian Vault content consistent.

Scale: Percentage of homepage feature proof cards that can be selected with
pointer and keyboard input and update a visible detail panel.

Meter: Inspect the homepage in the production build. For each feature proof
card, select it with pointer input and keyboard input, then verify that the
selected state and detail panel update to capability-specific practical
content.

Fail: Any feature proof card is static only, cannot be selected by keyboard, or
does not reveal capability-specific practical detail.

Goal: 100% of feature proof cards are selectable and reveal practical details.

Stretch: Goal level plus the detail panel includes concrete Markdown examples,
indexed vault context, and the visible editor result for every feature.

Wish: Stretch level plus desktop uses a shared full-width detail panel while
mobile expands the selected card inline without losing context.

Long-term Wish: Wish level plus selection state is reflected in the URL hash or
otherwise remains stable across reloads without harming SEO.

Stakeholders: Prospective users, docs readers, LLM maintainers, keyboard users.

Owner: Website implementation.

Source: [[website/docs/requirements/user/homepage]], [[website/docs/requirements/design/index]]

Open questions:

- Which feature should be selected by default on first render?

- Should mobile expanded card state persist when users navigate away and back?

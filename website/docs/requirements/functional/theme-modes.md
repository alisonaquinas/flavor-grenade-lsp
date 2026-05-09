# Theme Mode Functional Requirements

## Website.Theme.ModeSelection

Tag: `Website.Theme.ModeSelection`

Gist: Let users choose light, dark, or system theme mode.

Ambition: The site remains comfortable in the user's ambient context while
giving explicit control when system preference is not enough.

Scale: Percentage of required theme modes exposed by the theme control and
applied to the page.

Required modes:

- light
- dark
- system

Meter: In the production build, use the theme control to select each mode.
Observe the applied document state and visible theme result.

Fail: Any required mode is unavailable or cannot be applied.

Goal: 100% of required modes are available and apply correctly.

Stretch: Goal level plus the current mode is exposed to assistive technology.

Wish: Stretch level plus changing modes does not move keyboard focus
unexpectedly.

Stakeholders: All readers, keyboard users, screen-reader users.

Owner: Website implementation.

Source: [[requirements/user/accessibility-and-usability]], [[requirements/design/index]]

Visual interaction requirements:

- The header must expose theme selection through one compact icon affordance
  instead of a persistent three-segment System / Light / Dark control.
- The compact control may cycle modes or open a menu, but all three required
  modes must remain reachable.
- The active mode must be communicated through text available to assistive
  technology, such as `aria-label`, `aria-pressed`, menu item state, or
  equivalent semantics.

Open questions:

- What exact storage key should persist user preference?
- Should the compact icon control cycle modes directly or open a menu?

## Website.Theme.SystemDefault

Tag: `Website.Theme.SystemDefault`

Gist: Default to system color-scheme preference for first-time visitors.

Ambition: The website feels native to the user's environment without requiring
configuration.

Scale: Presence of a saved manual theme preference before first render.

Meter: Clear website storage, set operating system or browser emulation to
light and dark preferences, then load the production build and inspect the
initial rendered theme.

Fail: The first render ignores system preference when no saved preference
exists.

Goal: The first render follows system preference when no saved preference
exists.

Stretch: Goal level plus system mode responds to operating system preference
changes without a page reload.

Wish: Stretch level plus no visible flash of the wrong theme appears during
initial load.

Stakeholders: First-time visitors, returning readers.

Owner: Website implementation.

Source: [[requirements/user/accessibility-and-usability]]

Open questions:

- Which browser automation setup will emulate system color-scheme preference in
  CI?

## Website.Theme.Persistence

Tag: `Website.Theme.Persistence`

Gist: Persist manual theme choices across navigation and reloads.

Ambition: Users who choose light or dark mode should not need to repeat that
choice.

Scale: Percentage of manual theme choices that survive route navigation and
page reload.

Manual choices:

- light
- dark

Meter: Select each manual mode in the production build, navigate to another
route, reload the page, and inspect the active theme mode.

Fail: Any manual choice is lost after navigation or reload.

Goal: 100% of manual choices persist across navigation and reload.

Stretch: Goal level plus returning to system mode clears or replaces the manual
override.

Wish: Stretch level plus theme persistence works with direct-loaded nested
routes.

Stakeholders: Returning readers.

Owner: Website implementation.

Source: [[requirements/user/accessibility-and-usability]]

Open questions:

- Should system mode be stored explicitly or represented by absence of manual
  preference?

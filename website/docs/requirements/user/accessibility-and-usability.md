# Accessibility And Usability User Requirements

## User Need

Users must be able to read, navigate, and use the website across desktop,
mobile, keyboard, no-JS, light theme, and dark theme contexts.

## Required Experience

The website must be documentation-first: fast to scan, predictable, and
accessible. Interactive elements must improve task completion rather than hide
basic information.

## Acceptance Criteria

- Navigation is keyboard usable.
- The site includes a skip link to main content.
- Menus, accordions, theme controls, and copy buttons expose accessible labels
  and states.
- Text contrast passes WCAG AA in light and dark themes.
- Page layouts work on mobile and desktop without overlapping text or controls.
- Mobile layouts support reading, navigation, command copying, and VS Code
  extension setup without horizontal page overflow.
- Copy buttons never replace visible commands; commands remain selectable text.
- Screenshots and diagrams include useful alt text.
- Core page content remains meaningful without JavaScript.
- Theme preference respects system preference and can be overridden by the
  user.
- Theme controls provide three explicit modes: light, dark, and system.
- The default theme mode is system when the user has not chosen a manual
  preference.
- Manual light and dark choices persist across page loads.
- System mode updates the site when the operating system color-scheme
  preference changes.
- The first viewport hints at the next section on mobile and desktop.
- Product logos and screenshots include useful alt text and do not replace
  textual product identification.

## Theme User Stories

### System Default

As a first-time visitor, I want the website to use my operating system color
scheme automatically, so the site feels consistent with the rest of my
environment without configuration.

Acceptance criteria:

- Given no saved theme preference, when I open the site, then the site uses
  system mode.
- Given my operating system prefers dark mode, when I open the site with no
  saved preference, then the site renders in dark mode.
- Given my operating system prefers light mode, when I open the site with no
  saved preference, then the site renders in light mode.

### Manual Light Mode

As a user reading in a bright environment, I want to force light mode, so the
site remains easy to read regardless of my system setting.

Acceptance criteria:

- Given I choose light mode, when the system preference is dark, then the site
  remains in light mode.
- Given I refresh or navigate to another page, then the site keeps light mode.
- Given light mode is active, then text, controls, code blocks, and links meet
  contrast requirements.

### Manual Dark Mode

As a user reading in a dark environment, I want to force dark mode, so the site
does not switch to a bright theme when my system setting differs.

Acceptance criteria:

- Given I choose dark mode, when the system preference is light, then the site
  remains in dark mode.
- Given I refresh or navigate to another page, then the site keeps dark mode.
- Given dark mode is active, then text, controls, code blocks, and links meet
  contrast requirements.

### Return To System Mode

As a user who previously chose a manual theme, I want to return to system mode,
so the site follows my operating system again.

Acceptance criteria:

- Given a saved manual theme, when I choose system mode, then the manual
  override is replaced by system mode.
- Given system mode is active, when my operating system color-scheme preference
  changes, then the site updates to match it.
- Given system mode is active, when I refresh or navigate to another page, then
  the site remains in system mode.

### Accessible Theme Control

As a keyboard or screen-reader user, I want the theme control to expose its
current state and available options, so I can change the theme without relying
on visual-only cues.

Acceptance criteria:

- The theme control is keyboard reachable.
- The current mode is exposed as light, dark, or system.
- Each option has an accessible name.
- Changing the theme does not move focus unexpectedly.

## Follow-On Pages

- [[homepage]]
- [[quickstart]]
- [[how-to]]

# Mobile And Responsive Functional Requirements

## Website.Mobile.CoreUseCases

Tag: `Website.Mobile.CoreUseCases`

Gist: Keep the website usable on mobile for core docs and setup workflows.

Ambition: Mobile visitors can understand the product, navigate docs, inspect
examples, copy commands, and reach VS Code extension setup without layout
failure.

Scale: Percentage of required mobile use cases completed on representative
mobile viewport widths without horizontal page overflow, clipped controls, or
overlapping text.

Required mobile use cases:

- identify product name and category on homepage
- open primary navigation
- reach quickstart
- reach VS Code extension instructions
- reach the Visual Studio Marketplace link
- read a how-to page
- inspect a code or command block
- use a copy command control
- switch theme mode
- reach footer attribution links

Meter: Test the production build at representative mobile viewport widths. For
each required use case, complete the action using touch or keyboard simulation
and inspect for layout overflow, clipping, or overlap.

Fail: Any required mobile use case cannot be completed or has layout overflow,
clipped controls, or overlapping text.

Goal: 100% of required mobile use cases complete without layout overflow,
clipped controls, or overlapping text.

Stretch: Goal level plus no target used for core navigation or setup is smaller
than the chosen minimum touch target.

Wish: Stretch level plus mobile screenshots are captured in CI for homepage,
quickstart, and one how-to page.

Stakeholders: Mobile readers, search visitors, project maintainer.

Owner: Website implementation.

Source: [[requirements/user/accessibility-and-usability]], [[requirements/design/index]]

Open questions:

- Which viewport widths are the canonical acceptance fixtures?
- What touch target minimum should be adopted for the website?

## Website.Responsive.Navigation

Tag: `Website.Responsive.Navigation`

Gist: Adapt navigation to desktop and mobile without losing primary routes.

Ambition: Users can find the same primary destinations regardless of device
width.

Scale: Percentage of required primary navigation destinations reachable on
mobile and desktop.

Required destinations:

- Home
- Quickstart
- How-To
- Concepts
- Advanced Usage
- FAQ
- Visual Studio Marketplace
  - available through the homepage CTA or another prominent non-nav link
- GitHub repository
  - available through the homepage CTA or footer project links, not primary nav

Meter: Inspect production build at representative mobile and desktop viewports.
Count a destination as reachable when a keyboard user can navigate to it from
site navigation, the first-page primary action area, or footer project links.

Fail: Any required destination is unreachable on mobile or desktop.

Goal: 100% of required destinations are reachable on mobile and desktop.

Stretch: Goal level plus the active page or section is indicated on both
mobile and desktop.

Wish: Stretch level plus the mobile nav can be closed by Escape and by choosing
a destination.

Stakeholders: All website visitors, keyboard users.

Owner: Website implementation.

Source: [[requirements/design/index]], [[requirements/user/accessibility-and-usability]]

Open questions:

- Should Visual Studio Marketplace be a primary nav item, secondary nav item,
  or CTA-only link?

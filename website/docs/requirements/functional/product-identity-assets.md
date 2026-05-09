# Product Identity Asset Functional Requirements

## Website.BrandAssets.LogoUse

Tag: `Website.BrandAssets.LogoUse`

Gist: Use existing Flavor Grenade product logos and icons effectively.

Ambition: The website should feel like the official project surface without
creating duplicate or inconsistent brand assets.

Scale: Percentage of required product identity placements that use an existing
Flavor Grenade logo or icon asset.

Required placements:

- site header or navigation
- homepage hero or identity area
- footer or project metadata area
- social preview image or source asset for one

Available source assets include:

- `docs/assets/flavor-grenade-lsp-logo-light.png`
- `docs/assets/flavor-grenade-lsp-logo-dark.png`
- `docs/assets/flavor-grenade-lsp-icon-light.png`
- `docs/assets/flavor-grenade-lsp-icon-dark.png`
- `extension/images/icon.png`

Meter: Inspect the production build and source assets. Count a placement as
satisfied when it uses an existing Flavor Grenade asset or a documented
derivative generated from one.

Fail: Any required placement is missing product identity, uses an unrelated
asset, or renders as a broken image.

Goal: 100% of required placements use existing Flavor Grenade logo/icon assets
or documented derivatives.

Stretch: Goal level plus light and dark themes each use an asset variant with
appropriate contrast.

Wish: Stretch level plus social preview metadata uses a generated image that
includes the product logo and a concise product label.

Stakeholders: Search visitors, users sharing links, project maintainer.

Owner: Website implementation.

Source: [[requirements/design/index]], `DESIGN.md`

Open questions:

- Which logo variant is canonical for the website header?
- Should social previews reuse an existing logo image or generate a dedicated
  preview asset?

## Website.BrandAssets.RenderReliability

Tag: `Website.BrandAssets.RenderReliability`

Gist: Product identity and proof images must resolve correctly in development
and production builds.

Ambition: The website should never show broken-image indicators in core brand
or product-proof regions.

Scale: Percentage of required image regions that resolve to loadable assets.

Required image regions:

- header product icon or logo
- footer product icon or logo
- homepage product proof screenshot or demo image

Meter: Run the Vite dev server and production build preview, inspect the
homepage at mobile and desktop widths, and verify that every required image
region loads without a broken-image indicator.

Fail: Any required image region shows missing alt text as visible fallback,
browser broken-image UI, a zero-size image, or a request failure.

Goal: 100% of required image regions resolve in development and production
builds.

Stretch: Goal level plus automated tests verify that asset URLs are generated
through Vite-compatible imports.

Wish: Stretch level plus browser tests assert natural image dimensions after
render.

Stakeholders: Website visitors, project maintainer, search visitors.

Owner: Website implementation.

Source: [[requirements/design/index]], browser review feedback from 2026-05-09.

Open questions:

- Should proof screenshots remain sourced from extension marketplace assets or
  move into website-owned public assets?

## Website.BrandAssets.AccessibleText

Tag: `Website.BrandAssets.AccessibleText`

Gist: Ensure product logos and screenshots have useful accessible text.

Ambition: Product identity and visual evidence should not hide meaning from
screen-reader users or users with images disabled.

Scale: Percentage of in-scope product logo, icon, screenshot, and demo images
with meaningful `alt` text or deliberate decorative hiding.

Meter: Inspect generated HTML for all in-scope images. Count an image as
satisfied when it has useful alt text or is explicitly decorative and hidden
from assistive technology.

Fail: Any in-scope image has missing, generic, misleading, or redundant alt
text.

Goal: 100% of in-scope images have useful alt text or deliberate decorative
hiding.

Stretch: Goal level plus screenshots describe the product state shown, not only
the file name.

Wish: Stretch level plus visual demos have nearby text explaining the same
workflow.

Stakeholders: Screen-reader users, no-image users, search visitors.

Owner: Website implementation.

Source: [[requirements/user/accessibility-and-usability]], [[requirements/design/index]]

Open questions:

- Which screenshots are decorative, and which communicate essential product
  behavior?

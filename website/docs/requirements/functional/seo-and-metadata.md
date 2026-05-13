# SEO And Metadata Functional Requirements

## Website.Metadata.PageBasics

Tag: `Website.Metadata.PageBasics`

Gist: Provide basic search metadata for every public page.

Ambition: Search visitors and link previews see accurate page-specific
summaries instead of generic site text.

Scale: Percentage of public pages with one H1, unique title, unique
description, and canonical URL.

Meter: Inspect generated HTML for every route in the sitemap.

Fail: Any public page lacks one of the required metadata basics or has duplicate
title/description text where uniqueness is expected.

Goal: 100% of public pages have one H1, unique title, unique description, and
canonical URL.

Stretch: Goal level plus homepage includes Open Graph and Twitter preview
metadata.

Wish: Stretch level plus all major public pages include page-appropriate Open
Graph metadata.

Stakeholders: Search visitors, maintainers, people sharing links.

Owner: Website implementation.

Source: [[website/docs/requirements/user/seo-discovery]], [[website/docs/requirements/technical/index]]

Open questions:

- Which pages beyond the homepage require custom social preview images?

## Website.StructuredData.RequiredTypes

Tag: `Website.StructuredData.RequiredTypes`

Gist: Add structured data for the public docs site where page intent supports
it.

Ambition: Search engines can identify the site, software project, FAQ content,
how-to content, and docs hierarchy.

Scale: Percentage of required JSON-LD schema types present on at least one
appropriate public page.

Required schema types:

- WebSite
- SoftwareApplication
- FAQPage
- HowTo
- BreadcrumbList

Meter: Inspect generated HTML for JSON-LD script blocks and validate that each
required schema type appears on an appropriate page.

Fail: Less than 100% of required schema types are present on appropriate pages.

Goal: 100% of required schema types are present on appropriate pages.

Stretch: Goal level plus JSON-LD content matches visible page content.

Wish: Stretch level plus JSON-LD validates with the chosen schema validation
tool in CI.

Stakeholders: Search visitors, maintainers.

Owner: Website implementation.

Source: [[website/docs/requirements/user/seo-discovery]], [[website/docs/requirements/technical/index]]

Open questions:

- Which schema validation tool should become the acceptance meter in CI?

## Website.Indexing.SitemapRobots

Tag: `Website.Indexing.SitemapRobots`

Gist: Generate or maintain crawl discovery files for the public website.

Ambition: Search engines can discover public routes intentionally and avoid
depending on incidental links.

Scale: Presence and correctness of `robots.txt` and `sitemap.xml` in the
published static output.

Meter: Inspect the production output directory and deployed preview. Verify
that `robots.txt` exists, allows public crawling, and points to `sitemap.xml`.
Verify that `sitemap.xml` lists all public pages intended for indexing.

Fail: Either `robots.txt` or `sitemap.xml` is missing from published output.

Goal: Both files exist, and `sitemap.xml` lists 100% of public pages intended
for indexing.

Stretch: Goal level plus sitemap URLs use the correct GitHub Pages base path or
custom domain.

Wish: Stretch level plus sitemap `lastmod` values are generated from source or
build metadata.

Stakeholders: Search visitors, maintainers.

Owner: Website implementation.

Source: [[website/docs/requirements/user/seo-discovery]], [[website/docs/requirements/technical/index]]

Open questions:

- Will the published site use a custom domain or repository subpath?
- Should sitemap dates be source-based, build-based, or omitted?

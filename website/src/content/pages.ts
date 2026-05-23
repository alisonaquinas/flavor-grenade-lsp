import { websitePagesGenerated } from './generated/pages.generated';
import { validatePublicLinks, type PublicLink } from './links';
import type { RouteId, WebsiteRoute } from './routes';

/** Link from a hub section to a public guide article. */
export interface WebsiteArticleLink {
  routeId: RouteId;
  title: string;
  description: string;
}

/** A short section of public page content. */
export interface WebsitePageSection {
  heading: string;
  body: string;
  items?: string[];
  steps?: Array<{
    title: string;
    body: string;
  }>;
  code?: string;
  articleLinks?: WebsiteArticleLink[];
}

/** Typed content record used by the static website route renderer. */
export interface WebsitePageContent {
  routeId: RouteId;
  summary: string;
  sections: WebsitePageSection[];
  links: PublicLink[];
}

/** Generated public page content records consumed by the renderer facade. */
export const websitePages = websitePagesGenerated as readonly WebsitePageContent[];

/** Finds the public content record for a route ID. */
export function getWebsitePage(routeId: RouteId): WebsitePageContent {
  const pageRecord = websitePages.find((candidate) => candidate.routeId === routeId);

  if (!pageRecord) {
    throw new Error(`Unknown website page: ${routeId}`);
  }

  return pageRecord;
}

/** Finds the public content record for a browser path, falling back to home. */
export function getWebsitePageByPath(
  pathname: string,
  routes: readonly WebsiteRoute[],
): WebsitePageContent {
  const routeRecord = routes.find((route) => route.path === pathname);

  return getWebsitePage(routeRecord?.id ?? 'home');
}

/** Returns validation messages for content records and their public links. */
export function validateWebsitePages(
  pages: readonly WebsitePageContent[],
  routes: readonly WebsiteRoute[],
): string[] {
  const messages: string[] = [];
  const routeIds = new Set(routes.map((route) => route.id));
  const pageIds = new Set<RouteId>();

  for (const pageRecord of pages) {
    if (pageIds.has(pageRecord.routeId)) {
      messages.push(`${pageRecord.routeId} has duplicate content records.`);
    }
    pageIds.add(pageRecord.routeId);

    if (!routeIds.has(pageRecord.routeId)) {
      messages.push(`${pageRecord.routeId} content has no matching route.`);
    }

    if (!pageRecord.summary.trim()) {
      messages.push(`${pageRecord.routeId} is missing summary.`);
    }

    if (pageRecord.sections.length === 0) {
      messages.push(`${pageRecord.routeId} has no content sections.`);
    }

    for (const section of pageRecord.sections) {
      if (!section.heading.trim() || !section.body.trim()) {
        messages.push(`${pageRecord.routeId} has an incomplete content section.`);
      }

      for (const article of section.articleLinks ?? []) {
        if (!routeIds.has(article.routeId)) {
          messages.push(`${pageRecord.routeId} links unknown article route ${article.routeId}.`);
        }
      }
    }

    if (pageRecord.links.length === 0) {
      messages.push(`${pageRecord.routeId} has no public links.`);
    }

    messages.push(...validatePublicLinks(pageRecord.links, routes));
  }

  for (const routeRecord of routes) {
    if (!pageIds.has(routeRecord.id)) {
      messages.push(`${routeRecord.id} is missing content.`);
    }
  }

  return messages;
}

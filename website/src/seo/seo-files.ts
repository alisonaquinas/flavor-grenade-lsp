import type { WebsitePageContent } from '../content/pages';
import { getRouteById, siteBaseUrl, type WebsiteRoute } from '../content/routes';

/** Generic JSON-LD object emitted by the website SEO skeleton. */
export type JsonLdEntry = Record<string, unknown> & {
  '@context': 'https://schema.org';
  '@type': string;
};

interface JsonLdListItem {
  '@type': 'ListItem';
  item: string;
  name: string;
  position: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Generates the sitemap XML for all public website routes. */
export function generateSitemap(routes: readonly WebsiteRoute[]): string {
  const urls = routes
    .map((route) => `  <url>\n    <loc>${escapeXml(route.canonicalUrl)}</loc>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Generates robots.txt content that allows public crawling and points at the sitemap. */
export function generateRobotsTxt(siteMapUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteMapUrl}\n`;
}

/** Returns static homepage Open Graph and Twitter metadata. */
export function getHomeMetadata(): Record<string, string> {
  const home = getRouteById('home');

  return {
    'og:type': 'website',
    'og:site_name': 'Flavor Grenade LSP',
    'og:title': home.seo.openGraphTitle,
    'og:description': home.seo.openGraphDescription,
    'og:url': home.canonicalUrl,
    'twitter:card': 'summary_large_image',
    'twitter:title': home.seo.twitterTitle,
    'twitter:description': home.seo.twitterDescription,
  };
}

/** Returns the absolute social preview image URL used by Open Graph and Twitter cards. */
export function getSocialImageUrl(): string {
  return `${siteBaseUrl}/assets/flavor-grenade-lsp-icon-097debba.png`;
}

/** Serializes controlled JSON-LD for safe insertion into a script tag. */
export function serializeJsonLd(entries: readonly JsonLdEntry[]): string {
  const payload = entries.length === 1 ? entries[0] : entries;

  return JSON.stringify(payload).replace(/</g, '\\u003c');
}

/** Generates page-appropriate JSON-LD for one public route. */
export function generateJsonLdForRoute(
  route: WebsiteRoute,
  routes: readonly WebsiteRoute[],
  pages: readonly WebsitePageContent[],
): JsonLdEntry[] {
  const page = pages.find((candidate) => candidate.routeId === route.id);
  const entries: JsonLdEntry[] = [];

  if (route.id === 'home') {
    entries.push(generateWebsiteJsonLd(route), generateSoftwareApplicationJsonLd(route));
  }

  if (route.pageType === 'faq' && page) {
    entries.push(generateFaqJsonLd(route, page));
  }

  if (route.pageType === 'how-to' && page) {
    entries.push(generateHowToJsonLd(route, page));
  }

  entries.push(generateBreadcrumbJsonLd(route, routes));

  return entries;
}

function generateWebsiteJsonLd(home: WebsiteRoute): JsonLdEntry {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Flavor Grenade LSP',
    url: siteBaseUrl,
    description: home.description,
  };
}

function generateSoftwareApplicationJsonLd(home: WebsiteRoute): JsonLdEntry {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Flavor Grenade LSP',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Windows, macOS, Linux',
    url: home.canonicalUrl,
    image: getSocialImageUrl(),
    description: home.description,
  };
}

function generateFaqJsonLd(route: WebsiteRoute, page: WebsitePageContent): JsonLdEntry {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: route.h1,
    mainEntity: page.sections.map((section) => ({
      '@type': 'Question',
      name: section.heading,
      acceptedAnswer: {
        '@type': 'Answer',
        text: section.body,
      },
    })),
  };
}

function generateHowToJsonLd(route: WebsiteRoute, page: WebsitePageContent): JsonLdEntry {
  const steps = page.sections.flatMap((section, sectionIndex) => {
    if (section.steps?.length) {
      return section.steps.map((step, stepIndex) => ({
        '@type': 'HowToStep',
        position: stepIndex + 1,
        name: step.title,
        text: step.body,
      }));
    }

    return [
      {
        '@type': 'HowToStep',
        position: sectionIndex + 1,
        name: section.heading,
        text: section.body,
      },
    ];
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: route.h1,
    description: route.description,
    step: steps,
  };
}

function generateBreadcrumbJsonLd(
  route: WebsiteRoute,
  routes: readonly WebsiteRoute[],
): JsonLdEntry {
  const items: JsonLdListItem[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: getRouteById('home').h1,
      item: getRouteById('home').canonicalUrl,
    },
  ];

  if (route.id !== 'home') {
    const groupRoute = routes.find(
      (candidate) => candidate.id !== route.id && candidate.group === route.group && !candidate.isArticle,
    );

    if (groupRoute && groupRoute.id !== 'home') {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: groupRoute.h1,
        item: groupRoute.canonicalUrl,
      });
    }

    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: route.h1,
      item: route.canonicalUrl,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/** Generates the initial JSON-LD graph required by the website SEO requirements. */
export function generateJsonLd(
  routes: readonly WebsiteRoute[],
  pages: readonly WebsitePageContent[],
): JsonLdEntry[] {
  const home = getRouteById('home');
  const faq = getRouteById('faq');
  const firstHowTo = routes.find((route) => route.pageType === 'how-to');

  return [
    ...generateJsonLdForRoute(home, routes, pages).filter((entry) =>
      ['WebSite', 'SoftwareApplication'].includes(entry['@type']),
    ),
    ...generateJsonLdForRoute(faq, routes, pages).filter((entry) => entry['@type'] === 'FAQPage'),
    ...(firstHowTo
      ? generateJsonLdForRoute(firstHowTo, routes, pages).filter((entry) => entry['@type'] === 'HowTo')
      : []),
    generateBreadcrumbJsonLd(home, routes),
  ];
}

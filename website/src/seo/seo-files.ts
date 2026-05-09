import type { WebsitePageContent } from '../content/pages';
import { getRouteById, siteBaseUrl, type WebsiteRoute } from '../content/routes';

/** Generic JSON-LD object emitted by the website SEO skeleton. */
export type JsonLdEntry = Record<string, unknown> & {
  '@context': 'https://schema.org';
  '@type': string;
};

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

/** Generates the initial JSON-LD graph required by the website SEO requirements. */
export function generateJsonLd(
  routes: readonly WebsiteRoute[],
  pages: readonly WebsitePageContent[],
): JsonLdEntry[] {
  const home = getRouteById('home');
  const faq = getRouteById('faq');
  const howToRoutes = routes.filter((route) => route.pageType === 'how-to');
  const breadcrumbItems = routes.slice(0, 6).map((route, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: route.h1,
    item: route.canonicalUrl,
  }));
  const faqPage = pages.find((page) => page.routeId === 'faq');

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Flavor Grenade LSP',
      url: siteBaseUrl,
      description: home.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Flavor Grenade LSP',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Windows, macOS, Linux',
      url: home.canonicalUrl,
      description: home.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: faq.h1,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faqPage?.summary ?? faq.description,
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Use Flavor Grenade LSP with an Obsidian Vault',
      step: howToRoutes.map((route, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: route.h1,
        url: route.canonicalUrl,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    },
  ];
}

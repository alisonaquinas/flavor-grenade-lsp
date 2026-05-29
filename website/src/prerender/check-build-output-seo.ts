import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { websiteRoutes } from '../content/routes';

const websiteRoot = fileURLToPath(new URL('../..', import.meta.url));
const distRoot = join(websiteRoot, 'dist');

function routeHtmlPath(routePath: string): string {
  if (routePath === '/') {
    return join(distRoot, 'index.html');
  }

  return join(distRoot, routePath.replace(/^\/+/, ''), 'index.html');
}

function visibleWordCount(html: string): number {
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return visibleText ? visibleText.split(' ').length : 0;
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const assetName of ['favicon.ico', 'favicon.png', 'apple-touch-icon.png']) {
  assert(existsSync(join(distRoot, assetName)), `Missing SEO icon asset: ${assetName}`);
}

const robots = await readFile(join(distRoot, 'robots.txt'), 'utf8');
const sitemap = await readFile(join(distRoot, 'sitemap.xml'), 'utf8');

assert(
  robots.includes('Sitemap: https://flavor-grenade.dev/sitemap.xml'),
  'robots.txt must point to the production sitemap.',
);
assert(
  !sitemap.includes('alisonaquinas.github.io'),
  'sitemap.xml must not use the old GitHub Pages canonical host.',
);

for (const route of websiteRoutes) {
  const html = await readFile(routeHtmlPath(route.path), 'utf8');
  const h1Count = html.match(/<h1\b/g)?.length ?? 0;

  assert(h1Count === 1, `${route.id} must prerender exactly one H1.`);
  assert(html.includes(`<title>${route.title}</title>`), `${route.id} must prerender its title.`);
  assert(
    new RegExp(
      `<meta name="description" content="${escapeRegExp(route.description)}"\\s*/?>`,
    ).test(html),
    `${route.id} must prerender its meta description.`,
  );
  assert(
    new RegExp(`<link rel="canonical" href="${escapeRegExp(route.canonicalUrl)}"\\s*/?>`).test(
      html,
    ),
    `${route.id} must prerender its canonical URL.`,
  );
  assert(
    route.canonicalUrl.startsWith('https://flavor-grenade.dev'),
    `${route.id} must use the production canonical host.`,
  );
  assert(visibleWordCount(html) > 120, `${route.id} must prerender visible body content.`);
  assert(
    html.includes('<script type="application/ld+json">'),
    `${route.id} must prerender JSON-LD.`,
  );
}

const homeHtml = await readFile(join(distRoot, 'index.html'), 'utf8');
const homeSectionHeadingCount = homeHtml.match(/<h[23]\b/g)?.length ?? 0;

assert(homeSectionHeadingCount >= 3, 'Homepage must prerender multiple H2/H3 sections.');
assert(visibleWordCount(homeHtml) > 500, 'Homepage must prerender substantial visible content.');
assert(homeHtml.includes('"@type":"WebSite"'), 'Homepage JSON-LD must include WebSite.');
assert(
  homeHtml.includes('"@type":"SoftwareApplication"'),
  'Homepage JSON-LD must include SoftwareApplication.',
);

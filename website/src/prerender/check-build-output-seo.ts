import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { websiteRoutes } from '../content/routes';

const websiteRoot = fileURLToPath(new URL('../..', import.meta.url));
const distRoot = join(websiteRoot, 'dist');
const productionOrigin = 'https://flavor-grenade.dev';

function routeHtmlPath(routePath: string): string {
  if (routePath === '/') {
    return join(distRoot, 'index.html');
  }

  return join(distRoot, routePath.replace(/^\/+/, ''), 'index.html');
}

function visibleWordCount(html: string): number {
  const visibleText = visibleTextFromHtml(html).replace(/\s+/g, ' ').trim();

  return visibleText ? visibleText.split(' ').length : 0;
}

function sitemapLocUrls(xml: string): URL[] {
  const locations = extractElementText(xml, 'loc');

  return locations.map((location) => {
    assert(location, 'sitemap.xml contains an empty <loc> entry.');

    return new URL(location);
  });
}

function visibleTextFromHtml(html: string): string {
  let output = '';
  let index = 0;

  while (index < html.length) {
    const nextTagStart = html.indexOf('<', index);

    if (nextTagStart === -1) {
      output += html.slice(index);
      break;
    }

    output += html.slice(index, nextTagStart);

    if (startsWithTagName(html, nextTagStart, 'script')) {
      index = afterClosingTag(html, nextTagStart, 'script');
    } else if (startsWithTagName(html, nextTagStart, 'style')) {
      index = afterClosingTag(html, nextTagStart, 'style');
    } else {
      const tagEnd = html.indexOf('>', nextTagStart);
      index = tagEnd === -1 ? html.length : tagEnd + 1;
    }
  }

  return decodeBasicHtmlEntities(output);
}

function startsWithTagName(html: string, tagStart: number, tagName: string): boolean {
  const prefix = html.slice(tagStart + 1, tagStart + 1 + tagName.length).toLowerCase();
  const nextCharacter = html[tagStart + 1 + tagName.length];

  return (
    prefix === tagName &&
    (nextCharacter === undefined ||
      nextCharacter === '>' ||
      nextCharacter === '/' ||
      /\s/.test(nextCharacter))
  );
}

function afterClosingTag(html: string, tagStart: number, tagName: string): number {
  const lowerHtml = html.toLowerCase();
  const closingTag = `</${tagName}`;
  const closingTagStart = lowerHtml.indexOf(closingTag, tagStart);

  if (closingTagStart === -1) {
    return html.length;
  }

  const closingTagEnd = lowerHtml.indexOf('>', closingTagStart);

  return closingTagEnd === -1 ? html.length : closingTagEnd + 1;
}

function decodeBasicHtmlEntities(value: string): string {
  return value
    .split('&nbsp;')
    .join(' ')
    .split('&amp;')
    .join('&')
    .split('&lt;')
    .join('<')
    .split('&gt;')
    .join('>')
    .split('&quot;')
    .join('"')
    .split('&#39;')
    .join("'");
}

function extractElementText(xml: string, elementName: string): string[] {
  const values: string[] = [];
  let searchFrom = 0;
  const startTag = `<${elementName}>`;
  const endTag = `</${elementName}>`;

  while (searchFrom < xml.length) {
    const start = xml.indexOf(startTag, searchFrom);

    if (start === -1) {
      break;
    }

    const textStart = start + startTag.length;
    const end = xml.indexOf(endTag, textStart);

    if (end === -1) {
      break;
    }

    values.push(decodeBasicHtmlEntities(xml.slice(textStart, end).trim()));
    searchFrom = end + endTag.length;
  }

  return values;
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
const sitemapUrls = sitemapLocUrls(sitemap);

assert(
  robots.includes('Sitemap: https://flavor-grenade.dev/sitemap.xml'),
  'robots.txt must point to the production sitemap.',
);
assert(
  sitemapUrls.every((url) => url.origin === productionOrigin),
  'sitemap.xml must only use the production canonical host.',
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
    new URL(route.canonicalUrl).origin === productionOrigin,
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

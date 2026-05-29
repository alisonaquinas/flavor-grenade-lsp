import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { websitePages } from '../content/pages';
import { websiteRoutes } from '../content/routes';
import { generateJsonLdForRoute, serializeJsonLd } from '../seo/seo-files';

interface ServerRenderer {
  renderRoute: (initialPath: string) => {
    head: string;
    html: string;
  };
}

const websiteRoot = fileURLToPath(new URL('../..', import.meta.url));
const distRoot = join(websiteRoot, 'dist');
const templatePath = join(distRoot, 'index.html');
const serverEntryPath = join(distRoot, 'server', 'entry-server.js');

function outputPathForRoute(routePath: string): string {
  if (routePath === '/') {
    return templatePath;
  }

  return join(distRoot, routePath.replace(/^\/+/, ''), 'index.html');
}

function renderHtmlDocument(template: string, head: string, html: string): string {
  return template
    .replace('</head>', `${head}\n  </head>`)
    .replace(/<div id="app"><\/div>/, `<div id="app">${html}</div>`);
}

const template = await readFile(templatePath, 'utf8');
const serverModule = (await import(pathToFileURL(serverEntryPath).href)) as ServerRenderer;

for (const route of websiteRoutes) {
  const rendered = serverModule.renderRoute(route.path);
  const jsonLd = serializeJsonLd(generateJsonLdForRoute(route, websiteRoutes, websitePages));
  const head = `${rendered.head}<script type="application/ld+json">${jsonLd}</script>`;
  const outputPath = outputPathForRoute(route.path);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderHtmlDocument(template, head, rendered.html));
}

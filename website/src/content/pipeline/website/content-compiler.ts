import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { outboundLink, routeLink, type PublicLink } from '../../links';
import { guideArticleGroups, type RouteId, type WebsiteRoute } from '../../routes';
import { createSourceTrace, parseMarkdown, renderMarkdownHtml, type CommonloomDiagnostic } from '../commonloom';
import type { WebsiteCompiledContent, WebsiteGeneratedMediaRecord } from './adapter';
import {
  frontmatterLinks,
  relatedRouteIds,
  websitePageFrontmatterSchema,
  type WebsitePageFrontmatter,
} from './frontmatter';
import type { PageGroupManifest } from './manifest';
import { deriveWebsiteSections } from './sections';

export interface CompileWebsiteContentInput {
  copyRoot: string;
  manifests: readonly PageGroupManifest[];
  routes: readonly WebsiteRoute[];
}

export interface CompileWebsiteContentResult {
  records: WebsiteCompiledContent;
  diagnostics: CommonloomDiagnostic[];
}

const marketplaceLink = outboundLink(
  'https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp',
  'Flavor Grenade LSP on the Visual Studio Marketplace',
);
const githubLink = outboundLink(
  'https://github.com/alisonaquinas/flavor-grenade-lsp',
  'Flavor Grenade LSP GitHub repository',
);
const obsidianLink = outboundLink('https://obsidian.md', 'Obsidian');
const marksmanLink = outboundLink('https://github.com/artempyanykh/marksman', 'Marksman LSP');
const karpathyLink = outboundLink(
  'https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f',
  "Karpathy's LLM Wiki concept",
);

const fallbackPageLinks: Partial<Record<RouteId, PublicLink[]>> = {
  home: [routeLink('quickstart', 'Read the quickstart'), githubLink],
  quickstart: [routeLink('howToVsCodeExtension', 'Use the VS Code extension'), marketplaceLink],
  howToVsCodeExtension: [marketplaceLink, routeLink('quickstart', 'Back to quickstart')],
  conceptInspirationPriorArt: [karpathyLink, obsidianLink, marksmanLink],
  conceptObsidianFlavoredMarkdown: [obsidianLink, routeLink('conceptWikiLinkResolution', 'Understand wiki-link resolution')],
  concepts: [karpathyLink, obsidianLink, marksmanLink],
};

export async function compileWebsiteContentFromManifests(
  input: CompileWebsiteContentInput,
): Promise<CompileWebsiteContentResult> {
  const diagnostics: CommonloomDiagnostic[] = [];
  const routesById = new Map(input.routes.map((route) => [route.id, route]));
  const pages = [];
  const media: WebsiteGeneratedMediaRecord[] = [];

  for (const manifest of input.manifests) {
    for (const entry of [...manifest.entries].sort((left, right) => (left.order ?? 0) - (right.order ?? 0))) {
      const route = routesById.get(entry.routeId as RouteId);

      if (!route) {
        diagnostics.push({
          code: 'MANIFEST_INVALID',
          severity: 'error',
          message: `Unknown route id: ${entry.routeId}.`,
          sourcePath: manifest.manifestPath,
        });
        continue;
      }

      const markdownPath = join(input.copyRoot, entry.copy);
      const markdown = await readFile(markdownPath, 'utf8');
      const parsed = await parseMarkdown({
        sourcePath: entry.copy,
        markdown,
        frontmatterSchema: websitePageFrontmatterSchema,
      });
      const html = await renderMarkdownHtml({ parsed, allowHtml: true });
      const trace = createSourceTrace({
        markdownPath: entry.copy,
        manifestPath: manifest.manifestPath,
        markdown,
        parsed,
      });
      const frontmatter = parsed.frontmatter as WebsitePageFrontmatter | undefined;

      diagnostics.push(...parsed.diagnostics, ...html.diagnostics);

      if (!frontmatter) {
        continue;
      }

      const links = pageLinks(route.id, frontmatter, routesById);

      pages.push({
        routeId: route.id,
        summary: frontmatter.summary ?? route.description,
        bodyHtml: html.bodyHtml,
        sections: deriveWebsiteSections({
          tree: parsed.mdast,
          markdown: parsed.bodyMarkdown,
          routes: input.routes,
        }),
        links,
        sourceTrace: trace,
      });

      media.push(
        ...trace.images.map((image) => ({
          ...image,
          pageRouteId: route.id,
        })),
      );
    }
  }

  return {
    records: {
      pages,
      routes: [...input.routes],
      navigation: guideArticleGroups.map((group) => ({
        id: group.hubRouteId,
        label: group.label,
        routeIds: [...group.routeIds],
      })),
      media,
    },
    diagnostics,
  };
}

function pageLinks(
  routeId: RouteId,
  frontmatter: WebsitePageFrontmatter,
  routesById: Map<RouteId, WebsiteRoute>,
): PublicLink[] {
  const declaredLinks = frontmatterLinks(frontmatter);

  if (declaredLinks.length > 0) {
    return declaredLinks;
  }

  return [
    ...(fallbackPageLinks[routeId] ?? []),
    ...relatedRouteIds(frontmatter)
      .filter((relatedRouteId) => routesById.has(relatedRouteId))
      .map((relatedRouteId) => routeLink(relatedRouteId, routesById.get(relatedRouteId)?.h1 ?? relatedRouteId)),
  ];
}

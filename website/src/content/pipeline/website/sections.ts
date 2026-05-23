import type { Heading, List, ListItem, Nodes, Paragraph, Root } from 'mdast';

import type { WebsiteArticleLink, WebsitePageSection } from '../../pages';
import type { WebsiteRoute } from '../../routes';

export interface DeriveWebsiteSectionsInput {
  tree: Root;
  markdown: string;
  routes: readonly WebsiteRoute[];
}

export function deriveWebsiteSections(input: DeriveWebsiteSectionsInput): WebsitePageSection[] {
  const sections: WebsitePageSection[] = [];
  const routeByPath = new Map(input.routes.map((route) => [route.path, route]));
  const nodes = input.tree.children;

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];

    if (!isHeading(node, 2)) {
      continue;
    }

    const sectionNodes: Nodes[] = [];

    for (let sectionIndex = index + 1; sectionIndex < nodes.length; sectionIndex += 1) {
      const candidate = nodes[sectionIndex];

      if (isHeading(candidate, 2)) {
        break;
      }

      sectionNodes.push(candidate);
    }

    sections.push(deriveSection(node, sectionNodes, input.markdown, routeByPath));
  }

  return sections;
}

function deriveSection(
  heading: Heading,
  nodes: Nodes[],
  markdown: string,
  routeByPath: Map<string, WebsiteRoute>,
): WebsitePageSection {
  const bodyBlocks: string[] = [];
  const items: string[] = [];
  const articleLinks: WebsiteArticleLink[] = [];
  const steps: NonNullable<WebsitePageSection['steps']> = [];
  const codeBlocks: string[] = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];

    if (node.type === 'paragraph') {
      bodyBlocks.push(sliceMarkdown(node, markdown));
      continue;
    }

    if (node.type === 'list') {
      const derivedList = deriveList(node, markdown, routeByPath);
      items.push(...derivedList.items);
      articleLinks.push(...derivedList.articleLinks);
      continue;
    }

    if (node.type === 'heading' && node.depth === 3) {
      const stepNodes: Nodes[] = [];

      for (let stepIndex = index + 1; stepIndex < nodes.length; stepIndex += 1) {
        const candidate = nodes[stepIndex];

        if (candidate.type === 'heading' && (candidate.depth === 2 || candidate.depth === 3)) {
          break;
        }

        stepNodes.push(candidate);
      }

      steps.push({
        title: inlineText(node),
        body: stepNodes
          .filter((candidate): candidate is Paragraph => candidate.type === 'paragraph')
          .map((candidate) => sliceMarkdown(candidate, markdown))
          .join('\n\n'),
      });
      continue;
    }

    if (node.type === 'code') {
      codeBlocks.push(node.value);
    }
  }

  return {
    heading: inlineText(heading),
    body: bodyBlocks.join('\n\n'),
    ...(items.length > 0 ? { items } : {}),
    ...(steps.length > 0 ? { steps } : {}),
    ...(codeBlocks.length > 0 ? { code: codeBlocks.join('\n\n') } : {}),
    ...(articleLinks.length > 0 ? { articleLinks } : {}),
  };
}

function deriveList(
  list: List,
  markdown: string,
  routeByPath: Map<string, WebsiteRoute>,
): { items: string[]; articleLinks: WebsiteArticleLink[] } {
  const items: string[] = [];
  const articleLinks: WebsiteArticleLink[] = [];

  for (const child of list.children) {
    const rawItem = sliceMarkdown(child, markdown).replace(/^\s*[-*+]\s+/, '').trim();
    const articleLink = articleLinkFromRawItem(rawItem, routeByPath);

    if (articleLink) {
      articleLinks.push(articleLink);
    } else {
      items.push(rawItem);
    }
  }

  return { items, articleLinks };
}

function articleLinkFromRawItem(
  rawItem: string,
  routeByPath: Map<string, WebsiteRoute>,
): WebsiteArticleLink | undefined {
  const match = /^\[([^\]]+)\]\((\/[^)]+\/)\)\s+-\s+(.+)$/.exec(rawItem);

  if (!match?.[2]) {
    return undefined;
  }

  const route = routeByPath.get(match[2]);

  if (!route) {
    return undefined;
  }

  return {
    routeId: route.id,
    title: route.h1,
    description: route.description,
  };
}

function inlineText(node: Heading): string {
  return node.children
    .map((child) => ('value' in child && typeof child.value === 'string' ? child.value : ''))
    .join('')
    .trim();
}

function sliceMarkdown(node: Nodes | ListItem, markdown: string): string {
  if (!node.position) {
    return '';
  }

  const lines = markdown.split(/\r?\n/);
  const startLine = node.position.start.line - 1;
  const endLine = node.position.end.line - 1;
  const selectedLines = lines.slice(startLine, endLine + 1);

  if (selectedLines.length === 0) {
    return '';
  }

  selectedLines[0] = selectedLines[0].slice(node.position.start.column - 1);
  selectedLines[selectedLines.length - 1] = selectedLines[selectedLines.length - 1].slice(
    0,
    node.position.end.column - 1,
  );

  return selectedLines.join('\n').trim();
}

function isHeading(node: Nodes | undefined, depth: number): node is Heading {
  return node?.type === 'heading' && node.depth === depth;
}

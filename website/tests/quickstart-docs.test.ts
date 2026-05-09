import { describe, expect, it } from 'vitest';

import { websitePages } from '../src/content/pages';
import type { RouteId } from '../src/content/routes';

interface RichSectionShape {
  heading: string;
  body: string;
  items?: string[];
  steps?: Array<{
    title: string;
    body: string;
  }>;
  code?: string;
}

function pageText(routeId: RouteId): string {
  const page = websitePages.find((candidate) => candidate.routeId === routeId);

  if (!page) {
    throw new Error(`Missing page ${routeId}`);
  }

  return [
    page.summary,
    ...page.sections.flatMap((section: RichSectionShape) => [
      section.heading,
      section.body,
      ...(section.items ?? []),
      ...(section.steps ?? []).flatMap((step) => [step.title, step.body]),
      section.code ?? '',
    ]),
    ...page.links.map((link) => link.text),
  ].join('\n');
}

describe('quickstart and VS Code extension docs', () => {
  it('publishes the quickstart from prerequisites to first useful workflow', () => {
    const text = pageText('quickstart');

    expect(text).toContain('Prerequisites');
    expect(text).toContain('Visual Studio Marketplace');
    expect(text).toContain('Open an Obsidian Vault folder');
    expect(text).toContain('OFMarkdown');
    expect(text).toContain('[[Daily Note]]');
    expect(text).toContain('broken-link diagnostic');
    expect(text).toContain('Troubleshooting');
  });

  it('publishes the VS Code extension setup path clearly', () => {
    const text = pageText('howToVsCodeExtension');

    expect(text).toContain('Install from the Visual Studio Marketplace');
    expect(text).toContain('activation');
    expect(text).toContain('vault open');
    expect(text).toContain('server status');
    expect(text).toContain('extension packages the language server');
  });
});

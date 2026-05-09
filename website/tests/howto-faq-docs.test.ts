import { describe, expect, it } from 'vitest';

import { websitePages } from '../src/content/pages';
import { guideArticleGroups, type RouteId } from '../src/content/routes';

function page(routeId: RouteId) {
  const pageRecord = websitePages.find((candidate) => candidate.routeId === routeId);

  if (!pageRecord) {
    throw new Error(`Missing page ${routeId}`);
  }

  return pageRecord;
}

function text(routeId: RouteId): string {
  const pageRecord = page(routeId);

  return [
    pageRecord.summary,
    ...pageRecord.sections.flatMap((section) => [
      section.heading,
      section.body,
      ...(section.items ?? []),
      ...(section.steps ?? []).flatMap((step) => [step.title, step.body]),
      section.code ?? '',
    ]),
    ...pageRecord.links.map((link) => link.text),
  ].join('\n');
}

function paragraphCount(body: string): number {
  return body.split(/\n\s*\n/).filter((paragraph) => paragraph.trim().length > 0).length;
}

describe('how-to, advanced usage, and FAQ docs', () => {
  it('publishes a task-focused how-to index with required workflow groups', () => {
    const howTo = text('howTo');

    expect(howTo).toContain('Install and activate');
    expect(howTo).toContain('Complete wiki-links and headings');
    expect(howTo).toContain('Navigate notes, headings, blocks, embeds, and attachments');
    expect(howTo).toContain('Rename notes and headings safely');
    expect(howTo).toContain('Fix broken links with diagnostics and code actions');
  });

  it('gives each initial how-to page the required task shape', () => {
    const howToArticleIds =
      guideArticleGroups.find((group) => group.hubRouteId === 'howTo')?.routeIds ?? [];

    for (const routeId of howToArticleIds) {
      const pageText = text(routeId);

      expect(pageText).toContain('When to use it');
      expect(pageText).toContain('Steps');
      expect(pageText).toContain('Expected result');
      expect(pageText).toContain('Common failure mode');
      expect(page(routeId).sections.every((section) => paragraphCount(section.body) >= 1)).toBe(true);
      expect(page(routeId).links.some((link) => link.kind === 'route')).toBe(true);
    }
  });

  it('gives article sections enough prose depth for public docs', () => {
    const articleIds = guideArticleGroups.flatMap((group) => group.routeIds);

    for (const routeId of articleIds) {
      const article = page(routeId);
      const proseSectionCount = article.sections.filter(
        (section) => paragraphCount(section.body) >= 2,
      ).length;

      expect(proseSectionCount).toBeGreaterThanOrEqual(1);
      expect(text(routeId)).not.toMatch(/\bstub\b|\bplaceholder\b/i);
    }
  });

  it('publishes advanced usage boundaries and current behavior', () => {
    const advanced = text('advancedUsage');

    expect(advanced).toContain('Configuration model');
    expect(advanced).toContain('Vault mode and single-file mode');
    expect(advanced).toContain('Opaque regions');
    expect(advanced).toContain('Unsupported URI schemes');
    expect(advanced).toContain('Current behavior');
    expect(advanced).toContain('Planned behavior');
  });

  it('gives each advanced article a concrete boundary or configuration example', () => {
    const advancedArticleIds =
      guideArticleGroups.find((group) => group.hubRouteId === 'advancedUsage')?.routeIds ?? [];

    for (const routeId of advancedArticleIds) {
      const pageText = text(routeId);

      expect(page(routeId).sections.length).toBeGreaterThanOrEqual(3);
      expect(pageText).toMatch(/```|\.obsidian|\.flavor-grenade|rootUri|unsupported URI|opaque/i);
      expect(page(routeId).links.some((link) => link.kind === 'route')).toBe(true);
    }
  });

  it('publishes FAQ questions suitable for FAQPage metadata', () => {
    const faq = page('faq');

    expect(faq.sections.length).toBeGreaterThanOrEqual(8);
    expect(faq.sections.every((section) => section.heading.endsWith('?'))).toBe(true);
    expect(text('faq')).toContain('Is Flavor Grenade LSP an Obsidian plugin?');
    expect(text('faq')).toContain('How is it different from Marksman?');
    expect(text('faq')).toContain('Does it edit my vault automatically?');
  });
});

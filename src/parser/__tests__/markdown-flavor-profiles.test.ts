import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from '@jest/globals';
import {
  MARKDOWN_FLAVOR_IDS,
  MARKDOWN_FLAVOR_LABELS,
  MARKDOWN_FLAVOR_PROFILES,
  MARKDOWN_FLAVOR_SELECTIONS,
  getMarkdownFlavorProfile,
  isMarkdownFlavorId,
} from '../../markdown-flavor/index.js';

const explicitFlavorIds = [
  'original',
  'commonmark',
  'obsidian',
  'gfm',
  'glfm',
  'pandoc',
  'multimarkdown',
  'mdx',
  'kramdown',
  'markdown-extra',
  'r-markdown',
  'reddit',
  'stack-overflow',
] as const;

const expectedLabels = {
  auto: 'Auto Detect',
  original: 'Original Markdown',
  commonmark: 'CommonMark',
  obsidian: 'Obsidian',
  gfm: 'GitHub Flavored Markdown',
  glfm: 'GitLab Flavored Markdown',
  pandoc: 'Pandoc Markdown',
  multimarkdown: 'MultiMarkdown',
  mdx: 'MDX',
  kramdown: 'kramdown',
  'markdown-extra': 'Markdown Extra',
  'r-markdown': 'R Markdown',
  reddit: 'Reddit Markdown',
  'stack-overflow': 'Stack Overflow Markdown',
} as const;

const surfaceKeys = [
  'diagnostics',
  'completion',
  'navigation',
  'hover',
  'semanticTokens',
  'folding',
  'documentSymbols',
  'rename',
] as const;

const implementationTickets = new Map([
  ['original', 'TASK-315'],
  ['commonmark', 'TASK-318'],
  ['obsidian', 'TASK-321'],
  ['gfm', 'TASK-324'],
  ['glfm', 'TASK-327'],
  ['pandoc', 'TASK-330'],
  ['multimarkdown', 'TASK-333'],
  ['mdx', 'TASK-336'],
  ['kramdown', 'TASK-339'],
  ['markdown-extra', 'TASK-342'],
  ['r-markdown', 'TASK-345'],
  ['reddit', 'TASK-348'],
  ['stack-overflow', 'TASK-351'],
]);

describe('Markdown flavor contract', () => {
  it('matches ADR020 ids, labels, and selector order exactly', () => {
    expect(MARKDOWN_FLAVOR_IDS).toEqual(explicitFlavorIds);
    expect(MARKDOWN_FLAVOR_SELECTIONS).toEqual(['auto', ...explicitFlavorIds]);
    expect(MARKDOWN_FLAVOR_LABELS).toEqual(expectedLabels);
    expect(isMarkdownFlavorId('auto')).toBe(false);
    expect(isMarkdownFlavorId('obsidian')).toBe(true);
    expect(isMarkdownFlavorId('unresearched')).toBe(false);
  });
});

describe('Markdown flavor profile registry', () => {
  it('contains exactly one explicit profile per required flavor and excludes auto', () => {
    expect(Object.keys(MARKDOWN_FLAVOR_PROFILES)).toEqual([...explicitFlavorIds]);
    expect(MARKDOWN_FLAVOR_PROFILES).not.toHaveProperty('auto');

    for (const flavorId of explicitFlavorIds) {
      const profile = getMarkdownFlavorProfile(flavorId);
      expect(profile.id).toBe(flavorId);
      expect(profile.label).toBe(expectedLabels[flavorId]);
      expect(profile.phaseTicket).toBe(implementationTickets.get(flavorId));
    }
  });

  it('requires source-backed signatures, LSP surfaces, parser capabilities, and security metadata', () => {
    for (const flavorId of explicitFlavorIds) {
      const profile = getMarkdownFlavorProfile(flavorId);

      expect(profile.sources.feature).toMatch(/^docs\/features\/.+-flavor\.md$/);
      expect(profile.sources.primary).toMatch(/^docs\/(research|ofm-spec)\/.+/);
      expect(profile.activeSyntax.length).toBeGreaterThan(0);
      expect(profile.inertSyntax.length).toBeGreaterThan(0);
      expect(profile.opaqueRegions.length).toBeGreaterThan(0);
      expect(profile.parserCapabilities.localSyntax).toEqual(profile.activeSyntax);
      expect(profile.parserCapabilities.inertSyntax).toEqual(profile.inertSyntax);
      expect(profile.security.parserSizeBudgetBytes).toBe(1024 * 1024);
      expect(profile.security.redosReview).toBe('profile-data-only');
      expect(profile.security.networkBoundary).toBe('no-network');
      expect(profile.security.executionBoundary).toBe('no-execution');
      expect(profile.security.configInteraction).toBe('declares-flavor-only');
      expect(profile.security.renameConfinement).toMatch(/^vault-local/);

      for (const surfaceKey of surfaceKeys) {
        const surface = profile.surfaces[surfaceKey];
        expect(surface.summary.length).toBeGreaterThan(0);
        if (surface.status === 'planned') {
          expect(surface.owningTicket).toBe(implementationTickets.get(flavorId));
        }
      }
    }
  });

  it('captures Original, CommonMark, and Obsidian signature boundaries', () => {
    expect(getMarkdownFlavorProfile('original').activeSyntax).toEqual(
      expect.arrayContaining([
        'paragraphs',
        'atx-headings',
        'setext-headings',
        'indented-code-blocks',
        'inline-links',
      ]),
    );
    expect(getMarkdownFlavorProfile('original').inertSyntax).toEqual(
      expect.arrayContaining([
        'fenced-code-blocks',
        'pipe-tables',
        'task-lists',
        'wiki-links',
        'embeds',
        'tags',
        'callouts',
      ]),
    );

    expect(getMarkdownFlavorProfile('commonmark').activeSyntax).toEqual(
      expect.arrayContaining([
        'commonmark-blocks',
        'fenced-code-blocks',
        'commonmark-inline-links',
        'link-labels',
        'headings',
      ]),
    );
    expect(getMarkdownFlavorProfile('commonmark').inertSyntax).toEqual(
      expect.arrayContaining([
        'pipe-tables',
        'task-lists',
        'wiki-links',
        'embeds',
        'tags',
        'callouts',
      ]),
    );

    expect(getMarkdownFlavorProfile('obsidian').activeSyntax).toEqual(
      expect.arrayContaining([
        'wiki-links',
        'embeds',
        'tags',
        'block-anchors',
        'callouts',
        'frontmatter',
        'local-markdown-links',
      ]),
    );
    expect(getMarkdownFlavorProfile('obsidian').opaqueRegions).toEqual(
      expect.arrayContaining(['code', 'math', 'comments', 'templater']),
    );
  });

  it('captures researched profile signatures and host/conversion boundaries', () => {
    expect(getMarkdownFlavorProfile('gfm').activeSyntax).toEqual(
      expect.arrayContaining(['pipe-tables', 'task-lists', 'strikethrough', 'autolinks']),
    );
    expect(getMarkdownFlavorProfile('glfm').hostSpecificSyntax).toEqual(
      expect.arrayContaining([
        'gitlab-issues',
        'gitlab-merge-requests',
        'gitlab-epics',
        'gitlab-labels',
      ]),
    );
    expect(getMarkdownFlavorProfile('pandoc').hostSpecificSyntax).toEqual(
      expect.arrayContaining(['conversion-extensions', 'bibliography-context']),
    );
    expect(getMarkdownFlavorProfile('multimarkdown').activeSyntax).toEqual(
      expect.arrayContaining(['metadata', 'tables', 'footnotes', 'citations', 'cross-references']),
    );
    expect(getMarkdownFlavorProfile('mdx').opaqueRegions).toEqual(
      expect.arrayContaining(['jsx', 'esm', 'expressions']),
    );
    expect(getMarkdownFlavorProfile('kramdown').activeSyntax).toEqual(
      expect.arrayContaining([
        'attribute-lists',
        'definition-lists',
        'tables',
        'footnotes',
        'math',
      ]),
    );
    expect(getMarkdownFlavorProfile('markdown-extra').activeSyntax).toEqual(
      expect.arrayContaining([
        'tables',
        'definition-lists',
        'footnotes',
        'abbreviations',
        'attribute-blocks',
      ]),
    );
    expect(getMarkdownFlavorProfile('r-markdown').hostSpecificSyntax).toEqual(
      expect.arrayContaining(['r-execution', 'generated-output', 'package-symbols']),
    );
    expect(getMarkdownFlavorProfile('reddit').hostSpecificSyntax).toEqual(
      expect.arrayContaining([
        'subreddit-links',
        'reddit-users',
        'reddit-posts',
        'reddit-comments',
      ]),
    );
    expect(getMarkdownFlavorProfile('stack-overflow').hostSpecificSyntax).toEqual(
      expect.arrayContaining(['stack-exchange-tags', 'questions', 'answers', 'users', 'comments']),
    );
  });

  it('has reviewable research-trace evidence for every explicit profile', () => {
    const evidencePath = join(
      process.cwd(),
      'docs/test/evidence/markdown-flavor-research-trace.md',
    );
    expect(existsSync(evidencePath)).toBe(true);

    const evidence = readFileSync(evidencePath, 'utf8');
    for (const flavorId of explicitFlavorIds) {
      const profile = getMarkdownFlavorProfile(flavorId);
      expect(evidence).toContain(`\`${flavorId}\``);
      expect(evidence).toContain(profile.sources.feature);
      expect(evidence).toContain(profile.sources.primary);
      expect(evidence).toContain(profile.phaseTicket);
    }
  });
});

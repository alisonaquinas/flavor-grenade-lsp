import {
  MARKDOWN_FLAVOR_IDS,
  MARKDOWN_FLAVOR_LABELS,
  type MarkdownFlavorId,
} from './markdown-flavor-contract.js';

const PARSER_SIZE_BUDGET_BYTES = 1024 * 1024;

/** Profile surface implementation state. */
export type MarkdownFlavorSurfaceStatus = 'implemented' | 'planned' | 'deferred' | 'not-applicable';

/** LSP surface declaration for a profile. */
export interface MarkdownFlavorSurfaceProfile {
  status: MarkdownFlavorSurfaceStatus;
  summary: string;
  owningTicket?: string;
}

/** Source files that justify a profile signature. */
export interface MarkdownFlavorProfileSources {
  feature: string;
  primary: string;
  related: string[];
}

/** Parser and operation safety metadata inherited by flavor work. */
export interface MarkdownFlavorSecurityProfile {
  parserSizeBudgetBytes: number;
  redosReview: 'profile-data-only' | 'required-before-parser-change';
  networkBoundary: 'no-network';
  executionBoundary: 'no-execution';
  configInteraction: 'declares-flavor-only';
  renameConfinement: string;
}

/** Syntax flags available to future parse contexts. */
export interface MarkdownFlavorParserCapabilities {
  localSyntax: string[];
  inertSyntax: string[];
  hostSyntax: string[];
  opaqueRegions: string[];
}

/** Source-backed server profile for one explicit Markdown flavor. */
export interface MarkdownFlavorProfile {
  id: MarkdownFlavorId;
  label: string;
  phaseTicket: string;
  sources: MarkdownFlavorProfileSources;
  activeSyntax: string[];
  inertSyntax: string[];
  hostSpecificSyntax: string[];
  opaqueRegions: string[];
  surfaces: Record<
    | 'diagnostics'
    | 'completion'
    | 'navigation'
    | 'hover'
    | 'semanticTokens'
    | 'folding'
    | 'documentSymbols'
    | 'rename',
    MarkdownFlavorSurfaceProfile
  >;
  security: MarkdownFlavorSecurityProfile;
  parserCapabilities: MarkdownFlavorParserCapabilities;
}

type ProfileInput = Omit<
  MarkdownFlavorProfile,
  'label' | 'surfaces' | 'security' | 'parserCapabilities'
> & {
  surfaceSummary: string;
  surfaceStatus?: MarkdownFlavorSurfaceStatus;
};

function lspSurfaces(
  owningTicket: string,
  summary: string,
  status: MarkdownFlavorSurfaceStatus = 'planned',
): MarkdownFlavorProfile['surfaces'] {
  const surface: MarkdownFlavorSurfaceProfile = {
    status,
    summary,
    ...(status === 'planned' ? { owningTicket } : {}),
  };
  return {
    diagnostics: surface,
    completion: surface,
    navigation: surface,
    hover: surface,
    semanticTokens: surface,
    folding: surface,
    documentSymbols: surface,
    rename: surface,
  };
}

function securityProfile(): MarkdownFlavorSecurityProfile {
  return {
    parserSizeBudgetBytes: PARSER_SIZE_BUDGET_BYTES,
    redosReview: 'profile-data-only',
    networkBoundary: 'no-network',
    executionBoundary: 'no-execution',
    configInteraction: 'declares-flavor-only',
    renameConfinement:
      'vault-local or document-local edits only; host, renderer, conversion, and execution targets reject rename',
  };
}

function profile(input: ProfileInput): MarkdownFlavorProfile {
  return {
    ...input,
    label: MARKDOWN_FLAVOR_LABELS[input.id],
    surfaces: lspSurfaces(input.phaseTicket, input.surfaceSummary, input.surfaceStatus),
    security: securityProfile(),
    parserCapabilities: {
      localSyntax: input.activeSyntax,
      inertSyntax: input.inertSyntax,
      hostSyntax: input.hostSpecificSyntax,
      opaqueRegions: input.opaqueRegions,
    },
  };
}

const commonmarkInertSyntax = [
  'pipe-tables',
  'task-lists',
  'wiki-links',
  'embeds',
  'tags',
  'callouts',
];

const commonmarkOpaqueRegions = ['code', 'html'];

/** Registry keyed by explicit flavor id. `auto` is selector state, not a profile. */
export const MARKDOWN_FLAVOR_PROFILES: Record<MarkdownFlavorId, MarkdownFlavorProfile> = {
  original: profile({
    id: 'original',
    phaseTicket: 'TASK-315',
    sources: {
      feature: 'docs/features/original-markdown-flavor.md',
      primary: 'docs/research/commonmark-and-original-markdown.md',
      related: ['docs/adr/ADR020-markdown-flavor-selection.md'],
    },
    activeSyntax: [
      'paragraphs',
      'line-breaks',
      'atx-headings',
      'setext-headings',
      'emphasis',
      'lists',
      'blockquotes',
      'indented-code-blocks',
      'inline-code',
      'inline-links',
      'reference-links',
      'images',
      'raw-html',
    ],
    inertSyntax: [
      'fenced-code-blocks',
      'pipe-tables',
      'task-lists',
      'strikethrough',
      'autolinks',
      'wiki-links',
      'embeds',
      'tags',
      'callouts',
      'frontmatter',
      'math',
      'jsx',
      'r-chunks',
    ],
    hostSpecificSyntax: [],
    opaqueRegions: ['indented-code', 'inline-code', 'html'],
    surfaceStatus: 'implemented',
    surfaceSummary:
      'Original Markdown local links, headings, symbols, folds, tokens, and safe local rename are implemented in Phase 22.',
  }),
  commonmark: profile({
    id: 'commonmark',
    phaseTicket: 'TASK-318',
    sources: {
      feature: 'docs/features/commonmark-flavor.md',
      primary: 'docs/research/commonmark-and-original-markdown.md',
      related: ['docs/adr/ADR020-markdown-flavor-selection.md'],
    },
    activeSyntax: [
      'commonmark-blocks',
      'fenced-code-blocks',
      'commonmark-inline-links',
      'link-labels',
      'headings',
      'blockquotes',
      'lists',
      'html-blocks',
      'autolinks',
      'emphasis',
      'images',
    ],
    inertSyntax: commonmarkInertSyntax,
    hostSpecificSyntax: [],
    opaqueRegions: commonmarkOpaqueRegions,
    surfaceStatus: 'implemented',
    surfaceSummary: 'CommonMark parsing and LSP behavior are implemented in Phase 23.',
  }),
  obsidian: profile({
    id: 'obsidian',
    phaseTicket: 'TASK-321',
    sources: {
      feature: 'docs/features/obsidian-markdown-flavor.md',
      primary: 'docs/ofm-spec/index.md',
      related: ['docs/features/ofmarkdown-parity-roadmap.md'],
    },
    activeSyntax: [
      'wiki-links',
      'embeds',
      'tags',
      'block-anchors',
      'block-refs',
      'callouts',
      'frontmatter',
      'opaque-regions',
      'local-markdown-links',
      'attachments',
      'math',
      'comments',
      'templater',
    ],
    inertSyntax: [
      'gfm-alerts',
      'gitlab-references',
      'pandoc-citations',
      'jsx',
      'r-chunks',
      'reddit-spoilers',
    ],
    hostSpecificSyntax: ['obsidian-vault-resolution', 'obsidian-renderer-semantics'],
    opaqueRegions: ['code', 'math', 'comments', 'templater'],
    surfaceStatus: 'implemented',
    surfaceSummary:
      'Existing OFM behavior is mapped to explicit Obsidian flavor support in Phase 24.',
  }),
  gfm: profile({
    id: 'gfm',
    phaseTicket: 'TASK-324',
    sources: {
      feature: 'docs/features/github-flavored-markdown-flavor.md',
      primary: 'docs/research/github-flavored-markdown-analysis.md',
      related: ['docs/features/commonmark-flavor.md'],
    },
    activeSyntax: [
      'commonmark-base',
      'pipe-tables',
      'task-lists',
      'strikethrough',
      'autolinks',
      'github-heading-anchors',
      'github-alerts',
    ],
    inertSyntax: ['wiki-links', 'embeds', 'obsidian-tags', 'pandoc-citations', 'jsx', 'r-chunks'],
    hostSpecificSyntax: [
      'github-issues',
      'github-pull-requests',
      'github-commits',
      'github-users',
      'github-labels',
    ],
    opaqueRegions: commonmarkOpaqueRegions,
    surfaceSummary: 'GFM parser and local LSP behavior are implemented in Phase 25.',
  }),
  glfm: profile({
    id: 'glfm',
    phaseTicket: 'TASK-327',
    sources: {
      feature: 'docs/features/gitlab-flavored-markdown-flavor.md',
      primary: 'docs/research/gitlab-flavored-markdown-analysis.md',
      related: ['docs/features/github-flavored-markdown-flavor.md'],
    },
    activeSyntax: [
      'gfm-compatible-core',
      'pipe-tables',
      'task-lists',
      'inapplicable-task-marker',
      'footnotes',
      'description-lists',
      'math',
      'diagrams',
      'gitlab-alerts',
      'toc-tags',
      'includes',
    ],
    inertSyntax: [
      'wiki-links',
      'embeds',
      'obsidian-tags',
      'pandoc-title-blocks',
      'jsx',
      'r-chunks',
    ],
    hostSpecificSyntax: [
      'gitlab-issues',
      'gitlab-merge-requests',
      'gitlab-epics',
      'gitlab-commits',
      'gitlab-users',
      'gitlab-labels',
    ],
    opaqueRegions: ['code', 'math', 'diagrams'],
    surfaceSummary: 'GLFM parser and local LSP behavior are implemented in Phase 26.',
  }),
  pandoc: profile({
    id: 'pandoc',
    phaseTicket: 'TASK-330',
    sources: {
      feature: 'docs/features/pandoc-markdown-flavor.md',
      primary: 'docs/research/pandoc-markdown-deep-research-report.md',
      related: ['docs/plans/markdown-flavor-lsp-applicability-matrix.md'],
    },
    activeSyntax: [
      'metadata-blocks',
      'citations',
      'footnotes',
      'math',
      'attributes',
      'tables',
      'cross-references',
      'fenced-divs',
      'definition-lists',
    ],
    inertSyntax: [
      'wiki-links',
      'embeds',
      'obsidian-tags',
      'github-alerts',
      'gitlab-includes',
      'jsx',
      'r-chunks',
    ],
    hostSpecificSyntax: [
      'conversion-extensions',
      'bibliography-context',
      'output-format-cross-references',
    ],
    opaqueRegions: ['code', 'math', 'raw-attribute-blocks'],
    surfaceSummary: 'Pandoc Markdown parser and local LSP behavior are implemented in Phase 27.',
  }),
  multimarkdown: profile({
    id: 'multimarkdown',
    phaseTicket: 'TASK-333',
    sources: {
      feature: 'docs/features/multimarkdown-flavor.md',
      primary: 'docs/research/multimarkdown-analysis.md',
      related: ['docs/plans/markdown-flavor-lsp-applicability-matrix.md'],
    },
    activeSyntax: [
      'metadata',
      'tables',
      'footnotes',
      'citations',
      'cross-references',
      'math',
      'labels',
    ],
    inertSyntax: [
      'wiki-links',
      'embeds',
      'obsidian-tags',
      'github-alerts',
      'gitlab-includes',
      'jsx',
      'r-chunks',
    ],
    hostSpecificSyntax: ['export-only-cross-references', 'generated-output'],
    opaqueRegions: ['code', 'math'],
    surfaceSummary: 'MultiMarkdown parser and local LSP behavior are implemented in Phase 28.',
  }),
  mdx: profile({
    id: 'mdx',
    phaseTicket: 'TASK-336',
    sources: {
      feature: 'docs/features/mdx-flavor.md',
      primary: 'docs/research/mdx-analysis.md',
      related: ['docs/adr/ADR020-markdown-flavor-selection.md'],
    },
    activeSyntax: [
      'commonmark-mdx-markdown',
      'jsx-elements',
      'jsx-expressions',
      'esm-declarations',
      'component-references',
    ],
    inertSyntax: [
      'wiki-links',
      'embeds',
      'obsidian-tags',
      'pandoc-citations',
      'gitlab-includes',
      'r-chunks',
    ],
    hostSpecificSyntax: ['react-symbols', 'typescript-imports', 'component-runtime-context'],
    opaqueRegions: ['jsx', 'esm', 'expressions', 'code'],
    surfaceSummary: 'MDX parser and Markdown-mode-safe LSP behavior are implemented in Phase 29.',
  }),
  kramdown: profile({
    id: 'kramdown',
    phaseTicket: 'TASK-339',
    sources: {
      feature: 'docs/features/kramdown-flavor.md',
      primary: 'docs/research/kramdown-analysis.md',
      related: ['docs/plans/markdown-flavor-lsp-applicability-matrix.md'],
    },
    activeSyntax: [
      'kramdown-blocks',
      'attribute-lists',
      'definition-lists',
      'tables',
      'footnotes',
      'math',
      'header-ids',
    ],
    inertSyntax: [
      'wiki-links',
      'embeds',
      'obsidian-tags',
      'github-alerts',
      'gitlab-includes',
      'jsx',
      'r-chunks',
    ],
    hostSpecificSyntax: ['renderer-generated-anchors'],
    opaqueRegions: ['code', 'math', 'attribute-blocks'],
    surfaceSummary: 'kramdown parser and local LSP behavior are implemented in Phase 30.',
  }),
  'markdown-extra': profile({
    id: 'markdown-extra',
    phaseTicket: 'TASK-342',
    sources: {
      feature: 'docs/features/markdown-extra-flavor.md',
      primary: 'docs/research/markdown-extra-analysis.md',
      related: ['docs/plans/markdown-flavor-lsp-applicability-matrix.md'],
    },
    activeSyntax: [
      'tables',
      'definition-lists',
      'footnotes',
      'abbreviations',
      'fenced-code-blocks',
      'attribute-blocks',
    ],
    inertSyntax: [
      'wiki-links',
      'embeds',
      'obsidian-tags',
      'pandoc-citations',
      'kramdown-inline-attributes',
      'jsx',
      'r-chunks',
    ],
    hostSpecificSyntax: ['renderer-specific-attributes'],
    opaqueRegions: ['code', 'attribute-blocks'],
    surfaceSummary: 'Markdown Extra parser and local LSP behavior are implemented in Phase 31.',
  }),
  'r-markdown': profile({
    id: 'r-markdown',
    phaseTicket: 'TASK-345',
    sources: {
      feature: 'docs/features/r-markdown-flavor.md',
      primary: 'docs/research/r-markdown-analysis.md',
      related: ['docs/plans/markdown-flavor-lsp-applicability-matrix.md'],
    },
    activeSyntax: [
      'yaml-metadata',
      'code-chunks',
      'inline-r',
      'chunk-labels',
      'chunk-options',
      'cross-references',
      'citations',
    ],
    inertSyntax: [
      'wiki-links',
      'embeds',
      'obsidian-tags',
      'github-alerts',
      'gitlab-includes',
      'jsx',
    ],
    hostSpecificSyntax: [
      'r-execution',
      'generated-output',
      'package-symbols',
      'runtime-chunk-evaluation',
    ],
    opaqueRegions: ['code-chunks', 'inline-r', 'math', 'code'],
    surfaceSummary: 'R Markdown parser and non-executing LSP behavior are implemented in Phase 32.',
  }),
  reddit: profile({
    id: 'reddit',
    phaseTicket: 'TASK-348',
    sources: {
      feature: 'docs/features/reddit-markdown-flavor.md',
      primary: 'docs/research/reddit-markdown-analysis.md',
      related: ['docs/plans/markdown-flavor-lsp-applicability-matrix.md'],
    },
    activeSyntax: [
      'common-prose-markdown',
      'spoilers',
      'superscript',
      'escapes',
      'tables',
      'reddit-line-breaks',
    ],
    inertSyntax: [
      'wiki-links',
      'embeds',
      'obsidian-tags',
      'pandoc-citations',
      'gitlab-includes',
      'jsx',
      'r-chunks',
    ],
    hostSpecificSyntax: [
      'subreddit-links',
      'reddit-users',
      'reddit-posts',
      'reddit-comments',
      'moderation-targets',
    ],
    opaqueRegions: ['code', 'spoilers'],
    surfaceSummary:
      'Reddit Markdown parser and local portability LSP behavior are implemented in Phase 33.',
  }),
  'stack-overflow': profile({
    id: 'stack-overflow',
    phaseTicket: 'TASK-351',
    sources: {
      feature: 'docs/features/stack-overflow-markdown-flavor.md',
      primary: 'docs/research/stack-overflow-markdown-analysis.md',
      related: ['docs/plans/markdown-flavor-lsp-applicability-matrix.md'],
    },
    activeSyntax: [
      'commonmark-base',
      'fenced-code',
      'indented-code',
      'language-hints',
      'tables',
      'spoilers',
      'post-comment-profile',
    ],
    inertSyntax: [
      'wiki-links',
      'embeds',
      'obsidian-tags',
      'pandoc-citations',
      'gitlab-includes',
      'jsx',
      'r-chunks',
    ],
    hostSpecificSyntax: ['stack-exchange-tags', 'questions', 'answers', 'users', 'comments'],
    opaqueRegions: ['code', 'spoilers'],
    surfaceSummary:
      'Stack Overflow Markdown parser and local technical-writing LSP behavior are implemented in Phase 34.',
  }),
};

for (const flavorId of MARKDOWN_FLAVOR_IDS) {
  if (!MARKDOWN_FLAVOR_PROFILES[flavorId]) {
    throw new Error(`Missing Markdown flavor profile: ${flavorId}`);
  }
}

/** Return the source-backed profile for an explicit Markdown flavor id. */
export function getMarkdownFlavorProfile(id: MarkdownFlavorId): MarkdownFlavorProfile {
  return MARKDOWN_FLAVOR_PROFILES[id];
}

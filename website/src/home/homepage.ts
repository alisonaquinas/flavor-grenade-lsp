import { getRouteById } from '../content/routes';
import type { IconName } from '../shell/icons';

/** Homepage call to action. */
export interface HomepageAction {
  label: string;
  href: string;
  kind: 'primary' | 'secondary' | 'tertiary';
  icon: IconName;
}

/** Homepage first-viewport content. */
export interface HomepageHero {
  h1: string;
  category: string;
  value: string;
  actions: HomepageAction[];
}

/** Product proof panel content. */
export interface HomepageProof {
  title: string;
  caption: string;
  lines: string[];
}

/** Highlighted product capability. */
export interface FeatureHighlight {
  title: string;
  description: string;
  signal: FeatureSignal;
  detail: FeatureDetail;
}

/** Homepage feature proof signal. */
export type FeatureSignal = 'diagnostic' | 'completion' | 'rename' | 'index';

/** Deeper practical detail for a selectable feature card. */
export interface FeatureDetail {
  title: string;
  summary: string;
  markdownExample: readonly string[];
  outcome: string;
}

/** Existing product asset placement used by the homepage. */
export interface HomepageAssetPlacement {
  placement: 'header' | 'hero' | 'footer' | 'social';
  source: string;
  alt: string;
}

/** First-viewport homepage message and actions. */
export const homepageHero: HomepageHero = {
  h1: 'Flavor Grenade LSP',
  category: 'Obsidian Flavored Markdown and flavor-aware Markdown language server',
  value:
    'Keep Markdown flavors, Obsidian vault links, structured profiles, headings, embeds, tags, and safe edits clear enough for humans and LSP clients.',
  actions: [
    { label: 'Quickstart', href: getRouteById('quickstart').path, kind: 'primary', icon: 'book-open' },
    {
      label: 'Visual Studio Marketplace',
      href: 'https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp',
      kind: 'secondary',
      icon: 'store',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/alisonaquinas/flavor-grenade-lsp',
      kind: 'tertiary',
      icon: 'github',
    },
  ],
};

/** Inspectable product proof for the homepage hero. */
export const homepageProof: HomepageProof = {
  title: 'Vault-aware and flavor-aware proof',
  caption: 'One project model drives flavor detection, local links, diagnostics, and safe edits.',
  lines: [
    '[[Daily Note#Open questions]]',
    'Auto Detect -> obsidian, gfm, mdx, commonmark',
    'FG001 missing target diagnostic + code action',
    '#project/flavor-grenade indexed tags',
  ],
};

/** Homepage feature overview with varied signal roles. */
export const featureHighlights: readonly FeatureHighlight[] = [
  {
    title: 'Detect the right Markdown flavor',
    description: 'Auto Detect uses config, vault markers, syntax, context, and CommonMark fallback.',
    signal: 'diagnostic',
    detail: {
      title: 'How Auto Detect keeps generic Markdown generic',
      summary:
        'Flavor Grenade resolves one effective base flavor per document before applying vault behavior or structured profiles.',
      markdownExample: [
        '[core.markdown]\nflavor = "commonmark"',
        '[[core.markdown.overrides]]\npath = "docs/github"\nflavor = "gfm"',
      ],
      outcome:
        'A root README can stay CommonMark while Obsidian notes, MDX pages, and changelogs get the behavior their evidence supports.',
    },
  },
  {
    title: 'Complete from project structure',
    description: 'Completions use indexed docs, headings, blocks, tags, attachments, and profiles.',
    signal: 'completion',
    detail: {
      title: 'How completions use indexed Markdown context',
      summary:
        'The language server keeps a project index of documents, headings, tags, blocks, attachments, and structured headings for context-sensitive suggestions.',
      markdownExample: ['Today connects to [[Daily Note]]', '#project/ and ## [Unreleased]'],
      outcome:
        'The editor offers real note names, heading anchors, tags, and profile sections from the active workspace instead of generic snippets.',
    },
  },
  {
    title: 'Rename without collateral damage',
    description: 'Workspace edits stay vault-confined and preserve local references.',
    signal: 'rename',
    detail: {
      title: 'How rename edits stay vault-confined',
      summary:
        'Prepare-rename checks the target kind, then workspace edits rewrite only references that belong to the detected vault.',
      markdownExample: ['[[Project Plan#Open questions]]', '[[Project Plan|planning note]]'],
      outcome:
        'Renaming a note or heading updates inbound references while external URLs and files outside the vault stay untouched.',
    },
  },
  {
    title: 'Read structured Markdown faster',
    description: 'Hovers, symbols, folds, and semantic tokens expose useful document structure.',
    signal: 'index',
    detail: {
      title: 'How structured profiles make long Markdown scannable',
      summary:
        'Structured profiles layer changelog and MADR knowledge on top of the base flavor so long files become easier to scan and maintain.',
      markdownExample: ['# Changelog\n## [Unreleased]', '## Context and Problem Statement'],
      outcome:
        'Document symbols, folding ranges, hovers, and completions can reflect real release or decision-record structure.',
    },
  },
];

/** Existing Flavor Grenade and extension imagery used by the homepage. */
export const homepageAssetPlacements: readonly HomepageAssetPlacement[] = [
  {
    placement: 'header',
    source: '/assets/flavor-grenade-lsp-icon-097debba.png',
    alt: 'Flavor Grenade LSP product icon',
  },
  {
    placement: 'hero',
    source: '/assets/wiki-link-completion-982775b8.png',
    alt: 'VS Code showing Flavor Grenade wiki-link completion in an Obsidian Vault',
  },
  {
    placement: 'footer',
    source: '/assets/flavor-grenade-lsp-icon-097debba.png',
    alt: 'Flavor Grenade LSP product icon',
  },
  {
    placement: 'social',
    source: '/assets/flavor-grenade-lsp-icon-097debba.png',
    alt: 'Flavor Grenade LSP logo for social previews',
  },
];

/** Returns validation messages for homepage first-viewport and proof content. */
export function validateHomepageContent(): string[] {
  const messages: string[] = [];

  if (homepageHero.h1 !== 'Flavor Grenade LSP') {
    messages.push('Homepage H1 must identify Flavor Grenade LSP.');
  }

  if (!homepageHero.category.includes('Obsidian Flavored Markdown')) {
    messages.push('Homepage category must mention Obsidian Flavored Markdown.');
  }

  for (const requiredAction of ['Quickstart', 'Visual Studio Marketplace', 'GitHub']) {
    if (!homepageHero.actions.some((action) => action.label === requiredAction)) {
      messages.push(`Homepage is missing ${requiredAction} action.`);
    }
  }

  if (homepageProof.lines.length < 3) {
    messages.push('Homepage proof must show concrete product behavior.');
  }

  if (featureHighlights.length < 4) {
    messages.push('Homepage needs at least four feature highlights.');
  }

  for (const placement of ['header', 'hero', 'footer'] as const) {
    if (!homepageAssetPlacements.some((asset) => asset.placement === placement && asset.alt)) {
      messages.push(`Homepage is missing accessible ${placement} asset placement.`);
    }
  }

  return messages;
}

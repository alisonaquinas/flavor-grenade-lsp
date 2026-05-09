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
  signal: 'diagnostic' | 'completion' | 'rename' | 'index';
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
  category: 'Obsidian Flavored Markdown language server and VS Code extension',
  value:
    'Keep Obsidian Vault links, headings, embeds, tags, and rename workflows sharp enough for humans and LLM maintainers.',
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
  title: 'Vault-aware proof',
  caption: 'A real OFMarkdown workflow: link resolution, diagnostics, and safe edits.',
  lines: [
    '[[Daily Note#Open questions]]',
    'FG001 missing target diagnostic',
    'Rename heading -> update inbound references',
    '#project/flavor-grenade indexed tags',
  ],
};

/** Homepage feature overview with varied signal roles. */
export const featureHighlights: readonly FeatureHighlight[] = [
  {
    title: 'Find broken links early',
    description: 'Diagnostics catch missing wiki links, Markdown anchors, and attachment targets.',
    signal: 'diagnostic',
  },
  {
    title: 'Complete from the vault graph',
    description: 'Completions use indexed docs, headings, blocks, tags, and attachments.',
    signal: 'completion',
  },
  {
    title: 'Rename without collateral damage',
    description: 'Workspace edits stay vault-confined and preserve local references.',
    signal: 'rename',
  },
  {
    title: 'Keep LLM wiki pages consistent',
    description: 'Typed docs and strict checks help agents maintain Karpathy-style concept pages.',
    signal: 'index',
  },
];

/** Existing Flavor Grenade and extension imagery used by the homepage. */
export const homepageAssetPlacements: readonly HomepageAssetPlacement[] = [
  {
    placement: 'header',
    source: '/assets/flavor-grenade-lsp-icon.png',
    alt: 'Flavor Grenade LSP product icon',
  },
  {
    placement: 'hero',
    source: '/assets/wiki-link-completion.png',
    alt: 'VS Code showing Flavor Grenade wiki-link completion in an Obsidian Vault',
  },
  {
    placement: 'footer',
    source: '/assets/flavor-grenade-lsp-icon.png',
    alt: 'Flavor Grenade LSP product icon',
  },
  {
    placement: 'social',
    source: '/assets/flavor-grenade-lsp-icon.png',
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

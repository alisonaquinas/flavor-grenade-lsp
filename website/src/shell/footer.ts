import type { IconName } from './icons';

/** Public footer link. */
export interface FooterLink {
  label: string;
  href: string;
  icon?: IconName;
}

/** Creator byline shown in the global footer. */
export const footerByline = 'Vibe-coded by: Alison Aquinas';

/** Alison Aquinas public profile links. */
export const profileLinks: readonly FooterLink[] = [
  { label: 'Alison Aquinas website', href: 'https://www.alisonaquinas.com/', icon: 'globe' },
  { label: 'Alison Aquinas on GitHub', href: 'https://github.com/alisonaquinas', icon: 'github' },
  { label: 'Alison Aquinas on LinkedIn', href: 'https://www.linkedin.com/in/alisonaquinas', icon: 'linkedin' },
];

/** Project destination links. */
export const projectLinks: readonly FooterLink[] = [
  {
    label: 'Flavor Grenade LSP GitHub repository',
    href: 'https://github.com/alisonaquinas/flavor-grenade-lsp',
    icon: 'github',
  },
  {
    label: 'Flavor Grenade LSP on the Visual Studio Marketplace',
    href: 'https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp',
    icon: 'store',
  },
];

/** Inspiration and prior-art links credited by the website. */
export const inspirationLinks: readonly FooterLink[] = [
  {
    label: "Karpathy's LLM Wiki gist",
    href: 'https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f',
  },
  { label: 'Obsidian', href: 'https://obsidian.md/' },
  { label: 'Marksman LSP', href: 'https://github.com/artempyanykh/marksman' },
];

/** Returns footer validation messages for required byline and links. */
export function validateFooterLinks(): string[] {
  const messages: string[] = [];
  const allLinks = [...profileLinks, ...projectLinks, ...inspirationLinks];

  if (footerByline !== 'Vibe-coded by: Alison Aquinas') {
    messages.push('Footer byline is missing or incorrect.');
  }

  for (const link of allLinks) {
    if (!link.label.trim()) {
      messages.push('Footer link is missing descriptive text.');
    }

    if (!link.href.startsWith('https://')) {
      messages.push(`${link.label} must use HTTPS.`);
    }
  }

  for (const requiredLabel of [
    'Alison Aquinas website',
    'Alison Aquinas on GitHub',
    'Alison Aquinas on LinkedIn',
    "Karpathy's LLM Wiki gist",
    'Obsidian',
    'Marksman LSP',
  ]) {
    if (!allLinks.some((link) => link.label === requiredLabel)) {
      messages.push(`Footer is missing ${requiredLabel}.`);
    }
  }

  return messages;
}

import { describe, expect, it } from 'vitest';

import {
  footerByline,
  inspirationLinks,
  profileLinks,
  projectLinks,
  validateFooterLinks,
} from '../src/shell/footer';

describe('website footer links and byline', () => {
  it('includes creator byline and public profile links', () => {
    expect(footerByline).toBe('Vibe-coded by: Alison Aquinas');
    expect(profileLinks.map((link) => link.label)).toEqual([
      'Alison Aquinas website',
      'Alison Aquinas on GitHub',
      'Alison Aquinas on LinkedIn',
    ]);
  });

  it('links project destinations and required inspirations', () => {
    expect(projectLinks.map((link) => link.label)).toEqual([
      'Flavor Grenade LSP GitHub repository',
      'Flavor Grenade LSP on the Visual Studio Marketplace',
    ]);
    expect(inspirationLinks.map((link) => link.label)).toEqual([
      "Karpathy's LLM Wiki gist",
      'Obsidian',
      'Marksman LSP',
    ]);
    expect(validateFooterLinks()).toEqual([]);
  });
});

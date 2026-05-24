import { describe, expect, it } from 'vitest';

import { primaryNavigation } from '../src/shell/navigation';
import {
  readStoredTheme,
  resolveTheme,
  nextThemeMode,
  themeModes,
  writeStoredTheme,
  type ThemeMode,
} from '../src/theme/theme';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('website shell navigation and theme modes', () => {
  it('exposes the required primary navigation destinations', () => {
    expect(primaryNavigation.map((item) => item.label)).toEqual([
      'Home',
      'Quickstart',
      'How-To',
      'Concepts',
      'Advanced Usage',
      'FAQ',
    ]);
  });

  it('exposes guide article dropdowns for desktop navigation', () => {
    const dropdownItems = primaryNavigation
      .filter((item) => item.children?.length)
      .map((item) => [item.label, item.children?.map((child) => child.label)]);

    expect(dropdownItems).toEqual([
      [
        'How-To',
        [
          'Use the VS Code Extension',
          'Configure Markdown Workspaces',
          'Choose a Markdown Flavor',
          'Use Structured Profiles',
          'Fix Broken Links',
          'Use Code Actions',
          'Rename Notes Safely',
          'Complete Wiki-links and Headings',
          'Navigate Notes, Headings, Blocks, Embeds, and Attachments',
          'Find References and Highlights',
          'Use Tags and Tag Completion',
          'Work with OFM Opaque Regions',
        ],
      ],
      [
        'Concepts',
        [
          'Inspiration and Prior Art',
          'Obsidian Flavored Markdown and Markdown Flavors',
          'Markdown Flavor Model',
          'Structured Profiles',
          'Vault Index',
          'Wiki-link Resolution',
          'DocId and Vault-Relative Paths',
          'Opaque Regions',
          'Diagnostics',
          'Completions',
          'Rename Safety',
          'References, Navigation, Tags, and Embeds',
        ],
      ],
      [
        'Advanced Usage',
        [
          'Configuration Model',
          'Vault Mode and Single-file Mode',
          'Indexing and Performance',
          'Unsupported URI Schemes and Confinement',
          'Parser Boundaries and Opaque Regions',
          'Compatibility and Direct LSP Integration',
        ],
      ],
    ]);
    expect(
      primaryNavigation.flatMap((item) => item.children?.map((child) => child.href) ?? []),
    ).not.toContain('https://github.com');
    expect(
      primaryNavigation.flatMap(
        (item) => item.children?.map((child) => child.description) ?? [],
      ),
    ).not.toContain('');
  });

  it('supports system, light, and dark theme modes', () => {
    expect(themeModes).toEqual(['system', 'light', 'dark']);
    expect(nextThemeMode('system')).toBe('light');
    expect(nextThemeMode('light')).toBe('dark');
    expect(nextThemeMode('dark')).toBe('system');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('persists manual theme choices and defaults to system', () => {
    const storage = new MemoryStorage();

    expect(readStoredTheme(storage)).toBe('system');

    writeStoredTheme(storage, 'dark');
    expect(readStoredTheme(storage)).toBe('dark');

    writeStoredTheme(storage, 'light');
    expect(readStoredTheme(storage)).toBe('light');

    writeStoredTheme(storage, 'system' satisfies ThemeMode);
    expect(readStoredTheme(storage)).toBe('system');
  });
});

/**
 * Describes the initial static website shell used to verify the W1 scaffold.
 *
 * Provides: {@link getAppShellSummary}
 *
 * Role in system: gives tests and the initial Svelte shell a typed source of
 * truth for the website foundation before the full content pipeline exists.
 *
 * @module app-shell
 */

export interface AppShellSummary {
  productName: 'Flavor Grenade LSP';
  stack: readonly ['Vite', 'Svelte', 'TypeScript', 'SCSS'];
  sourceRoot: 'website/src';
  testRoot: 'website/tests';
}

export function getAppShellSummary(): AppShellSummary {
  return {
    productName: 'Flavor Grenade LSP',
    stack: ['Vite', 'Svelte', 'TypeScript', 'SCSS'],
    sourceRoot: 'website/src',
    testRoot: 'website/tests',
  };
}

import { definePageGroupManifest } from './pipeline/website/manifest';

export const howToManifest = definePageGroupManifest({
  group: "how-to",
  manifestPath: "src/content/how-to.manifest.ts",
  entries: [
    {
      routeId: "howTo",
      group: "how-to",
      copy: "how-to/how-to.md",
      order: 1,
      output: "pages",
    },
    {
      routeId: "howToVsCodeExtension",
      group: "how-to",
      copy: "how-to/use-vscode-extension.md",
      order: 2,
      output: "pages",
    },
    {
      routeId: "howToConfigureObsidianVaults",
      group: "how-to",
      copy: "how-to/configure-obsidian-vaults.md",
      order: 3,
      output: "pages",
    },
    {
      routeId: "howToFixBrokenLinks",
      group: "how-to",
      copy: "how-to/fix-broken-links.md",
      order: 4,
      output: "pages",
    },
    {
      routeId: "howToRenameNotesSafely",
      group: "how-to",
      copy: "how-to/rename-notes-safely.md",
      order: 5,
      output: "pages",
    },
    {
      routeId: "howToCompleteWikiLinksHeadings",
      group: "how-to",
      copy: "how-to/complete-wiki-links-and-headings.md",
      order: 6,
      output: "pages",
    },
    {
      routeId: "howToNavigateVaultTargets",
      group: "how-to",
      copy: "how-to/navigate-notes-headings-blocks-embeds-and-attachments.md",
      order: 7,
      output: "pages",
    },
    {
      routeId: "howToFindReferencesHighlights",
      group: "how-to",
      copy: "how-to/find-references-and-highlights.md",
      order: 8,
      output: "pages",
    },
    {
      routeId: "howToUseTagsCompletion",
      group: "how-to",
      copy: "how-to/use-tags-and-tag-completion.md",
      order: 9,
      output: "pages",
    },
    {
      routeId: "howToOpaqueRegions",
      group: "how-to",
      copy: "how-to/work-with-ofm-opaque-regions.md",
      order: 10,
      output: "pages",
    },
  ],
});

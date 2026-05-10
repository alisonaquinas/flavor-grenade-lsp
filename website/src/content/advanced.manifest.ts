import { definePageGroupManifest } from './pipeline/website/manifest';

export const advancedManifest = definePageGroupManifest({
  group: "advanced-usage",
  manifestPath: "src/content/advanced.manifest.ts",
  entries: [
    {
      routeId: "advancedUsage",
      group: "advanced-usage",
      copy: "advanced/advanced-usage.md",
      order: 1,
      output: "pages",
    },
    {
      routeId: "advancedConfigurationModel",
      group: "advanced-usage",
      copy: "advanced/configuration-model.md",
      order: 2,
      output: "pages",
    },
    {
      routeId: "advancedVaultSingleFileMode",
      group: "advanced-usage",
      copy: "advanced/vault-mode-and-single-file-mode.md",
      order: 3,
      output: "pages",
    },
    {
      routeId: "advancedIndexingPerformance",
      group: "advanced-usage",
      copy: "advanced/indexing-and-performance.md",
      order: 4,
      output: "pages",
    },
    {
      routeId: "advancedUriConfinement",
      group: "advanced-usage",
      copy: "advanced/unsupported-uri-schemes-and-confinement.md",
      order: 5,
      output: "pages",
    },
    {
      routeId: "advancedParserBoundaries",
      group: "advanced-usage",
      copy: "advanced/parser-boundaries-and-opaque-regions.md",
      order: 6,
      output: "pages",
    },
    {
      routeId: "advancedDirectLspIntegration",
      group: "advanced-usage",
      copy: "advanced/compatibility-and-direct-lsp-integration.md",
      order: 7,
      output: "pages",
    },
  ],
});

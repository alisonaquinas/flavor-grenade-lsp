import { definePageGroupManifest } from './pipeline/website/manifest';

export const featuresManifest = definePageGroupManifest({
  group: "features",
  manifestPath: "src/content/features.manifest.ts",
  entries: [
    {
      routeId: "features",
      group: "features",
      copy: "features/index.md",
      order: 1,
      output: "pages",
    },
  ],
});

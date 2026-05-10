import { definePageGroupManifest } from './pipeline/website/manifest';

export const quickstartManifest = definePageGroupManifest({
  group: "quickstart",
  manifestPath: "src/content/quickstart.manifest.ts",
  entries: [
    {
      routeId: "quickstart",
      group: "quickstart",
      copy: "quickstart/index.md",
      order: 1,
      output: "pages",
    },
  ],
});

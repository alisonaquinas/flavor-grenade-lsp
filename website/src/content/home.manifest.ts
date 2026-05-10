import { definePageGroupManifest } from './pipeline/website/manifest';

export const homeManifest = definePageGroupManifest({
  group: "home",
  manifestPath: "src/content/home.manifest.ts",
  entries: [
    {
      routeId: "home",
      group: "home",
      copy: "home/index.md",
      order: 1,
      output: "pages",
    },
  ],
});

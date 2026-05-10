import { definePageGroupManifest } from './pipeline/website/manifest';

export const faqManifest = definePageGroupManifest({
  group: "faq",
  manifestPath: "src/content/faq.manifest.ts",
  entries: [
    {
      routeId: "faq",
      group: "faq",
      copy: "faq/index.md",
      order: 1,
      output: "pages",
    },
  ],
});

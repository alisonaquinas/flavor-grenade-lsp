import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { websiteContentManifests } from '../src/content/manifests';
import { websitePages } from '../src/content/pages';
import { websiteRoutes } from '../src/content/routes';

describe('Commonloom content migration coverage', () => {
  it('has Markdown copy and a manifest entry for every public page record', () => {
    const manifestEntries = websiteContentManifests.flatMap((manifest) => manifest.entries);
    const entryByRouteId = new Map(manifestEntries.map((entry) => [entry.routeId, entry]));

    for (const page of websitePages) {
      const entry = entryByRouteId.get(page.routeId);

      expect(entry, `${page.routeId} manifest entry`).toBeDefined();
      expect(existsSync(join(process.cwd(), 'src/content/copy', entry?.copy ?? 'missing'))).toBe(true);
    }
  });

  it('keeps route and page coverage aligned during migration', () => {
    const pageRouteIds = new Set(websitePages.map((page) => page.routeId));
    const manifestRouteIds = new Set(
      websiteContentManifests.flatMap((manifest) => manifest.entries.map((entry) => entry.routeId)),
    );

    expect([...pageRouteIds].sort()).toEqual(websiteRoutes.map((route) => route.id).sort());
    expect([...manifestRouteIds].sort()).toEqual([...pageRouteIds].sort());
  });
});

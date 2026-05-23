import { describe, expect, it } from 'vitest';

import { websiteContentManifests } from '../src/content/manifests';
import {
  definePageGroupManifest,
  validatePageGroupManifests,
  type PageGroupManifest,
} from '../src/content/pipeline/website/manifest';

describe('website page-group manifests', () => {
  it('loads manifests only through the explicit registry', () => {
    expect(websiteContentManifests).toEqual(expect.arrayContaining([
      expect.objectContaining({
        group: 'quickstart',
        manifestPath: 'src/content/quickstart.manifest.ts',
      }),
    ]));
  });

  it('rejects duplicate route ids and copy paths', () => {
    const duplicateRouteManifest: PageGroupManifest = definePageGroupManifest({
      group: 'quickstart',
      manifestPath: 'src/content/duplicate.manifest.ts',
      entries: [
        {
          routeId: 'quickstart',
          group: 'quickstart',
          copy: 'quickstart/index.md',
          output: 'pages',
        },
        {
          routeId: 'quickstart',
          group: 'quickstart',
          copy: 'quickstart/second.md',
          output: 'pages',
        },
        {
          routeId: 'faq',
          group: 'faq',
          copy: 'quickstart/index.md',
          output: 'pages',
        },
      ],
    });
    const result = validatePageGroupManifests([duplicateRouteManifest]);

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'MANIFEST_INVALID',
          severity: 'error',
          message: expect.stringContaining('Duplicate route id'),
        }),
        expect.objectContaining({
          code: 'MANIFEST_INVALID',
          severity: 'error',
          message: expect.stringContaining('Duplicate copy path'),
        }),
      ]),
    );
  });

  it('rejects invalid route ids and mismatched page groups before Svelte typecheck', () => {
    const manifest = definePageGroupManifest({
      group: 'quickstart',
      manifestPath: 'src/content/bad.manifest.ts',
      entries: [
        {
          routeId: 'not-a-route',
          group: 'quickstart',
          copy: '../outside.md',
          output: 'pages',
        },
        {
          routeId: 'faq',
          group: 'faq',
          copy: 'faq/index.md',
          output: 'routes',
        },
      ],
    } satisfies PageGroupManifest);
    const result = validatePageGroupManifests([manifest]);

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'MANIFEST_INVALID', message: expect.stringContaining('Unknown route id') }),
        expect.objectContaining({ code: 'PATH_OUTSIDE_ROOT' }),
        expect.objectContaining({ code: 'MANIFEST_INVALID', message: expect.stringContaining('must match manifest') }),
      ]),
    );
  });
});

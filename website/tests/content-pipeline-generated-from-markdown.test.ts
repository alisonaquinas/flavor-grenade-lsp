import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { compileWebsiteContentFromManifests } from '../src/content/pipeline/website/content-compiler';
import { emitWebsiteGeneratedModules } from '../src/content/pipeline/website/emitter';
import { websiteRoutes } from '../src/content/routes';
import type { PageGroupManifest } from '../src/content/pipeline/website/manifest';

describe('website generated content from Markdown', () => {
  it('changes generated page output when Markdown copy changes', async () => {
    const copyRoot = join(process.cwd(), 'node_modules', '.tmp-commonloom-generated-from-markdown');
    const copyFile = join(copyRoot, 'quickstart', 'index.md');
    const manifest: PageGroupManifest = {
      group: 'quickstart',
      manifestPath: 'src/content/quickstart.manifest.ts',
      entries: [
        {
          routeId: 'quickstart',
          group: 'quickstart',
          copy: 'quickstart/index.md',
          order: 1,
          output: 'pages',
        },
      ],
    };

    await mkdir(join(copyRoot, 'quickstart'), { recursive: true });
    await writeFile(copyFile, markdownWithSummary('First generated summary.'), 'utf8');
    const first = await compileWebsiteContentFromManifests({
      copyRoot,
      manifests: [manifest],
      routes: websiteRoutes,
    });

    await writeFile(copyFile, markdownWithSummary('Second generated summary.'), 'utf8');
    const second = await compileWebsiteContentFromManifests({
      copyRoot,
      manifests: [manifest],
      routes: websiteRoutes,
    });

    expect(first.records.pages[0]?.summary).toBe('First generated summary.');
    expect(second.records.pages[0]?.summary).toBe('Second generated summary.');
    expect(emitWebsiteGeneratedModules(first.records).pages).not.toEqual(
      emitWebsiteGeneratedModules(second.records).pages,
    );
  });

  it('keeps the generated builder independent from old websitePages source data', () => {
    const buildSource = readFixture('../src/content/pipeline/website/build.ts');

    expect(buildSource).not.toContain("from '../../pages'");
    expect(buildSource).not.toContain('websitePages.map');
  });
});

function markdownWithSummary(summary: string): string {
  return [
    '---',
    'title: "Quickstart | Flavor Grenade LSP"',
    'description: "Install Flavor Grenade LSP."',
    'h1: "Quickstart"',
    `summary: "${summary}"`,
    'related: ["home"]',
    '---',
    '',
    '# Quickstart',
    '',
    summary,
    '',
    '## Start',
    '',
    summary,
  ].join('\n');
}

function readFixture(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

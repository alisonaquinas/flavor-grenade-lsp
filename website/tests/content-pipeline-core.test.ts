import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { compileCommonloom } from 'commonloom';
import type {
  CommonloomConfig,
  CommonloomLinkReference,
  CommonloomSourceTrace,
} from 'commonloom';

describe('Commonloom compiler scaffold', () => {
  it('uses the published package instead of local Commonloom source', () => {
    const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const localCommonloomPath = join(process.cwd(), 'src', 'content', 'pipeline', 'commonloom');

    expect(packageJson.dependencies?.commonloom ?? packageJson.devDependencies?.commonloom).toBeDefined();
    expect(existsSync(localCommonloomPath)).toBe(false);
  });

  it('exports a non-destructive compiler entry point', async () => {
    const result = await compileCommonloom({
      copyRoot: 'website/src/content/copy',
      mediaRoot: 'website/src/content/media',
    });

    expect(result.diagnostics).toEqual([
      {
        code: 'NO_MANIFESTS',
        severity: 'info',
        message: 'No page manifests configured.',
      },
    ]);
  });

  it('exports stable diagnostics and source trace contracts', () => {
    const trace: CommonloomSourceTrace = {
      markdownPath: 'copy/example.md',
      contentHash: 'abc123',
      headings: [],
      links: [],
      images: [],
    };

    expect(trace.markdownPath).toBe('copy/example.md');
  });

  it('keeps website route concepts behind adapter-owned callbacks', async () => {
    const link: CommonloomLinkReference = {
      rawTarget: '/quickstart/',
      resolvedTarget: '/quickstart/',
      kind: 'internal',
    };
    const config: CommonloomConfig = {
      copyRoot: 'src/content/copy',
      mediaRoot: 'src/content/media',
      manifests: [],
      html: { allowInlineHtml: true },
      links: {
        resolveLink: ({ rawTarget }) => ({
          kind: rawTarget.startsWith('/') ? 'internal' : 'unsupported',
          resolvedTarget: rawTarget,
        }),
      },
    };

    const resolution = await config.links?.resolveLink({ rawTarget: '/quickstart/' });

    expect(link.kind).toBe('internal');
    expect(resolution?.kind).toBe('internal');
  });
});

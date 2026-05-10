import { describe, expect, it } from 'vitest';

import { compileCommonloom } from '../src/content/pipeline/commonloom';
import {
  commonloomDiagnosticCodes,
  commonloomSeverities,
} from '../src/content/pipeline/commonloom/diagnostics';
import type { CommonloomSourceTrace } from '../src/content/pipeline/commonloom';

describe('Commonloom compiler scaffold', () => {
  it('exports a non-destructive compiler entry point', async () => {
    const result = await compileCommonloom({
      copyRoot: 'website/src/content/copy',
      mediaRoot: 'website/src/content/media',
      generatedRoot: 'website/src/content/generated',
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
    expect(commonloomSeverities).toEqual(['error', 'warning', 'info']);
    expect(commonloomDiagnosticCodes).toEqual([
      'NO_MANIFESTS',
      'COPY_NOT_FOUND',
      'FRONTMATTER_INVALID',
      'MARKDOWN_INVALID',
      'HTML_UNSAFE',
      'LINK_UNRESOLVED',
      'MEDIA_UNRESOLVED',
      'MEDIA_ALT_MISSING',
      'PATH_OUTSIDE_ROOT',
    ]);

    const trace: CommonloomSourceTrace = {
      markdownPath: 'copy/example.md',
      contentHash: 'abc123',
      headings: [],
      links: [],
      images: [],
    };

    expect(trace.markdownPath).toBe('copy/example.md');
  });
});

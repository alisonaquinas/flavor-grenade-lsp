import { stat } from 'node:fs/promises';

import { resolveInsideRoot } from './paths';
import type { CommonloomDiagnostic, CommonloomImageReference } from './types';

export interface ValidateMediaReferenceOptions {
  mediaRoot: string;
  sourcePath?: string;
}

export interface ValidateMediaReferenceResult {
  resolvedPath?: string;
  diagnostics: CommonloomDiagnostic[];
}

const mediaSchemePattern = /^[a-z][a-z0-9+.-]*:/i;

export async function validateMediaReference(
  reference: CommonloomImageReference,
  options: ValidateMediaReferenceOptions,
): Promise<ValidateMediaReferenceResult> {
  const diagnostics: CommonloomDiagnostic[] = [];

  if (!reference.altText.trim()) {
    diagnostics.push({
      code: 'MEDIA_ALT_MISSING',
      severity: 'error',
      message: `Image requires alt text or an explicit decorative marker: ${reference.rawTarget}`,
      sourcePath: reference.sourcePath ?? options.sourcePath,
      line: reference.line,
      column: reference.column,
    });
  }

  if (mediaSchemePattern.test(reference.rawTarget)) {
    diagnostics.push({
      code: 'MEDIA_UNRESOLVED',
      severity: 'error',
      message: `Media references must be local to an approved root: ${reference.rawTarget}`,
      sourcePath: reference.sourcePath ?? options.sourcePath,
      line: reference.line,
      column: reference.column,
    });

    return { diagnostics };
  }

  const resolved = resolveInsideRoot({
    root: options.mediaRoot,
    target: reference.rawTarget,
    sourcePath: reference.sourcePath ?? options.sourcePath,
  });

  diagnostics.push(...resolved.diagnostics);

  if (!resolved.resolvedPath) {
    return { diagnostics };
  }

  try {
    await stat(resolved.resolvedPath);
  } catch {
    diagnostics.push({
      code: 'MEDIA_UNRESOLVED',
      severity: 'error',
      message: `Media file does not exist: ${reference.rawTarget}`,
      sourcePath: reference.sourcePath ?? options.sourcePath,
      line: reference.line,
      column: reference.column,
    });
  }

  return { resolvedPath: resolved.resolvedPath, diagnostics };
}

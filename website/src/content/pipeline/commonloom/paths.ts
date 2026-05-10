import { relative, resolve } from 'node:path';

import type { CommonloomDiagnostic } from './types';

export interface ResolveInsideRootInput {
  root: string;
  target: string;
  sourcePath?: string;
}

export interface ResolveInsideRootResult {
  resolvedPath?: string;
  diagnostics: CommonloomDiagnostic[];
}

export function resolveInsideRoot(input: ResolveInsideRootInput): ResolveInsideRootResult {
  const root = resolve(input.root);
  const resolvedPath = resolve(root, input.target);

  if (!isInsideRoot(root, resolvedPath)) {
    return {
      diagnostics: [
        {
          code: 'PATH_OUTSIDE_ROOT',
          severity: 'error',
          message: `Path must stay inside ${root}: ${input.target}`,
          sourcePath: input.sourcePath,
        },
      ],
    };
  }

  return { resolvedPath, diagnostics: [] };
}

function isInsideRoot(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate);

  return relativePath === '' || (!relativePath.startsWith('..') && !resolve(relativePath).startsWith('..'));
}

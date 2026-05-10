import type { CommonloomConfig, CommonloomResult } from './types';

export async function compileCommonloom(_config: CommonloomConfig): Promise<CommonloomResult> {
  return {
    diagnostics: [
      {
        code: 'NO_MANIFESTS',
        severity: 'info',
        message: 'No page manifests configured.',
      },
    ],
  };
}

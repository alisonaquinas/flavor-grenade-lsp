import type { CommonloomConfig, CommonloomResult } from './types';

export async function compileCommonloom(config: CommonloomConfig): Promise<CommonloomResult> {
  void config;

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

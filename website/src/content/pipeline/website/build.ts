import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { websiteContentManifests } from '../../manifests';
import { websiteRoutes } from '../../routes';
import { compileWebsiteContentFromManifests } from './content-compiler';
import { validatePageGroupManifests } from './manifest';
import { emitWebsiteGeneratedModules, type WebsiteGeneratedModules } from './emitter';
import type { CommonloomDiagnostic } from 'commonloom';

export interface WebsiteContentBuildResult {
  modules: WebsiteGeneratedModules;
  diagnostics: CommonloomDiagnostic[];
}

const generatedFileNames: Record<keyof WebsiteGeneratedModules, string> = {
  routes: 'routes.generated.ts',
  pages: 'pages.generated.ts',
  navigation: 'navigation.generated.ts',
  media: 'media.generated.ts',
  index: 'index.generated.ts',
};

export async function buildWebsiteGeneratedModules(): Promise<WebsiteContentBuildResult> {
  const manifestValidation = validatePageGroupManifests([...websiteContentManifests]);
  const compiled = await compileWebsiteContentFromManifests({
    copyRoot: 'src/content/copy',
    manifests: [...websiteContentManifests],
    routes: websiteRoutes,
  });

  return {
    modules: emitWebsiteGeneratedModules(compiled.records),
    diagnostics: [...manifestValidation.diagnostics, ...compiled.diagnostics],
  };
}

export async function writeWebsiteGeneratedModules(generatedRoot: string): Promise<WebsiteContentBuildResult> {
  const result = await buildWebsiteGeneratedModules();

  await mkdir(generatedRoot, { recursive: true });

  for (const [moduleName, content] of Object.entries(result.modules) as Array<
    [keyof WebsiteGeneratedModules, string]
  >) {
    await writeFile(join(generatedRoot, generatedFileNames[moduleName]), content, 'utf8');
  }

  return result;
}

export async function checkWebsiteGeneratedModules(generatedRoot: string): Promise<WebsiteContentBuildResult> {
  const result = await buildWebsiteGeneratedModules();

  for (const [moduleName, expected] of Object.entries(result.modules) as Array<
    [keyof WebsiteGeneratedModules, string]
  >) {
    const filePath = join(generatedRoot, generatedFileNames[moduleName]);
    let actual: string | undefined;

    try {
      actual = await readFile(filePath, 'utf8');
    } catch {
      continue;
    }

    if (actual !== expected) {
      result.diagnostics.push({
        code: 'MANIFEST_INVALID',
        severity: 'error',
        message: `Generated content is stale: ${filePath}`,
        sourcePath: filePath,
      });
    }
  }

  return result;
}

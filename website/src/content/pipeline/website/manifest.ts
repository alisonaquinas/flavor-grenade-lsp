import { resolveInsideRoot, type CommonloomDiagnostic } from 'commonloom';

import { routeIds, type RouteGroup, type RouteId } from '../../routes';

export type WebsitePageGroup = RouteGroup;

export type PageManifestOutput = 'pages' | 'routes' | 'navigation';

export interface PageManifestEntry {
  routeId: RouteId | string;
  group: WebsitePageGroup;
  copy: string;
  order?: number;
  output: PageManifestOutput;
}

export interface PageGroupManifest {
  group: WebsitePageGroup;
  manifestPath: string;
  entries: PageManifestEntry[];
}

export interface ManifestValidationResult {
  diagnostics: CommonloomDiagnostic[];
}

const routeIdSet = new Set<string>(routeIds);

export function definePageGroupManifest(manifest: PageGroupManifest): PageGroupManifest {
  return manifest;
}

export function validatePageGroupManifests(
  manifests: PageGroupManifest[],
): ManifestValidationResult {
  const diagnostics: CommonloomDiagnostic[] = [];
  const routeIdsByEntry = new Map<string, string>();
  const copyPathsByEntry = new Map<string, string>();

  for (const manifest of manifests) {
    for (const entry of manifest.entries) {
      const sourcePath = `${manifest.manifestPath}:${entry.copy}`;

      if (entry.group !== manifest.group) {
        diagnostics.push(manifestDiagnostic(sourcePath, `Entry group ${entry.group} must match manifest group ${manifest.group}.`));
      }

      if (!routeIdSet.has(entry.routeId)) {
        diagnostics.push(manifestDiagnostic(sourcePath, `Unknown route id: ${entry.routeId}.`));
      }

      const routeOwner = routeIdsByEntry.get(entry.routeId);

      if (routeOwner) {
        diagnostics.push(manifestDiagnostic(sourcePath, `Duplicate route id ${entry.routeId} also appears in ${routeOwner}.`));
      } else {
        routeIdsByEntry.set(entry.routeId, sourcePath);
      }

      const copyOwner = copyPathsByEntry.get(entry.copy);

      if (copyOwner) {
        diagnostics.push(manifestDiagnostic(sourcePath, `Duplicate copy path ${entry.copy} also appears in ${copyOwner}.`));
      } else {
        copyPathsByEntry.set(entry.copy, sourcePath);
      }

      diagnostics.push(
        ...resolveInsideRoot({
          root: 'src/content/copy',
          target: entry.copy,
          sourcePath,
        }).diagnostics,
      );
    }
  }

  return { diagnostics };
}

function manifestDiagnostic(sourcePath: string, message: string): CommonloomDiagnostic {
  return {
    code: 'MANIFEST_INVALID',
    severity: 'error',
    message,
    sourcePath,
  };
}

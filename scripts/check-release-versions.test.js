import { describe, expect, it } from 'bun:test';
import { checkReleaseVersions } from './check-release-versions.mjs';

describe('check-release-versions', () => {
  it('accepts linked server and markdown flavor release versions', () => {
    const result = checkReleaseVersions({
      rootPackage: rootPackage('1.2.3', '1.2.3'),
      markdownFlavorPackage: markdownFlavorPackage('1.2.3'),
      tagName: 'v1.2.3',
    });

    expect(result).toEqual({
      ok: true,
      errors: [],
      versions: {
        root: '1.2.3',
        markdownFlavor: '1.2.3',
        rootDependency: '1.2.3',
        tag: '1.2.3',
      },
    });
  });

  it('reports tag, package, and dependency drift', () => {
    const result = checkReleaseVersions({
      rootPackage: rootPackage('1.2.3', '1.2.2'),
      markdownFlavorPackage: markdownFlavorPackage('1.2.1'),
      tagName: 'v1.2.4',
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      'root package version 1.2.3 does not match markdown flavor package version 1.2.1',
      'root dependency markdown-flavor-detection@1.2.2 does not match root package version 1.2.3',
      'release tag v1.2.4 resolves to 1.2.4, but root package version is 1.2.3',
    ]);
  });
});

function rootPackage(version, markdownFlavorDependency) {
  return {
    name: 'flavor-grenade-lsp',
    version,
    dependencies: {
      'markdown-flavor-detection': markdownFlavorDependency,
    },
  };
}

function markdownFlavorPackage(version) {
  return {
    name: 'markdown-flavor-detection',
    version,
  };
}

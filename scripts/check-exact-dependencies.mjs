#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MANIFESTS = ['package.json', 'extension/package.json', 'packages/markdown-flavor/package.json'];
const DEPENDENCY_SECTIONS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];
const RANGE_PREFIX = /^[~^]/;

export function findRangeSpecifiers(manifest) {
  const findings = [];
  for (const section of DEPENDENCY_SECTIONS) {
    const entries = manifest[section];
    if (entries === null || typeof entries !== 'object' || Array.isArray(entries)) {
      continue;
    }

    for (const [name, specifier] of Object.entries(entries)) {
      if (typeof specifier === 'string' && RANGE_PREFIX.test(specifier)) {
        findings.push({ section, name, specifier });
      }
    }
  }
  return findings;
}

export function findManifestRangeSpecifiers(manifestPath) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  return findRangeSpecifiers(manifest).map((finding) => ({ manifestPath, ...finding }));
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const findings = MANIFESTS.flatMap((manifest) =>
    findManifestRangeSpecifiers(resolve(process.cwd(), manifest)),
  );

  if (findings.length > 0) {
    for (const finding of findings) {
      const relativePath = finding.manifestPath.replace(`${process.cwd()}\\`, '');
      console.error(
        `${relativePath}: ${finding.section}.${finding.name} uses range ${finding.specifier}`,
      );
    }
    process.exitCode = 1;
  }
}

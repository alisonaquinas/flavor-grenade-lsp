#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies'];

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  if (match === null) {
    return null;
  }

  return match.slice(1).map(Number);
}

function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }

  return 0;
}

function upperBoundForCaret(base) {
  const [major, minor, patch] = base;
  if (major > 0) {
    return [major + 1, 0, 0];
  }

  if (minor > 0) {
    return [0, minor + 1, 0];
  }

  return [0, 0, patch + 1];
}

function upperBoundForTilde(base) {
  const [major, minor] = base;
  return [major, minor + 1, 0];
}

export function satisfiesManifestSpecifier(specifier, installedVersion) {
  const installed = parseVersion(installedVersion);
  if (installed === null) {
    return false;
  }

  if (/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(specifier)) {
    return installedVersion === specifier;
  }

  const operator = specifier[0];
  if (operator !== '^' && operator !== '~') {
    return false;
  }

  const base = parseVersion(specifier.slice(1));
  if (base === null || compareVersions(installed, base) < 0) {
    return false;
  }

  const upperBound = operator === '^' ? upperBoundForCaret(base) : upperBoundForTilde(base);
  return compareVersions(installed, upperBound) < 0;
}

function packageJsonPath(packageDir, packageName) {
  return join(packageDir, 'node_modules', ...packageName.split('/'), 'package.json');
}

export function findInstalledPackageMismatches(packageDir) {
  const manifestPath = join(packageDir, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const findings = [];

  for (const section of DEPENDENCY_SECTIONS) {
    const entries = manifest[section];
    if (entries === null || typeof entries !== 'object' || Array.isArray(entries)) {
      continue;
    }

    for (const [name, specifier] of Object.entries(entries)) {
      if (typeof specifier !== 'string') {
        continue;
      }

      const installedPath = packageJsonPath(packageDir, name);
      if (!existsSync(installedPath)) {
        findings.push({ section, name, specifier, installedVersion: null, reason: 'missing' });
        continue;
      }

      const installedManifest = JSON.parse(readFileSync(installedPath, 'utf8'));
      const installedVersion = installedManifest.version;
      if (
        typeof installedVersion !== 'string' ||
        !satisfiesManifestSpecifier(specifier, installedVersion)
      ) {
        findings.push({ section, name, specifier, installedVersion, reason: 'version-mismatch' });
      }
    }
  }

  return findings;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const packageDirs = process.argv.slice(2);
  const targets = packageDirs.length > 0 ? packageDirs : ['.'];
  const findings = targets.flatMap((target) => {
    const packageDir = resolve(process.cwd(), target);
    return findInstalledPackageMismatches(packageDir).map((finding) => ({ packageDir, ...finding }));
  });

  if (findings.length > 0) {
    for (const finding of findings) {
      const installed = finding.installedVersion ?? '<missing>';
      console.error(
        `${finding.packageDir}: ${finding.section}.${finding.name} declares ${finding.specifier} but installed ${installed}`,
      );
    }
    process.exitCode = 1;
  }
}

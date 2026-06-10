#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT_PACKAGE = 'package.json';
const MARKDOWN_FLAVOR_PACKAGE = 'packages/markdown-flavor/package.json';
const MARKDOWN_FLAVOR_PACKAGE_NAME = 'markdown-flavor-detection';

export function checkReleaseVersions({ rootPackage, markdownFlavorPackage, tagName }) {
  const errors = [];
  const rootVersion = rootPackage.version;
  const markdownFlavorVersion = markdownFlavorPackage.version;
  const dependencyVersion = rootPackage.dependencies?.[MARKDOWN_FLAVOR_PACKAGE_NAME];
  const tagVersion = tagName === undefined || tagName === '' ? undefined : normalizeTag(tagName);

  if (rootPackage.name !== 'flavor-grenade-lsp') {
    errors.push(
      `root package name must be flavor-grenade-lsp, got ${formatValue(rootPackage.name)}`,
    );
  }

  if (markdownFlavorPackage.name !== MARKDOWN_FLAVOR_PACKAGE_NAME) {
    errors.push(
      `markdown flavor package name must be ${MARKDOWN_FLAVOR_PACKAGE_NAME}, got ${formatValue(
        markdownFlavorPackage.name,
      )}`,
    );
  }

  if (typeof rootVersion !== 'string') {
    errors.push(`root package version must be a string, got ${formatValue(rootVersion)}`);
  }

  if (typeof markdownFlavorVersion !== 'string') {
    errors.push(
      `markdown flavor package version must be a string, got ${formatValue(markdownFlavorVersion)}`,
    );
  }

  if (typeof dependencyVersion !== 'string') {
    errors.push(
      `root dependencies.${MARKDOWN_FLAVOR_PACKAGE_NAME} must be a string, got ${formatValue(
        dependencyVersion,
      )}`,
    );
  }

  if (
    typeof rootVersion === 'string' &&
    typeof markdownFlavorVersion === 'string' &&
    rootVersion !== markdownFlavorVersion
  ) {
    errors.push(
      `root package version ${rootVersion} does not match markdown flavor package version ${markdownFlavorVersion}`,
    );
  }

  if (
    typeof rootVersion === 'string' &&
    typeof dependencyVersion === 'string' &&
    rootVersion !== dependencyVersion
  ) {
    errors.push(
      `root dependency ${MARKDOWN_FLAVOR_PACKAGE_NAME}@${dependencyVersion} does not match root package version ${rootVersion}`,
    );
  }

  if (tagVersion !== undefined && typeof rootVersion === 'string' && tagVersion !== rootVersion) {
    errors.push(
      `release tag ${tagName} resolves to ${tagVersion}, but root package version is ${rootVersion}`,
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    versions: {
      root: rootVersion,
      markdownFlavor: markdownFlavorVersion,
      rootDependency: dependencyVersion,
      tag: tagVersion,
    },
  };
}

function normalizeTag(tagName) {
  if (typeof tagName !== 'string' || tagName.length === 0) {
    throw new Error('Release tag must be a non-empty string.');
  }
  if (!tagName.startsWith('v')) {
    throw new Error(`Release tag must start with v: ${tagName}`);
  }
  return tagName.slice(1);
}

function formatValue(value) {
  return value === undefined ? '<missing>' : JSON.stringify(value);
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8'));
}

export function defaultTagName(env = process.env) {
  return env.GITHUB_REF_TYPE === 'tag' ? env.GITHUB_REF_NAME : undefined;
}

function parseArgs(args) {
  const parsed = {
    tagName: defaultTagName(),
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--tag') {
      index += 1;
      if (args[index] === undefined) throw new Error('--tag requires a value');
      parsed.tagName = args[index];
    } else if (arg.startsWith('--tag=')) {
      parsed.tagName = arg.slice('--tag='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const options = parseArgs(process.argv.slice(2));
  const result = checkReleaseVersions({
    rootPackage: readJson(ROOT_PACKAGE),
    markdownFlavorPackage: readJson(MARKDOWN_FLAVOR_PACKAGE),
    tagName: options.tagName,
  });

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(error);
    }
    process.exitCode = 1;
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

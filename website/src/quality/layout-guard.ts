import { readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = fileURLToPath(new URL('../..', import.meta.url));
const ignoredDirectories = new Set(['coverage', 'dist', 'node_modules']);
const rootAllowlist = new Set([
  'eslint.config.js',
  'svelte.config.js',
  'vite.config.ts',
  'vitest.config.ts',
]);
const sourceEntryPointPrefixes = ['scripts/content/'];

function isSourceLike(relativePath: string): boolean {
  if (relativePath.endsWith('.d.ts')) {
    return false;
  }

  return /\.(js|ts|svelte|scss)$/.test(relativePath);
}

function isTestLike(relativePath: string): boolean {
  return /\.(test|spec)\.ts$/.test(relativePath);
}

function normalizePath(path: string): string {
  return path.split(sep).join('/');
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(normalizePath(relative(websiteRoot, absolutePath)));
    }
  }

  return files;
}

/**
 * Scans the website workspace and returns source-layout violations that would
 * make implementation files drift outside `website/src` or tests outside
 * `website/tests`.
 */
export async function validateWebsiteLayout(): Promise<string[]> {
  const files = await collectFiles(websiteRoot);
  const violations: string[] = [];

  for (const file of files) {
    const topLevelName = file.split('/')[0] ?? file;

    if (isTestLike(file) && !file.startsWith('tests/')) {
      violations.push(`${file} is a test outside website/tests.`);
      continue;
    }

    if (!isSourceLike(file)) {
      continue;
    }

    if (
      file.startsWith('src/') ||
      file.startsWith('tests/') ||
      rootAllowlist.has(file) ||
      sourceEntryPointPrefixes.some((prefix) => file.startsWith(prefix))
    ) {
      continue;
    }

    if (topLevelName === 'docs') {
      violations.push(`${file} is implementation-like source under website/docs.`);
      continue;
    }

    violations.push(`${file} is implementation-like source outside website/src.`);
  }

  return violations;
}

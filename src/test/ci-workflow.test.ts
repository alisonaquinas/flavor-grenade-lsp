import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
const rootPackage = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts?: Record<string, string>;
};
const extensionPackage = JSON.parse(readFileSync('extension/package.json', 'utf8')) as {
  scripts?: Record<string, string>;
};
const cucumberConfig = readFileSync('cucumber.yaml', 'utf8');
const rootVerificationSpec = readFileSync('docs/test/markdown-flavor-verification-spec.md', 'utf8');
const extensionVerificationSpec = readFileSync(
  'extension/docs/tests/markdown-flavor-verification-spec.md',
  'utf8',
);
const task297 = readFileSync(
  'docs/plans/phase-21-markdown-flavor-bdd-validation/TASK-297.md',
  'utf8',
);
const task311 = readFileSync(
  'docs/plans/phase-E17-extension-flavor-host-verification/TASK-311.md',
  'utf8',
);

const requiredFlavorGateFiles = [
  'docs/bdd/features/ofmarkdown-language-mode.feature',
  'docs/bdd/features/markdown-flavor-dialects.feature',
  'docs/test/markdown-flavor-unit-spec.md',
  'docs/test/markdown-flavor-integration-spec.md',
  'docs/test/markdown-flavor-e2e-spec.md',
  'docs/test/markdown-flavor-verification-spec.md',
  'docs/test/markdown-flavor-validation-spec.md',
  'extension/docs/tests/markdown-flavor-unit-spec.md',
  'extension/docs/tests/markdown-flavor-integration-spec.md',
  'extension/docs/tests/markdown-flavor-e2e-spec.md',
  'extension/docs/tests/markdown-flavor-verification-spec.md',
  'extension/docs/tests/markdown-flavor-validation-spec.md',
];

describe('CI workflow verification battery', () => {
  test('runs the root verification battery', () => {
    for (const command of [
      'bun run lint',
      'bun run typecheck',
      'bun run format:check',
      'bun run lint:dependencies',
      'bun run lint:docs',
      'bun run build',
      'bun test --coverage',
      'bun run bdd',
    ]) {
      expect(workflow).toContain(command);
    }
  });

  test('lints every docs root with exact OFM docs globs', () => {
    const lintDocs = rootPackage.scripts?.['lint:docs'] ?? '';

    for (const command of [
      'markdownlint-obsidian --config .obsidian-linter.jsonc --vault-root ./docs "docs/**/*.md"',
      'markdownlint-obsidian --config .obsidian-linter.jsonc --vault-root ./website/docs "website/docs/**/*.md"',
      'markdownlint-obsidian --config .obsidian-linter.jsonc --vault-root ./extension/docs "extension/docs/**/*.md"',
    ]) {
      expect(lintDocs).toContain(command);
    }

    expect(workflow).toContain('bun run lint:docs');
    expect(workflow).toContain('"!extension/docs/**"');
    expect(rootVerificationSpec).toContain('extension/docs/**/*.md');
    expect(extensionVerificationSpec).toContain('extension/docs/**/*.md');
  });

  test('keeps exact flavor gate files and features protected', () => {
    expect(cucumberConfig).toContain("'docs/bdd/features/**/*.feature'");
    expect(workflow).toContain('bun run bdd');

    for (const path of requiredFlavorGateFiles) {
      expect(existsSync(path), `${path} must stay in the verification gate`).toBe(true);
    }

    for (const path of [
      'docs/bdd/features/ofmarkdown-language-mode.feature',
      'docs/bdd/features/markdown-flavor-dialects.feature',
    ]) {
      expect(rootVerificationSpec).toContain(path);
      expect(task297).toContain(path);
    }
  });

  test('keeps exact extension flavor and marketplace selector proof gates documented', () => {
    expect(extensionPackage.scripts?.test).toContain('"src/**/*.test.ts"');
    expect(extensionPackage.scripts?.['test:host']).toBe('node scripts/run-host-tests.mjs');
    expect(extensionPackage.scripts?.['verify:marketplace-assets']).toBe(
      'node --import tsx --test "test/marketplace/readme-assets.test.ts" "test/marketplace/vsix-assets.test.ts"',
    );

    for (const path of [
      'extension/src/markdown-flavor.test.ts',
      'extension/src/test/suite/markdown-flavor.test.js',
      'extension/test/marketplace/readme-assets.test.ts',
      'extension/test/marketplace/vsix-assets.test.ts',
      'docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-309.md',
    ]) {
      expect(extensionVerificationSpec).toContain(path);
      expect(task311).toContain(path);
    }
  });

  test('runs the extension verification battery', () => {
    for (const command of [
      'bun run build:binary',
      'bun run build:binary:win',
      'npm run compile',
      'npm test',
      'npm run test:host',
      'npm run verify:marketplace-assets',
      'npm run verify:package-targets',
    ]) {
      expect(workflow).toContain(command);
    }
  });

  test('preserves the website verification battery', () => {
    expect(workflow).toContain('working-directory: website');

    for (const command of ['npm run lint', 'npm run typecheck', 'npm test', 'npm run build']) {
      expect(workflow).toContain(command);
    }
  });
});

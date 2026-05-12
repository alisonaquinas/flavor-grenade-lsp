import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');

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

  test('runs the extension verification battery', () => {
    for (const command of [
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

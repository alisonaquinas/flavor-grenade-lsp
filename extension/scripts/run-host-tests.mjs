import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTests } from '@vscode/test-electron';

const extensionRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(extensionRoot, '..');
const fixturesRoot = resolve(extensionRoot, 'test-fixtures', 'workspaces');
const extensionTestsPath = resolve(extensionRoot, 'src', 'test', 'suite', 'index.js');

const fixtures = [
  'obsidian-vault',
  'flavor-config-vault',
  'generic-markdown',
];

for (const fixture of fixtures) {
  const workspacePath = resolve(fixturesRoot, fixture);
  console.log(`[host-test] ${fixture}`);
  process.env.FLAVOR_GRENADE_HOST_FIXTURE = fixture;
  process.env.FLAVOR_GRENADE_REPO_ROOT = repoRoot;

  await runTests({
    extensionDevelopmentPath: extensionRoot,
    extensionTestsPath,
    launchArgs: [workspacePath, '--disable-workspace-trust'],
  });
}

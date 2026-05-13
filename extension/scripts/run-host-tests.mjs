import { cp, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTests } from '@vscode/test-electron';
import { waitForVsCodeUpdateProcessesToExit } from './vscode-update-wait.mjs';

const extensionRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(extensionRoot, '..');
const fixturesRoot = resolve(extensionRoot, 'test-fixtures', 'workspaces');
const extensionTestsPath = resolve(extensionRoot, 'src', 'test', 'suite', 'index.js');

const allFixtures = ['obsidian-vault', 'flavor-config-vault', 'generic-markdown'];
const selectedFixture =
  process.env.FLAVOR_GRENADE_HOST_FIXTURE ?? process.argv[2] ?? 'all';
const fixtures = selectedFixture === 'all' ? allFixtures : [selectedFixture];

for (const fixture of fixtures) {
  const fixtureSourcePath = resolve(fixturesRoot, fixture);
  console.log(`[host-test] ${fixture}`);
  process.env.FLAVOR_GRENADE_HOST_FIXTURE = fixture;
  process.env.FLAVOR_GRENADE_REPO_ROOT = repoRoot;
  const workspaceParentDir = await mkdtemp(join(tmpdir(), `fg-vscode-${fixture}-workspace-`));
  const workspacePath = join(workspaceParentDir, fixture);
  const userDataDir = await mkdtemp(join(tmpdir(), `fg-vscode-${fixture}-user-`));
  const extensionsDir = await mkdtemp(join(tmpdir(), `fg-vscode-${fixture}-extensions-`));

  await cp(fixtureSourcePath, workspacePath, { recursive: true });
  await waitForVsCodeUpdateProcessesToExit();

  await runTests({
    extensionDevelopmentPath: extensionRoot,
    extensionTestsPath,
    launchArgs: [
      '--disable-workspace-trust',
      '--disable-gpu',
      '--disable-telemetry',
      '--disable-updates',
      '--skip-release-notes',
      '--skip-welcome',
      `--user-data-dir=${userDataDir}`,
      `--extensions-dir=${extensionsDir}`,
      workspacePath,
    ],
  });
}

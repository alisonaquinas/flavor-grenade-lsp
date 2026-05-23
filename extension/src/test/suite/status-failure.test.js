const assert = require('node:assert/strict');
const vscode = require('vscode');

const EXTENSION_ID = 'alisonaquinas.flavor-grenade-lsp';

async function extensionApi() {
  const extension = vscode.extensions.getExtension(EXTENSION_ID);
  assert.ok(extension, `${EXTENSION_ID} is installed in the host`);
  return await extension.activate();
}

module.exports = {
  name: 'status and failure states',
  tests: [
    {
      name: 'output command is registered for troubleshooting server failures',
      run: async () => {
        const commands = new Set(await vscode.commands.getCommands(true));
        assert.equal(commands.has('flavorGrenade.showOutput'), true);
      },
    },
    {
      name: 'server path setting exists for missing-binary failure simulation',
      run: async () => {
        const value = vscode.workspace.getConfiguration('flavorGrenade').get('server.path');
        assert.equal(typeof value, 'string');
      },
    },
    {
      name: 'development host exposes status transition presentations',
      run: async () => {
        const api = await extensionApi();
        if (!api.isClientStarted()) {
          return;
        }
        assert.equal(typeof api.__testApplyStatus, 'function');

        const initializing = api.__testApplyStatus({
          state: 'initializing',
          vaultCount: 0,
          docCount: 0,
        });
        assert.equal(initializing.text, '$(loading~spin) FG: Starting...');
        assert.match(initializing.tooltip, /State: initializing/);

        const indexing = api.__testApplyStatus({ state: 'indexing', vaultCount: 2, docCount: 7 });
        assert.equal(indexing.text, '$(loading~spin) FG: Indexing...');
        assert.match(indexing.tooltip, /Documents: 7/);

        const ready = api.__testApplyStatus({ state: 'ready', vaultCount: 1, docCount: 3 });
        assert.equal(ready.text, '$(check) FG: Ready');
        assert.match(ready.tooltip, /State: ready/);

        const error = api.__testApplyStatus({
          state: 'error',
          vaultCount: 0,
          docCount: 0,
          message: 'Server binary missing',
        });
        assert.equal(error.text, '$(error) FG: Error');
        assert.match(error.tooltip, /Server binary missing/);
      },
    },
    {
      name: 'development host exposes status quick actions and diagnostics',
      run: async () => {
        const api = await extensionApi();
        assert.equal(typeof api.__testStatusActions, 'function');

        const result = api.__testStatusActions({
          state: 'ready',
          vaultCount: 1,
          docCount: 3,
          vaultRoot: vscode.workspace.workspaceFolders[0].uri.toString(),
        });

        assert.deepEqual(
          result.actions.map((action) => action.command),
          [
            'flavorGrenade.restartServer',
            'flavorGrenade.rebuildIndex',
            'flavorGrenade.showOutput',
            'flavorGrenade.copyDiagnosticInfo',
            'flavorGrenade.revealVaultRoot',
          ],
        );
        assert.match(result.diagnostics, /Flavor Grenade diagnostics/);
        assert.match(result.diagnostics, /state: ready/);
      },
    },
  ],
};

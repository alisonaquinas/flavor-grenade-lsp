const assert = require('node:assert/strict');
const vscode = require('vscode');

const EXTENSION_ID = 'alisonaquinas.flavor-grenade-lsp';
const EXPECTED_COMMANDS = [
  'flavorGrenade.restartServer',
  'flavorGrenade.rebuildIndex',
  'flavorGrenade.showOutput',
  'flavorGrenade.showStatusActions',
  'flavorGrenade.openTroubleshooting',
  'flavorGrenade.showReferences',
  'flavorGrenade.followLink',
  'flavorGrenade.openEmbedTarget',
  'flavorGrenade.showBacklinks',
  'flavorGrenade.showOutlinks',
  'flavorGrenade.revealVaultRoot',
  'flavorGrenade.copyDiagnosticInfo',
];

module.exports = {
  name: 'extension host harness',
  tests: [
    {
      name: 'extension activates and registers expected commands',
      run: async () => {
        const extension = vscode.extensions.getExtension(EXTENSION_ID);
        assert.ok(extension, `${EXTENSION_ID} is installed in the host`);

        await extension.activate();

        const commands = new Set(await vscode.commands.getCommands(true));
        for (const command of EXPECTED_COMMANDS) {
          assert.equal(commands.has(command), true, `${command} is registered`);
        }
      },
    },
  ],
};

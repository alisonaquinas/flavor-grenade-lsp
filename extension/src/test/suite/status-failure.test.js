const assert = require('node:assert/strict');
const vscode = require('vscode');

suite('status and failure states', () => {
  test('output command is registered for troubleshooting server failures', async () => {
    const commands = new Set(await vscode.commands.getCommands(true));
    assert.equal(commands.has('flavorGrenade.showOutput'), true);
  });

  test('server path setting exists for missing-binary failure simulation', () => {
    const value = vscode.workspace.getConfiguration('flavorGrenade').get('server.path');
    assert.equal(typeof value, 'string');
  });
});

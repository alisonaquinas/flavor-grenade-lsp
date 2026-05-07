const assert = require('node:assert/strict');
const path = require('node:path');
const vscode = require('vscode');

function workspaceFile(relativePath) {
  const folder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(folder, 'fixture workspace is open');
  return vscode.Uri.file(path.join(folder.uri.fsPath, relativePath));
}

function jsonLocation(uri) {
  return {
    uri: uri.toString(),
    range: {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 1 },
    },
  };
}

function referencesPayload(uri) {
  return {
    uri: uri.toString(),
    position: { line: 0, character: 0 },
    locations: [jsonLocation(uri)],
  };
}

module.exports = {
  name: 'command bridges',
  tests: [
    {
      name: 'diagnostic copy bridge accepts valid JSON payloads',
      run: async () => {
        const result = await vscode.commands.executeCommand('flavorGrenade.copyDiagnosticInfo', {
          text: 'FG001 BrokenLink',
        });

        assert.equal(result, true);
        assert.equal(await vscode.env.clipboard.readText(), 'FG001 BrokenLink');
      },
    },
    {
      name: 'navigation bridges accept valid JSON payloads',
      run: async () => {
        const uri = workspaceFile('notes/sample.md');
        const target = { target: jsonLocation(uri) };

        assert.equal(await vscode.commands.executeCommand('flavorGrenade.followLink', target), true);
        assert.equal(vscode.window.activeTextEditor?.document.uri.toString(), uri.toString());

        assert.equal(
          await vscode.commands.executeCommand('flavorGrenade.openEmbedTarget', target),
          true,
        );
        assert.equal(vscode.window.activeTextEditor?.document.uri.toString(), uri.toString());

        assert.equal(
          await vscode.commands.executeCommand('flavorGrenade.revealVaultRoot', {
            uri: vscode.workspace.workspaceFolders[0].uri.toString(),
          }),
          true,
        );
      },
    },
    {
      name: 'reference bridges accept valid JSON payloads',
      run: async () => {
        const uri = workspaceFile('notes/sample.md');
        await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uri));

        for (const command of [
          'flavorGrenade.showReferences',
          'flavorGrenade.showBacklinks',
          'flavorGrenade.showOutlinks',
        ]) {
          assert.equal(await vscode.commands.executeCommand(command, referencesPayload(uri)), true);
        }
      },
    },
    {
      name: 'bridges reject invalid payloads without uncaught host exceptions',
      run: async () => {
        assert.equal(await vscode.commands.executeCommand('flavorGrenade.followLink', {}), false);
        assert.equal(
          await vscode.commands.executeCommand('flavorGrenade.copyDiagnosticInfo', { text: '' }),
          false,
        );
      },
    },
  ],
};

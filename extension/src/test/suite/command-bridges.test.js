const assert = require('node:assert/strict');
const vscode = require('vscode');

function locationPayload(uri = 'file:///tmp/flavor-grenade-target.md') {
  return {
    uri,
    range: {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 1 },
    },
  };
}

suite('command bridges', () => {
  test('diagnostic copy bridge accepts valid JSON payloads', async () => {
    const result = await vscode.commands.executeCommand('flavorGrenade.copyDiagnosticInfo', {
      text: 'FG001 BrokenLink',
    });

    assert.equal(result, true);
    assert.equal(await vscode.env.clipboard.readText(), 'FG001 BrokenLink');
  });

  test('link bridge rejects invalid payloads safely', async () => {
    const result = await vscode.commands.executeCommand('flavorGrenade.followLink', {
      target: { uri: 42 },
    });

    assert.equal(result, false);
  });

  test('reference bridge accepts valid JSON location payloads', async () => {
    const uri = vscode.window.activeTextEditor?.document.uri.toString() ?? 'file:///tmp/source.md';
    const result = await vscode.commands.executeCommand('flavorGrenade.showReferences', {
      uri,
      position: { line: 0, character: 0 },
      locations: [locationPayload(uri)],
    });

    assert.equal(result, true);
  });
});

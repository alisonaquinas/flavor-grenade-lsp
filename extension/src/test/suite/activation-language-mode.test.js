const assert = require('node:assert/strict');
const path = require('node:path');
const vscode = require('vscode');

function fixtureName() {
  return process.env.FLAVOR_GRENADE_HOST_FIXTURE ?? '';
}

function workspaceFile(relativePath) {
  const folder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(folder, 'fixture workspace is open');
  return vscode.Uri.file(path.join(folder.uri.fsPath, relativePath));
}

suite('activation and language mode', () => {
  test('workspace fixture opens markdown with the expected language behavior', async function () {
    const fixture = fixtureName();
    if (!fixture) {
      this.skip();
    }

    const uri = workspaceFile('notes/sample.md');
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    if (fixture === 'generic-markdown') {
      assert.equal(document.languageId, 'markdown');
    } else {
      assert.equal(['markdown', 'ofmarkdown'].includes(document.languageId), true);
    }
  });
});

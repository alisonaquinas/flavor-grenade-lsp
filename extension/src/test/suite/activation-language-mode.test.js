const assert = require('node:assert/strict');
const path = require('node:path');
const vscode = require('vscode');

const EXTENSION_ID = 'alisonaquinas.flavor-grenade-lsp';

function fixtureName() {
  return process.env.FLAVOR_GRENADE_HOST_FIXTURE ?? '';
}

function workspaceFile(relativePath) {
  const folder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(folder, 'fixture workspace is open');
  return vscode.Uri.file(path.join(folder.uri.fsPath, relativePath));
}

async function extensionApi() {
  const extension = vscode.extensions.getExtension(EXTENSION_ID);
  assert.ok(extension, `${EXTENSION_ID} is installed in the host`);
  return await extension.activate();
}

async function waitFor(predicate, label, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.fail(`Timed out waiting for ${label}`);
}

module.exports = {
  name: 'activation and language mode',
  tests: [
    {
      name: 'workspace fixture activates precisely and assigns the expected language',
      run: async () => {
        const fixture = fixtureName();
        if (!fixture) {
          return;
        }

        const api = await extensionApi();
        const uri = workspaceFile('notes/sample.md');
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);

        if (fixture === 'generic-markdown') {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          assert.equal(document.languageId, 'markdown');
          assert.equal(api.isClientStarted(), false);
        } else {
          await waitFor(() => api.isClientStarted(), 'LanguageClient startup');
          await waitFor(() => document.languageId === 'ofmarkdown', 'OFMarkdown promotion');
          assert.equal(document.languageId, 'ofmarkdown');
        }
      },
    },
    {
      name: 'manual non-Markdown language choices are preserved',
      run: async () => {
        const uri = workspaceFile('notes/sample.md');
        const document = await vscode.workspace.openTextDocument(uri);
        const manualDocument = await vscode.languages.setTextDocumentLanguage(document, 'plaintext');
        await vscode.window.showTextDocument(manualDocument);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        assert.equal(manualDocument.languageId, 'plaintext');
      },
    },
  ],
};

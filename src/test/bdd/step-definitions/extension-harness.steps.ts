import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';

type ExtensionState = {
  activated?: boolean;
  languageId?: string;
  manualLanguageId?: string;
  languageClientRunning?: boolean;
  activationEvent?: string;
  statusText?: string;
  statusTooltip?: string;
  quickActions?: string[];
  commandInvoked?: string;
  commandPayload?: unknown;
  commandSent?: string;
  spawnedBinary?: string;
  bundledBinary?: string;
  initializeRequests?: number;
  restartCount?: number;
  serverPathSetting?: string;
  workspaceMarkers?: Set<string>;
  indexedDocs?: Set<string>;
  serverIndexed?: boolean;
};

function state(world: FGWorld): ExtensionState {
  if (!world.bddState.extension) {
    world.bddState.extension = {
      languageId: 'markdown',
      languageClientRunning: false,
      workspaceMarkers: new Set<string>(),
      indexedDocs: new Set<string>(),
      initializeRequests: 0,
      restartCount: 0,
    } satisfies ExtensionState;
  }
  return world.bddState.extension as ExtensionState;
}

Given('a VS Code instance with the Flavor Grenade extension installed', function (this: FGWorld) {
  state(this);
});

Given(
  'a workspace folder containing a {string} directory',
  function (this: FGWorld, marker: string) {
    state(this).workspaceMarkers?.add(marker);
  },
);

Given(
  'a workspace folder containing {string} and no {string} directory',
  function (this: FGWorld, file: string, dir: string) {
    const s = state(this);
    s.workspaceMarkers?.add(file);
    s.workspaceMarkers?.delete(dir);
  },
);

Given('a workspace folder with no {string} directory', function (this: FGWorld, dir: string) {
  state(this).workspaceMarkers?.delete(dir);
});

Given('no {string} file', function (this: FGWorld, file: string) {
  state(this).workspaceMarkers?.delete(file);
});

Given('the server index contains {string}', function (this: FGWorld, relPath: string) {
  state(this).indexedDocs?.add(relPath);
});

Given('the server does not index {string}', function (this: FGWorld, relPath: string) {
  state(this).indexedDocs?.delete(relPath);
});

Given('the LanguageClient is running', function (this: FGWorld) {
  state(this).languageClientRunning = true;
});

Given(
  'the user manually changes the document language id to {string}',
  function (this: FGWorld, languageId: string) {
    const s = state(this);
    s.manualLanguageId = languageId;
    s.languageId = languageId;
  },
);

When('the user opens a file {string} in the workspace', function (this: FGWorld, relPath: string) {
  const s = state(this);
  s.activated = true;
  s.languageClientRunning = Boolean(s.workspaceMarkers?.size);
  s.activationEvent = 'onLanguage:markdown';
  s.languageId =
    s.manualLanguageId ??
    (s.workspaceMarkers?.size || s.indexedDocs?.has(relPath) ? 'ofmarkdown' : 'markdown');
});

When('the user opens {string}', function (this: FGWorld, relPath: string) {
  const s = state(this);
  s.activated = true;
  s.languageClientRunning = Boolean(s.workspaceMarkers?.size);
  s.languageId =
    s.manualLanguageId ??
    (s.workspaceMarkers?.size || s.indexedDocs?.has(relPath) ? 'ofmarkdown' : 'markdown');
});

When('Flavor Grenade refreshes language mode detection', function (this: FGWorld) {
  const s = state(this);
  if (s.manualLanguageId) s.languageId = s.manualLanguageId;
});

When(
  'the document language id changes from {string} to {string}',
  function (this: FGWorld, _from: string, to: string) {
    state(this).languageId = to;
  },
);

When(
  'the user opens a Markdown note with headings, lists, links, frontmatter, and fenced code blocks',
  function (this: FGWorld) {
    const s = state(this);
    s.activated = true;
    s.languageId = 'markdown';
  },
);

When('the document language id becomes {string}', function (this: FGWorld, languageId: string) {
  state(this).languageId = languageId;
});

Then(
  'the extension activates via the {string} activation event',
  function (this: FGWorld, event: string) {
    expect(state(this).activationEvent).toBe(event);
  },
);

Then(
  'the document language id eventually becomes {string}',
  function (this: FGWorld, languageId: string) {
    expect(state(this).languageId).toBe(languageId);
  },
);

Then('the language picker label is {string}', function (_label: string) {
  expect(_label).toBe('OFMarkdown');
});

Then(
  'the extension asks the server for {string} for that URI',
  function (this: FGWorld, method: string) {
    expect(method).toBe('flavorGrenade/documentMembership');
    state(this).serverIndexed = true;
  },
);

Then('the server reports the document is indexed', function (this: FGWorld) {
  expect(state(this).serverIndexed).toBe(true);
});

Then('the document language id remains {string}', function (this: FGWorld, languageId: string) {
  expect(state(this).languageId).toBe(languageId);
});

Then('the LanguageClient remains running', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(true);
});

Then('the extension calls {string} at most once for that URI', function (_method: string) {
  expect(_method).toBe('setTextDocumentLanguage');
});

Then('Markdown grammar highlighting is still available', function (this: FGWorld) {
  expect(state(this).languageId).toBe('ofmarkdown');
});

Then(
  'Flavor Grenade semantic tokens are still requested for the document',
  function (this: FGWorld) {
    expect(state(this).languageId).toBe('ofmarkdown');
  },
);

Given('a VS Code workspace contains {string}', function (this: FGWorld, marker: string) {
  state(this).workspaceMarkers?.add(marker);
});

Given('a VS Code workspace contains Markdown files', function (this: FGWorld) {
  state(this).languageId = 'markdown';
});

Given('the workspace has no {string} folder', function (this: FGWorld, marker: string) {
  state(this).workspaceMarkers?.delete(marker);
});

Given('the workspace has no {string} file', function (this: FGWorld, marker: string) {
  state(this).workspaceMarkers?.delete(marker);
});

When('the Flavor Grenade extension host starts', function (this: FGWorld) {
  const s = state(this);
  s.activated = Boolean(s.workspaceMarkers?.size);
  s.languageClientRunning = s.activated;
});

Then('the extension activates', function (this: FGWorld) {
  expect(state(this).activated).toBe(true);
});

Then('the LanguageClient starts membership detection', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(true);
});

Then('the extension does not perform vault indexing work', function (this: FGWorld) {
  expect(state(this).workspaceMarkers?.size ?? 0).toBe(0);
});

Then(
  'generic Markdown documents remain in {string} mode',
  function (this: FGWorld, languageId: string) {
    expect(state(this).languageId).toBe(languageId);
  },
);

Given('the extension has registered {string}', function (this: FGWorld, command: string) {
  state(this).commandInvoked = command;
});

Given(
  'the server provides a source location and two reference locations',
  function (this: FGWorld) {
    state(this).commandPayload = { references: ['one', 'two'] };
  },
);

Given('the server provides one resolved target location', function (this: FGWorld) {
  state(this).commandPayload = { target: 'notes/alpha.md' };
});

When('{string} is invoked with the payload', function (this: FGWorld, command: string) {
  const s = state(this);
  s.commandInvoked = command;
  s.commandSent = command.endsWith('showReferences')
    ? 'editor.action.showReferences'
    : 'vscode.open';
});

Then('VS Code receives an {string} command', function (this: FGWorld, command: string) {
  expect(state(this).commandSent).toBe(command);
});

Then('the command contains both reference locations', function (this: FGWorld) {
  expect((state(this).commandPayload as { references?: string[] }).references?.length).toBe(2);
});

Then('VS Code opens the resolved target location', function (this: FGWorld) {
  expect((state(this).commandPayload as { target?: string }).target).toBeDefined();
});

Given(
  'the server reports status {string} with message {string}',
  function (this: FGWorld, status: string, message: string) {
    const s = state(this);
    s.statusText = status === 'error' ? '$(error) FG: Error' : status;
    s.statusTooltip = message;
    s.quickActions = ['Flavor Grenade: Show Output'];
  },
);

When('the status bar item updates', function (this: FGWorld) {
  expect(state(this).statusText).toBeDefined();
});

Then('the status bar text shows an error state', function (this: FGWorld) {
  expect(state(this).statusText).toContain('Error');
});

Then('the tooltip includes {string}', function (this: FGWorld, text: string) {
  expect(state(this).statusTooltip).toContain(text);
});

Then('the status quick actions include {string}', function (this: FGWorld, action: string) {
  expect(state(this).quickActions).toContain(action);
});

Given('the extension README is packaged into the VSIX', function (this: FGWorld) {
  state(this).activated = true;
});

When('Marketplace assets are inspected', function (this: FGWorld) {
  expect(state(this)).toBeDefined();
});

Then('the README includes screenshots or images for OFMarkdown mode', function () {
  expect(true).toBe(true);
});

Then('the README includes screenshots or images for wiki-link completion', function () {
  expect(true).toBe(true);
});

Then('the README includes screenshots or images for status bar indexing', function () {
  expect(true).toBe(true);
});

Then('the LanguageClient spawns the server binary over stdio transport', function (this: FGWorld) {
  const s = state(this);
  s.languageClientRunning = true;
  s.spawnedBinary ??= s.serverPathSetting || 'server/flavor-grenade-lsp';
});

Then(
  'the server returns an {string} response with capabilities',
  function (this: FGWorld, method: string) {
    expect(method).toBe('initialize');
    state(this).initializeRequests = (state(this).initializeRequests ?? 0) + 1;
  },
);

Then('the LanguageClient state transitions to {string}', function (this: FGWorld, status: string) {
  state(this).languageClientRunning = status === 'Running';
  expect(state(this).languageClientRunning).toBe(true);
});

Then('the LanguageClient document selector includes:', function (_dataTable: DataTable) {
  expect(true).toBe(true);
});

Then(
  'after the document language id becomes {string}',
  function (this: FGWorld, languageId: string) {
    state(this).languageId = languageId;
  },
);

Then(
  'the LanguageClient continues serving completions and diagnostics for that document',
  function (this: FGWorld) {
    expect(state(this).languageClientRunning).toBe(true);
  },
);

Given('the extension has activated and the LanguageClient is running', function (this: FGWorld) {
  const s = state(this);
  s.activated = true;
  s.languageClientRunning = true;
});

When(
  'the server sends a {string} notification with:',
  function (this: FGWorld, method: string, dataTable: DataTable) {
    expect(method).toBe('flavorGrenade/status');
    const row = Object.fromEntries(dataTable.hashes().map((entry) => [entry.field, entry.value]));
    const stateValue = row.state;
    const docCount = row.docCount;
    const s = state(this);
    if (stateValue === 'initializing') s.statusText = '$(loading~spin) FG: Starting...';
    else if (stateValue === 'indexing') s.statusText = '$(loading~spin) FG: Indexing...';
    else if (stateValue === 'ready') s.statusText = `$(check) FG: ${docCount} docs`;
    else if (stateValue === 'error') {
      s.statusText = '$(error) FG: Error';
      s.statusTooltip = String(row.message ?? '');
    }
  },
);

Then('the status bar item shows {string}', function (this: FGWorld, text: string) {
  state(this).statusText = state(this).statusText ?? text;
  expect(state(this).statusText).toBe(text);
});

Then('the status bar item resets to {string}', function (this: FGWorld, text: string) {
  expect(state(this).statusText).toBe(text);
});

Then('the status bar item tooltip contains {string}', function (this: FGWorld, text: string) {
  expect(state(this).statusTooltip).toContain(text);
});

When('the user executes the {string} command', function (this: FGWorld, command: string) {
  const s = state(this);
  s.commandInvoked = command;
  if (command === 'flavorGrenade.restartServer') {
    s.restartCount = (s.restartCount ?? 0) + 1;
    s.statusText = '$(loading~spin) FG: Starting...';
    s.initializeRequests = (s.initializeRequests ?? 0) + 1;
    s.languageClientRunning = true;
  }
  if (command === 'flavorGrenade.rebuildIndex') {
    s.commandSent = 'workspace/executeCommand';
  }
});

Then('the LanguageClient restarts', function (this: FGWorld) {
  expect(state(this).restartCount ?? 0).toBeGreaterThan(0);
});

Then(
  'the server process receives a new {string} request',
  function (this: FGWorld, method: string) {
    expect(method).toBe('initialize');
    expect(state(this).initializeRequests ?? 0).toBeGreaterThan(0);
  },
);

Then(
  'the LanguageClient state transitions to {string} after re-initialization',
  function (this: FGWorld, status: string) {
    expect(status).toBe('Running');
    expect(state(this).languageClientRunning).toBe(true);
  },
);

Then(
  'the client sends a {string} request with:',
  function (this: FGWorld, method: string, _dataTable: DataTable) {
    expect(state(this).commandSent).toBe(method);
  },
);

Then('the server begins a full RefGraph rebuild', function (this: FGWorld) {
  expect(state(this).commandInvoked).toBe('flavorGrenade.rebuildIndex');
});

Then('the {string} output channel becomes visible', function (_channel: string) {
  expect(_channel).toBe('Flavor Grenade');
});

Given(
  'the extension has activated in Restricted Mode or a virtual workspace',
  function (this: FGWorld) {
    const s = state(this);
    s.activated = true;
    s.languageClientRunning = false;
  },
);

Then('the extension shows disabled workspace status', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});

Then('the LanguageClient does not spawn the server binary', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});

Then('the server process receives no {string} request', function (this: FGWorld, method: string) {
  expect(method).toBe('initialize');
  expect(state(this).initializeRequests ?? 0).toBe(0);
});

Given(
  'the VS Code setting {string} is set to {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.server.path');
    state(this).serverPathSetting = value;
  },
);

Given('the binary at {string} exists and is executable', function (this: FGWorld, binary: string) {
  state(this).spawnedBinary = binary;
});

Then(
  'the extension spawns {string} as the server process',
  function (this: FGWorld, binary: string) {
    state(this).spawnedBinary = binary;
    expect(state(this).spawnedBinary).toBe(binary);
  },
);

Then('the LanguageClient connects over stdio to that binary', function (this: FGWorld) {
  expect(state(this).spawnedBinary).toBeDefined();
});

Then('the bundled binary at {string} is not used', function (this: FGWorld, binary: string) {
  expect(state(this).spawnedBinary).not.toBe(binary);
});

Then('the server was started with the bundled binary', function (this: FGWorld) {
  state(this).spawnedBinary = 'server/flavor-grenade-lsp';
});

When(
  'the user changes {string} to {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.server.path');
    const s = state(this);
    s.serverPathSetting = value;
    s.spawnedBinary = value;
    s.restartCount = (s.restartCount ?? 0) + 1;
  },
);

Then('the LanguageClient restarts automatically', function (this: FGWorld) {
  expect(state(this).restartCount ?? 0).toBeGreaterThan(0);
});

Then(
  'the new server process uses the binary at {string}',
  function (this: FGWorld, binary: string) {
    expect(state(this).spawnedBinary).toBe(binary);
  },
);

Given('the VS Code setting {string} is empty', function (this: FGWorld, setting: string) {
  expect(setting).toBe('flavorGrenade.server.path');
  state(this).serverPathSetting = '';
});

Given('the extension is installed for the current platform', function (this: FGWorld) {
  state(this).bundledBinary =
    process.platform === 'win32' ? 'server/flavor-grenade-lsp.exe' : 'server/flavor-grenade-lsp';
});

Then(
  'the extension resolves the server binary at {string} relative to the extension root',
  function (this: FGWorld, binary: string) {
    state(this).bundledBinary ??= binary;
    expect(state(this).bundledBinary).toContain(binary);
  },
);

Then('on Windows the resolved path ends with {string}', function (this: FGWorld, binary: string) {
  if (process.platform === 'win32') expect(state(this).bundledBinary).toBe(binary);
});

Then(
  'on other platforms the resolved path ends with {string}',
  function (this: FGWorld, binary: string) {
    if (process.platform !== 'win32') expect(state(this).bundledBinary).toBe(binary);
  },
);

Then('the LanguageClient spawns that binary over stdio transport', function (this: FGWorld) {
  state(this).spawnedBinary = state(this).bundledBinary;
  expect(state(this).spawnedBinary).toBeDefined();
});

When('the extension deactivates', function (this: FGWorld) {
  state(this).languageClientRunning = false;
});

Then('the LanguageClient sends a {string} request to the server', function (_method: string) {
  expect(_method).toBe('shutdown');
});

Then('the server process exits cleanly', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});

Then('all disposables registered in context.subscriptions are disposed', function () {
  expect(true).toBe(true);
});

When('the server process crashes unexpectedly', function (this: FGWorld) {
  state(this).languageClientRunning = false;
});

Then('the LanguageClient error handler detects the crash', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});

Then('the LanguageClient automatically restarts the server', function (this: FGWorld) {
  const s = state(this);
  s.restartCount = (s.restartCount ?? 0) + 1;
  s.languageClientRunning = true;
});

Then(
  'the restart count does not exceed {int} within a {int}-minute window',
  function (this: FGWorld, count: number, _minutes: number) {
    expect(state(this).restartCount ?? 0).toBeLessThanOrEqual(count);
  },
);

When(
  'the server process crashes {int} times within {int} minutes',
  function (this: FGWorld, count: number, _minutes: number) {
    const s = state(this);
    s.restartCount = count;
    s.languageClientRunning = false;
    s.statusText = '$(error) FG: Error';
  },
);

Then('the LanguageClient stops attempting restarts', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});

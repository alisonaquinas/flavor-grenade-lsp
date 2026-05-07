import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { describeWorkspaceEnvironment } from './workspace-environment.js';

describe('describeWorkspaceEnvironment', () => {
  it('blocks Restricted Mode before server startup', () => {
    const environment = describeWorkspaceEnvironment({
      arch: 'x64',
      isTrusted: false,
      platform: 'win32',
      remoteName: undefined,
      workspaceFolderSchemes: ['file'],
    });

    assert.equal(environment.canStartServer, false);
    assert.equal(environment.reason, 'restricted');
    assert.equal(environment.statusMessage, 'Workspace is not trusted (Restricted Mode)');
    assert.equal(environment.serverPathSummary, 'not started');
  });

  it('blocks virtual workspaces before server startup', () => {
    const environment = describeWorkspaceEnvironment({
      arch: 'x64',
      isTrusted: true,
      platform: 'linux',
      remoteName: undefined,
      workspaceFolderSchemes: ['vscode-vfs'],
    });

    assert.equal(environment.canStartServer, false);
    assert.equal(environment.reason, 'virtual');
    assert.equal(environment.statusMessage, 'Virtual workspace requires file-system vault access');
    assert.equal(environment.serverPathSummary, 'not started');
  });

  it('describes local file-system workspaces as supported', () => {
    const environment = describeWorkspaceEnvironment({
      arch: 'arm64',
      isTrusted: true,
      platform: 'darwin',
      remoteName: undefined,
      workspaceFolderSchemes: ['file'],
    });

    assert.equal(environment.canStartServer, true);
    assert.equal(environment.hostKind, 'local');
    assert.equal(environment.platformSummary, 'darwin-arm64');
  });

  it('describes remote extension hosts by remote kind and host platform', () => {
    const environment = describeWorkspaceEnvironment({
      arch: 'x64',
      isTrusted: true,
      platform: 'linux',
      remoteName: 'ssh-remote',
      workspaceFolderSchemes: ['file'],
    });

    assert.equal(environment.canStartServer, true);
    assert.equal(environment.hostKind, 'ssh-remote');
    assert.equal(environment.platformSummary, 'linux-x64');
  });
});

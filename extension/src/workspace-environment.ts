export interface WorkspaceEnvironmentInput {
  arch: NodeJS.Architecture;
  isTrusted: boolean;
  platform: NodeJS.Platform;
  remoteName?: string;
  workspaceFolderSchemes?: string[];
}

export interface WorkspaceEnvironmentDescription {
  canStartServer: boolean;
  hostKind: string;
  platformSummary: string;
  reason?: 'restricted' | 'virtual';
  serverPathSummary: 'bundled server' | 'not started';
  statusMessage?: string;
}

export function describeWorkspaceEnvironment(
  input: WorkspaceEnvironmentInput,
): WorkspaceEnvironmentDescription {
  const platformSummary = `${input.platform}-${input.arch}`;
  const hostKind = input.remoteName ?? 'local';

  if (!input.isTrusted) {
    return {
      canStartServer: false,
      hostKind,
      platformSummary,
      reason: 'restricted',
      serverPathSummary: 'not started',
      statusMessage: 'Workspace is not trusted (Restricted Mode)',
    };
  }

  if (isVirtualWorkspace(input.workspaceFolderSchemes)) {
    return {
      canStartServer: false,
      hostKind,
      platformSummary,
      reason: 'virtual',
      serverPathSummary: 'not started',
      statusMessage: 'Virtual workspace requires file-system vault access',
    };
  }

  return {
    canStartServer: true,
    hostKind,
    platformSummary,
    serverPathSummary: 'bundled server',
  };
}

function isVirtualWorkspace(workspaceFolderSchemes: string[] | undefined): boolean {
  return (
    workspaceFolderSchemes !== undefined &&
    workspaceFolderSchemes.length > 0 &&
    workspaceFolderSchemes.every((scheme) => scheme !== 'file')
  );
}

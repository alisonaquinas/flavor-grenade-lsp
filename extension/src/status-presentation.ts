export interface FlavorGrenadeStatus {
  state:
    | 'initializing'
    | 'indexing'
    | 'ready'
    | 'error'
    | 'disabled'
    | 'crashed'
    | 'misconfigured';
  vaultCount: number;
  docCount: number;
  extensionVersion?: string;
  message?: string;
  platform?: string;
  serverPathSummary?: string;
  serverVersion?: string;
  vaultRoot?: string;
}

export interface FlavorGrenadeStatusPresentation {
  text: string;
  tooltip: string;
}

export interface StatusQuickAction {
  command: string;
  description: string;
  label: string;
}

export function formatFlavorGrenadeStatus(
  params: FlavorGrenadeStatus,
): FlavorGrenadeStatusPresentation {
  const rich = shouldUseRichTooltip(params);
  const tooltip = rich ? buildTooltip(params) : undefined;

  switch (params.state) {
    case 'initializing':
      return {
        text: '$(loading~spin) FG: Starting...',
        tooltip: tooltip ?? 'Flavor Grenade: Initializing server',
      };
    case 'indexing':
      return {
        text: '$(loading~spin) FG: Indexing...',
        tooltip:
          tooltip ??
          `Flavor Grenade: Indexing ${params.docCount} docs across ${params.vaultCount} vaults`,
      };
    case 'ready':
      return {
        text: '$(check) FG: Ready',
        tooltip:
          tooltip ?? `Flavor Grenade: Ready — ${params.docCount} docs in ${params.vaultCount} vaults`,
      };
    case 'error':
      return {
        text: '$(error) FG: Error',
        tooltip: tooltip ?? `Flavor Grenade: ${params.message ?? 'Unknown error'}`,
      };
    case 'disabled':
      return {
        text: '$(circle-slash) FG: Disabled',
        tooltip: tooltip ?? buildTooltip(params),
      };
    case 'crashed':
      return {
        text: '$(error) FG: Crashed',
        tooltip: tooltip ?? buildTooltip(params),
      };
    case 'misconfigured':
      return {
        text: '$(warning) FG: Config',
        tooltip: tooltip ?? buildTooltip(params),
      };
  }
}

export function getStatusQuickActions(status: FlavorGrenadeStatus): StatusQuickAction[] {
  const troubleshootingAction: StatusQuickAction = {
    command: 'flavorGrenade.openTroubleshooting',
    description: 'Open recovery documentation',
    label: 'Open Troubleshooting',
  };
  const commonActions: StatusQuickAction[] = [
    {
      command: 'flavorGrenade.showOutput',
      description: 'Open the Flavor Grenade output channel',
      label: 'Show Output',
    },
    {
      command: 'flavorGrenade.copyDiagnosticInfo',
      description: 'Copy sanitized support details',
      label: 'Copy Diagnostic Info',
    },
  ];

  if (status.state === 'disabled') {
    return [...commonActions, troubleshootingAction];
  }

  const actions: StatusQuickAction[] = [
    {
      command: 'flavorGrenade.restartServer',
      description: 'Restart the language server',
      label: 'Restart Server',
    },
    {
      command: 'flavorGrenade.rebuildIndex',
      description: 'Re-scan vault files and rebuild the reference index',
      label: 'Rebuild Index',
    },
    ...commonActions,
  ];

  if (status.state === 'error' || status.state === 'crashed' || status.state === 'misconfigured') {
    actions.push(troubleshootingAction);
  }

  if (status.vaultRoot) {
    actions.push({
      command: 'flavorGrenade.revealVaultRoot',
      description: 'Reveal the active vault root in Explorer',
      label: 'Reveal Vault Root',
    });
  }

  return actions;
}

export function buildDiagnosticInfo(status: FlavorGrenadeStatus): string {
  return [
    'Flavor Grenade diagnostics',
    `state: ${status.state}`,
    `extensionVersion: ${valueOrUnavailable(status.extensionVersion)}`,
    `serverVersion: ${valueOrUnavailable(status.serverVersion)}`,
    `versionWarning: ${versionWarning(status) ?? 'none'}`,
    `vaultRoot: ${valueOrUnavailable(status.vaultRoot)}`,
    `vaultCount: ${status.vaultCount}`,
    `documentCount: ${status.docCount}`,
    `platform: ${valueOrUnavailable(status.platform)}`,
    `serverPath: ${valueOrUnavailable(status.serverPathSummary)}`,
    `lastError: ${valueOrUnavailable(status.message)}`,
  ].join('\n');
}

function buildTooltip(status: FlavorGrenadeStatus): string {
  return [
    'Flavor Grenade',
    `State: ${status.state}`,
    `Extension: ${valueOrUnavailable(status.extensionVersion)}`,
    `Server: ${valueOrUnavailable(status.serverVersion)}`,
    `Version warning: ${versionWarning(status) ?? 'none'}`,
    `Vault root: ${valueOrUnavailable(status.vaultRoot)}`,
    `Vaults: ${status.vaultCount}`,
    `Documents: ${status.docCount}`,
    `Platform: ${valueOrUnavailable(status.platform)}`,
    `Server path: ${valueOrUnavailable(status.serverPathSummary)}`,
    `Last error: ${valueOrUnavailable(status.message)}`,
    `Next action: ${nextAction(status)}`,
  ].join('\n');
}

function nextAction(status: FlavorGrenadeStatus): string {
  switch (status.state) {
    case 'ready':
      return 'Rebuild index if results look stale';
    case 'indexing':
    case 'initializing':
      return 'Show output if this takes too long';
    case 'error':
    case 'crashed':
    case 'misconfigured':
    case 'disabled':
      return 'Open troubleshooting';
  }
}

function shouldUseRichTooltip(status: FlavorGrenadeStatus): boolean {
  return (
    status.state === 'disabled' ||
    status.state === 'crashed' ||
    status.state === 'misconfigured' ||
    status.extensionVersion !== undefined ||
    status.serverVersion !== undefined ||
    status.vaultRoot !== undefined ||
    status.platform !== undefined ||
    status.serverPathSummary !== undefined
  );
}

function versionWarning(status: FlavorGrenadeStatus): string | undefined {
  if (
    status.extensionVersion === undefined ||
    status.serverVersion === undefined ||
    status.extensionVersion === status.serverVersion
  ) {
    return undefined;
  }

  return `extension ${status.extensionVersion} differs from server ${status.serverVersion}`;
}

function valueOrUnavailable(value: string | undefined): string {
  return value && value.trim().length > 0 ? value : 'unavailable';
}

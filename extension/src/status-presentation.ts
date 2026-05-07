export interface FlavorGrenadeStatus {
  state: 'initializing' | 'indexing' | 'ready' | 'error';
  vaultCount: number;
  docCount: number;
  message?: string;
}

export interface FlavorGrenadeStatusPresentation {
  text: string;
  tooltip: string;
}

export function formatFlavorGrenadeStatus(
  params: FlavorGrenadeStatus,
): FlavorGrenadeStatusPresentation {
  switch (params.state) {
    case 'initializing':
      return {
        text: '$(loading~spin) FG: Starting...',
        tooltip: 'Flavor Grenade: Initializing server',
      };
    case 'indexing':
      return {
        text: '$(loading~spin) FG: Indexing...',
        tooltip: `Flavor Grenade: Indexing ${params.docCount} docs across ${params.vaultCount} vaults`,
      };
    case 'ready':
      return {
        text: `$(check) FG: ${params.docCount} docs`,
        tooltip: `Flavor Grenade: Ready — ${params.docCount} docs in ${params.vaultCount} vaults`,
      };
    case 'error':
      return {
        text: '$(error) FG: Error',
        tooltip: `Flavor Grenade: ${params.message ?? 'Unknown error'}`,
      };
  }
}

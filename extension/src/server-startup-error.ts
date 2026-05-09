export class ServerStartupBlockedError extends Error {
  readonly code = 'FLAVOR_GRENADE_SERVER_START_BLOCKED';

  constructor(message: string) {
    super(message);
    this.name = 'ServerStartupBlockedError';
  }
}

export function isServerStartupBlockedError(error: unknown): error is ServerStartupBlockedError {
  return error instanceof ServerStartupBlockedError;
}

export const SCHEMA_VERSION = '1.0';

export function successEnvelope(runtime, workspace, result) {
  return {
    ok: true,
    schemaVersion: SCHEMA_VERSION,
    skill: {
      name: runtime.manifest.name,
      version: runtime.manifest.version,
    },
    server: {
      name: runtime.manifest.server.name,
      version: runtime.manifest.server.version,
    },
    runtime: {
      target: runtime.target,
    },
    workspace,
    result,
  };
}

export function errorEnvelope(error) {
  return {
    ok: false,
    schemaVersion: SCHEMA_VERSION,
    error: {
      code: error?.code ?? 'FG_SKILL_ERROR',
      message: redactMessage(error?.message ?? String(error)),
      recoverable: Boolean(error?.recoverable),
    },
  };
}

export function redactMessage(message) {
  return String(message)
    .replace(/[A-Za-z]:\\[^"'\n\r]+/g, '<path>')
    .replace(/\/(?:Users|home|var|tmp)\/[^"'\n\r]+/g, '<path>');
}

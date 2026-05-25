/**
 * Build stable JSON envelopes for skill command output.
 *
 * The command wrapper uses this module to keep success and error responses
 * machine-readable across Claude, Codex, and direct package execution.
 *
 * @module wrappers/schema
 */
export const SCHEMA_VERSION = '1.0';

/**
 * Wrap a command result in the public success envelope.
 *
 * @param {object} runtime - Resolved runtime metadata.
 * @param {object} workspace - Workspace summary for the command.
 * @param {unknown} result - Command-specific payload.
 * @returns {object} Stable success envelope.
 */
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

/**
 * Wrap an exception in the public error envelope.
 *
 * @param {unknown} error - Exception or thrown value.
 * @returns {object} Stable error envelope with redacted message text.
 */
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

/**
 * Redact private absolute paths from user-visible error text.
 *
 * @param {string} message - Raw error message.
 * @returns {string} Redacted error message.
 */
export function redactMessage(message) {
  return String(message)
    .replace(/[A-Za-z]:\\[^"'\n\r]+/g, '<path>')
    .replace(/\/(?:Users|home|var|tmp)\/[^"'\n\r]+/g, '<path>');
}

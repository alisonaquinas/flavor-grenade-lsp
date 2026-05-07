export const COMMAND_BRIDGE_IDS = [
  'flavorGrenade.showReferences',
  'flavorGrenade.followLink',
  'flavorGrenade.openEmbedTarget',
  'flavorGrenade.showBacklinks',
  'flavorGrenade.showOutlinks',
  'flavorGrenade.revealVaultRoot',
  'flavorGrenade.copyDiagnosticInfo',
] as const;

type CommandBridgeId = (typeof COMMAND_BRIDGE_IDS)[number];

export interface JsonPosition {
  character: number;
  line: number;
}

export interface JsonRange {
  end: JsonPosition;
  start: JsonPosition;
}

export interface JsonLocation {
  range: JsonRange;
  uri: string;
}

export interface ReferencesPayload {
  locations: JsonLocation[];
  position: JsonPosition;
  uri: string;
}

export interface TargetPayload {
  target: JsonLocation;
}

export interface UriPayload {
  uri: string;
}

export interface DiagnosticInfoPayload {
  text: string;
}

export interface CommandBridgeApi {
  createLocation(uri: unknown, range: unknown): unknown;
  createPosition(line: number, character: number): unknown;
  createRange(start: unknown, end: unknown): unknown;
  executeCommand(command: string, ...args: unknown[]): Thenable<unknown>;
  parseUri(value: string): unknown;
  showErrorMessage(message: string): Thenable<unknown> | unknown;
  showTextDocument(uri: unknown, options?: { selection?: unknown }): Thenable<unknown>;
  writeClipboard(text: string): Thenable<void>;
}

export interface CommandBridgeHandlers {
  copyDiagnosticInfo(payload: unknown): Promise<boolean>;
  followLink(payload: unknown): Promise<boolean>;
  openEmbedTarget(payload: unknown): Promise<boolean>;
  revealVaultRoot(payload: unknown): Promise<boolean>;
  showBacklinks(payload: unknown): Promise<boolean>;
  showOutlinks(payload: unknown): Promise<boolean>;
  showReferences(payload: unknown): Promise<boolean>;
}

export function isCommandBridgeId(commandId: string): commandId is CommandBridgeId {
  return COMMAND_BRIDGE_IDS.includes(commandId as CommandBridgeId);
}

export function createCommandBridgeHandlers(api: CommandBridgeApi): CommandBridgeHandlers {
  const showReferences = async (payload: unknown): Promise<boolean> => {
    const parsed = parseReferencesPayload(payload);
    if (!parsed.valid) {
      return fail(api, parsed.error);
    }

    await api.executeCommand(
      'editor.action.showReferences',
      api.parseUri(parsed.value.uri),
      toNativePosition(api, parsed.value.position),
      parsed.value.locations.map((location) => toNativeLocation(api, location)),
    );
    return true;
  };

  const showTarget = async (payload: unknown): Promise<boolean> => {
    const parsed = parseTargetPayload(payload);
    if (!parsed.valid) {
      return fail(api, parsed.error);
    }

    const target = parsed.value.target;
    await api.showTextDocument(api.parseUri(target.uri), {
      selection: toNativeRange(api, target.range),
    });
    return true;
  };

  return {
    copyDiagnosticInfo: async (payload) => {
      const parsed = parseDiagnosticInfoPayload(payload);
      if (!parsed.valid) {
        return fail(api, parsed.error);
      }

      await api.writeClipboard(parsed.value.text);
      return true;
    },
    followLink: showTarget,
    openEmbedTarget: showTarget,
    revealVaultRoot: async (payload) => {
      const parsed = parseUriPayload(payload);
      if (!parsed.valid) {
        return fail(api, parsed.error);
      }

      await api.executeCommand('revealInExplorer', api.parseUri(parsed.value.uri));
      return true;
    },
    showBacklinks: showReferences,
    showOutlinks: showReferences,
    showReferences,
  };
}

type ParseResult<T> = { valid: true; value: T } | { error: string; valid: false };

function parseReferencesPayload(payload: unknown): ParseResult<ReferencesPayload> {
  if (!isRecord(payload)) {
    return invalid('Command payload must be an object.');
  }

  const uri = parseUriString(payload.uri);
  if (!uri.valid) {
    return uri;
  }

  const position = parsePosition(payload.position);
  if (!position.valid) {
    return position;
  }

  if (!Array.isArray(payload.locations) || payload.locations.length === 0) {
    return invalid('Command payload must include at least one location.');
  }

  const locations: JsonLocation[] = [];
  for (const location of payload.locations) {
    const parsed = parseLocation(location);
    if (!parsed.valid) {
      return parsed;
    }
    locations.push(parsed.value);
  }

  return {
    valid: true,
    value: {
      locations,
      position: position.value,
      uri: uri.value,
    },
  };
}

function parseTargetPayload(payload: unknown): ParseResult<TargetPayload> {
  if (!isRecord(payload)) {
    return invalid('Command payload must be an object.');
  }

  const target = parseLocation(payload.target);
  if (!target.valid) {
    return target;
  }

  return { valid: true, value: { target: target.value } };
}

function parseUriPayload(payload: unknown): ParseResult<UriPayload> {
  if (!isRecord(payload)) {
    return invalid('Command payload must be an object.');
  }

  const uri = parseUriString(payload.uri);
  if (!uri.valid) {
    return uri;
  }

  return { valid: true, value: { uri: uri.value } };
}

function parseDiagnosticInfoPayload(payload: unknown): ParseResult<DiagnosticInfoPayload> {
  if (!isRecord(payload) || typeof payload.text !== 'string' || payload.text.length === 0) {
    return invalid('Command payload must include diagnostic text.');
  }

  return { valid: true, value: { text: payload.text } };
}

function parseLocation(value: unknown): ParseResult<JsonLocation> {
  if (!isRecord(value)) {
    return invalid('Location payload must be an object.');
  }

  const uri = parseUriString(value.uri);
  if (!uri.valid) {
    return uri;
  }

  const range = parseRange(value.range);
  if (!range.valid) {
    return range;
  }

  return {
    valid: true,
    value: {
      range: range.value,
      uri: uri.value,
    },
  };
}

function parseRange(value: unknown): ParseResult<JsonRange> {
  if (!isRecord(value)) {
    return invalid('Range payload must be an object.');
  }

  const start = parsePosition(value.start);
  if (!start.valid) {
    return start;
  }

  const end = parsePosition(value.end);
  if (!end.valid) {
    return end;
  }

  if (
    end.value.line < start.value.line ||
    (end.value.line === start.value.line && end.value.character < start.value.character)
  ) {
    return invalid('Range end must not come before range start.');
  }

  return {
    valid: true,
    value: {
      end: end.value,
      start: start.value,
    },
  };
}

function parsePosition(value: unknown): ParseResult<JsonPosition> {
  if (
    !isRecord(value) ||
    !isNonNegativeInteger(value.line) ||
    !isNonNegativeInteger(value.character)
  ) {
    return invalid('Position payload must include non-negative line and character.');
  }

  return {
    valid: true,
    value: {
      character: value.character,
      line: value.line,
    },
  };
}

function parseUriString(value: unknown): ParseResult<string> {
  if (typeof value !== 'string' || value.length === 0) {
    return invalid('URI payload must be a non-empty string.');
  }

  if (!value.startsWith('file:')) {
    return invalid('URI payload must use the file scheme.');
  }

  return { valid: true, value };
}

function toNativeLocation(api: CommandBridgeApi, location: JsonLocation): unknown {
  return api.createLocation(api.parseUri(location.uri), toNativeRange(api, location.range));
}

function toNativePosition(api: CommandBridgeApi, position: JsonPosition): unknown {
  return api.createPosition(position.line, position.character);
}

function toNativeRange(api: CommandBridgeApi, range: JsonRange): unknown {
  return api.createRange(toNativePosition(api, range.start), toNativePosition(api, range.end));
}

async function fail(api: CommandBridgeApi, message: string): Promise<false> {
  await api.showErrorMessage(`Flavor Grenade command payload rejected: ${message}`);
  return false;
}

function invalid(error: string): ParseResult<never> {
  return { error, valid: false };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

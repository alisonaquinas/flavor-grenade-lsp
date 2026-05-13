import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const DEFAULT_MAX_WAIT_MS = 180_000;
const DEFAULT_POLL_INTERVAL_MS = 5_000;

export function findVsCodeUpdateProcesses(processes, platform = process.platform) {
  if (platform !== 'win32') {
    return [];
  }

  return processes.filter((processInfo) => /^CodeSetup(?:-|$)/i.test(processInfo.name));
}

export function formatVsCodeUpdateProcessMessage(processes) {
  return processes
    .map((processInfo) => `${processInfo.name} (pid ${processInfo.pid})`)
    .join(', ');
}

export function parseWindowsTaskListCsv(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const columns = parseCsvLine(line);
      return {
        name: columns[0] ?? '',
        pid: Number(columns[1]),
      };
    })
    .filter((processInfo) => processInfo.name && Number.isFinite(processInfo.pid));
}

export async function listWindowsProcesses() {
  const { stdout } = await execFileAsync('tasklist', ['/FO', 'CSV', '/NH'], {
    windowsHide: true,
  });
  return parseWindowsTaskListCsv(stdout);
}

export async function waitForVsCodeUpdateProcessesToExit({
  platform = process.platform,
  listProcesses = listWindowsProcesses,
  sleep = sleepMs,
  maxWaitMs = readPositiveIntegerEnv(
    'FLAVOR_GRENADE_VSCODE_UPDATE_WAIT_MS',
    DEFAULT_MAX_WAIT_MS,
  ),
  pollIntervalMs = readPositiveIntegerEnv(
    'FLAVOR_GRENADE_VSCODE_UPDATE_POLL_MS',
    DEFAULT_POLL_INTERVAL_MS,
  ),
  logger = console,
} = {}) {
  if (platform !== 'win32') {
    return;
  }

  const startedAt = Date.now();

  while (true) {
    const updateProcesses = findVsCodeUpdateProcesses(await listProcesses(), platform);

    if (updateProcesses.length === 0) {
      return;
    }

    const processSummary = formatVsCodeUpdateProcessMessage(updateProcesses);
    const elapsedMs = Date.now() - startedAt;

    if (elapsedMs >= maxWaitMs) {
      throw new Error(
        `VS Code update processes still active after ${elapsedMs}ms: ${processSummary}`,
      );
    }

    logger.warn(
      `[host-test] waiting for VS Code update processes before launch: ${processSummary}`,
    );
    await sleep(Math.min(pollIntervalMs, maxWaitMs - elapsedMs));
  }
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function readPositiveIntegerEnv(name, fallback) {
  const rawValue = process.env[name];
  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function sleepMs(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

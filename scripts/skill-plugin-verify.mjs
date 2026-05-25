#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const pluginRoot = path.join(ROOT, 'plugins', 'flavorgrenade-lsp');
const errors = [];
const codex = readJson(path.join(pluginRoot, '.codex-plugin', 'plugin.json'));
const claude = readJson(path.join(pluginRoot, '.claude-plugin', 'plugin.json'));
const skillManifest = readJson(path.join(ROOT, 'skills', 'flavorgrenade-lsp', 'manifest.json'));
const lsp = readJson(path.join(pluginRoot, 'lsp', 'servers.json'));
const hooks = readJson(path.join(pluginRoot, 'hooks', 'hooks.json'));
const codexHooks = readJson(path.join(pluginRoot, 'codex', 'hooks.json'));
if (codex.name !== 'flavorgrenade-lsp') errors.push('Codex plugin name mismatch');
if (claude.name !== 'flavorgrenade-lsp') errors.push('Claude plugin name mismatch');
if (codex.version !== skillManifest.version) errors.push('Codex plugin version mismatch');
if (claude.version !== skillManifest.version) errors.push('Claude plugin version mismatch');
for (const required of [
  'commands/flavorgrenade-analyze.md',
  'commands/flavorgrenade-detect.md',
  'commands/flavorgrenade-diagnostics.md',
  'commands/flavorgrenade-outline.md',
  'agents/markdown-flavor-reviewer.md',
  'agents/markdown-release-auditor.md',
  'hooks/hooks.json',
  'codex/hooks.json',
  'lsp/servers.json',
  'skills/flavorgrenade-lsp/SKILL.md',
]) {
  if (!existsSync(path.join(pluginRoot, required))) errors.push(`missing plugin path ${required}`);
}
for (const server of lsp.servers ?? []) {
  if (server.name !== 'flavor-grenade-lsp') continue;
  if (server.command !== 'node') errors.push('LSP server command must launch node');
  if (!Array.isArray(server.args) || server.args.join(' ') !== 'skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs lsp') {
    errors.push('LSP server args must launch wrapper lsp mode');
  }
  if (server.transport !== 'stdio') errors.push('LSP server transport must be stdio');
  if (server.runtimeResolver !== 'skills/flavorgrenade-lsp/wrappers/runtime.mjs') {
    errors.push('LSP server runtimeResolver mismatch');
  }
}
if (!Array.isArray(lsp.servers) || !lsp.servers.some((server) => server.name === 'flavor-grenade-lsp')) {
  errors.push('missing flavor-grenade-lsp LSP server declaration');
}
for (const hook of hooks.hooks ?? []) {
  validateHookCommand(hook);
}
if (!Array.isArray(codexHooks.hooks)) errors.push('Codex hooks file must contain hooks array');
for (const commandFile of [
  'commands/flavorgrenade-analyze.md',
  'commands/flavorgrenade-detect.md',
  'commands/flavorgrenade-diagnostics.md',
  'commands/flavorgrenade-outline.md',
]) {
  validateCommandPrompt(commandFile);
}
const packagedPluginRoot = findPackagedPluginRoot(skillManifest.version);
if (packagedPluginRoot !== null) {
  await smokeLspDeclaration(packagedPluginRoot);
}
if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`${JSON.stringify({ ok: true }, null, 2)}\n`);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function validateHookCommand(hook) {
  if (hook.enabledByDefault !== false) errors.push(`hook ${hook.name} must be disabled by default`);
  if (!hook.advisory) errors.push(`hook ${hook.name} must be advisory`);
  if (!Array.isArray(hook.command)) {
    errors.push(`hook ${hook.name} missing command array`);
    return;
  }
  const [node, wrapper, command] = hook.command;
  if (node !== 'node') errors.push(`hook ${hook.name} must invoke node`);
  if (wrapper !== 'skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs') {
    errors.push(`hook ${hook.name} wrapper path mismatch`);
  }
  if (!['detect', 'diagnostics', 'variants'].includes(command)) {
    errors.push(`hook ${hook.name} uses unsupported wrapper command ${command}`);
  }
  if (!hook.command.includes('--json')) errors.push(`hook ${hook.name} must request JSON`);
}

function validateCommandPrompt(commandFile) {
  const content = readFileSync(path.join(pluginRoot, commandFile), 'utf8');
  if (!/skills\/flavorgrenade-lsp\/wrappers\/flavorgrenade\.mjs\s+(analyze|detect|diagnostics|symbols|folds|variants|refs)/.test(content)) {
    errors.push(`${commandFile} does not reference a supported wrapper command`);
  }
  if (!/--json/.test(content)) errors.push(`${commandFile} must request JSON output`);
  if (/parse raw config/i.test(content) && !/do not parse raw config/i.test(content)) {
    errors.push(`${commandFile} must not tell agents to parse raw config`);
  }
}

function findPackagedPluginRoot(version) {
  const target = currentTarget();
  if (target === null) return null;
  const packageRoot = path.join(
    ROOT,
    'build',
    'skill-artifacts',
    `flavorgrenade-lsp-skill-v${version}-${target}`,
  );
  const candidate = path.join(packageRoot, 'plugins', 'flavorgrenade-lsp');
  const executableName = target === 'win-x64' ? 'flavor-grenade-lsp.exe' : 'flavor-grenade-lsp';
  const executable = path.join(
    candidate,
    'skills',
    'flavorgrenade-lsp',
    'bin',
    target,
    executableName,
  );
  return existsSync(executable) ? candidate : null;
}

function currentTarget() {
  if (process.platform === 'win32' && process.arch === 'x64') return 'win-x64';
  if (process.platform === 'linux' && process.arch === 'x64') return 'linux-x64';
  if (process.platform === 'darwin' && process.arch === 'arm64') return 'darwin-arm64';
  if (process.platform === 'darwin' && process.arch === 'x64') return 'darwin-x64';
  return null;
}

function smokeLspDeclaration(packagedPluginRoot) {
  return new Promise((resolve) => {
    const server = readJson(path.join(packagedPluginRoot, 'lsp', 'servers.json')).servers[0];
    const child = spawn(server.command, server.args, {
      cwd: packagedPluginRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
    });
    let buffer = Buffer.alloc(0);
    const timeout = setTimeout(() => {
      errors.push('packaged LSP declaration initialize request timed out');
      child.kill();
      resolve();
    }, 10000);
    child.on('error', (error) => {
      clearTimeout(timeout);
      errors.push(`packaged LSP declaration failed to launch: ${error.message}`);
      resolve();
    });
    child.stdout.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const message = tryReadLspMessage(buffer);
      if (message === null) return;
      clearTimeout(timeout);
      if (!message.result?.capabilities) {
        errors.push('packaged LSP declaration did not return capabilities');
      }
      child.kill();
      resolve();
    });
    const initialize = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { processId: null, rootUri: null, capabilities: {} },
    });
    child.stdin.write(
      `Content-Length: ${Buffer.byteLength(initialize, 'utf8')}\r\n\r\n${initialize}`,
    );
  });
}

function tryReadLspMessage(buffer) {
  const headerEnd = buffer.indexOf('\r\n\r\n');
  if (headerEnd === -1) return null;
  const header = buffer.slice(0, headerEnd).toString('utf8');
  const match = /Content-Length:\s*(\d+)/i.exec(header);
  if (!match) return null;
  const bodyStart = headerEnd + 4;
  const length = Number(match[1]);
  if (buffer.length < bodyStart + length) return null;
  return JSON.parse(buffer.slice(bodyStart, bodyStart + length).toString('utf8'));
}

#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const pluginRoot = path.join(ROOT, 'plugins', 'flavorgrenade-lsp');
const errors = [];
const codex = readJson(path.join(pluginRoot, '.codex-plugin', 'plugin.json'));
const claude = readJson(path.join(pluginRoot, '.claude-plugin', 'plugin.json'));
if (codex.name !== 'flavorgrenade-lsp') errors.push('Codex plugin name mismatch');
if (claude.name !== 'flavorgrenade-lsp') errors.push('Claude plugin name mismatch');
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
if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`${JSON.stringify({ ok: true }, null, 2)}\n`);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

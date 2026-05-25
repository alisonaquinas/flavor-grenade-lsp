#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const marketplacePath = path.join(ROOT, 'marketplace.json');
const marketplace = readJson(marketplacePath);
const claudeMarketplace = readJson(path.join(ROOT, '.claude-plugin', 'marketplace.json'));
const codexMarketplace = readJson(path.join(ROOT, '.agents', 'plugins', 'marketplace.json'));
const errors = [];

if (existsSync(path.join(ROOT, 'skill', 'marketplace.json'))) {
  errors.push('legacy skill/marketplace.json must not exist; use root marketplace.json');
}
if (existsSync(path.join(ROOT, 'skills', 'flavorgrenade-lsp'))) {
  errors.push('legacy root skills/flavorgrenade-lsp must not exist; use plugin-local skill source');
}
if (existsSync(path.join(ROOT, '.codex-plugin', 'marketplace.json'))) {
  errors.push('legacy .codex-plugin/marketplace.json must not exist; use .agents/plugins/marketplace.json');
}

for (const skill of marketplace.skills ?? []) {
  const skillPath = path.join(ROOT, skill.path);
  const skillMd = path.join(skillPath, 'SKILL.md');
  if (!existsSync(skillPath)) errors.push(`missing skill path ${skill.path}`);
  if (!existsSync(skillMd)) errors.push(`missing SKILL.md for ${skill.name}`);
  if (existsSync(skillMd)) {
    const content = readFileSync(skillMd, 'utf8');
    if (!/^---\n[\s\S]*name:\s*flavorgrenade-lsp[\s\S]*description:/m.test(content)) {
      errors.push(`invalid SKILL.md frontmatter for ${skill.name}`);
    }
  }
}

const claudePlugin = (claudeMarketplace.plugins ?? []).find(
  (plugin) => plugin.name === 'flavorgrenade-lsp',
);
if (claudePlugin === undefined) errors.push('Claude marketplace missing flavorgrenade-lsp');
else {
  if (claudePlugin.source !== './plugins/flavorgrenade-lsp') {
    errors.push('Claude marketplace source must be ./plugins/flavorgrenade-lsp');
  }
  if (!existsSync(path.join(ROOT, 'plugins', 'flavorgrenade-lsp', '.claude-plugin', 'plugin.json'))) {
    errors.push('Claude plugin manifest missing for marketplace entry');
  }
}

const codexPlugin = (codexMarketplace.plugins ?? []).find(
  (plugin) => plugin.name === 'flavorgrenade-lsp',
);
if (codexPlugin === undefined) errors.push('Codex marketplace missing flavorgrenade-lsp');
else {
  if (codexPlugin.source?.path !== './plugins/flavorgrenade-lsp') {
    errors.push('Codex marketplace source path must be ./plugins/flavorgrenade-lsp');
  }
  if (codexPlugin.source?.source !== 'local') {
    errors.push('Codex marketplace source must be local');
  }
  if (codexPlugin.policy?.installation !== 'AVAILABLE') {
    errors.push('Codex marketplace policy.installation must be AVAILABLE');
  }
  if (codexPlugin.policy?.authentication !== 'ON_INSTALL') {
    errors.push('Codex marketplace policy.authentication must be ON_INSTALL');
  }
  if (!existsSync(path.join(ROOT, 'plugins', 'flavorgrenade-lsp', '.codex-plugin', 'plugin.json'))) {
    errors.push('Codex plugin manifest missing for marketplace entry');
  }
}

if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      skills: marketplace.skills.length,
      claudePlugins: claudeMarketplace.plugins.length,
      codexPlugins: codexMarketplace.plugins.length,
    },
    null,
    2,
  )}\n`,
);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

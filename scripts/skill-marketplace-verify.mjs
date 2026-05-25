#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const marketplace = JSON.parse(readFileSync(path.join(ROOT, 'skill', 'marketplace.json'), 'utf8'));
const errors = [];
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
if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`${JSON.stringify({ ok: true, skills: marketplace.skills.length }, null, 2)}\n`);

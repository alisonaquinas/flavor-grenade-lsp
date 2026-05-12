import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

function collectRawSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const result: string[] = [];
  const rawSourceExtensions = new Set([
    '.c',
    '.cpp',
    '.cs',
    '.go',
    '.java',
    '.js',
    '.jsx',
    '.kt',
    '.mjs',
    '.py',
    '.rb',
    '.rs',
    '.sh',
    '.ts',
    '.tsx',
  ]);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectRawSourceFiles(fullPath));
    } else if (entry.isFile() && rawSourceExtensions.has(path.extname(entry.name))) {
      result.push(fullPath);
    }
  }
  return result;
}

describe('BDD feature layout', () => {
  it('keeps raw source files out of docs', () => {
    expect(collectRawSourceFiles(path.resolve('docs'))).toEqual([]);
  });

  it('keeps BDD step implementation notes outside docs', () => {
    expect(fs.existsSync(path.resolve('docs/bdd/steps'))).toBe(false);
  });

  it('keeps Cucumber pointed at the documented BDD feature specs', () => {
    const config = fs.readFileSync(path.resolve('cucumber.yaml'), 'utf8');
    expect(config).toContain('docs/bdd/features/**/*.feature');
  });
});

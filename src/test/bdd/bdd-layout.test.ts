import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

function collectFeatureFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const result: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectFeatureFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.feature')) {
      result.push(fullPath);
    }
  }
  return result;
}

describe('BDD feature layout', () => {
  it('keeps executable feature files out of docs', () => {
    expect(collectFeatureFiles(path.resolve('docs'))).toEqual([]);
  });

  it('points Cucumber at the test-owned BDD feature tree', () => {
    const config = fs.readFileSync(path.resolve('cucumber.yaml'), 'utf8');
    expect(config).toContain('src/test/bdd/features/**/*.feature');
  });
});

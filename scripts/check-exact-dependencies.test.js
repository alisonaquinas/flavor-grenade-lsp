import { describe, expect, it } from 'bun:test';
import { findRangeSpecifiers } from './check-exact-dependencies.mjs';

describe('check-exact-dependencies', () => {
  it('reports dependency range specifiers', () => {
    const findings = findRangeSpecifiers({
      dependencies: {
        safe: '1.2.3',
        ranged: '^1.2.3',
      },
      devDependencies: {
        tilde: '~4.5.6',
      },
      engines: {
        vscode: '^1.82.0',
      },
    });

    expect(findings).toEqual([
      { section: 'dependencies', name: 'ranged', specifier: '^1.2.3' },
      { section: 'devDependencies', name: 'tilde', specifier: '~4.5.6' },
    ]);
  });
});

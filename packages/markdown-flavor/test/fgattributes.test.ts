import { describe, expect, it } from '@jest/globals';
import { applyFgAttributes, parseFgAttributes } from '../src/index.js';

describe('.fgattributes parsing and matching', () => {
  it('parses flavor and structured profile assignments', () => {
    expect(
      parseFgAttributes('*.md flavor=gfm structured_profiles=keep-a-changelog,madr\n'),
    ).toEqual([
      {
        pattern: '*.md',
        negated: false,
        assignments: [
          { kind: 'set', key: 'flavor', value: 'gfm' },
          { kind: 'set', key: 'structuredProfiles', value: ['keep-a-changelog', 'madr'] },
        ],
      },
    ]);
  });

  it('applies local overrides and reset tokens over inherited attributes', () => {
    const inherited = { flavor: 'commonmark' as const, structuredProfiles: ['madr'] as const };
    const rules = parseFgAttributes('*.md flavor=gfm\nprivate.md !flavor !structured_profiles\n');

    expect(applyFgAttributes(rules, 'guide.md', inherited)).toEqual({
      flavor: 'gfm',
      structuredProfiles: ['madr'],
    });
    expect(applyFgAttributes(rules, 'private.md', inherited)).toEqual({});
  });

  it('ignores dangerous and invalid assignment keys', () => {
    const rules = parseFgAttributes(
      'unsafe.md __proto__=polluted constructor=bad flavor=unknown structured_profiles=keep-a-changelog,common-changelog\n',
    );

    expect(applyFgAttributes(rules, 'unsafe.md')).toEqual({});
  });
});

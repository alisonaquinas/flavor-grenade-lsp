import { describe, it, expect } from '@jest/globals';
import { mark, isInsideOpaqueRegion } from '../opaque-region-marker.js';

describe('mark()', () => {
  it('merges regions from all parsers', () => {
    const text = '`code` and %%comment%%';
    const regions = mark(text, 0);
    expect(regions.length).toBeGreaterThanOrEqual(2);
  });

  it('returns sorted regions by start', () => {
    const text = '%%comment%% then `code`';
    const regions = mark(text, 0);
    for (let i = 1; i < regions.length; i++) {
      expect(regions[i].start).toBeGreaterThanOrEqual(regions[i - 1].start);
    }
  });

  it('returns empty array for plain text', () => {
    expect(mark('plain text', 0)).toHaveLength(0);
  });
});

describe('isInsideOpaqueRegion()', () => {
  it('returns true when offset is inside a region', () => {
    const regions = [{ kind: 'code' as const, start: 5, end: 15 }];
    expect(isInsideOpaqueRegion(10, regions)).toBe(true);
  });

  it('returns false when offset is before all regions', () => {
    const regions = [{ kind: 'code' as const, start: 5, end: 15 }];
    expect(isInsideOpaqueRegion(3, regions)).toBe(false);
  });

  it('returns false when offset is after all regions', () => {
    const regions = [{ kind: 'code' as const, start: 5, end: 15 }];
    expect(isInsideOpaqueRegion(20, regions)).toBe(false);
  });

  it('treats start as inclusive', () => {
    const regions = [{ kind: 'code' as const, start: 5, end: 15 }];
    expect(isInsideOpaqueRegion(5, regions)).toBe(true);
  });

  it('treats end as exclusive', () => {
    const regions = [{ kind: 'code' as const, start: 5, end: 15 }];
    expect(isInsideOpaqueRegion(15, regions)).toBe(false);
  });
});

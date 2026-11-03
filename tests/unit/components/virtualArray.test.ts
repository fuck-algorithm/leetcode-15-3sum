import { describe, expect, it } from 'vitest';
import { getVisibleArrayRange } from '../../../src/components/Canvas/virtualArray';

describe('virtual array window', () => {
  it('keeps all nodes for small inputs', () => {
    expect(getVisibleArrayRange(6, 1012, { x: 16, k: 1 }, 48, 74)).toEqual({ start: 0, end: 6 });
  });

  it('selects a buffered range around the viewport after panning', () => {
    const range = getVisibleArrayRange(3000, 1012, { x: -5000, k: 1 }, 48, 62);
    expect(range.start).toBeGreaterThan(50);
    expect(range.end).toBeLessThan(180);
    expect(range.end - range.start).toBeLessThanOrEqual(96);
  });

  it('clamps ranges at the beginning and end, including zoom', () => {
    expect(getVisibleArrayRange(3000, 1000, { x: 0, k: 2 }, 48, 62).start).toBe(0);
    const end = getVisibleArrayRange(3000, 1000, { x: -185000, k: 1 }, 48, 62);
    expect(end.end).toBe(3000);
    expect(end.start).toBeGreaterThan(2900);
  });
});

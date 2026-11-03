import { describe, expect, it } from 'vitest';
import { getVisibleArrayRange } from '../../../src/components/Canvas/virtualArray';
import { createCanvasLayout } from '../../../src/components/Canvas/layout';
import { generateSteps } from '../../../src/algorithms/threeSum';

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

  it('centers short arrays while keeping instructional cells readable', () => {
    const step = generateSteps([-1, 0, 1, 2, -1, -4])[0];
    const layout = createCanvasLayout(step, { width: 920, height: 520 });
    expect(layout.cellWidth).toBeGreaterThanOrEqual(44);
    expect(layout.cellWidth + layout.gap).toBeGreaterThanOrEqual(56);
    expect(layout.arrayStartX + layout.arrayWidth / 2).toBe(460);
  });

  it('keeps long virtual arrays anchored to the scrollable canvas origin', () => {
    const step = generateSteps(Array.from({ length: 100 }, (_, index) => index - 50))[0];
    const layout = createCanvasLayout(step, { width: 920, height: 520 });
    expect(layout.arrayStartX).toBe(layout.startX);
    expect(layout.arrayWidth).toBeGreaterThan(920);
  });

  it('clamps ranges at the beginning and end, including zoom', () => {
    expect(getVisibleArrayRange(3000, 1000, { x: 0, k: 2 }, 48, 62).start).toBe(0);
    const end = getVisibleArrayRange(3000, 1000, { x: -185000, k: 1 }, 48, 62);
    expect(end.end).toBe(3000);
    expect(end.start).toBeGreaterThan(2900);
  });
});

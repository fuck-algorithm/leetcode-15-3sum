import { describe, expect, it } from 'vitest';
import { MOTION, motionDuration } from '../../../src/components/Canvas/motion';

describe('motion tokens', () => {
  it('scales duration by playback speed and removes motion on request', () => {
    expect(motionDuration('move')).toBe(MOTION.move);
    expect(motionDuration('move', 2)).toBe(MOTION.move / 2);
    expect(motionDuration('move', 1, true)).toBe(0);
    expect(motionDuration('move', 0)).toBe(MOTION.move);
  });
});

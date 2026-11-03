import { describe, expect, it } from 'vitest';
import { EXAMPLE_DATA, generateRandomInput, generateSteps, validateInput } from '../../../src/algorithms/threeSum';

describe('threeSum algorithm inputs and snapshots', () => {
  it('accepts valid arrays and rejects malformed values and bounds', () => {
    expect(validateInput('[-1,0,1]')).toEqual({ valid: true, nums: [-1, 0, 1] });
    expect(validateInput('[1,2]')).toMatchObject({ valid: false });
    expect(validateInput('[1,2,1.5]')).toMatchObject({ valid: false });
    expect(validateInput('[1,2,100001]')).toMatchObject({ valid: false });
    expect(validateInput('nope')).toMatchObject({ valid: false });
    expect(validateInput('{"nums":[]}')).toMatchObject({ valid: false });
  });

  it('generates valid random data and known triplets', () => {
    for (let index = 0; index < 20; index += 1) {
      expect(validateInput(JSON.stringify(generateRandomInput())).valid).toBe(true);
    }
    expect(generateSteps(EXAMPLE_DATA[0].value).at(-1)?.result).toEqual([[-1, -1, 2], [-1, 0, 1]]);
  });

  it('attaches unique semantic operations and valid stable anchors to every step', () => {
    const steps = generateSteps(EXAMPLE_DATA[0].value);
    expect(new Set(steps.map(step => step.id)).size).toBe(steps.length);
    for (const step of steps) {
      expect(step.operation).toBeTruthy();
      expect(step.narration.trim().length).toBeGreaterThan(8);
      expect(step.anchorIds.length).toBeGreaterThan(0);
      expect(new Set(step.arrayState.map(item => item.originalIndex)).size).toBe(step.arrayState.length);
    }
    expect(steps[0].anchorIds).toEqual(['step-0']);
    const duplicateFixed = generateSteps([-2, -2, 0, 1, 1]).find(step => step.animationType === 'skip' && step.pointers.i === 1);
    expect(duplicateFixed?.decision?.previousPointers).toEqual({ i: 0, left: -1, right: -1 });
    expect(duplicateFixed?.decision?.movedPointer).toBe('i');
    expect(generateSteps(Array.from({ length: 3000 }, (_, index) => index % 31 - 15)).length).toBeLessThanOrEqual(40);
  });
});

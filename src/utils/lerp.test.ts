import { describe, expect, it } from 'vitest';
import { lerp } from './lerp';

describe('lerp', () => {
  it('moves a value toward the target by the provided amount', () => {
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });

  it('returns the start value at zero progress', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns the end value at full progress', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });
});

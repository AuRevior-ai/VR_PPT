import { describe, expect, it } from 'vitest';
import { clamp } from './clamp';

describe('clamp', () => {
  it('keeps values inside the provided range', () => {
    expect(clamp(0.4, 0, 1)).toBe(0.4);
  });

  it('uses the lower bound when the value is too small', () => {
    expect(clamp(-4, -1, 2)).toBe(-1);
  });

  it('uses the upper bound when the value is too large', () => {
    expect(clamp(7, -1, 2)).toBe(2);
  });
});

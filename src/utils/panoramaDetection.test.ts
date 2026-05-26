import { describe, expect, it } from 'vitest';
import { isEquirectangularPanorama } from './panoramaDetection';

describe('isEquirectangularPanorama', () => {
  it('accepts a 2:1 classroom panorama', () => {
    expect(isEquirectangularPanorama({ width: 1774, height: 887 })).toBe(true);
  });

  it('accepts small rounding differences around 2:1', () => {
    expect(isEquirectangularPanorama({ width: 4096, height: 2050 })).toBe(true);
  });

  it('rejects ordinary 16:9 illustrations', () => {
    expect(isEquirectangularPanorama({ width: 1920, height: 1080 })).toBe(false);
  });

  it('rejects invalid dimensions', () => {
    expect(isEquirectangularPanorama({ width: 0, height: 887 })).toBe(false);
  });
});

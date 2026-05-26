import { describe, expect, it } from 'vitest';
import { hotspots } from './hotspots';

describe('hotspots', () => {
  it('provides the four MVP classroom interactions', () => {
    expect(hotspots.map((hotspot) => hotspot.id)).toEqual([
      'teacher',
      'blackboard',
      'class-rules',
      'students'
    ]);
  });

  it('keeps hotspot geometry in percentage coordinates', () => {
    for (const hotspot of hotspots) {
      expect(hotspot.x).toBeGreaterThanOrEqual(0);
      expect(hotspot.x).toBeLessThanOrEqual(100);
      expect(hotspot.y).toBeGreaterThanOrEqual(0);
      expect(hotspot.y).toBeLessThanOrEqual(100);
      expect(hotspot.width).toBeGreaterThan(0);
      expect(hotspot.height).toBeGreaterThan(0);
    }
  });

  it('stores readable copy outside the visual component tree', () => {
    for (const hotspot of hotspots) {
      expect(hotspot.title.length).toBeGreaterThan(0);
      expect(hotspot.description.length).toBeGreaterThan(0);
    }
  });
});

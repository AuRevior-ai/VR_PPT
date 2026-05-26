import { describe, expect, it } from 'vitest';
import {
  classroomAssets,
  defaultSceneSettings,
  requiredLayerSources
} from './sceneConfig';

describe('sceneConfig', () => {
  it('points to the expected public classroom asset directory', () => {
    expect(classroomAssets.basePath).toBe('/assets/classroom');
    expect(classroomAssets.original).toBe('/assets/classroom/original.png');
  });

  it('treats the five painted layers as required layered-scene assets', () => {
    expect(requiredLayerSources).toEqual([
      '/assets/classroom/bg_wall.png',
      '/assets/classroom/teacher_podium.png',
      '/assets/classroom/desks_students_mid.png',
      '/assets/classroom/students_foreground.png',
      '/assets/classroom/overlays.png'
    ]);
  });

  it('keeps default controls in a gentle MVP range', () => {
    expect(defaultSceneSettings.parallaxStrength).toBeGreaterThan(0);
    expect(defaultSceneSettings.parallaxStrength).toBeLessThanOrEqual(1.4);
    expect(defaultSceneSettings.fisheyeStrength).toBeGreaterThan(0);
    expect(defaultSceneSettings.fisheyeStrength).toBeLessThanOrEqual(0.6);
  });
});

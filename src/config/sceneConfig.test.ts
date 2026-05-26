import { describe, expect, it } from 'vitest';
import {
  classroomAssets,
  controlRanges,
  defaultSceneSettings,
  panoramaCamera,
  requiredLayerSources
} from './sceneConfig';

describe('sceneConfig', () => {
  it('points to the expected public classroom asset directory', () => {
    expect(classroomAssets.basePath).toBe('/assets/classroom');
    expect(classroomAssets.original).toBe('/assets/classroom/original.png');
    expect(classroomAssets.panorama).toBe(
      '/assets/classroom/full_classroom_2to1.png'
    );
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
    expect(defaultSceneSettings.parallaxStrength).toBeLessThanOrEqual(2.2);
    expect(defaultSceneSettings.fisheyeStrength).toBeGreaterThan(0);
    expect(defaultSceneSettings.fisheyeStrength).toBeLessThanOrEqual(0.9);
    expect(defaultSceneSettings.viewRotationMaxDegrees).toBeGreaterThanOrEqual(28);
    expect(defaultSceneSettings.viewRotationMaxDegrees).toBeLessThanOrEqual(40);
  });

  it('defaults to concave wide-angle rather than convex fisheye', () => {
    expect(defaultSceneSettings.lensMode).toBe('concaveWide');
    expect(defaultSceneSettings.autoDriftEnabled).toBe(false);
    expect(controlRanges.parallaxStrength.max).toBeGreaterThanOrEqual(2);
    expect(controlRanges.fisheyeStrength.max).toBeGreaterThanOrEqual(0.8);
  });

  it('defines a 2:1 panorama camera envelope for scheme C', () => {
    expect(panoramaCamera.fov).toBeGreaterThanOrEqual(70);
    expect(panoramaCamera.maxYawDegrees).toBeGreaterThanOrEqual(100);
    expect(panoramaCamera.maxPitchDegrees).toBeLessThanOrEqual(50);
    expect(panoramaCamera.initialYawDegrees).toBeGreaterThanOrEqual(80);
    expect(panoramaCamera.initialYawDegrees).toBeLessThanOrEqual(100);
    expect(panoramaCamera.minFov).toBeLessThan(panoramaCamera.fov);
    expect(panoramaCamera.maxFov).toBeGreaterThan(panoramaCamera.fov);
    expect(panoramaCamera.textureHorizontalScale).toBe(-1);
  });
});

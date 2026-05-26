import { describe, expect, it } from 'vitest';
import {
  defaultPanoramaAsset,
  defaultPanoramaSettings,
  panoramaCamera
} from './panoramaConfig';

describe('panoramaConfig', () => {
  it('keeps the app focused on a single default 2:1 panorama asset', () => {
    expect(defaultPanoramaAsset).toBe(
      `${import.meta.env.BASE_URL}assets/classroom/full_classroom_2to1.png`
    );
  });

  it('defines the camera and interaction limits for the panorama viewer', () => {
    expect(panoramaCamera.fov).toBe(76);
    expect(panoramaCamera.minFov).toBeLessThan(panoramaCamera.fov);
    expect(panoramaCamera.maxFov).toBeGreaterThan(panoramaCamera.fov);
    expect(panoramaCamera.textureHorizontalScale).toBe(-1);
    expect(panoramaCamera.radius).toBeGreaterThan(100);
  });

  it('keeps drift disabled by default', () => {
    expect(defaultPanoramaSettings.autoDriftEnabled).toBe(false);
  });
});

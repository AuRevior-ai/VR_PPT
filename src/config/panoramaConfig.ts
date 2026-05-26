export const defaultPanoramaAsset =
  '/assets/classroom/full_classroom_2to1.png';

export const defaultPanoramaSettings = {
  autoDriftEnabled: false
} as const;

export const panoramaCamera = {
  fov: 76,
  minFov: 44,
  maxFov: 92,
  initialYawDegrees: 90,
  maxPitchDegrees: 42,
  textureHorizontalScale: -1,
  yawSensitivity: 0.004,
  pitchSensitivity: 0.003,
  radius: 500
} as const;

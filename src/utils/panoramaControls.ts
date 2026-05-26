import { clamp } from './clamp';

export type PanoramaAngles = {
  yaw: number;
  pitch: number;
};

export type PanoramaDragDelta = {
  deltaX: number;
  deltaY: number;
};

export type PanoramaDragOptions = {
  yawSensitivity: number;
  pitchSensitivity: number;
  pitchLimit: number;
};

export type PanoramaWheelOptions = {
  minFov: number;
  maxFov: number;
};

export function applyPanoramaDrag(
  current: PanoramaAngles,
  delta: PanoramaDragDelta,
  options: PanoramaDragOptions
): PanoramaAngles {
  return {
    yaw: current.yaw - delta.deltaX * options.yawSensitivity,
    pitch: clamp(
      current.pitch - delta.deltaY * options.pitchSensitivity,
      -options.pitchLimit,
      options.pitchLimit
    )
  };
}

export function applyPanoramaWheel(
  currentFov: number,
  deltaY: number,
  options: PanoramaWheelOptions
) {
  return clamp(currentFov + deltaY * 0.05, options.minFov, options.maxFov);
}

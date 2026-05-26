import { describe, expect, it } from 'vitest';
import {
  applyPanoramaDrag,
  applyPanoramaWheel
} from './panoramaControls';

describe('panoramaControls', () => {
  it('updates yaw and pitch from drag deltas', () => {
    const next = applyPanoramaDrag(
      { yaw: 0, pitch: 0 },
      { deltaX: 120, deltaY: -60 },
      { yawSensitivity: 0.004, pitchSensitivity: 0.003, pitchLimit: 0.7 }
    );

    expect(next.yaw).toBeCloseTo(-0.48);
    expect(next.pitch).toBeCloseTo(0.18);
  });

  it('clamps pitch during drag', () => {
    const next = applyPanoramaDrag(
      { yaw: 0, pitch: 0.65 },
      { deltaX: 0, deltaY: -200 },
      { yawSensitivity: 0.004, pitchSensitivity: 0.003, pitchLimit: 0.7 }
    );

    expect(next.pitch).toBe(0.7);
  });

  it('zooms in when the wheel moves upward', () => {
    expect(applyPanoramaWheel(76, -240, { minFov: 44, maxFov: 92 })).toBe(64);
  });

  it('zooms out when the wheel moves downward and respects limits', () => {
    expect(applyPanoramaWheel(88, 240, { minFov: 44, maxFov: 92 })).toBe(92);
  });
});

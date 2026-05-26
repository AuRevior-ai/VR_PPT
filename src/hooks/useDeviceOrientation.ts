import { useCallback, useEffect, useMemo, useState } from 'react';
import { clamp } from '../utils/clamp';

type PermissionState = 'unsupported' | 'prompt' | 'granted' | 'denied';

export type DeviceOrientationState = {
  x: number;
  y: number;
  permissionState: PermissionState;
  requestPermission: () => Promise<void>;
};

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

export function useDeviceOrientation(): DeviceOrientationState {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [permissionState, setPermissionState] = useState<PermissionState>(() => {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      return 'unsupported';
    }

    const eventConstructor =
      DeviceOrientationEvent as DeviceOrientationEventWithPermission;

    return typeof eventConstructor.requestPermission === 'function'
      ? 'prompt'
      : 'granted';
  });

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermissionState('unsupported');
      return;
    }

    const eventConstructor =
      DeviceOrientationEvent as DeviceOrientationEventWithPermission;

    if (typeof eventConstructor.requestPermission !== 'function') {
      setPermissionState('granted');
      return;
    }

    const result = await eventConstructor.requestPermission();
    setPermissionState(result);
  }, []);

  useEffect(() => {
    if (permissionState !== 'granted') {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0;
      const beta = event.beta ?? 45;
      const normalizedX = clamp(gamma / 28, -1, 1);
      const normalizedY = clamp((beta - 45) / 32, -1, 1);
      setTilt({
        x: normalizedX,
        y: normalizedY
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionState]);

  return useMemo(
    () => ({
      ...tilt,
      permissionState,
      requestPermission
    }),
    [permissionState, requestPermission, tilt]
  );
}

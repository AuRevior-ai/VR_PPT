import { RefObject, useEffect, useRef, useState } from 'react';
import { panoramaCamera } from '../config/sceneConfig';
import {
  applyPanoramaDrag,
  applyPanoramaWheel,
  PanoramaAngles
} from '../utils/panoramaControls';
import { isInteractiveTarget } from '../utils/isInteractiveTarget';

export type PanoramaControls = PanoramaAngles & {
  fov: number;
  isDragging: boolean;
};

export function usePanoramaControls(
  containerRef: RefObject<HTMLDivElement | null>
) {
  const controlsRef = useRef<PanoramaControls>({
    yaw: 0,
    pitch: 0,
    fov: panoramaCamera.fov,
    isDragging: false
  });
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const [controls, setControls] = useState<PanoramaControls>(
    controlsRef.current
  );

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const commit = (next: PanoramaControls) => {
      controlsRef.current = next;
      setControls(next);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (isInteractiveTarget(event.target)) {
        return;
      }

      lastPointerRef.current = {
        x: event.clientX,
        y: event.clientY
      };
      element.setPointerCapture?.(event.pointerId);
      commit({
        ...controlsRef.current,
        isDragging: true
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!controlsRef.current.isDragging) {
        return;
      }

      const delta = {
        deltaX: event.clientX - lastPointerRef.current.x,
        deltaY: event.clientY - lastPointerRef.current.y
      };
      lastPointerRef.current = {
        x: event.clientX,
        y: event.clientY
      };

      const nextAngles = applyPanoramaDrag(controlsRef.current, delta, {
        yawSensitivity: panoramaCamera.yawSensitivity,
        pitchSensitivity: panoramaCamera.pitchSensitivity,
        pitchLimit: (panoramaCamera.maxPitchDegrees * Math.PI) / 180
      });

      commit({
        ...controlsRef.current,
        ...nextAngles
      });
    };

    const handlePointerUp = (event: PointerEvent) => {
      element.releasePointerCapture?.(event.pointerId);
      commit({
        ...controlsRef.current,
        isDragging: false
      });
    };

    const handleWheel = (event: WheelEvent) => {
      if (isInteractiveTarget(event.target)) {
        return;
      }

      event.preventDefault();
      commit({
        ...controlsRef.current,
        fov: applyPanoramaWheel(controlsRef.current.fov, event.deltaY, {
          minFov: panoramaCamera.minFov,
          maxFov: panoramaCamera.maxFov
        })
      });
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef]);

  return controls;
}

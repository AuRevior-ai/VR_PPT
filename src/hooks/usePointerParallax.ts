import { RefObject, useEffect, useRef, useState } from 'react';
import { clamp } from '../utils/clamp';
import { isInteractiveTarget } from '../utils/isInteractiveTarget';
import { lerp } from '../utils/lerp';

export type ParallaxMotion = {
  x: number;
  y: number;
  isDragging: boolean;
};

export function usePointerParallax(): {
  containerRef: RefObject<HTMLDivElement | null>;
  motion: ParallaxMotion;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const [motion, setMotion] = useState<ParallaxMotion>({
    x: 0,
    y: 0,
    isDragging: false
  });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const setTargetFromPoint = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((clientY - rect.top) / rect.height - 0.5) * 2;
      targetRef.current = {
        x: clamp(x, -1, 1),
        y: clamp(y, -1, 1)
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      // Let real controls receive normal clicks and drags; the scene only owns
      // pointer gestures that start on the painted classroom surface.
      if (!isDraggingRef.current && isInteractiveTarget(event.target)) {
        return;
      }

      if (event.pointerType === 'touch' && !isDraggingRef.current) {
        return;
      }

      setTargetFromPoint(event.clientX, event.clientY);
    };

    const handlePointerDown = (event: PointerEvent) => {
      // Avoid pointer capture on hotspots, sliders, switches, and close buttons.
      if (isInteractiveTarget(event.target)) {
        return;
      }

      isDraggingRef.current = true;
      element.setPointerCapture?.(event.pointerId);
      setTargetFromPoint(event.clientX, event.clientY);
      setMotion((previous) => ({
        ...previous,
        isDragging: true
      }));
    };

    const handlePointerUp = (event: PointerEvent) => {
      isDraggingRef.current = false;
      element.releasePointerCapture?.(event.pointerId);
      setMotion((previous) => ({
        ...previous,
        isDragging: false
      }));
    };

    const handlePointerLeave = () => {
      if (!isDraggingRef.current) {
        targetRef.current = { x: 0, y: 0 };
      }
    };

    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);
    element.addEventListener('pointerleave', handlePointerLeave);

    let frameId = 0;

    const animate = () => {
      currentRef.current = {
        x: lerp(currentRef.current.x, targetRef.current.x, 0.08),
        y: lerp(currentRef.current.y, targetRef.current.y, 0.08)
      };

      setMotion({
        x: currentRef.current.x,
        y: currentRef.current.y,
        isDragging: isDraggingRef.current
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
      element.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return {
    containerRef,
    motion
  };
}

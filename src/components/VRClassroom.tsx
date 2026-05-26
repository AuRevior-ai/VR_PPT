import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { hotspots } from '../config/hotspots';
import {
  classroomAssets,
  defaultSceneSettings,
  panoramaCamera,
  requiredLayerSources,
  SceneSettings
} from '../config/sceneConfig';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { useImagePreload } from '../hooks/useImagePreload';
import { usePointerParallax } from '../hooks/usePointerParallax';
import { assetExists } from '../utils/assetExists';
import { clamp } from '../utils/clamp';
import {
  isEquirectangularPanorama,
  loadImageDimensions
} from '../utils/panoramaDetection';
import { ControlPanel } from './ControlPanel';
import { HotspotLayer } from './HotspotLayer';
import { InfoBubble } from './InfoBubble';
import { LayeredScene } from './LayeredScene';
import { LoadingScreen } from './LoadingScreen';
import { PanoramaScene } from './PanoramaScene';
import { SingleImageScene } from './SingleImageScene';

type SceneMode = 'detecting' | 'panorama' | 'layered' | 'single';

export function VRClassroom() {
  const [sceneMode, setSceneMode] = useState<SceneMode>('detecting');
  const [settings, setSettings] = useState<SceneSettings>(defaultSceneSettings);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [introScale, setIntroScale] = useState(1.08);
  const introState = useRef({ scale: 1.08 });
  const { containerRef, motion } = usePointerParallax();
  const deviceOrientation = useDeviceOrientation();

  useEffect(() => {
    let isMounted = true;

    const detectAssets = async () => {
      const panoramaExists = await assetExists(classroomAssets.panorama);

      if (panoramaExists) {
        try {
          const dimensions = await loadImageDimensions(classroomAssets.panorama);

          if (isEquirectangularPanorama(dimensions)) {
            if (isMounted) {
              setSceneMode('panorama');
            }

            return;
          }
        } catch {
          // Fall through to the 2.5D scene if the panorama cannot be inspected.
        }
      }

      const layerResults = await Promise.all(
        requiredLayerSources.map((source) => assetExists(source))
      );

      if (!isMounted) {
        return;
      }

      setSceneMode(layerResults.every(Boolean) ? 'layered' : 'single');
    };

    void detectAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  const sceneSources = useMemo(() => {
    if (sceneMode === 'panorama') {
      return [classroomAssets.panorama];
    }

    if (sceneMode === 'layered') {
      return requiredLayerSources;
    }

    if (sceneMode === 'single') {
      return [classroomAssets.original];
    }

    return [];
  }, [sceneMode]);

  const preload = useImagePreload(sceneSources);
  const activeHotspot = useMemo(
    () => hotspots.find((hotspot) => hotspot.id === activeHotspotId) ?? null,
    [activeHotspotId]
  );

  const combinedMotion = useMemo(
    () => ({
      x: clamp(motion.x + deviceOrientation.x * 0.38, -1.35, 1.35),
      y: clamp(motion.y + deviceOrientation.y * 0.3, -1.25, 1.25)
    }),
    [deviceOrientation.x, deviceOrientation.y, motion.x, motion.y]
  );

  const isLoading = sceneMode === 'detecting' || !preload.isLoaded;
  const isPanoramaMode = sceneMode === 'panorama';

  useEffect(() => {
    if (isLoading) {
      return;
    }

    introState.current.scale = 1.08;
    setIntroScale(1.08);

    const tween = gsap.to(introState.current, {
      scale: 1,
      duration: 1.45,
      ease: 'power3.out',
      onUpdate: () => setIntroScale(introState.current.scale)
    });

    return () => {
      tween.kill();
    };
  }, [isLoading, sceneMode]);

  const loadingProgress =
    sceneMode === 'detecting' ? 0.18 : preload.progress || 0.18;
  const loadingLabel =
    sceneMode === 'detecting'
      ? '正在检查课堂图层'
      : sceneMode === 'panorama'
        ? '正在进入 360 全景教室'
        : sceneMode === 'layered'
        ? '正在摆放绘本图层'
        : '正在载入原始插画';

  const cameraProps = isPanoramaMode
    ? {
        position: [0, 0, 0.1] as [number, number, number],
        fov: panoramaCamera.fov,
        near: 0.1,
        far: panoramaCamera.radius * 3
      }
    : {
        position: [0, 0, 10] as [number, number, number],
        zoom: 100,
        near: 0.1,
        far: 100
      };

  return (
    <main ref={containerRef} className="vr-classroom">
      {isLoading ? (
        <LoadingScreen progress={loadingProgress} modeLabel={loadingLabel} />
      ) : (
        <>
          <Canvas
            className="classroom-canvas"
            orthographic={!isPanoramaMode}
            dpr={[1, 2]}
            camera={cameraProps}
            gl={{
              alpha: true,
              antialias: true
            }}
          >
            <color attach="background" args={['#d7f2ec']} />
            <Suspense fallback={null}>
              {sceneMode === 'panorama' ? (
                <PanoramaScene
                  motion={combinedMotion}
                  settings={settings}
                  introScale={introScale}
                />
              ) : sceneMode === 'layered' ? (
                <LayeredScene
                  motion={combinedMotion}
                  settings={settings}
                  introScale={introScale}
                />
              ) : (
                <SingleImageScene
                  motion={combinedMotion}
                  settings={settings}
                  introScale={introScale}
                />
              )}
            </Suspense>
          </Canvas>

          <div className="scene-vignette" aria-hidden="true" />
          {isPanoramaMode ? (
            <div className="panorama-badge" aria-label="当前为 360 全景模式">
              360 全景
            </div>
          ) : (
            <>
              <HotspotLayer
                activeHotspotId={activeHotspotId}
                motion={combinedMotion}
                settings={settings}
                onSelect={(hotspot) => setActiveHotspotId(hotspot.id)}
              />
              <InfoBubble
                hotspot={activeHotspot}
                onClose={() => setActiveHotspotId(null)}
              />
            </>
          )}
          <ControlPanel
            settings={settings}
            deviceOrientation={deviceOrientation}
            onChange={setSettings}
          />
        </>
      )}
    </main>
  );
}

import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import {
  BackSide,
  Group,
  LinearFilter,
  PerspectiveCamera,
  SRGBColorSpace,
  TextureLoader
} from 'three';
import {
  classroomAssets,
  panoramaCamera,
  SceneSettings
} from '../config/sceneConfig';
import { ParallaxMotion } from '../hooks/usePointerParallax';
import { clamp } from '../utils/clamp';

type PanoramaSceneProps = {
  motion: Pick<ParallaxMotion, 'x' | 'y'>;
  settings: SceneSettings;
  introScale: number;
};

export function PanoramaScene({
  motion,
  settings,
  introScale
}: PanoramaSceneProps) {
  const groupRef = useRef<Group>(null);
  const texture = useLoader(TextureLoader, classroomAssets.panorama);
  const { camera } = useThree();

  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  useEffect(() => {
    camera.position.set(0, 0, 0.1);
    camera.rotation.order = 'YXZ';

    if ((camera as PerspectiveCamera).isPerspectiveCamera) {
      const perspectiveCamera = camera as PerspectiveCamera;
      perspectiveCamera.fov = panoramaCamera.fov;
      perspectiveCamera.near = 0.1;
      perspectiveCamera.far = panoramaCamera.radius * 3;
      perspectiveCamera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame(({ clock }) => {
    const drift = settings.autoDriftEnabled
      ? Math.sin(clock.elapsedTime * 0.16) * 0.05
      : 0;
    const yaw =
      -clamp(motion.x + drift, -1, 1) *
      settings.parallaxStrength *
      (panoramaCamera.maxYawDegrees * Math.PI) /
      180;
    const pitch =
      clamp(motion.y, -1, 1) *
      settings.parallaxStrength *
      (panoramaCamera.maxPitchDegrees * Math.PI) /
      180;

    camera.rotation.y = yaw;
    camera.rotation.x = clamp(pitch, -Math.PI / 2.8, Math.PI / 2.8);
    groupRef.current?.scale.setScalar(introScale);
  });

  return (
    <group
      ref={groupRef}
      rotation={[0, (panoramaCamera.initialYawDegrees * Math.PI) / 180, 0]}
    >
      <mesh>
        <sphereGeometry args={[panoramaCamera.radius, 96, 64]} />
        <meshBasicMaterial map={texture} side={BackSide} />
      </mesh>
    </group>
  );
}

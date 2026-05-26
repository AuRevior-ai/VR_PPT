import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  FrontSide,
  Group,
  LinearFilter,
  PerspectiveCamera,
  SRGBColorSpace,
  SphereGeometry,
  TextureLoader
} from 'three';
import {
  panoramaCamera,
  SceneSettings
} from '../config/sceneConfig';
import { PanoramaControls } from '../hooks/usePanoramaControls';

type PanoramaSceneProps = {
  controls: PanoramaControls;
  imageSrc: string;
  settings: Pick<SceneSettings, 'autoDriftEnabled'>;
  introScale: number;
};

export function PanoramaScene({
  controls,
  imageSrc,
  settings,
  introScale
}: PanoramaSceneProps) {
  const groupRef = useRef<Group>(null);
  const texture = useLoader(TextureLoader, imageSrc);
  const { camera } = useThree();
  const geometry = useMemo(() => {
    const sphereGeometry = new SphereGeometry(panoramaCamera.radius, 128, 80);
    sphereGeometry.scale(panoramaCamera.textureHorizontalScale, 1, 1);

    return sphereGeometry;
  }, []);

  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  useEffect(() => {
    camera.position.set(0, 0, 0.1);
    camera.rotation.order = 'YXZ';

    if ((camera as PerspectiveCamera).isPerspectiveCamera) {
      const perspectiveCamera = camera as PerspectiveCamera;
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
      (panoramaCamera.initialYawDegrees * Math.PI) / 180 +
      controls.yaw +
      drift;
    const pitch = controls.pitch;

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    if ((camera as PerspectiveCamera).isPerspectiveCamera) {
      const perspectiveCamera = camera as PerspectiveCamera;
      perspectiveCamera.fov = controls.fov;
      perspectiveCamera.updateProjectionMatrix();
    }

    groupRef.current?.scale.setScalar(introScale);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <primitive object={geometry} attach="geometry" />
        <meshBasicMaterial
          map={texture}
          side={FrontSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

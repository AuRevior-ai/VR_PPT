import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  LinearFilter,
  Mesh,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader
} from 'three';
import {
  layeredSceneLayers,
  SceneLayerConfig,
  SceneSettings
} from '../config/sceneConfig';
import { ParallaxMotion } from '../hooks/usePointerParallax';
import {
  fisheyeFragmentShader,
  fisheyeVertexShader
} from '../shaders/fisheyeShader';

export type SceneRenderProps = {
  motion: Pick<ParallaxMotion, 'x' | 'y'>;
  settings: SceneSettings;
  introScale: number;
};

type SceneImagePlaneProps = SceneRenderProps & {
  layer: SceneLayerConfig;
  renderOrder: number;
};

export function SceneImagePlane({
  layer,
  motion,
  settings,
  introScale,
  renderOrder
}: SceneImagePlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const texture = useLoader(TextureLoader, layer.src);
  const { viewport } = useThree();

  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  const planeSize = useMemo(() => {
    const image = texture.image as HTMLImageElement | undefined;
    const imageAspect = image?.width && image?.height ? image.width / image.height : 16 / 9;
    const viewportAspect = viewport.width / viewport.height;

    // Cover the viewport like background-size: cover, then overscale each layer
    // slightly so parallax never exposes empty edges.
    if (viewportAspect > imageAspect) {
      const width = viewport.width * layer.scale;
      return {
        width,
        height: width / imageAspect
      };
    }

    const height = viewport.height * layer.scale;
    return {
      width: height * imageAspect,
      height
    };
  }, [layer.scale, texture.image, viewport.height, viewport.width]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uStrength: { value: settings.fisheyeEnabled ? settings.fisheyeStrength : 0 },
      uLensMode: { value: settings.lensMode === 'concaveWide' ? 1 : 0 },
      uConcaveStrength: {
        value:
          settings.fisheyeEnabled && settings.lensMode === 'concaveWide'
            ? settings.fisheyeStrength
            : 0
      },
      uOpacity: { value: layer.opacity ?? 1 }
    }),
    [
      layer.opacity,
      settings.fisheyeEnabled,
      settings.fisheyeStrength,
      settings.lensMode,
      texture
    ]
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const material = materialRef.current;

    if (!mesh || !material) {
      return;
    }

    const driftX = settings.autoDriftEnabled
      ? Math.sin(clock.elapsedTime * 0.24 + layer.parallaxFactor * 1.8) * 0.12
      : 0;
    const driftY = settings.autoDriftEnabled
      ? Math.cos(clock.elapsedTime * 0.18 + layer.parallaxFactor) * 0.06
      : 0;
    const viewX = motion.x + driftX;
    const viewY = motion.y + driftY;
    const maxX = viewport.width * 0.13;
    const maxY = viewport.height * 0.095;
    const rotationRange = (settings.viewRotationMaxDegrees * Math.PI) / 180;
    const rotationWeight = 0.24 + layer.parallaxFactor * 0.52;

    // Different parallax factors make flat planes feel like foreground,
    // midground, and background without requiring full 3D modeling.
    mesh.position.x = -viewX * settings.parallaxStrength * layer.parallaxFactor * maxX;
    mesh.position.y = viewY * settings.parallaxStrength * layer.parallaxFactor * maxY;
    mesh.position.z = layer.depth;
    mesh.rotation.x = viewY * settings.parallaxStrength * rotationRange * rotationWeight * 0.28;
    mesh.rotation.y = viewX * settings.parallaxStrength * rotationRange * rotationWeight;
    mesh.scale.setScalar(introScale);

    material.uniforms.uStrength.value = settings.fisheyeEnabled
      ? settings.fisheyeStrength
      : 0;
    material.uniforms.uLensMode.value =
      settings.lensMode === 'concaveWide' ? 1 : 0;
    material.uniforms.uConcaveStrength.value =
      settings.fisheyeEnabled && settings.lensMode === 'concaveWide'
        ? settings.fisheyeStrength
        : 0;
    material.uniforms.uOpacity.value = layer.opacity ?? 1;
  });

  return (
    <mesh ref={meshRef} renderOrder={renderOrder}>
      <planeGeometry args={[planeSize.width, planeSize.height, 48, 48]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={fisheyeVertexShader}
        fragmentShader={fisheyeFragmentShader}
      />
    </mesh>
  );
}

export function LayeredScene(props: SceneRenderProps) {
  return (
    <group>
      {layeredSceneLayers.map((layer, index) => (
        <SceneImagePlane
          key={layer.id}
          layer={layer}
          renderOrder={index}
          {...props}
        />
      ))}
    </group>
  );
}

import { singleImageLayer } from '../config/sceneConfig';
import { SceneImagePlane, SceneRenderProps } from './LayeredScene';

export function SingleImageScene(props: SceneRenderProps) {
  return (
    <SceneImagePlane
      layer={singleImageLayer}
      renderOrder={0}
      {...props}
    />
  );
}

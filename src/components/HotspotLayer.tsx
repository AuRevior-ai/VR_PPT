import { ClassroomHotspot, hotspots } from '../config/hotspots';
import { SceneSettings } from '../config/sceneConfig';
import { ParallaxMotion } from '../hooks/usePointerParallax';

type HotspotLayerProps = {
  activeHotspotId: string | null;
  motion: Pick<ParallaxMotion, 'x' | 'y'>;
  settings: SceneSettings;
  onSelect: (hotspot: ClassroomHotspot) => void;
};

export function HotspotLayer({
  activeHotspotId,
  motion,
  settings,
  onSelect
}: HotspotLayerProps) {
  const offsetX = -motion.x * settings.parallaxStrength * 34;
  const offsetY = motion.y * settings.parallaxStrength * 20;

  return (
    <div
      className="hotspot-layer"
      style={{
        transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`
      }}
    >
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          type="button"
          className={`hotspot-button hotspot-${hotspot.tone}`}
          style={{
            left: `${hotspot.x - hotspot.width / 2}%`,
            top: `${hotspot.y - hotspot.height / 2}%`,
            width: `${hotspot.width}%`,
            height: `${hotspot.height}%`
          }}
          aria-label={hotspot.title}
          aria-pressed={activeHotspotId === hotspot.id}
          onClick={() => onSelect(hotspot)}
        >
          <span>{hotspot.label}</span>
        </button>
      ))}
    </div>
  );
}

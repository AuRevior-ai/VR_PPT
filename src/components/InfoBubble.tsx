import { ClassroomHotspot } from '../config/hotspots';

type InfoBubbleProps = {
  hotspot: ClassroomHotspot | null;
  onClose: () => void;
};

export function InfoBubble({ hotspot, onClose }: InfoBubbleProps) {
  if (!hotspot) {
    return null;
  }

  return (
    <section
      className={`info-bubble bubble-${hotspot.tone}`}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`
      }}
      aria-live="polite"
    >
      <button
        type="button"
        className="info-bubble-close"
        aria-label="关闭"
        onClick={onClose}
      >
        x
      </button>
      <span className="info-bubble-label">{hotspot.label}</span>
      <h2>{hotspot.title}</h2>
      <p>{hotspot.description}</p>
      <ul>
        {hotspot.details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
    </section>
  );
}

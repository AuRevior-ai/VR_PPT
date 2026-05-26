import { controlRanges, SceneSettings } from '../config/sceneConfig';
import { DeviceOrientationState } from '../hooks/useDeviceOrientation';

type ControlPanelProps = {
  settings: SceneSettings;
  deviceOrientation: DeviceOrientationState;
  uploadError: string | null;
  onChange: (settings: SceneSettings) => void;
  onPanoramaUpload: (file: File) => void;
};

export function ControlPanel({
  settings,
  deviceOrientation,
  uploadError,
  onChange,
  onPanoramaUpload
}: ControlPanelProps) {
  const update = <Key extends keyof SceneSettings>(
    key: Key,
    value: SceneSettings[Key]
  ) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <aside className="control-panel" aria-label="镜头控制">
      <div className="control-panel-header">
        <span>镜头台</span>
      </div>

      <label className="upload-row">
        <span>全景图</span>
        <span className="upload-button" aria-hidden="true">
          上传
        </span>
        <input
          className="upload-input"
          type="file"
          accept="image/*"
          aria-label="上传 2:1 全景图"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';

            if (file) {
              onPanoramaUpload(file);
            }
          }}
        />
      </label>

      {uploadError ? (
        <p className="upload-error" role="status">
          {uploadError}
        </p>
      ) : null}

      <label className="switch-row">
        <span>凹面</span>
        <input
          type="checkbox"
          checked={settings.fisheyeEnabled}
          onChange={(event) => update('fisheyeEnabled', event.target.checked)}
        />
      </label>

      <label className="switch-row">
        <span>漂移</span>
        <input
          type="checkbox"
          checked={settings.autoDriftEnabled}
          onChange={(event) => update('autoDriftEnabled', event.target.checked)}
        />
      </label>

      <label className="range-row">
        <span>视差</span>
        <input
          type="range"
          min={controlRanges.parallaxStrength.min}
          max={controlRanges.parallaxStrength.max}
          step={controlRanges.parallaxStrength.step}
          value={settings.parallaxStrength}
          onChange={(event) =>
            update('parallaxStrength', Number(event.target.value))
          }
        />
      </label>

      <label className="range-row">
        <span>弯曲</span>
        <input
          type="range"
          min={controlRanges.fisheyeStrength.min}
          max={controlRanges.fisheyeStrength.max}
          step={controlRanges.fisheyeStrength.step}
          value={settings.fisheyeStrength}
          onChange={(event) =>
            update('fisheyeStrength', Number(event.target.value))
          }
        />
      </label>

      {deviceOrientation.permissionState === 'prompt' ? (
        <button
          type="button"
          className="motion-permission-button"
          onClick={() => void deviceOrientation.requestPermission()}
        >
          开启体感
        </button>
      ) : null}
    </aside>
  );
}

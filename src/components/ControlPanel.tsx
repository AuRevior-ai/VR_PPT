type ControlPanelProps = {
  uploadError: string | null;
  onPanoramaUpload: (file: File) => void;
};

export function ControlPanel({
  uploadError,
  onPanoramaUpload
}: ControlPanelProps) {
  return (
    <aside className="control-panel" aria-label="镜头控制">
      <div className="control-panel-header">
        <span>镜头台</span>
      </div>

      <label className="upload-row">
        <span className="upload-button" aria-hidden="true">
          上传全景图
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
    </aside>
  );
}

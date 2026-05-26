type LoadingScreenProps = {
  progress: number;
  modeLabel: string;
};

export function LoadingScreen({ progress, modeLabel }: LoadingScreenProps) {
  const percent = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-mark" />
        <h1>绘本教室正在展开</h1>
        <p>{modeLabel}</p>
        <div className="loading-bar" aria-label={`加载进度 ${percent}%`}>
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

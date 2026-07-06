import { lokiTheme } from "../../../shared/loki-theme";

export function LiveBar({ onCamera, onShare, onExpand, onMute, onEnd }: {
  onCamera: () => void; onShare: () => void; onExpand: () => void;
  onMute: () => void; onEnd: () => void;
}) {
  return (
    <div style={{ background: lokiTheme.colors.surface, display: "flex", gap: 12 }}>
      <button onClick={onCamera}>Cam</button>
      <button onClick={onShare}>Share</button>
      <button onClick={onExpand}>Expand</button>
      <button onClick={onMute}>Mute</button>
      <button onClick={onEnd} style={{ background: lokiTheme.colors.danger }}>End</button>
    </div>
  );
}

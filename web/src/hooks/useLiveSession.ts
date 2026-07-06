import { useRef, useState } from "react";

export function useLiveSession(gatewayClient: any) {
  const [, setCamOn] = useState(false);
  const [, setShareOn] = useState(false);
  const [muted, setMuted] = useState(false);
  void muted;
  const sessionRef = useRef<any>(null);

  const start = async (source: "camera" | "screen") => {
    sessionRef.current = await gatewayClient.startLiveSession({ video_source: source, interruptible: true });
  };
  const end = async () => {
    await gatewayClient.endLiveSession(sessionRef.current?.id);
    sessionRef.current = null;
    setCamOn(false); setShareOn(false);
  };

  return {
    onCamera: () => { setCamOn(v => { const n = !v; n ? start("camera") : end(); return n; }); },
    onShare: () => { setShareOn(v => { const n = !v; n ? start("screen") : end(); return n; }); },
    onExpand: () => gatewayClient.toggleLiveSource?.(sessionRef.current?.id),
    onMute: () => { setMuted(m => { gatewayClient.setMute?.(sessionRef.current?.id, !m); return !m; }); },
    onEnd: end,
  };
}

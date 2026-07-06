import { useState } from "react";
import { LiveBar } from "./LiveBar";
import { useLiveSession } from "../hooks/useLiveSession";

export function LiveOverlay({ gatewayClient, triggered }: { gatewayClient: any; triggered: boolean }) {
  const [open, setOpen] = useState(triggered);
  const controls = useLiveSession(gatewayClient);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, borderRadius: 999 }}>
      <LiveBar {...controls} onEnd={() => { controls.onEnd(); setOpen(false); }} />
    </div>
  );
}

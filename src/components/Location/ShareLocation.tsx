import type { LatLng } from "../../types/location";
import { shareLinkUrl, shareText } from "../../utils/mapsLinks";
import CopyButton from "../Hexagon/CopyButton";

interface Props {
  point: LatLng;
  cellId: string | null;
  resolution: number;
  label?: string;
  heading?: string;
}

/** One-time snapshot share (not live tracking). Uses the native share sheet when available, else copy. */
export default function ShareLocation({ point, cellId, resolution, label = "Share my location", heading = "My location" }: Props) {
  const base = window.location.href.split("#")[0];
  const url = shareLinkUrl(point, resolution, base);
  const text = shareText(point, cellId, url, heading);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const share = async () => {
    try {
      await navigator.share({ title: heading, text, url });
    } catch {
      /* user cancelled the share sheet */
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        {canShare && <button type="button" className="btn-primary" onClick={share}>📤 {label}</button>}
        <CopyButton text={text} label={canShare ? "share text" : label.toLowerCase()} />
      </div>
      <p className="text-xs text-slate-600">Sends a one-time snapshot of these coordinates, not live tracking.</p>
    </div>
  );
}

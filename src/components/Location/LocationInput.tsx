import { useState, type FormEvent } from "react";
import type { LatLng } from "../../types/location";
import { validateLatLng } from "../../utils/validation";

export default function LocationInput({ onSubmit }: { onSubmit: (p: LatLng) => void }) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [msg, setMsg] = useState<{ kind: "error" | "warn"; text: string } | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const la = lat.trim() === "" ? NaN : Number(lat);
    const ln = lng.trim() === "" ? NaN : Number(lng);
    const c = validateLatLng(la, ln);
    if (!c.valid) return setMsg({ kind: "error", text: c.error! });
    setMsg(c.warning ? { kind: "warn", text: c.warning } : null);
    onSubmit({ lat: la, lng: ln });
  };

  return (
    <form onSubmit={submit} className="space-y-2" aria-label="Manual coordinates">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="lat" className="text-xs font-medium">Latitude</label>
          <input id="lat" className="input" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="25.4484" />
        </div>
        <div>
          <label htmlFor="lng" className="text-xs font-medium">Longitude</label>
          <input id="lng" className="input" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="78.5685" />
        </div>
      </div>
      <button type="submit" className="btn-primary w-full">Go to coordinates</button>
      {msg && <p role="alert" className={`text-xs ${msg.kind === "error" ? "text-red-700" : "text-amber-700"}`}>{msg.text}</p>}
    </form>
  );
}

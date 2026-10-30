import { RESOLUTION_PRESETS, resolutionAreaKm2 } from "../../services/h3Service";
import type { Units } from "../../types/location";
import { formatArea } from "../../utils/formatters";

interface Props {
  resolution: number;
  suggested: number;
  units: Units;
  onChange: (r: number) => void;
}

export default function ResolutionSelector({ resolution, suggested, units, onChange }: Props) {
  const isPreset = RESOLUTION_PRESETS.some((p) => p.resolution === resolution);
  return (
    <div className="space-y-1">
      <label htmlFor="res" className="text-sm font-medium">Resolution</label>
      <select id="res" className="input" value={resolution} onChange={(e) => onChange(Number(e.target.value))}>
        {RESOLUTION_PRESETS.map((p) => (
          <option key={p.resolution} value={p.resolution}>
            {p.label} – res {p.resolution} (≈{formatArea(resolutionAreaKm2(p.resolution), units)})
          </option>
        ))}
        {!isPreset && <option value={resolution}>Custom – res {resolution}</option>}
      </select>
      <p className="text-xs text-slate-600">Approx average area; actual cell sizes vary.</p>
      {suggested !== resolution && (
        <button type="button" className="btn-ghost w-full" onClick={() => onChange(suggested)}>
          Use suggested for this zoom (res {suggested})
        </button>
      )}
    </div>
  );
}

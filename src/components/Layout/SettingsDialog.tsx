import { RESOLUTION_PRESETS } from "../../services/h3Service";
import type { Units } from "../../types/location";

interface Props {
  units: Units;
  defaultRes: number;
  sampleCount: number;
  onUnits: (u: Units) => void;
  onDefaultRes: (r: number) => void;
  onLoadSamples: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function SettingsDialog(p: Props) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40 sm:items-center" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="w-full max-w-md space-y-4 rounded-t-2xl bg-white p-4 sm:rounded-2xl">
        <h2 className="text-lg font-semibold">Settings</h2>
        <div>
          <label htmlFor="units" className="text-sm font-medium">Units</label>
          <select id="units" className="input" value={p.units} onChange={(e) => p.onUnits(e.target.value as Units)}>
            <option value="metric">Metric (m, km)</option>
            <option value="imperial">Imperial (ft, mi)</option>
          </select>
        </div>
        <div>
          <label htmlFor="dres" className="text-sm font-medium">Default resolution</label>
          <select id="dres" className="input" value={p.defaultRes} onChange={(e) => p.onDefaultRes(Number(e.target.value))}>
            {RESOLUTION_PRESETS.map((r) => <option key={r.resolution} value={r.resolution}>{r.label} (res {r.resolution})</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.sampleCount === 0 && <button type="button" className="btn-ghost" onClick={p.onLoadSamples}>Reload sample data</button>}
          <button
            type="button"
            className="btn-ghost !border-red-300 !text-red-700"
            onClick={() => window.confirm("Delete all locally saved prices and settings?") && p.onClearAll()}
          >
            Clear all local data
          </button>
        </div>
        <p className="text-xs text-slate-500">Everything is stored only in this browser. Shared prices, accounts and verification are future features.</p>
        <button type="button" className="btn-primary w-full" onClick={p.onClose}>Done</button>
      </div>
    </div>
  );
}

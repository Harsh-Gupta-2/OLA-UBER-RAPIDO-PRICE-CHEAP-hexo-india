import { BAND_COLORS, BAND_ICONS, BAND_LABELS } from "../../utils/pricing";
import type { PriceBand } from "../../types/price";
import { formatINR } from "../../utils/formatters";

const ORDER: PriceBand[] = ["cheapest", "low", "average", "high", "highest", "none"];

export default function Legend({ min, max, hasPrices }: { min: number; max: number; hasPrices: boolean }) {
  return (
    <div className="absolute bottom-6 left-2 z-[900] hidden max-w-[220px] rounded-lg bg-white/95 p-2 text-xs shadow md:block" aria-label="Map legend">
      <div className="mb-1 font-semibold">Price (selected product)</div>
      <ul className="space-y-0.5">
        {ORDER.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm border border-slate-400" style={{ background: BAND_COLORS[b] }} />
            <span aria-hidden>{BAND_ICONS[b]}</span>
            {BAND_LABELS[b]}
          </li>
        ))}
      </ul>
      {hasPrices && <div className="mt-1 text-slate-600">{formatINR(min)} – {formatINR(max)}</div>}
      <div className="mt-1 border-t pt-1 text-slate-600">
        <span className="text-indigo-600">▬</span> selected · <span className="text-sky-500">┅</span> your cell
      </div>
    </div>
  );
}

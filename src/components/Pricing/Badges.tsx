import type { PriceRecord } from "../../types/price";
import { isOutdated } from "../../utils/pricing";

export default function Badges({ r }: { r: PriceRecord }) {
  const cls = "rounded px-1.5 py-0.5 text-[11px] font-medium";
  return (
    <span className="inline-flex flex-wrap gap-1">
      {r.isSample && <span className={`${cls} bg-amber-100 text-amber-900`}>Sample</span>}
      <span className={`${cls} ${r.verified ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-700"}`}>{r.verified ? "✓ Verified" : "Unverified"}</span>
      {isOutdated(r) && <span className={`${cls} bg-red-100 text-red-800`}>Outdated</span>}
    </span>
  );
}

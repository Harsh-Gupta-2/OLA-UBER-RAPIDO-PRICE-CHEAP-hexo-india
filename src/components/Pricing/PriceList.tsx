import { useMemo, useState } from "react";
import type { LatLng, Units } from "../../types/location";
import type { PriceRecord } from "../../types/price";
import { haversine } from "../../utils/distance";
import { formatDate, formatDistance, formatINR } from "../../utils/formatters";
import type { CheapestResult } from "../../utils/pricing";
import Badges from "./Badges";

interface Props {
  records: PriceRecord[]; // already same-product
  cheapest: CheapestResult | null;
  userLoc: LatLng | null;
  units: Units;
  onFocus: (r: PriceRecord) => void;
  onRemove: (id: string) => void;
  title: string;
}

export default function PriceList({ records, cheapest, userLoc, units, onFocus, onRemove, title }: Props) {
  const [sort, setSort] = useState<"price" | "distance">("price");
  const rows = useMemo(() => {
    const withDist = records.map((r) => ({ r, d: userLoc ? haversine(userLoc, { lat: r.latitude, lng: r.longitude }) : null }));
    return withDist.sort((a, b) => (sort === "distance" && a.d !== null && b.d !== null ? a.d - b.d : a.r.price - b.r.price));
  }, [records, userLoc, sort]);

  return (
    <section aria-label={title} className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title} ({records.length})</h3>
        <select aria-label="Sort prices" className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value as "price" | "distance")}>
          <option value="price">Lowest price</option>
          <option value="distance" disabled={!userLoc}>Nearest to me</option>
        </select>
      </div>
      {!records.length && <p className="text-sm text-slate-600">No price records yet for this product.</p>}
      <ul className="space-y-2">
        {rows.map(({ r, d }) => {
          const isCheapest = cheapest?.record.id === r.id;
          const diff = cheapest ? r.price - cheapest.record.price : null;
          return (
            <li key={r.id} className={`rounded-lg border p-2 ${isCheapest ? "border-green-500 bg-green-50" : "border-slate-200"}`}>
              <div className="flex items-start justify-between gap-2">
                <button type="button" className="text-left" onClick={() => onFocus(r)} aria-label={`Show ${r.providerName} on map`}>
                  <span className="block text-sm font-medium">{r.providerName}</span>
                  <span className="block text-lg font-semibold">{formatINR(r.price)}</span>
                </button>
                <button type="button" className="btn-ghost !px-2 text-xs" onClick={() => onRemove(r.id)} aria-label={`Remove ${r.providerName} price`}>Remove</button>
              </div>
              {isCheapest && <div className="text-xs font-semibold text-green-800">★ {cheapest!.verified ? "Cheapest (verified)" : "Cheapest (unverified)"}</div>}
              <div className="text-xs text-slate-600">
                {diff !== null && diff > 0 && <>+{formatINR(diff)} vs cheapest · </>}
                {d !== null && <>{formatDistance(d, units)} from you · </>}
                {formatDate(r.updatedAt)}
              </div>
              <div className="mt-1"><Badges r={r} /></div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

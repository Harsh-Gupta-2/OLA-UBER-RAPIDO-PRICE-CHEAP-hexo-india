import { useMemo } from "react";
import { edgeInfo, getNeighbours } from "../../services/h3Service";
import type { LatLng, Units } from "../../types/location";
import type { CellPriceSummary } from "../../types/price";
import { formatDistance, formatINR } from "../../utils/formatters";
import WalkButtons from "../Hexagon/WalkButtons";

interface Props {
  userLoc: LatLng;
  userCellId: string;
  summaries: Map<string, CellPriceSummary>;
  units: Units;
}

/** Suggests adjacent hexagons with a lower price for the selected product. It never judges routes or traffic. */
export default function BetterNearby({ userLoc, userCellId, summaries, units }: Props) {
  const edge = useMemo(() => edgeInfo(userCellId, userLoc), [userCellId, userLoc]);
  const own = summaries.get(userCellId);
  const better = useMemo(
    () =>
      getNeighbours(userCellId, 1, userLoc)
        .map((n) => ({ n, s: summaries.get(n.id) }))
        .filter((x): x is { n: (typeof x)["n"]; s: CellPriceSummary } => !!x.s && (!own || x.s.minPrice < own.minPrice))
        .sort((a, b) => a.s.minPrice - b.s.minPrice),
    [userCellId, userLoc, summaries, own],
  );

  return (
    <section aria-label="Better nearby" className="space-y-2 rounded-lg border border-sky-200 bg-sky-50 p-3">
      <h2 className="text-sm font-semibold">Better nearby</h2>
      {edge && (
        <p className="text-sm">
          You are about {formatDistance(edge.distanceToEdgeM, units)} from the {edge.direction} edge of your hexagon.
        </p>
      )}
      <p className="text-sm">{own ? `Your hexagon: ${formatINR(own.minPrice)}${own.hasVerified ? "" : " (unverified)"}` : "No price info in your hexagon."}</p>
      {better.length === 0 ? (
        <p className="text-sm text-slate-700">No cheaper adjacent hexagon found for this product.</p>
      ) : (
        <ul className="space-y-2">
          {better.map(({ n, s }) => (
            <li key={n.id} className="rounded border border-slate-200 bg-white p-2 text-sm">
              <strong>{formatINR(s.minPrice)}</strong>
              {own && <> (₹{(own.minPrice - s.minPrice).toFixed(2).replace(/\.00$/, "")} cheaper)</>}
              {!s.cheapestRecord.verified && " · unverified"} · {formatDistance(n.distanceM, units)} {n.direction}
              <div className="mt-1"><WalkButtons dest={n.center} origin={userLoc} compact /></div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-600">
        We only point to a hexagon. Check the route, traffic and whether it's worth it in Google Maps, which you decide.
      </p>
    </section>
  );
}

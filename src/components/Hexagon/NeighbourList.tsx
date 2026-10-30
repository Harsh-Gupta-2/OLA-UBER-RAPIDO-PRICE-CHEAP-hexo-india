import type { NeighbourInfo } from "../../types/hexagon";
import type { LatLng, Units } from "../../types/location";
import { formatDistance } from "../../utils/formatters";
import WalkButtons from "./WalkButtons";

interface Props {
  neighbours: NeighbourInfo[];
  rings: number;
  setRings: (n: number) => void;
  userLoc: LatLng | null;
  hasUser: boolean;
  units: Units;
  onSelect: (id: string) => void;
}

export default function NeighbourList({ neighbours, rings, setRings, userLoc, hasUser, units, onSelect }: Props) {
  return (
    <section aria-label="Neighbours" className="space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="rings" className="text-sm font-medium">Rings: {rings}</label>
        <input id="rings" type="range" min={1} max={5} value={rings} onChange={(e) => setRings(Number(e.target.value))} className="flex-1" />
      </div>
      <p className="text-xs text-slate-600">
        {neighbours.length} neighbouring cells, sorted by straight-line distance from {hasUser ? "you" : "the selected hexagon (share or enter your location for distance from you)"}.
      </p>
      <ul className="space-y-2">
        {neighbours.map((n) => (
          <li key={n.id} className="rounded-lg border border-slate-200 p-2">
            <button type="button" className="w-full text-left" onClick={() => onSelect(n.id)} aria-label={`Select neighbour ${n.id}`}>
              <span className="block break-all font-mono text-xs">{n.id}</span>
              <span className="text-sm">
                {n.gridDistance === null ? "ring ?" : `ring ${n.gridDistance}`} · {formatDistance(n.distanceM, units)} · {n.direction}
              </span>
            </button>
            <div className="mt-1"><WalkButtons dest={n.center} origin={userLoc} compact /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

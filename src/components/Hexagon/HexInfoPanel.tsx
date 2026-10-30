import type { HexInfo } from "../../types/hexagon";
import type { LatLng, Units } from "../../types/location";
import type { PriceRecord } from "../../types/price";
import { formatArea, formatCoord, formatDate, formatINR } from "../../utils/formatters";
import { resolutionAreaKm2 } from "../../services/h3Service";
import CopyButton from "./CopyButton";
import WalkButtons from "./WalkButtons";

interface Props {
  info: HexInfo;
  neighbourCount: number;
  isUserCell: boolean;
  userLoc: LatLng | null;
  records: PriceRecord[];
  units: Units;
}

export default function HexInfoPanel({ info, neighbourCount, isUserCell, userLoc, records, units }: Props) {
  const latest = records.reduce<string | null>((m, r) => (!m || r.updatedAt > m ? r.updatedAt : m), null);
  const verified = records.filter((r) => r.verified).reduce<number | null>((m, r) => (m === null || r.price < m ? r.price : m), null);
  return (
    <section aria-label="Selected hexagon" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">Selected hexagon</h2>
        {isUserCell && <span className="rounded bg-sky-100 px-2 py-0.5 text-xs text-sky-800">📍 Your cell</span>}
        {info.isPentagon && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Pentagon cell, 5 vertices</span>}
      </div>
      <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-slate-500">H3 ID</dt><dd className="break-all font-mono">{info.id}</dd>
        <dt className="text-slate-500">Resolution</dt>
        <dd>{info.resolution} <span className="text-slate-500">(≈{formatArea(resolutionAreaKm2(info.resolution), units)} avg)</span></dd>
        <dt className="text-slate-500">Centre</dt><dd>{formatCoord(info.center.lat)}, {formatCoord(info.center.lng)}</dd>
        <dt className="text-slate-500">Neighbours</dt><dd>{neighbourCount} in ring</dd>
        <dt className="text-slate-500">Price records</dt><dd>{records.length}</dd>
        <dt className="text-slate-500">Cheapest verified</dt><dd>{verified !== null ? formatINR(verified) : "No verified price"}</dd>
        <dt className="text-slate-500">Latest update</dt><dd>{latest ? formatDate(latest) : "—"}</dd>
      </dl>
      <div className="flex flex-wrap gap-2">
        <CopyButton text={info.id} label="H3 ID" />
        <CopyButton text={`${formatCoord(info.center.lat)}, ${formatCoord(info.center.lng)}`} label="coordinates" />
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer py-2">Boundary coordinates ({info.boundary.length} vertices)</summary>
        <ol className="list-decimal pl-5 font-mono text-xs">
          {info.boundary.map(([la, ln], i) => <li key={i}>{formatCoord(la)}, {formatCoord(ln)}</li>)}
        </ol>
      </details>
      <WalkButtons dest={info.center} origin={userLoc} />
      <p className="text-xs text-slate-500">Hexagons are an indexing grid, not state, district or city boundaries.</p>
    </section>
  );
}

import type { LatLng } from "../../types/location";
import { googleMapsWalkUrl, osmUrl } from "../../utils/mapsLinks";
import { formatCoord } from "../../utils/formatters";
import CopyButton from "./CopyButton";

export default function WalkButtons({ dest, origin, compact = false }: { dest: LatLng; origin: LatLng | null; compact?: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <a className="btn-primary" href={googleMapsWalkUrl(dest, origin)} target="_blank" rel="noopener noreferrer">
          🚶 Walk to this hexagon
        </a>
        {!compact && (
          <>
            <a className="btn-ghost" href={osmUrl(dest)} target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
            <CopyButton text={`${formatCoord(dest.lat)}, ${formatCoord(dest.lng)}`} label="coordinates" />
          </>
        )}
      </div>
      {!compact && (
        <p className="mt-1 text-xs text-slate-600">
          Hexagon centre may not be a walkable point (building, river, road). Directions go to the centre coordinates.
        </p>
      )}
    </div>
  );
}

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { CircleMarker, MapContainer, Polygon, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import { useHexagons } from "../../hooks/useHexagons";
import { cellBoundary, suggestResolution, type ViewBounds } from "../../services/h3Service";
import { INDIA_CENTER, INDIA_ZOOM, OSM_ATTRIBUTION, OSM_TILES } from "../../services/mapService";
import type { LatLng } from "../../types/location";
import type { PriceBand, PriceFilter } from "../../types/price";
import { BAND_COLORS, passesFilter } from "../../utils/pricing";

export interface FlyRequest {
  center: LatLng;
  zoom: number;
  nonce: number;
}

interface Props {
  resolution: number;
  selectedId: string | null;
  userCellId: string | null;
  userLoc: LatLng | null;
  neighbourIds: Set<string>;
  bands: Map<string, PriceBand>;
  filter: PriceFilter;
  fly: FlyRequest | null;
  onSelect: (id: string) => void;
  onZoomSuggest: (res: number) => void;
}

const toBounds = (b: LatLngBounds): ViewBounds => ({
  south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast(),
});

function Flyer({ fly }: { fly: FlyRequest | null }) {
  const map = useMap();
  useEffect(() => {
    if (fly) map.flyTo([fly.center.lat, fly.center.lng], fly.zoom, { duration: 0.8 });
  }, [fly, map]);
  return null;
}

/** Tracks debounced (250ms) bounds + zoom. */
function ViewTracker({ onView }: { onView: (b: ViewBounds, z: number) => void }) {
  const map = useMap();
  const timer = useRef<number | undefined>(undefined);
  const fire = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onView(toBounds(map.getBounds()), map.getZoom()), 250);
  };
  useMapEvents({ moveend: fire, zoomend: fire });
  useEffect(() => {
    onView(toBounds(map.getBounds()), map.getZoom());
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface HexProps {
  id: string;
  color: string | null;
  kind: "plain" | "neighbour" | "selected" | "user";
  onSelect: (id: string) => void;
}

const HexPolygon = memo(function HexPolygon({ id, color, kind, onSelect }: HexProps) {
  const positions = useMemo(() => cellBoundary(id), [id]);
  const pathOptions = useMemo(() => {
    const base = { fillColor: color ?? "#e2e8f0", fillOpacity: color ? 0.55 : 0.08 };
    switch (kind) {
      case "selected": return { ...base, color: "#4f46e5", weight: 4, fillOpacity: color ? 0.7 : 0.25 };
      case "user": return { ...base, color: "#0ea5e9", weight: 4, dashArray: "6 4", fillOpacity: color ? 0.7 : 0.25 };
      case "neighbour": return { ...base, color: "#6366f1", weight: 2 };
      default: return { ...base, color: "#64748b", weight: 1 };
    }
  }, [color, kind]);
  const handlers = useMemo(() => ({ click: () => onSelect(id) }), [id, onSelect]);
  return <Polygon positions={positions} pathOptions={pathOptions} eventHandlers={handlers} />;
});

function Cells(p: Props & { bounds: ViewBounds | null }) {
  const { cells, tooMany } = useHexagons(p.bounds, p.resolution);
  const ids = useMemo(() => {
    const set = new Set(cells);
    for (const x of [p.selectedId, p.userCellId]) if (x) set.add(x);
    return [...set];
  }, [cells, p.selectedId, p.userCellId]);

  return (
    <>
      {tooMany && (
        <div role="status" className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2 text-sm text-white shadow">
          Zoom in to see hexagons
        </div>
      )}
      {!tooMany &&
        ids.map((id) => {
          const band = p.bands.get(id) ?? "none";
          if (!passesFilter(p.filter, band) && id !== p.selectedId && id !== p.userCellId) return null;
          const kind = id === p.selectedId ? "selected" : id === p.userCellId ? "user" : p.neighbourIds.has(id) ? "neighbour" : "plain";
          return <HexPolygon key={id} id={id} color={band === "none" ? null : BAND_COLORS[band]} kind={kind} onSelect={p.onSelect} />;
        })}
    </>
  );
}

export default function HexMap(props: Props) {
  const [bounds, setBounds] = useState<ViewBounds | null>(null);
  const { onZoomSuggest } = props;
  const onView = useMemo(
    () => (b: ViewBounds, z: number) => {
      setBounds(b);
      onZoomSuggest(suggestResolution(z));
    },
    [onZoomSuggest],
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer center={INDIA_CENTER} zoom={INDIA_ZOOM} minZoom={4} preferCanvas className="h-full w-full" zoomControl>
        <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} maxZoom={19} />
        <ViewTracker onView={onView} />
        <Flyer fly={props.fly} />
        <Cells {...props} bounds={bounds} />
        {props.userLoc && (
          <CircleMarker center={[props.userLoc.lat, props.userLoc.lng]} radius={7} pathOptions={{ color: "#fff", fillColor: "#0ea5e9", fillOpacity: 1, weight: 3 }} />
        )}
      </MapContainer>
    </div>
  );
}

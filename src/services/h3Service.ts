import {
  cellToBoundary,
  cellToLatLng,
  getHexagonAreaAvg,
  getResolution,
  gridDisk,
  gridDistance as h3GridDistance,
  isPentagon,
  latLngToCell,
  polygonToCells,
} from "h3-js";
import type { HexInfo, NeighbourInfo, ResolutionPreset } from "../types/hexagon";
import type { LatLng } from "../types/location";
import { bearing, compassDirection, haversine } from "../utils/distance";

export const MAX_VIEWPORT_CELLS = 1500;
export const MAX_RINGS = 5;

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: "City-level", resolution: 7 },
  { label: "Neighbourhood", resolution: 8 },
  { label: "Local area", resolution: 9 },
  { label: "Fine-grained", resolution: 10 },
];

const boundaryCache = new Map<string, [number, number][]>();

export function latLngToCellId(lat: number, lng: number, res: number): string {
  return latLngToCell(lat, lng, res);
}

export function cellCenter(id: string): LatLng {
  const [lat, lng] = cellToLatLng(id);
  return { lat, lng };
}

/** Boundary as Leaflet [lat,lng] pairs (h3-js already returns [lat,lng]); cached. 5 vertices for pentagons. */
export function cellBoundary(id: string): [number, number][] {
  let b = boundaryCache.get(id);
  if (!b) {
    b = cellToBoundary(id).map(([lat, lng]) => [lat, lng] as [number, number]);
    boundaryCache.set(id, b);
  }
  return b;
}

export function neighbourIds(id: string, rings: number): string[] {
  return gridDisk(id, Math.max(0, Math.min(MAX_RINGS, Math.floor(rings))));
}

/** Grid distance in rings, or null when H3 cannot compute it (e.g. across pentagon distortion). */
export function safeGridDistance(a: string, b: string): number | null {
  try {
    return h3GridDistance(a, b);
  } catch {
    return null;
  }
}

export function resolutionAreaKm2(res: number): number {
  return getHexagonAreaAvg(res, "km2");
}

export function getHexInfo(id: string): HexInfo {
  return {
    id,
    resolution: getResolution(id),
    center: cellCenter(id),
    boundary: cellBoundary(id),
    isPentagon: isPentagon(id),
  };
}

export function getNeighbours(id: string, rings: number, user: LatLng | null): NeighbourInfo[] {
  const from = user ?? cellCenter(id);
  return neighbourIds(id, rings)
    .filter((n) => n !== id)
    .map((n) => {
      const center = cellCenter(n);
      const brg = bearing(from, center);
      return {
        id: n,
        center,
        gridDistance: safeGridDistance(id, n),
        distanceM: haversine(from, center),
        bearing: brg,
        direction: compassDirection(brg),
      };
    })
    .sort((a, b) => a.distanceM - b.distanceM);
}

export interface ViewBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

/** Cells whose centres lie in the bounds, or null if the estimate exceeds `max` ("zoom in"). */
export function cellsInBounds(b: ViewBounds, res: number, max = MAX_VIEWPORT_CELLS): string[] | null {
  const midLat = (b.north + b.south) / 2;
  const heightKm = Math.abs(b.north - b.south) * 111.32;
  const widthKm = Math.abs(b.east - b.west) * 111.32 * Math.cos((midLat * Math.PI) / 180);
  if ((heightKm * widthKm) / resolutionAreaKm2(res) > max * 1.3) return null;
  const ring: [number, number][] = [
    [b.south, b.west],
    [b.north, b.west],
    [b.north, b.east],
    [b.south, b.east],
  ];
  try {
    const cells = polygonToCells(ring, res);
    return cells.length > max ? null : cells;
  } catch {
    return null;
  }
}

/** Suggest a resolution from map zoom level. */
export function suggestResolution(zoom: number): number {
  if (zoom <= 11) return 7;
  if (zoom <= 13) return 8;
  if (zoom <= 15) return 9;
  return 10;
}

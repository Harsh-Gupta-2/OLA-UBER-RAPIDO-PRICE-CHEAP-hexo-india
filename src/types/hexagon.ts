import type { LatLng } from "./location";

export interface HexInfo {
  id: string;
  resolution: number;
  center: LatLng;
  boundary: [number, number][];
  isPentagon: boolean;
}

export interface NeighbourInfo {
  id: string;
  center: LatLng;
  gridDistance: number | null;
  distanceM: number;
  bearing: number;
  direction: string;
}

export interface ResolutionPreset {
  label: string;
  resolution: number;
}

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

export const INDIA_CENTER: [number, number] = [22.5, 79];
export const INDIA_ZOOM = 5;

/** Fix Leaflet's default marker icon paths under Vite. */
export function fixLeafletIcons(): void {
  L.Icon.Default.mergeOptions({ iconUrl: icon, iconRetinaUrl: icon2x, shadowUrl: shadow });
}

export const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const ZOOM_FOR_RES: Record<number, number> = { 7: 12, 8: 14, 9: 15, 10: 17 };
export const zoomForResolution = (res: number): number => ZOOM_FOR_RES[res] ?? Math.max(4, Math.min(18, Math.round(res * 1.7)));

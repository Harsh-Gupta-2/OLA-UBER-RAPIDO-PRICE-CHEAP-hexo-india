import type { LatLng } from "../types/location";

export function googleMapsWalkUrl(dest: LatLng, origin?: LatLng | null): string {
  const o = origin ? `&origin=${origin.lat},${origin.lng}` : "";
  return `https://www.google.com/maps/dir/?api=1${o}&destination=${dest.lat},${dest.lng}&travelmode=walking`;
}

export function osmUrl(dest: LatLng): string {
  return `https://www.openstreetmap.org/?mlat=${dest.lat}&mlon=${dest.lng}#map=18/${dest.lat}/${dest.lng}`;
}

/** App link that reopens the explorer at a point. `baseUrl` is the page URL without hash. */
export function shareLinkUrl(p: LatLng, resolution: number, baseUrl: string): string {
  return `${baseUrl}#/?lat=${p.lat.toFixed(6)}&lng=${p.lng.toFixed(6)}&res=${resolution}`;
}

export function shareText(p: LatLng, cellId: string | null, appUrl: string, heading = "My location"): string {
  const mapsUrl = `https://www.google.com/maps?q=${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
  return `${heading}: ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}${cellId ? ` (H3 ${cellId})` : ""}\nMap: ${mapsUrl}\nHexagon view: ${appUrl}`;
}

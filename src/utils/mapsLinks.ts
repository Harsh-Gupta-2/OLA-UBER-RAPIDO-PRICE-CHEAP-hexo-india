import type { LatLng } from "../types/location";

export function googleMapsWalkUrl(dest: LatLng, origin?: LatLng | null): string {
  const o = origin ? `&origin=${origin.lat},${origin.lng}` : "";
  return `https://www.google.com/maps/dir/?api=1${o}&destination=${dest.lat},${dest.lng}&travelmode=walking`;
}

export function osmUrl(dest: LatLng): string {
  return `https://www.openstreetmap.org/?mlat=${dest.lat}&mlon=${dest.lng}#map=18/${dest.lat}/${dest.lng}`;
}

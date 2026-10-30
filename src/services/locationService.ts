import type { GeoStatus, LatLng } from "../types/location";

export interface GeoResult {
  status: GeoStatus;
  position?: LatLng;
  message?: string;
}

export function getCurrentPosition(): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return resolve({ status: "unavailable", message: "Geolocation isn't supported by this browser. Enter coordinates manually." });
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ status: "success", position: { lat: p.coords.latitude, lng: p.coords.longitude } }),
      (e) => {
        if (e.code === e.PERMISSION_DENIED)
          resolve({ status: "denied", message: "Location permission was denied. You can still explore the map or type coordinates." });
        else if (e.code === e.TIMEOUT)
          resolve({ status: "timeout", message: "Getting your location timed out. Try again or enter coordinates." });
        else resolve({ status: "unavailable", message: "Your location is unavailable right now. Try again or enter coordinates." });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  });
}

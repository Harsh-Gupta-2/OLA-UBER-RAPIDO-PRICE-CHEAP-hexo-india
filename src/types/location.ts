export interface LatLng {
  lat: number;
  lng: number;
}
export type GeoStatus = "idle" | "loading" | "success" | "denied" | "unavailable" | "timeout" | "error";
export type Units = "metric" | "imperial";

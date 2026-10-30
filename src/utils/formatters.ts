import type { Units } from "../types/location";

export function formatDistance(m: number, units: Units = "metric"): string {
  if (units === "imperial") {
    const ft = m * 3.28084;
    return ft < 1000 ? `${Math.round(ft)} ft` : `${(m / 1609.344).toFixed(2)} mi`;
  }
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
}

export function formatArea(km2: number, units: Units = "metric"): string {
  if (units === "imperial") {
    const acres = km2 * 247.105;
    return acres < 640 ? `${acres.toFixed(1)} acres` : `${(km2 * 0.386102).toFixed(2)} mi²`;
  }
  return km2 < 1 ? `${Math.round(km2 * 1e6).toLocaleString("en-IN")} m²` : `${km2.toFixed(2)} km²`;
}

export function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatCoord(n: number): string {
  return n.toFixed(6);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "Unknown" : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

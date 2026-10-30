import { isValidCell } from "h3-js";

export const INDIA_BOUNDS = { minLat: 6, maxLat: 38, minLng: 68, maxLng: 98 };

export interface CoordCheck {
  valid: boolean;
  error?: string;
  warning?: string;
}

export function validateLatLng(lat: number, lng: number): CoordCheck {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { valid: false, error: "Enter numeric latitude and longitude." };
  if (lat < -90 || lat > 90) return { valid: false, error: "Latitude must be between -90 and 90." };
  if (lng < -180 || lng > 180) return { valid: false, error: "Longitude must be between -180 and 180." };
  if (!isInIndia(lat, lng)) return { valid: true, warning: "This point is outside India's approximate bounding box." };
  return { valid: true };
}

export function isInIndia(lat: number, lng: number): boolean {
  const b = INDIA_BOUNDS;
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng;
}

export function isValidH3Id(id: string): boolean {
  try {
    return typeof id === "string" && isValidCell(id.trim());
  } catch {
    return false;
  }
}

/** Parses "25.44, 78.56" into numbers; returns null if not two numbers. */
export function parseLatLng(text: string): { lat: number; lng: number } | null {
  const m = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)$/);
  return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null;
}

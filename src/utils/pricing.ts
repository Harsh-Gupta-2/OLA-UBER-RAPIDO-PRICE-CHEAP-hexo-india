import { latLngToCell } from "h3-js";
import type { CellPriceSummary, PriceBand, PriceFilter, PriceRecord } from "../types/price";

export const OUTDATED_DAYS = 30;
export const RECORD_RESOLUTION = 9; // resolution at which PriceRecord.h3CellId is stored

export const productIdFromName = (name: string): string =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function isOutdated(r: PriceRecord, now = Date.now()): boolean {
  const t = Date.parse(r.updatedAt);
  return Number.isNaN(t) || now - t > OUTDATED_DAYS * 86_400_000;
}

/** A record has a usable price only if it is a finite number > 0 (missing is never treated as 0). */
export const hasValidPrice = (r: PriceRecord): boolean => Number.isFinite(r.price) && r.price > 0;

export function recordsForProduct(records: PriceRecord[], productId: string): PriceRecord[] {
  return records.filter((r) => r.productId === productId && hasValidPrice(r));
}

export function listProducts(records: PriceRecord[]): { id: string; name: string }[] {
  const m = new Map<string, string>();
  for (const r of records) if (!m.has(r.productId)) m.set(r.productId, r.productName);
  return [...m].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
}

/** Per-cell summary at `resolution`, using the lowest price among that cell's records (same product only). */
export function summarizeCells(records: PriceRecord[], productId: string, resolution: number): Map<string, CellPriceSummary> {
  const out = new Map<string, CellPriceSummary>();
  for (const r of recordsForProduct(records, productId)) {
    const cellId = latLngToCell(r.latitude, r.longitude, resolution);
    const cur = out.get(cellId);
    if (!cur) {
      out.set(cellId, { cellId, minPrice: r.price, cheapestRecord: r, hasVerified: r.verified, recordCount: 1 });
    } else {
      cur.recordCount++;
      cur.hasVerified ||= r.verified;
      if (r.price < cur.minPrice) {
        cur.minPrice = r.price;
        cur.cheapestRecord = r;
      }
    }
  }
  return out;
}

export interface CheapestResult {
  record: PriceRecord;
  verified: boolean; // false => label as "Cheapest (unverified)"
}

/** Cheapest verified record; falls back to cheapest unverified (flagged). Null if no prices. */
export function findCheapest(records: PriceRecord[], productId: string): CheapestResult | null {
  const valid = recordsForProduct(records, productId);
  const pick = (list: PriceRecord[]) => list.reduce<PriceRecord | null>((m, r) => (!m || r.price < m.price ? r : m), null);
  const v = pick(valid.filter((r) => r.verified));
  if (v) return { record: v, verified: true };
  const u = pick(valid);
  return u ? { record: u, verified: false } : null;
}

/** Min-max bands over cell prices. Green ("cheapest") is reserved for a verified lowest price. */
export function priceBand(price: number | null, min: number, max: number, verifiedAtMin: boolean): PriceBand {
  if (price === null || !Number.isFinite(price) || price <= 0) return "none";
  if (price === min) return verifiedAtMin ? "cheapest" : "low";
  if (max === min) return "average";
  const t = (price - min) / (max - min);
  if (price === max) return "highest";
  if (t < 0.34) return "low";
  if (t < 0.67) return "average";
  return "high";
}

export const BAND_COLORS: Record<PriceBand, string> = {
  cheapest: "#16a34a",
  low: "#86efac",
  average: "#facc15",
  high: "#fb923c",
  highest: "#dc2626",
  none: "#94a3b8",
};

export const BAND_LABELS: Record<PriceBand, string> = {
  cheapest: "Cheapest (verified)",
  low: "Relatively inexpensive",
  average: "Average",
  high: "Relatively expensive",
  highest: "Most expensive",
  none: "No price info",
};

export const BAND_ICONS: Record<PriceBand, string> = { cheapest: "★", low: "▼", average: "●", high: "▲", highest: "⬆", none: "–" };

export interface CellBands {
  bands: Map<string, PriceBand>;
  min: number;
  max: number;
}

export function computeBands(summaries: Map<string, CellPriceSummary>): CellBands {
  const list = [...summaries.values()];
  const bands = new Map<string, PriceBand>();
  if (!list.length) return { bands, min: 0, max: 0 };
  const min = Math.min(...list.map((s) => s.minPrice));
  const max = Math.max(...list.map((s) => s.minPrice));
  for (const s of list) {
    bands.set(s.cellId, priceBand(s.minPrice, min, max, s.cheapestRecord.verified));
  }
  return { bands, min, max };
}

export function passesFilter(filter: PriceFilter, band: PriceBand): boolean {
  switch (filter) {
    case "all":
      return true;
    case "with":
      return band !== "none";
    case "cheapest":
      return band === "cheapest" || band === "low";
    case "without":
      return band === "none";
  }
}

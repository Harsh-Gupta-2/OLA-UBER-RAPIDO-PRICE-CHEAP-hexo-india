export interface PriceRecord {
  id: string;
  h3CellId: string;
  productId: string;
  productName: string;
  providerName: string;
  price: number;
  currency: "INR";
  latitude: number;
  longitude: number;
  updatedAt: string; // ISO
  verified: boolean;
  isSample?: boolean;
}

export type PriceBand = "cheapest" | "low" | "average" | "high" | "highest" | "none";
export type PriceFilter = "all" | "with" | "cheapest" | "without";

export interface CellPriceSummary {
  cellId: string;
  minPrice: number;
  cheapestRecord: PriceRecord;
  hasVerified: boolean;
  recordCount: number;
}

/** Swap this implementation for Supabase/Firebase later without touching UI. */
export interface PriceRepository {
  list(): Promise<PriceRecord[]>;
  add(record: PriceRecord): Promise<void>;
  remove(id: string): Promise<void>;
  clearSamples(): Promise<void>;
  /** Seed sample data once (local implementation only). */
  seedSamples?(records: PriceRecord[]): Promise<void>;
}

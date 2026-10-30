import { describe, expect, it } from "vitest";
import type { PriceRecord } from "../types/price";
import { computeBands, findCheapest, isOutdated, passesFilter, priceBand, recordsForProduct, summarizeCells } from "../utils/pricing";
import { buildSampleRecords } from "../data/samplePrices";

const mk = (o: Partial<PriceRecord>): PriceRecord => ({
  id: Math.random().toString(), h3CellId: "x", productId: "a", productName: "A", providerName: "P",
  price: 10, currency: "INR", latitude: 25.4484, longitude: 78.5685, updatedAt: new Date().toISOString(), verified: true, ...o,
});

describe("pricing", () => {
  it("compares only the same product", () => {
    const recs = [mk({ productId: "a", price: 50 }), mk({ productId: "b", price: 5 })];
    expect(findCheapest(recs, "a")!.record.price).toBe(50);
    expect(recordsForProduct(recs, "b")).toHaveLength(1);
  });
  it("missing/zero prices are never used", () => {
    const recs = [mk({ price: 0 }), mk({ price: NaN })];
    expect(findCheapest(recs, "a")).toBeNull();
    expect(summarizeCells(recs, "a", 9).size).toBe(0);
    expect(priceBand(null, 1, 2, true)).toBe("none");
    expect(priceBand(0, 1, 2, true)).toBe("none");
  });
  it("cheapest requires verified; unverified-only flagged", () => {
    const only = [mk({ price: 5, verified: false }), mk({ price: 9, verified: false })];
    expect(findCheapest(only, "a")).toMatchObject({ verified: false });
    const mixed = [...only, mk({ price: 7, verified: true })];
    expect(findCheapest(mixed, "a")).toMatchObject({ verified: true });
    expect(findCheapest(mixed, "a")!.record.price).toBe(7);
  });
  it("outdated after 30 days", () => {
    const now = Date.now();
    expect(isOutdated(mk({ updatedAt: new Date(now - 31 * 86400000).toISOString() }), now)).toBe(true);
    expect(isOutdated(mk({ updatedAt: new Date(now - 29 * 86400000).toISOString() }), now)).toBe(false);
  });
  it("colour bands", () => {
    expect(priceBand(10, 10, 100, true)).toBe("cheapest");
    expect(priceBand(10, 10, 100, false)).toBe("low");
    expect(priceBand(100, 10, 100, true)).toBe("highest");
    expect(priceBand(55, 10, 100, true)).toBe("average");
    expect(priceBand(80, 10, 100, true)).toBe("high");
    expect(priceBand(20, 10, 100, true)).toBe("low");
  });
  it("cell uses lowest price and filters work", () => {
    const recs = [mk({ price: 9 }), mk({ price: 5, latitude: 25.5, verified: true }), mk({ price: 20, latitude: 25.6 })];
    const s = summarizeCells(recs, "a", 9);
    expect(s.size).toBe(3);
    const { bands } = computeBands(s);
    expect([...bands.values()]).toContain("cheapest");
    expect([...bands.values()]).toContain("highest");
    expect(passesFilter("without", "none")).toBe(true);
    expect(passesFilter("with", "none")).toBe(false);
    expect(passesFilter("cheapest", "high")).toBe(false);
  });
  it("sample data flagged", () => {
    expect(buildSampleRecords().every((r) => r.isSample)).toBe(true);
  });
});

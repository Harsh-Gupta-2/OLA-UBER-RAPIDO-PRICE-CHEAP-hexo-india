import { latLngToCell } from "h3-js";
import type { PriceRecord } from "../types/price";
import { RECORD_RESOLUTION, productIdFromName } from "../utils/pricing";

/** Sample data only. Every price here is invented for demonstration and is NOT a real-world price. */
export const JHANSI = { lat: 25.4484, lng: 78.5685 };

const PRODUCTS = ["Sample Product A (1 kg)", "Sample Product B (1 L)"];

// [provider, productIdx, dLat, dLng, price, verified, ageDays]
const ROWS: [string, number, number, number, number, boolean, number][] = [
  ["Sample Provider 1", 0, 0.002, 0.003, 52, true, 2],
  ["Sample Provider 2", 0, -0.006, 0.008, 48, true, 5],
  ["Sample Provider 3", 0, 0.012, -0.004, 61, false, 1],
  ["Sample Provider 4", 0, -0.015, -0.012, 57, true, 45],
  ["Sample Provider 5", 0, 0.02, 0.018, 66, true, 3],
  ["Sample Provider 6", 0, 0.004, -0.02, 44, false, 8],
  ["Sample Provider 7", 0, -0.003, 0.0, 55, true, 10],
  ["Sample Provider 2", 1, -0.006, 0.008, 90, true, 4],
  ["Sample Provider 3", 1, 0.012, -0.004, 84, true, 6],
  ["Sample Provider 5", 1, 0.02, 0.018, 99, false, 2],
  ["Sample Provider 1", 1, 0.002, 0.003, 93, true, 1],
];

export function buildSampleRecords(now = Date.now()): PriceRecord[] {
  return ROWS.map(([provider, p, dLat, dLng, price, verified, age], i) => {
    const latitude = +(JHANSI.lat + dLat).toFixed(6);
    const longitude = +(JHANSI.lng + dLng).toFixed(6);
    return {
      id: `sample-${i + 1}`,
      h3CellId: latLngToCell(latitude, longitude, RECORD_RESOLUTION),
      productId: productIdFromName(PRODUCTS[p]),
      productName: PRODUCTS[p],
      providerName: provider,
      price,
      currency: "INR",
      latitude,
      longitude,
      updatedAt: new Date(now - age * 86_400_000).toISOString(),
      verified,
      isSample: true,
    };
  });
}

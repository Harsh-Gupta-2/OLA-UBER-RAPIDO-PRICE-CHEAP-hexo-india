import { describe, expect, it } from "vitest";
import { getPentagons, latLngToCell } from "h3-js";
import {
  cellBoundary, cellCenter, cellsInBounds, getNeighbours, latLngToCellId, neighbourIds, safeGridDistance,
} from "../services/h3Service";
import { isValidH3Id, validateLatLng } from "../utils/validation";
import { bearing, compassDirection, haversine } from "../utils/distance";
import { googleMapsWalkUrl } from "../utils/mapsLinks";

const JH = { lat: 25.4484, lng: 78.5685 };

describe("h3Service", () => {
  it("round-trips centre into same cell", () => {
    for (const res of [7, 8, 9, 10]) {
      const id = latLngToCellId(JH.lat, JH.lng, res);
      const c = cellCenter(id);
      expect(latLngToCellId(c.lat, c.lng, res)).toBe(id);
    }
  });
  it("boundary has 6 vertices, pentagon has 5", () => {
    expect(cellBoundary(latLngToCellId(JH.lat, JH.lng, 8))).toHaveLength(6);
    expect(cellBoundary(getPentagons(8)[0])).toHaveLength(5);
  });
  it("gridDisk size = 1+3k(k+1)", () => {
    const id = latLngToCellId(JH.lat, JH.lng, 9);
    for (let k = 0; k <= 5; k++) expect(neighbourIds(id, k)).toHaveLength(1 + 3 * k * (k + 1));
  });
  it("gridDistance neighbours = 1, errors return null", () => {
    const id = latLngToCellId(JH.lat, JH.lng, 9);
    const n = neighbourIds(id, 1).find((x) => x !== id)!;
    expect(safeGridDistance(id, n)).toBe(1);
    expect(safeGridDistance(id, latLngToCell(0, 0, 9))).toBeNull();
    expect(safeGridDistance("bad", id)).toBeNull();
  });
  it("neighbours sorted by distance with directions", () => {
    const id = latLngToCellId(JH.lat, JH.lng, 9);
    const list = getNeighbours(id, 2, JH);
    expect(list).toHaveLength(18);
    for (let i = 1; i < list.length; i++) expect(list[i].distanceM).toBeGreaterThanOrEqual(list[i - 1].distanceM);
  });
  it("viewport cells capped", () => {
    const small = { south: 25.44, west: 78.56, north: 25.46, east: 78.58 };
    expect(cellsInBounds(small, 9)!.length).toBeGreaterThan(0);
    expect(cellsInBounds({ south: 8, west: 68, north: 37, east: 97 }, 9)).toBeNull();
  });
});

describe("validation", () => {
  it("validates coordinates", () => {
    expect(validateLatLng(91, 0).valid).toBe(false);
    expect(validateLatLng(0, 181).valid).toBe(false);
    expect(validateLatLng(NaN, 0).valid).toBe(false);
    expect(validateLatLng(25, 78)).toEqual({ valid: true });
    expect(validateLatLng(51, 0).warning).toBeTruthy();
  });
  it("validates H3 ids", () => {
    expect(isValidH3Id(latLngToCellId(JH.lat, JH.lng, 9))).toBe(true);
    expect(isValidH3Id("nope")).toBe(false);
  });
});

describe("distance", () => {
  it("haversine ~ known distance", () => {
    const d = haversine({ lat: 28.6139, lng: 77.209 }, { lat: 19.076, lng: 72.8777 });
    expect(d / 1000).toBeGreaterThan(1130);
    expect(d / 1000).toBeLessThan(1160);
    expect(haversine(JH, JH)).toBe(0);
  });
  it("compass directions", () => {
    expect(compassDirection(0)).toBe("N");
    expect(compassDirection(90)).toBe("E");
    expect(compassDirection(225)).toBe("SW");
    expect(compassDirection(359)).toBe("N");
    expect(compassDirection(bearing(JH, { lat: JH.lat + 0.01, lng: JH.lng }))).toBe("N");
    expect(compassDirection(bearing(JH, { lat: JH.lat, lng: JH.lng + 0.01 }))).toBe("E");
  });
});

describe("maps url", () => {
  it("with and without origin", () => {
    const dest = { lat: 25.1, lng: 78.2 };
    expect(googleMapsWalkUrl(dest, { lat: 25, lng: 78 })).toBe(
      "https://www.google.com/maps/dir/?api=1&origin=25,78&destination=25.1,78.2&travelmode=walking",
    );
    expect(googleMapsWalkUrl(dest)).toBe("https://www.google.com/maps/dir/?api=1&destination=25.1,78.2&travelmode=walking");
  });
});

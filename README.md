# India Hexagon Explorer

**Explore every hexagon. Discover better prices.**

A client-side React + TypeScript app that divides India into [Uber H3](https://h3geo.org) hexagons. Share (or type) your location, see your hexagon, explore neighbours, compare prices for the same product across hexagons, find the cheapest, and open walking directions in an external maps app. No backend, no API keys.

> Hexagons are an indexing grid. They are **not** state, district or city boundaries.

## Features (built)
- Leaflet + OpenStreetMap map of India; hexagons rendered **only for the viewport** (capped at 1500, otherwise "Zoom in to see hexagons"), debounced at 250 ms, canvas-rendered.
- Geolocation with friendly errors, manual lat/lng validation (warns outside India's rough bounding box), search by `lat, lng` or H3 ID.
- Resolution presets 7–10 with computed average areas (approximate; real cells vary) and a zoom-based suggestion you can override.
- Neighbour explorer (1–5 rings) with ring distance, straight-line distance, compass direction and per-cell "Walk to this hexagon".
- Hexagon panel: ID, resolution, centre, boundary, pentagon flag, price records, copy buttons with fallback.
- Prices: product filter, manual entry (saved in `localStorage`), same-product comparison, Verified / Unverified / Sample / Outdated (>30 days) badges, price colouring + legend + map filter, distance sorting.
- Rules: missing price is never 0; a cell is "Cheapest" only with a verified record, otherwise "Cheapest (unverified)".
- Walking directions: Google Maps link (omits `origin` when location is unknown), OpenStreetMap link, copy coordinates.

- Share: "Share my location" / "Share this hexagon" opens the phone share sheet (WhatsApp, Messages, etc.) or copies text with a Google Maps link and an app link (`#/?lat=..&lng=..&res=..`) that reopens the map at that spot. It is a one-time snapshot, nothing is uploaded.

## Sample data
~11 demo records near Jhansi (25.4484, 78.5685) are seeded on first run, flagged `isSample` and labelled "Sample" in the UI. **Prices are invented, not real.** Use "Clear sample data" in the banner (or Settings to reload).

## Future features (not built)
- Shared prices, auth, verification, reporting, duplicate prevention (Supabase/Firebase). Swap `localPriceRepository` (`src/services/priceService.ts`) for another `PriceRepository` implementation; UI is unaffected. The "verified" checkbox on the form is only a local flag.
- Live tracking / live location sharing (needs a backend and privacy controls).
- In-app turn-by-turn routing (OSRM / OpenRouteService).
- Place-name search (e.g. Nominatim).

## Develop
```bash
npm install
npm run dev
npm run typecheck && npm test && npm run build
```

## Deploy to GitHub Pages
1. In `vite.config.ts` set `REPO_NAME` to your repository name (currently `OLA-UBER-RAPIDO-PRICE-CHEAP-hexo-india`); the `base` is `/<REPO_NAME>/`.
2. One-time: repo **Settings → Pages → Source = "GitHub Actions"**.
3. Push to `main`; `.github/workflows/deploy.yml` runs typecheck, tests, build and deploys. HashRouter avoids 404s on direct routes. Geolocation works because Pages is HTTPS.

## Known limitations
- Hexagon centres may not be walkable points; directions target the centre coordinates.
- `gridDistance` can fail across pentagon distortion; it is shown as "ring ?" in that case.
- Prices are per-device (localStorage); clearing browser data deletes them.
- Map tiles use the public OSM tile server: fine for light use, subject to its usage policy.
- Single JS bundle ~580 kB (≈185 kB gzipped); not code-split.
- Accessibility reviewed by hand only; no automated audit.

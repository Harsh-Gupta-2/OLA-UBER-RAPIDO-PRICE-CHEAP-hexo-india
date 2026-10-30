import { useCallback, useEffect, useMemo, useState } from "react";
import { getResolution, latLngToCell } from "h3-js";
import HexMap, { type FlyRequest } from "../components/Map/HexMap";
import Legend from "../components/Map/Legend";
import Header from "../components/Layout/Header";
import SidePanel, { useSnap } from "../components/Layout/SidePanel";
import SettingsDialog from "../components/Layout/SettingsDialog";
import ResolutionSelector from "../components/Hexagon/ResolutionSelector";
import HexInfoPanel from "../components/Hexagon/HexInfoPanel";
import NeighbourList from "../components/Hexagon/NeighbourList";
import LocationInput from "../components/Location/LocationInput";
import BetterNearby from "../components/Pricing/BetterNearby";
import SampleBanner from "../components/Pricing/SampleBanner";
import PriceList from "../components/Pricing/PriceList";
import AddPriceForm from "../components/Pricing/AddPriceForm";
import { useGeolocation } from "../hooks/useGeolocation";
import { usePriceComparison, usePrices, useProducts } from "../hooks/usePriceComparison";
import { cellCenter, getHexInfo, getNeighbours, neighbourIds } from "../services/h3Service";
import { zoomForResolution } from "../services/mapService";
import { clearAllLocalData } from "../services/priceService";
import type { LatLng, Units } from "../types/location";
import type { PriceFilter, PriceRecord } from "../types/price";
import { formatINR } from "../utils/formatters";
import { isValidH3Id, parseLatLng, validateLatLng } from "../utils/validation";

type Tab = "hex" | "neighbours" | "prices" | "location";
const TABS: [Tab, string][] = [["hex", "Hexagon"], ["neighbours", "Neighbours"], ["prices", "Prices"], ["location", "Location"]];
const SETTINGS_KEY = "ihx.settings.v1";

function loadSettings(): { units: Units; defaultRes: number } {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
    return { units: s.units === "imperial" ? "imperial" : "metric", defaultRes: [7, 8, 9, 10].includes(s.defaultRes) ? s.defaultRes : 9 };
  } catch {
    return { units: "metric", defaultRes: 9 };
  }
}

export default function ExplorerPage() {
  const [settings, setSettings] = useState(loadSettings);
  const [resolution, setResolution] = useState(settings.defaultRes);
  const [suggested, setSuggested] = useState(settings.defaultRes);
  const [focus, setFocus] = useState<LatLng | null>(null);
  const [userLoc, setUserLoc] = useState<LatLng | null>(null);
  const [rings, setRings] = useState(2);
  const [tab, setTab] = useState<Tab>("hex");
  const [filter, setFilter] = useState<PriceFilter>("all");
  const [productId, setProductId] = useState("");
  const [fly, setFly] = useState<FlyRequest | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [snap, setSnap] = useSnap("half");

  const geo = useGeolocation();
  const prices = usePrices();
  const products = useProducts(prices.records);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  useEffect(() => {
    if (!products.some((p) => p.id === productId)) setProductId(products[0]?.id ?? "");
  }, [products, productId]);

  const cmp = usePriceComparison(prices.records, productId, resolution);

  const selectedId = focus ? latLngToCell(focus.lat, focus.lng, resolution) : null;
  const userCellId = userLoc ? latLngToCell(userLoc.lat, userLoc.lng, resolution) : null;
  const info = useMemo(() => (selectedId ? getHexInfo(selectedId) : null), [selectedId]);
  const ringIds = useMemo(() => (selectedId ? new Set(neighbourIds(selectedId, rings)) : new Set<string>()), [selectedId, rings]);
  const neighbours = useMemo(() => (selectedId ? getNeighbours(selectedId, rings, userLoc) : []), [selectedId, rings, userLoc]);
  const cellRecords = useMemo(
    () => (selectedId ? cmp.productRecords.filter((r) => latLngToCell(r.latitude, r.longitude, resolution) === selectedId) : []),
    [cmp.productRecords, selectedId, resolution],
  );

  const goTo = useCallback((p: LatLng, res = resolution) => {
    setFocus(p);
    setFly({ center: p, zoom: zoomForResolution(res), nonce: Date.now() });
    setSnap((s) => (s === "peek" ? "half" : s));
  }, [resolution, setSnap]);

  const onSelect = useCallback((id: string) => {
    setFocus(cellCenter(id));
    setSnap((s) => (s === "peek" ? "half" : s));
    setTab((t) => (t === "location" ? "hex" : t));
  }, [setSnap]);

  const locate = async () => {
    const p = await geo.request();
    if (p) {
      setUserLoc(p);
      goTo(p);
      setTab("hex");
      setNotice(validateLatLng(p.lat, p.lng).warning ?? null);
    }
  };

  const manual = (p: LatLng) => {
    setUserLoc(p);
    goTo(p);
    setTab("hex");
    setNotice(validateLatLng(p.lat, p.lng).warning ?? null);
  };

  const search = (q: string): string | null => {
    const ll = parseLatLng(q);
    if (ll) {
      const c = validateLatLng(ll.lat, ll.lng);
      if (!c.valid) return c.error!;
      setNotice(c.warning ?? null);
      goTo(ll);
      return null;
    }
    if (isValidH3Id(q)) {
      const id = q.trim();
      const res = getResolution(id);
      setResolution(res);
      goTo(cellCenter(id), res);
      setNotice(null);
      return null;
    }
    return "Enter “lat, lng” (e.g. 25.4484, 78.5685) or a valid H3 ID.";
  };

  const focusRecord = (r: PriceRecord) => {
    goTo({ lat: r.latitude, lng: r.longitude });
    setTab("hex");
  };

  const clearAll = async () => {
    clearAllLocalData();
    setSettings({ units: "metric", defaultRes: 9 });
    await prices.reload();
    setShowSettings(false);
  };

  const sampleCount = prices.records.filter((r) => r.isSample).length;
  const hasPrices = cmp.summaries.size > 0;

  return (
    <div className="flex h-full flex-col">
      <Header onSearch={search} onLocate={locate} locating={geo.status === "loading"} onSettings={() => setShowSettings(true)} />
      <SampleBanner count={sampleCount} onClear={prices.clearSamples} />
      {(notice || geo.message) && (
        <div role="status" className="flex items-center justify-between gap-2 bg-slate-100 px-3 py-1 text-xs text-slate-800">
          <span>{notice ?? geo.message}</span>
          <button type="button" className="underline" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}
      <main className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <HexMap
            resolution={resolution}
            selectedId={selectedId}
            userCellId={userCellId}
            userLoc={userLoc}
            neighbourIds={ringIds}
            bands={cmp.bands}
            filter={filter}
            fly={fly}
            onSelect={onSelect}
            onZoomSuggest={setSuggested}
          />
          <Legend min={cmp.min} max={cmp.max} hasPrices={hasPrices} />
          {snap !== "full" && (
            <button
              type="button"
              onClick={locate}
              disabled={geo.status === "loading"}
              aria-label="Use my location"
              className={`btn-primary fixed right-3 z-[1050] !h-14 !w-14 !rounded-full text-xl shadow-lg md:hidden ${snap === "peek" ? "bottom-28" : "bottom-[calc(50vh+1rem)]"}`}
            >
              {geo.status === "loading" ? "…" : "📍"}
            </button>
          )}
        </div>
        <SidePanel snap={snap} setSnap={setSnap}>
          <div role="tablist" aria-label="Panels" className="sticky top-0 z-10 -mx-4 flex gap-1 overflow-x-auto bg-white px-4 pb-2">
            {TABS.map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`btn shrink-0 ${tab === k ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-2" role="tabpanel">
            {tab === "hex" && (
              <>
                {userLoc && userCellId && productId && (
                  <BetterNearby userLoc={userLoc} userCellId={userCellId} summaries={cmp.summaries} units={settings.units} />
                )}
                <ResolutionSelector resolution={resolution} suggested={suggested} units={settings.units} onChange={setResolution} />
                {info ? (
                  <HexInfoPanel info={info} neighbourCount={neighbours.length} isUserCell={selectedId === userCellId} userLoc={userLoc} records={cellRecords} units={settings.units} />
                ) : (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    Tap any hexagon on the map, search coordinates, or use your location. You can explore without sharing location.
                  </p>
                )}
              </>
            )}

            {tab === "neighbours" &&
              (selectedId ? (
                <NeighbourList neighbours={neighbours} rings={rings} setRings={setRings} userLoc={userLoc} hasUser={!!userLoc} units={settings.units} onSelect={onSelect} />
              ) : (
                <p className="text-sm text-slate-600">Select a hexagon first to see its neighbours.</p>
              ))}

            {tab === "prices" && (
              <>
                {prices.loading ? (
                  <p className="text-sm">Loading prices…</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="product" className="text-xs font-medium">Product</label>
                        <select id="product" className="input" value={productId} onChange={(e) => setProductId(e.target.value)} disabled={!products.length}>
                          {products.length === 0 && <option value="">No products</option>}
                          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="filter" className="text-xs font-medium">Map filter</label>
                        <select id="filter" className="input" value={filter} onChange={(e) => setFilter(e.target.value as PriceFilter)}>
                          <option value="all">All</option>
                          <option value="with">With price</option>
                          <option value="cheapest">Cheapest</option>
                          <option value="without">Without price</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">Only prices for the same product are compared. Hexagon colour = lowest price in that hexagon.</p>
                    {cmp.cheapest ? (
                      <div className="rounded-lg border border-green-500 bg-green-50 p-2 text-sm">
                        <div className="font-semibold">{cmp.cheapest.verified ? "★ Cheapest (verified)" : "★ Cheapest (unverified)"}: {formatINR(cmp.cheapest.record.price)}</div>
                        <div>{cmp.cheapest.record.providerName}</div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">No prices for this product yet.</p>
                    )}
                    {selectedId && <p className="text-xs">Selected hexagon has {cellRecords.length} record(s) for this product{cellRecords.length === 0 ? " (no price info)" : ""}.</p>}
                    <PriceList title="All prices" records={cmp.productRecords} cheapest={cmp.cheapest} userLoc={userLoc} units={settings.units} onFocus={focusRecord} onRemove={prices.remove} />
                    <AddPriceForm products={products} defaultProduct={productId} suggest={info?.center ?? null} onAdd={prices.add} />
                  </>
                )}
              </>
            )}

            {tab === "location" && (
              <>
                <button type="button" className="btn-primary w-full" onClick={locate} disabled={geo.status === "loading"}>
                  {geo.status === "loading" ? "Locating…" : "📍 Use My Location"}
                </button>
                {geo.message && <p role="alert" className="text-sm text-red-700">{geo.message}</p>}
                {userLoc && <p className="text-xs">Your position: {userLoc.lat.toFixed(6)}, {userLoc.lng.toFixed(6)}. Stays in your browser; nothing is uploaded.</p>}
                <LocationInput onSubmit={manual} />
              </>
            )}
          </div>
        </SidePanel>
      </main>

      {showSettings && (
        <SettingsDialog
          units={settings.units}
          defaultRes={settings.defaultRes}
          sampleCount={sampleCount}
          onUnits={(units) => setSettings((s) => ({ ...s, units }))}
          onDefaultRes={(defaultRes) => { setSettings((s) => ({ ...s, defaultRes })); setResolution(defaultRes); }}
          onLoadSamples={prices.loadSamples}
          onClearAll={clearAll}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { latLngToCell } from "h3-js";
import type { LatLng } from "../../types/location";
import type { PriceRecord } from "../../types/price";
import { RECORD_RESOLUTION, productIdFromName } from "../../utils/pricing";
import { validateLatLng } from "../../utils/validation";

interface Props {
  products: { id: string; name: string }[];
  defaultProduct: string;
  /** Suggested provider coordinates (e.g. selected hexagon centre). The user's location is never used implicitly. */
  suggest: LatLng | null;
  onAdd: (r: PriceRecord) => Promise<void>;
}

export default function AddPriceForm({ products, defaultProduct, suggest, onAdd }: Props) {
  const [product, setProduct] = useState("");
  const [provider, setProvider] = useState("");
  const [price, setPrice] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [verified, setVerified] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [ok, setOk] = useState(false);

  const productName = product.trim() || products.find((p) => p.id === defaultProduct)?.name || "";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    const p = Number(price);
    if (!productName) errs.push("Product is required.");
    if (!provider.trim()) errs.push("Provider name is required.");
    if (price.trim() === "" || !Number.isFinite(p) || p <= 0) errs.push("Price must be a number greater than 0.");
    const la = lat.trim() === "" ? NaN : Number(lat);
    const ln = lng.trim() === "" ? NaN : Number(lng);
    const c = validateLatLng(la, ln);
    if (!c.valid) errs.push(`Provider location: ${c.error}`);
    setErrors(errs);
    setOk(false);
    if (errs.length) return;
    await onAdd({
      id: crypto.randomUUID?.() ?? `u-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      h3CellId: latLngToCell(la, ln, RECORD_RESOLUTION), // derived from the provider's coordinates
      productId: productIdFromName(productName),
      productName,
      providerName: provider.trim(),
      price: p,
      currency: "INR",
      latitude: la,
      longitude: ln,
      updatedAt: new Date().toISOString(),
      verified, // local-only flag; real verification is a future backend feature
    });
    setOk(true);
    setPrice("");
  };

  return (
    <form onSubmit={submit} className="space-y-2" aria-label="Add price">
      <h3 className="text-sm font-semibold">Add a price (saved on this device only)</h3>
      <div>
        <label htmlFor="ap-product" className="text-xs font-medium">Product</label>
        <input id="ap-product" className="input" list="ap-products" value={product} onChange={(e) => setProduct(e.target.value)} placeholder={productName || "Product name"} />
        <datalist id="ap-products">{products.map((p) => <option key={p.id} value={p.name} />)}</datalist>
      </div>
      <div>
        <label htmlFor="ap-provider" className="text-xs font-medium">Provider name</label>
        <input id="ap-provider" className="input" value={provider} onChange={(e) => setProvider(e.target.value)} />
      </div>
      <div>
        <label htmlFor="ap-price" className="text-xs font-medium">Price (₹)</label>
        <input id="ap-price" className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="ap-lat" className="text-xs font-medium">Provider latitude</label>
          <input id="ap-lat" className="input" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
        </div>
        <div>
          <label htmlFor="ap-lng" className="text-xs font-medium">Provider longitude</label>
          <input id="ap-lng" className="input" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} />
        </div>
      </div>
      {suggest && (
        <button type="button" className="btn-ghost w-full" onClick={() => { setLat(suggest.lat.toFixed(6)); setLng(suggest.lng.toFixed(6)); }}>
          Use selected hexagon centre
        </button>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} style={{ minHeight: 0 }} />
        I verified this price myself (local flag; shared verification is a future feature)
      </label>
      <button type="submit" className="btn-primary w-full">Save price</button>
      {errors.length > 0 && <ul role="alert" className="list-disc pl-5 text-xs text-red-700">{errors.map((x) => <li key={x}>{x}</li>)}</ul>}
      {ok && <p role="status" className="text-xs text-green-700">Saved ✓</p>}
    </form>
  );
}

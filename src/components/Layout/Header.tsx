import { useState, type FormEvent } from "react";

interface Props {
  onSearch: (q: string) => string | null; // returns error message or null
  onLocate: () => void;
  locating: boolean;
  onSettings: () => void;
}

export default function Header({ onSearch, onLocate, locating, onSettings }: Props) {
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErr(onSearch(q));
  };
  return (
    <header className="z-[1100] flex flex-wrap items-center gap-2 border-b bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden><path d="M16 2l12 7v14l-12 7-12-7V9z" fill="#4f46e5" /></svg>
        <div className="leading-tight">
          <h1 className="text-base font-bold">India Hexagon Explorer</h1>
          <p className="hidden text-xs text-slate-500 sm:block">Explore every hexagon. Discover better prices.</p>
        </div>
      </div>
      <form onSubmit={submit} className="order-3 flex min-w-0 flex-1 gap-2 md:order-none md:max-w-md" role="search">
        <input
          aria-label="Search by latitude,longitude or H3 ID"
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="lat, lng  or  H3 ID"
        />
        <button type="submit" className="btn-ghost">Go</button>
      </form>
      <div className="ml-auto flex gap-2">
        <button type="button" className="btn-primary hidden md:inline-flex" onClick={onLocate} disabled={locating}>
          {locating ? "Locating…" : "📍 Use My Location"}
        </button>
        <button type="button" className="btn-ghost" onClick={onSettings} aria-label="Settings">⚙ <span className="hidden sm:inline">Settings</span></button>
      </div>
      {err && <p role="alert" className="w-full text-xs text-red-700">{err}</p>}
      <p className="order-last hidden w-full text-xs text-slate-500 lg:block">Place-name search is a future feature.</p>
    </header>
  );
}

import { useState, type ReactNode } from "react";

type Snap = "peek" | "half" | "full";
const HEIGHT: Record<Snap, string> = { peek: "h-24", half: "h-[50vh]", full: "h-[88vh]" };
const NEXT: Record<Snap, Snap> = { peek: "half", half: "full", full: "peek" };

/** Desktop: right column. Mobile: bottom sheet with peek / half / full states. */
export default function SidePanel({ children, snap, setSnap }: { children: ReactNode; snap: Snap; setSnap: (s: Snap) => void }) {
  return (
    <aside
      aria-label="Details"
      className={`z-[1000] flex flex-col bg-white shadow-2xl max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:rounded-t-2xl md:w-[400px] md:shrink-0 md:border-l ${HEIGHT[snap]} md:!h-full`}
    >
      <button
        type="button"
        className="flex w-full flex-col items-center py-2 md:hidden"
        onClick={() => setSnap(NEXT[snap])}
        aria-label={`Resize panel (currently ${snap})`}
      >
        <span className="h-1.5 w-12 rounded-full bg-slate-300" />
        <span className="text-xs text-slate-500">{snap === "full" ? "Collapse" : "Expand"}</span>
      </button>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{children}</div>
    </aside>
  );
}

export function useSnap(initial: Snap = "half") {
  return useState<Snap>(initial);
}
export type { Snap };

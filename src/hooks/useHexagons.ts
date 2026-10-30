import { useEffect, useState } from "react";
import { cellsInBounds, type ViewBounds } from "../services/h3Service";

export interface HexagonsState {
  cells: string[];
  tooMany: boolean;
}

/** Viewport cells for the given bounds/resolution. Bounds are expected to be pre-debounced. */
export function useHexagons(bounds: ViewBounds | null, resolution: number): HexagonsState {
  const [state, setState] = useState<HexagonsState>({ cells: [], tooMany: false });
  useEffect(() => {
    if (!bounds) return;
    const cells = cellsInBounds(bounds, resolution);
    setState(cells ? { cells, tooMany: false } : { cells: [], tooMany: true });
  }, [bounds, resolution]);
  return state;
}

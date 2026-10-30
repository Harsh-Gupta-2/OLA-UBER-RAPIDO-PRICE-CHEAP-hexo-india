import { useCallback, useEffect, useMemo, useState } from "react";
import { buildSampleRecords } from "../data/samplePrices";
import { localPriceRepository as repo, markSeeded, wasSeeded } from "../services/priceService";
import type { PriceRecord } from "../types/price";
import { computeBands, findCheapest, listProducts, recordsForProduct, summarizeCells } from "../utils/pricing";

export function usePrices() {
  const [records, setRecords] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => setRecords(await repo.list()), []);

  useEffect(() => {
    (async () => {
      if (!wasSeeded() && (await repo.list()).length === 0) await repo.seedSamples?.(buildSampleRecords());
      else markSeeded();
      await reload();
      setLoading(false);
    })();
  }, [reload]);

  const add = useCallback(async (r: PriceRecord) => { await repo.add(r); await reload(); }, [reload]);
  const remove = useCallback(async (id: string) => { await repo.remove(id); await reload(); }, [reload]);
  const clearSamples = useCallback(async () => { await repo.clearSamples(); await reload(); }, [reload]);
  const loadSamples = useCallback(async () => { await repo.seedSamples?.(buildSampleRecords()); await reload(); }, [reload]);

  return { records, loading, add, remove, clearSamples, loadSamples, reload };
}

export function usePriceComparison(records: PriceRecord[], productId: string, resolution: number) {
  return useMemo(() => {
    const summaries = summarizeCells(records, productId, resolution);
    const { bands, min, max } = computeBands(summaries);
    return {
      summaries,
      bands,
      min,
      max,
      cheapest: findCheapest(records, productId),
      productRecords: recordsForProduct(records, productId),
    };
  }, [records, productId, resolution]);
}

export const useProducts = (records: PriceRecord[]) => useMemo(() => listProducts(records), [records]);

import type { PriceRecord, PriceRepository } from "../types/price";

const KEY = "ihx.prices.v1";
const SEEDED = "ihx.seeded.v1";

function read(): PriceRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? (data as PriceRecord[]) : [];
  } catch {
    return [];
  }
}

function write(list: PriceRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable/full: data stays in memory only for this session */
  }
}

/** localStorage-backed repository. Replace with a Supabase/Firebase implementation of PriceRepository later. */
export const localPriceRepository: PriceRepository = {
  async list() {
    return read();
  },
  async add(record) {
    write([...read(), record]);
  },
  async remove(id) {
    write(read().filter((r) => r.id !== id));
  },
  async clearSamples() {
    write(read().filter((r) => !r.isSample));
  },
  async seedSamples(records) {
    write([...read().filter((r) => !r.isSample), ...records]);
    try {
      localStorage.setItem(SEEDED, "1");
    } catch {
      /* ignore */
    }
  },
};

export function wasSeeded(): boolean {
  try {
    return localStorage.getItem(SEEDED) === "1";
  } catch {
    return false;
  }
}

export function markSeeded(): void {
  try {
    localStorage.setItem(SEEDED, "1");
  } catch {
    /* ignore */
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(SEEDED);
    localStorage.removeItem("ihx.settings.v1");
  } catch {
    /* ignore */
  }
}

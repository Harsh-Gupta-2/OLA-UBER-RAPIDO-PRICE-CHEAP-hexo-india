import { useCallback, useState } from "react";
import { getCurrentPosition } from "../services/locationService";
import type { GeoStatus, LatLng } from "../types/location";

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const request = useCallback(async (): Promise<LatLng | null> => {
    setStatus("loading");
    setMessage(null);
    const r = await getCurrentPosition();
    setStatus(r.status);
    setMessage(r.message ?? null);
    return r.position ?? null;
  }, []);

  return { status, message, request };
}

"use client";

import { useEffect, useState } from "react";

// HIEMT-Aktion: Montag 02.11.2026 00:00 Uhr bis Freitag 06.11.2026 23:59:59 Uhr (deutsche Zeit, MEZ)
export const PROMO_START = new Date("2026-11-02T00:00:00+01:00").getTime();
export const PROMO_END = new Date("2026-11-06T23:59:59+01:00").getTime();

export const PROMO_STORAGE_KEY = "christina-hiemt-promo-2026-11";

export function isPromoActive(now: number = Date.now()): boolean {
  return now >= PROMO_START && now <= PROMO_END;
}

/**
 * Gibt erst nach dem Mount true zurueck (verhindert Hydration-Unterschiede)
 * und nur innerhalb des Aktionszeitraums.
 */
export function usePromoActive(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const check = () => setActive(isPromoActive());
    check();
    const interval = window.setInterval(check, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return active;
}

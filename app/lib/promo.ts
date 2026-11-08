"use client";

import { useEffect, useState } from "react";

// Massage-Aktion "3x 60 Minuten": Sonntag 08.11.2026 00:00 Uhr bis Samstag 14.11.2026 23:59:59 Uhr (deutsche Zeit, MEZ)
export const PROMO_START = new Date("2026-11-08T00:00:00+01:00").getTime();
export const PROMO_END = new Date("2026-11-14T23:59:59+01:00").getTime();

export const PROMO_STORAGE_KEY = "christina-massage-promo-2026-11-08";

export const PROMO_WHATSAPP_NUMBER = "491722664648";

export function isPromoActive(now: number = Date.now()): boolean {
  return now >= PROMO_START && now <= PROMO_END;
}

export function promoWhatsappHref(language: "de" | "hu"): string {
  const text =
    language === "de"
      ? "Hallo Christina, ich möchte die Aktion 3x 60 Minuten Massage für 150 € nutzen."
      : "Szia Christina, szeretném igénybe venni a 3x 60 perces masszázs akciót 150 €-ért.";
  return `https://wa.me/${PROMO_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
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

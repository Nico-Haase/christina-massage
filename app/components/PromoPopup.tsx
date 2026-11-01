"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PROMO_STORAGE_KEY, usePromoActive } from "../lib/promo";

type Language = "de" | "hu";

const COOKIE_CONSENT_KEY = "christina-cookie-consent";

const content = {
  de: {
    headline: "%% Rabatt auf HIEMT",
    price: "250 € statt 280 €",
    close: "Schließen",
  },
  hu: {
    headline: "%% Kedvezmény a HIEMT-re",
    price: "250 € 280 € helyett",
    close: "Bezárás",
  },
} as const;

export default function PromoPopup({ language }: { language: Language }) {
  const active = usePromoActive();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [consented, setConsented] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dismissedRef = useRef(false);
  const t = content[language];

  const dismiss = useCallback(() => {
    dismissedRef.current = true;
    setShown(false);
    try {
      sessionStorage.setItem(PROMO_STORAGE_KEY, "1");
    } catch {
      // Storage nicht verfuegbar: Popup erscheint dann beim naechsten Laden erneut
    }
    window.setTimeout(() => setOpen(false), 200);
  }, []);

  // Erst nach der Cookie-Entscheidung zeigen, damit sich beide Fenster nicht ueberlagern
  useEffect(() => {
    if (!active || consented) return;

    const id = window.setInterval(() => {
      let decided = true;
      try {
        decided = !!localStorage.getItem(COOKIE_CONSENT_KEY);
      } catch {
        decided = true;
      }
      if (decided) setConsented(true);
    }, 400);

    return () => window.clearInterval(id);
  }, [active, consented]);

  // Nach kurzer Verzoegerung einblenden, einmal pro Browser-Sitzung
  useEffect(() => {
    if (!active || !consented || dismissedRef.current) return;

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(PROMO_STORAGE_KEY) === "1";
    } catch {
      alreadySeen = false;
    }
    if (alreadySeen) return;

    const openTimer = window.setTimeout(() => {
      setOpen(true);
      window.requestAnimationFrame(() => setShown(true));
    }, 1000);

    return () => window.clearTimeout(openTimer);
  }, [active, consented]);

  // Sichtbar nur, solange die Aktion laeuft
  const visible = active && open;

  // Escape, Fokus und Scroll-Sperre
  useEffect(() => {
    if (!visible) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4 transition-opacity duration-300 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-[2rem] bg-[#f8f5ef] px-8 py-12 text-center shadow-2xl transition duration-300 ${
          shown ? "translate-y-0 scale-100" : "translate-y-3 scale-95"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label={t.close}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl leading-none text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          ×
        </button>

        <h2
          id="promo-title"
          className="text-4xl font-semibold leading-tight text-stone-900 md:text-5xl"
        >
          {t.headline}
        </h2>
        <p className="mt-5 text-2xl font-semibold text-[#405e3f] md:text-3xl">
          {t.price}
        </p>
      </div>
    </div>
  );
}

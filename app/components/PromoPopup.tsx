"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PROMO_STORAGE_KEY, usePromoActive } from "../lib/promo";

type Language = "de" | "hu";

const COOKIE_CONSENT_KEY = "christina-cookie-consent";
const WHATSAPP_NUMBER = "491722664648";

const content = {
  de: {
    eyebrow: "HIEMT Beckenboden-Training",
    headline: "RABATT",
    save: "Spare jetzt 30 €",
    period: "Nur diese Woche von 01.11.2026 bis 07.11.2026",
    instead: "Anstatt",
    only: "nur",
    pack: "10er-Karte",
    valid: "innerhalb von 6 Monaten einlösbar",
    button: "Jetzt beraten",
    close: "Schließen",
    whatsappText:
      "Hallo Christina, ich interessiere mich für die HIEMT 10er-Karte zum Aktionspreis von 250 €.",
  },
  hu: {
    eyebrow: "HIEMT medencefenék-tréning",
    headline: "KEDVEZMÉNY",
    save: "Spórolj most 30 €-t",
    period: "Csak ezen a héten: 2026.11.01. és 2026.11.07. között",
    instead: "280 € helyett",
    only: "csak",
    pack: "10 alkalmas bérlet",
    valid: "6 hónapon belül beváltható",
    button: "Tanácsadás kérése",
    close: "Bezárás",
    whatsappText:
      "Szia Christina, érdeklődni szeretnék a HIEMT 10 alkalmas bérletről (250 €).",
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

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t.whatsappText
  )}`;

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/65 p-4 transition-opacity duration-300 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        onClick={(e) => e.stopPropagation()}
        className={`relative my-auto w-full max-w-2xl rounded-[2rem] border-4 border-red-600 bg-white px-6 py-10 text-center shadow-2xl transition duration-300 md:px-12 md:py-14 ${
          shown ? "translate-y-0 scale-100" : "translate-y-3 scale-95"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label={t.close}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-2xl leading-none text-stone-700 shadow-sm transition hover:bg-stone-200"
        >
          ×
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-600 md:text-base">
          {t.eyebrow}
        </p>

        <h2
          id="promo-title"
          className="mt-3 text-6xl font-black uppercase leading-none tracking-tight text-red-600 sm:text-7xl md:text-8xl"
        >
          {t.headline}
        </h2>

        <p className="mt-6 text-3xl font-extrabold leading-tight text-red-600 md:text-5xl">
          {t.save}
        </p>

        <p className="mt-4 text-lg font-bold leading-snug text-stone-900 md:text-2xl">
          {t.period}
        </p>

        <div className="mt-6 rounded-[1.6rem] bg-red-600 px-4 py-6 text-white md:px-8 md:py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">
            {t.pack}
          </p>
          <p className="mt-2 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
            <span className="text-lg font-semibold text-white/80 md:text-2xl">
              {language === "de" ? t.instead : null}
            </span>
            <span className="text-3xl font-bold text-white/80 line-through decoration-4 md:text-5xl">
              280{" "}€
            </span>
            {language === "hu" ? (
              <span className="text-lg font-semibold text-white/80 md:text-2xl">
                helyett
              </span>
            ) : null}
          </p>
          <p className="mt-2 flex flex-wrap items-baseline justify-center gap-x-3">
            <span className="text-xl font-bold uppercase md:text-3xl">
              {t.only}
            </span>
            <span className="text-6xl font-black leading-none md:text-8xl">
              250{" "}€
            </span>
          </p>
        </div>

        <p className="mt-4 text-sm font-medium italic text-stone-600 md:text-base">
          *{t.valid}*
        </p>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="mt-6 inline-block w-full rounded-full bg-[#405e3f] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#344f33] md:w-auto md:px-12 md:py-5 md:text-xl"
        >
          {t.button}
        </a>
      </div>
    </div>
  );
}

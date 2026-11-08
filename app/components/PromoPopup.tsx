"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PROMO_STORAGE_KEY,
  promoWhatsappHref,
  usePromoActive,
} from "../lib/promo";

type Language = "de" | "hu";

const COOKIE_CONSENT_KEY = "christina-cookie-consent";

const content = {
  de: {
    eyebrow: "Massage-Paket",
    headline: "RABATTAKTION",
    pack: "3x 60 Minuten Massage",
    gift: "30 Minuten geschenkt",
    instead: "Statt",
    only: "nur",
    period: "Nur diese Woche von 08.11.2026 bis 14.11.2026",
    stepsTitle: "So geht's",
    steps: [
      "Eine 60-Minuten-Massage ganz normal online buchen.",
      "Per WhatsApp schreiben, dass du die Aktion nutzen möchtest.",
      "Christina fügt die weiteren 2x 60 Minuten für dich hinzu.",
    ],
    button: "Per WhatsApp sichern",
    close: "Schließen",
  },
  hu: {
    eyebrow: "Masszázs csomag",
    headline: "AKCIÓ",
    pack: "3x 60 perc masszázs",
    gift: "30 perc ajándék",
    instead: "180\u00a0€ helyett",
    only: "csak",
    period: "Csak ezen a héten: 2026.11.08. és 2026.11.14. között",
    stepsTitle: "Így működik",
    steps: [
      "Foglalj egy 60 perces masszázst a szokásos módon online.",
      "Írj WhatsAppon, hogy szeretnéd igénybe venni az akciót.",
      "Christina hozzáadja neked a további 2x 60 percet.",
    ],
    button: "Foglalás WhatsAppon",
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

  const whatsappHref = promoWhatsappHref(language);

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
        className={`relative my-auto w-full max-w-2xl rounded-[2rem] border-4 border-red-600 bg-white px-5 py-8 text-center shadow-2xl transition duration-300 sm:px-8 md:px-12 md:py-8 ${
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
          className="mt-2 text-[2rem] font-black uppercase leading-none tracking-tight text-red-600 min-[400px]:text-5xl sm:text-6xl md:text-7xl"
        >
          {t.headline}
        </h2>

        <p className="mt-4 text-2xl font-extrabold leading-tight text-stone-900 md:text-4xl">
          {t.pack}
        </p>
        <p className="mt-1 text-xl font-extrabold leading-tight text-red-600 md:text-3xl">
          {t.gift}
        </p>

        <div className="mt-4 rounded-[1.6rem] bg-red-600 px-4 py-4 text-white md:px-8 md:py-5">
          <p className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
            {language === "de" ? (
              <span className="text-lg font-semibold text-white/80 md:text-2xl">
                {t.instead}
              </span>
            ) : null}
            <span className="text-3xl font-bold text-white/80 line-through decoration-4 md:text-5xl">
              180{"\u00a0"}€
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
            <span className="text-6xl font-black leading-none md:text-7xl">
              150{"\u00a0"}€
            </span>
          </p>
        </div>

        <p className="mt-4 text-base font-bold leading-snug text-stone-900 md:text-lg">
          {t.period}
        </p>

        <div className="mt-4 rounded-[1.4rem] bg-[#f6efe5] px-5 py-4 text-left">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
            {t.stepsTitle}
          </p>
          <ol className="mt-3 space-y-2 text-sm text-stone-800 md:text-base">
            {t.steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="mt-5 inline-block w-full rounded-full bg-[#405e3f] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#344f33] md:w-auto md:px-12"
        >
          {t.button}
        </a>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROMO_STORAGE_KEY, usePromoActive } from "../lib/promo";

type Language = "de" | "hu";

const WHATSAPP_NUMBER = "491722664648";
const COOKIE_CONSENT_KEY = "christina-cookie-consent";

const content = {
  de: {
    eyebrow: "Aktion · 2. bis 6. November",
    title: "HIEMT Beckenboden-Training",
    headline: "10er-Karte jetzt günstiger sichern",
    oldPrice: "280 €",
    newPrice: "250 €",
    save: "Du sparst 30 €",
    packLabel: "10er-Karte",
    trial: "Probesitzung: nur 30 €",
    points: [
      "30 Minuten pro Sitzung",
      "Komplett in Kleidung",
      "Nicht-invasive Behandlung",
    ],
    note: "Gezielte Aktivierung und Stärkung des Beckenbodens.",
    validity: "Nur vom 2. bis 6. November 2026",
    primary: "Jetzt per WhatsApp sichern",
    secondary: "Mehr zu HIEMT",
    later: "Vielleicht später",
    close: "Schließen",
    imageAlt: "HIEMT Beckenboden-Training in Kleidung auf dem Behandlungsstuhl",
    whatsappText:
      "Hallo Christina, ich möchte gerne die HIEMT 10er-Karte zum Aktionspreis von 250 € sichern.",
  },
  hu: {
    eyebrow: "Akció · november 2–6.",
    title: "HIEMT medencefenék-tréning",
    headline: "Biztosítsd most kedvezményesen a 10 alkalmas bérletet",
    oldPrice: "280 €",
    newPrice: "250 €",
    save: "30 € megtakarítás",
    packLabel: "10 alkalmas bérlet",
    trial: "Próbaalkalom: csak 30 €",
    points: [
      "30 perc egy alkalom",
      "Teljesen ruhában",
      "Nem invazív kezelés",
    ],
    note: "A medencefenék célzott aktiválása és erősítése.",
    validity: "Csak 2026. november 2. és 6. között",
    primary: "Foglalás WhatsAppon",
    secondary: "Továbbiak a HIEMT-ről",
    later: "Talán később",
    close: "Bezárás",
    imageAlt: "HIEMT medencefenék-tréning ruhában, kezelőszéken ülve",
    whatsappText:
      "Szia Christina, szeretném lefoglalni a HIEMT 10 alkalmas bérletet 250 €-s akciós áron.",
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
    }, 1200);

    return () => window.clearTimeout(openTimer);
  }, [active, consented]);

  // Sichtbar nur, solange die Aktion laeuft (endet sie bei offenem Popup, verschwindet es von selbst)
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
        className={`relative grid max-h-full w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-[#f8f5ef] shadow-2xl transition duration-300 sm:grid-cols-[0.8fr_1.2fr] ${
          shown ? "translate-y-0 scale-100" : "translate-y-3 scale-95"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label={t.close}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl leading-none text-stone-700 shadow-sm transition hover:bg-white"
        >
          ×
        </button>

        <div className="relative hidden min-h-[320px] bg-[#16212a] sm:block">
          <Image
            src="/hiemt-aktion.jpg"
            alt={t.imageAlt}
            fill
            sizes="(min-width: 640px) 300px, 0px"
            className="object-cover"
          />
        </div>

        <div className="p-6 pt-14 sm:p-8 sm:pt-12">
          <div className="inline-flex rounded-full bg-[#dfe6da] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-stone-700">
            {t.eyebrow}
          </div>

          <p className="mt-4 text-sm uppercase tracking-[0.18em] text-[#7a8566]">
            {t.title}
          </p>
          <h2
            id="promo-title"
            className="mt-2 text-2xl font-semibold leading-tight text-stone-900 md:text-3xl"
          >
            {t.headline}
          </h2>

          <div className="mt-5 rounded-[1.6rem] bg-[#567a57] p-5 text-white">
            <div className="text-xs uppercase tracking-[0.18em] text-white/70">
              {t.packLabel}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-lg text-white/60 line-through">
                {t.oldPrice}
              </span>
              <span className="text-4xl font-semibold">{t.newPrice}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                {t.save}
              </span>
            </div>
            <div className="mt-3 text-sm text-white/85">{t.trial}</div>
          </div>

          <ul className="mt-5 space-y-2 text-sm text-stone-700">
            {t.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-[#6f7d58]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm leading-6 text-stone-600">{t.note}</p>
          <p className="mt-2 text-xs font-medium text-[#4e5f3f]">
            {t.validity}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="inline-block rounded-full bg-[#405e3f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#344f33]"
            >
              {t.primary}
            </a>
            <a
              href="#special"
              onClick={dismiss}
              className="inline-block rounded-full border border-[#6f7d58] px-6 py-3 text-sm font-semibold text-[#556246] transition hover:bg-[#eef3e6]"
            >
              {t.secondary}
            </a>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="mt-4 text-sm text-stone-500 underline-offset-4 transition hover:text-stone-800 hover:underline"
          >
            {t.later}
          </button>
        </div>
      </div>
    </div>
  );
}

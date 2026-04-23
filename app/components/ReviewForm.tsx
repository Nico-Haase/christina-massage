"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type Language = "de" | "hu";

type ReviewFormProps = {
  language: Language;
  onReviewSubmitted?: () => void;
};

export default function ReviewForm({
  language,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<"massage" | "hiemt">("massage");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  const t =
    language === "de"
      ? {
          title: "Bewertung schreiben",
          subtitle:
            "Teile deine Erfahrung mit anderen Kundinnen und Kunden.",
          name: "Name",
          namePlaceholder: "Dein Name",
          category: "Bereich",
          massage: "Massage",
          hiemt: "HIEMT",
          rating: "Sterne",
          text: "Bewertung",
          textPlaceholder: "Wie war deine Erfahrung?",
          submit: "Bewertung senden",
          sending: "Wird gesendet...",
          success: "Vielen Dank! Deine Bewertung wurde gespeichert.",
          error: "Fehler beim Speichern der Bewertung.",
          validation: "Bitte Name, Sterne und Bewertungstext ausfüllen.",
        }
      : {
          title: "Értékelés írása",
          subtitle: "Oszd meg a tapasztalatodat más vendégekkel.",
          name: "Név",
          namePlaceholder: "Neved",
          category: "Kategória",
          massage: "Masszázs",
          hiemt: "HIEMT",
          rating: "Csillagok",
          text: "Értékelés",
          textPlaceholder: "Milyen volt a tapasztalatod?",
          submit: "Értékelés küldése",
          sending: "Küldés...",
          success: "Köszönjük! Az értékelés elmentve.",
          error: "Hiba történt az értékelés mentésekor.",
          validation: "Kérjük töltsd ki a nevet, csillagokat és a szöveget.",
        };

  const resetForm = () => {
    setName("");
    setRating(5);
    setText("");
    setCategory("massage");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !text.trim() || !rating) {
      setMessageType("error");
      setMessage(t.validation);
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("reviews").insert([
      {
        name: name.trim(),
        rating,
        text: text.trim(),
        category,
        approved: true,
      },
    ]);

    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(t.error);
      return;
    }

    setMessageType("success");
    setMessage(t.success);
    resetForm();
    onReviewSubmitted?.();
  };

  const messageStyles =
    messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : messageType === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-stone-200 bg-stone-50 text-stone-700";

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
      <h3 className="text-2xl font-semibold text-stone-900">{t.title}</h3>
      <p className="mt-2 text-sm leading-7 text-stone-600 md:text-base">
        {t.subtitle}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            {t.name}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            {t.category}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "massage" | "hiemt")}
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
          >
            <option value="massage">{t.massage}</option>
            <option value="hiemt">{t.hiemt}</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            {t.rating}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-3xl transition hover:scale-110"
                aria-label={`${star} Sterne`}
              >
                <span className={star <= rating ? "text-[#d6b36a]" : "text-stone-300"}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            {t.text}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.textPlaceholder}
            rows={5}
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#567a57] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? t.sending : t.submit}
        </button>

        {message && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${messageStyles}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
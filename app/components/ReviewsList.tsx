"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Language = "de" | "hu";

type Review = {
  id: string;
  name: string | null;
  text: string | null;
  rating: number | null;
  category: "massage" | "hiemt" | string | null;
  approved: boolean | null;
  created_at: string | null;
};

type ReviewsListProps = {
  language: Language;
  refreshKey?: number;
};

export default function ReviewsList({
  language,
  refreshKey = 0,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const t = useMemo(
    () =>
      language === "de"
        ? {
            eyebrow: "Bewertungen",
            title: "Erfahrungen meiner Kundinnen und Kunden",
            subtitle:
              "Echte Bewertungen zu Massage und HIEMT.",
            massageTitle: "Massage",
            hiemtTitle: "HIEMT",
            emptyMassage: "Noch keine Bewertungen für Massage vorhanden.",
            emptyHiemt: "Noch keine Bewertungen für HIEMT vorhanden.",
            loading: "Bewertungen werden geladen...",
            anonymous: "Anonym",
          }
        : {
            eyebrow: "Értékelések",
            title: "Vendégeim tapasztalatai",
            subtitle: "Valódi értékelések masszázsról és HIEMT-ről.",
            massageTitle: "Masszázs",
            hiemtTitle: "HIEMT",
            emptyMassage: "Még nincs értékelés a masszázsokhoz.",
            emptyHiemt: "Még nincs értékelés a HIEMT-hez.",
            loading: "Értékelések betöltése...",
            anonymous: "Névtelen",
          },
    [language]
  );

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("reviews")
        .select("id, name, text, rating, category, approved, created_at")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        setReviews([]);
        setLoading(false);
        return;
      }

      setReviews((data ?? []) as Review[]);
      setLoading(false);
    };

    loadReviews();
  }, [refreshKey]);

  const massageReviews = reviews.filter(
    (review) => review.category === "massage"
  );

  const hiemtReviews = reviews.filter(
    (review) => review.category === "hiemt"
  );

  const renderStars = (rating: number | null) => {
    const safeRating = Math.max(1, Math.min(5, rating ?? 5));
    return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
  };

  const renderReviewCard = (review: Review) => (
    <div
      key={review.id}
      className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-3 text-xl tracking-[0.15em] text-[#d6b36a]">
        {renderStars(review.rating)}
      </div>
      <p className="text-base leading-8 text-stone-700">
        {review.text || ""}
      </p>
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
        {review.name?.trim() || t.anonymous}
      </p>
    </div>
  );

  return (
    <section id="bewertungen" className="bg-[#f8f2e9] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
            {t.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-stone-900 md:text-5xl">
            {t.title}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-stone-600 md:text-lg md:leading-8">
            {t.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center text-stone-600 shadow-sm">
            {t.loading}
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-[#dfe6da] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-700">
                {t.massageTitle}
              </div>

              <div className="space-y-5">
                {massageReviews.length > 0 ? (
                  massageReviews.map(renderReviewCard)
                ) : (
                  <div className="rounded-[2rem] border border-stone-200 bg-white p-6 text-stone-600 shadow-sm">
                    {t.emptyMassage}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-5 inline-flex rounded-full bg-[#edf4e3] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#4e5f3f]">
                {t.hiemtTitle}
              </div>

              <div className="space-y-5">
                {hiemtReviews.length > 0 ? (
                  hiemtReviews.map(renderReviewCard)
                ) : (
                  <div className="rounded-[2rem] border border-stone-200 bg-white p-6 text-stone-600 shadow-sm">
                    {t.emptyHiemt}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
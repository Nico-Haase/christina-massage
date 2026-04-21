"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    // Weiterleitung zurück zur Booking Seite
    const timeout = setTimeout(() => {
      window.location.href =
        "/booking?auth=1&mode=login&confirmed=1";
    }, 800);

    // Versuche Tab zu schließen (funktioniert bei vielen Browsern)
    setTimeout(() => {
      window.close();
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6efe5]">
      <div className="rounded-3xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-xl font-semibold text-stone-900">
          E-Mail wird bestätigt...
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Du wirst automatisch zurückgeleitet.
        </p>
      </div>
    </div>
  );
}